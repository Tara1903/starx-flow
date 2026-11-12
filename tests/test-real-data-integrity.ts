import fs from 'node:fs';
import { NextRequest } from 'next/server';

if (fs.existsSync('.env')) {
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .forEach((line) => {
      const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
      }
    });
}

import {
  createIdempotencyKey,
  extractIdempotencyKey,
  runWithIdempotency,
} from '@/lib/idempotency';
import { setTestStaffSession } from '@/lib/auth/serverAuth';
import { POST as ordersPOST } from '@/app/api/orders/route';
import { useOrderStore } from '@/store/orderStore';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log(' REAL-DATA INTEGRITY, EMPTY STATE & IDEMPOTENCY TEST SUITE');
  console.log('================================================================\n');

  try {
    // 1. Idempotency key generation & extraction
    console.log('1. Idempotency Key Extraction & Coalescing');
    const keyA = createIdempotencyKey('ord');
    const keyB = createIdempotencyKey('ord');
    assert(keyA.startsWith('ord-') && keyA !== keyB, 'createIdempotencyKey generates unique scoped keys');

    const headerReq = new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Idempotency-Key': 'retry-token-001' },
    });
    assert(
      extractIdempotencyKey(headerReq) === 'retry-token-001',
      'extractIdempotencyKey extracts Idempotency-Key header'
    );

    const bodyReq = new Request('http://localhost/api/orders', { method: 'POST' });
    assert(
      extractIdempotencyKey(bodyReq, { idempotencyKey: 'body-token-002' }) === 'body-token-002',
      'extractIdempotencyKey falls back to body.idempotencyKey'
    );

    // 2. Sequential & concurrent retry deduplication
    console.log('\n2. Sequential & Concurrent Retry Deduplication');
    let sequentialCount = 0;
    const seqKey = `test-seq-${Date.now()}`;
    const first = await runWithIdempotency(seqKey, async () => {
      sequentialCount++;
      return { id: `order-${sequentialCount}` };
    });
    const second = await runWithIdempotency(seqKey, async () => {
      sequentialCount++;
      return { id: `order-${sequentialCount}` };
    });
    assert(
      sequentialCount === 1 && !first.deduplicated && second.deduplicated && first.result.id === second.result.id,
      'Sequential retry with matching key executes mutation once and returns identical cached payload'
    );

    let concurrentCount = 0;
    const concKey = `test-conc-${Date.now()}`;
    const [c1, c2] = await Promise.all([
      runWithIdempotency(concKey, async () => {
        concurrentCount++;
        await new Promise((r) => setTimeout(r, 25));
        return { msgId: `msg-${concurrentCount}` };
      }),
      runWithIdempotency(concKey, async () => {
        concurrentCount++;
        return { msgId: `msg-${concurrentCount}` };
      }),
    ]);
    assert(
      concurrentCount === 1 && c1.result.msgId === c2.result.msgId && (c1.deduplicated || c2.deduplicated),
      'Concurrent double-submit shares in-flight promise and never duplicates mutation'
    );

    // Failed execution must NOT poison cache so user retry succeeds
    let recoveryCount = 0;
    const failKey = `test-fail-${Date.now()}`;
    let threw = false;
    try {
      await runWithIdempotency(failKey, async () => {
        recoveryCount++;
        throw new Error('Transient DB timeout');
      });
    } catch {
      threw = true;
    }
    const recovered = await runWithIdempotency(failKey, async () => {
      recoveryCount++;
      return { recovered: true };
    });
    assert(
      threw && recoveryCount === 2 && !recovered.deduplicated && recovered.result.recovered,
      'Failed mutation cleans in-flight lock so subsequent retry can recover'
    );

    // 3. Honest API validation & zero synthetic 200 fallbacks
    console.log('\n3. Honest API Validation & Store Empty-State Behavior');
    setTestStaffSession({
      user: { id: 'owner-user-1', email: 'owner@starx.test' },
      organizationId: 'org-alpha',
      role: 'owner',
    });

    const badOrderRes = await ordersPOST(
      new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: 'Jane', items: [] }),
      })
    );
    assert(
      badOrderRes.status === 400,
      'POST /api/orders rejects empty items array with HTTP 400 instead of synthetic fallback'
    );

    // Verify client orderStore starts empty & cleanly handles unauthenticated fetch without injecting fake rows
    await useOrderStore.getState().fetchOrders();
    const orderState = useOrderStore.getState();
    assert(
      Array.isArray(orderState.orders) &&
        orderState.orders.length === 0 &&
        orderState.hasFetched === true &&
        orderState.error === null,
      'useOrderStore initializes empty without seeded fake orders when signed out'
    );
  } finally {
    setTestStaffSession(null);
  }

  console.log(`\nReal-Data Integrity Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Unhandled real-data integrity suite error:', err);
  process.exit(1);
});
