# STARX-FLOW — PHASE 6.1: ONBOARDING & WEB SANDBOX VERIFICATION

**Audit Date:** 2026-11-10  
**Auditor:** Principal SaaS Architect & Full-Stack Engineer  
**Scope:** Customer Onboarding Flow, Step-by-Step State Management, Web Sandbox Fallback  
**Readiness Classification:** **A — Production Verified**  

---

## 1. Executive Summary

The StarX-Flow customer onboarding journey was inspected across all seven setup steps. Special scrutiny was applied to `/setup/test/page.tsx` (the Web Sandbox simulator), which enables new customers to immediately test their AI receptionist during the 3–14 business day waiting period required for Meta WhatsApp Business Verification.

During the audit, a major gap was identified and corrected: the Web Sandbox simulator originally used a mock `setTimeout` that returned hardcoded greetings instead of engaging the actual AI pipeline. In Phase 6.1, `src/app/setup/test/page.tsx` was remediated to execute a live `POST /api/chat` request against the StarX-Flow AI engine using the user's specific business name, custom FAQs, and configured communication tone, with a graceful fallback if the remote LLM is temporarily unreachable.

---

## 2. Seven-Stage Onboarding Flow Verification

| Route | Step Name | Purpose & Implementation | Verification Findings |
|---|---|---|---|
| `/setup/welcome` | Step 1: Welcome & Profile | Collects business name, vertical category, and company website. Stores to `localStorage` key `starx_setup_data`. | **PASS** — Clean validation, responsive layout. |
| `/setup/ai` | Step 2: AI Configuration | Configures bot persona, communication tone (Professional, Warm, Direct), and custom business FAQs. | **PASS** — Supports dynamic FAQ addition/removal. |
| `/setup/whatsapp` | Step 3: WhatsApp Channel | Collects Phone Number ID, WABA ID, and Permanent Access Token. Prominently displays the Meta App Review disclaimer. | **PASS** — Includes clear guidance on Meta approval timeline. |
| `/setup/instagram` | Step 4: Instagram DM | Connects Facebook Page and Instagram Professional Account via OAuth or Token. | **PASS** — Provides setup instructions and toggle skip option. |
| `/setup/sms` | Step 5: SMS Fallback | Twilio integration for SMS appointment reminders and confirmations. | **PASS** — Optional step; can be bypassed without blocking. |
| `/setup/test` | Step 6: Web Sandbox | Live interactive chat simulator allowing immediate testing of the configured bot. | **PASS (REMEDIATED)** — Connected to live `/api/chat` pipeline. |
| `/setup/launch` | Step 7: Launch & Go-Live | Summarizes configured channels, activates bot status in database, and redirects to `/dashboard`. | **PASS** — Finalizes onboarding flags. |

---

## 3. Web Sandbox Simulator Remediation Details

### The Problem in Phase 6 Baseline:
In the initial Phase 6 implementation, `/setup/test/page.tsx` simulated AI responses using:
```typescript
// Previous implementation:
setTimeout(() => {
  setMessages(prev => [...prev, {
    sender: 'bot',
    text: `Thanks for messaging ${aiConfig.businessName}! How can I help you today?`
  }]);
}, 1000);
```
This produced a static, repetitive demo that did not reflect the customer's actual AI prompt engineering, FAQs, or appointment booking rules.

### The Remediation in Phase 6.1:
`src/app/setup/test/page.tsx` was refactored to query the live backend chat API:
```typescript
const handleSendTest = async (messageText: string) => {
  // Push user message to UI immediately
  ...
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        businessName: aiConfig.businessName,
        tone: aiConfig.tone,
        faqs: aiConfig.faqs,
        context: 'sandbox_test'
      })
    });

    if (res.ok) {
      const data = await res.json();
      // Render genuine AI-generated response from LLM
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      return;
    }
  } catch (err) {
    // Intelligent fallback using customer's configured FAQ/tone if offline
    ...
  }
};
```

---

## 4. Meta Approval Waiting Period Strategy

For UK and Irish SMBs, WhatsApp Business API verification typically requires:
- Meta Business Manager verification (Certificate of Incorporation / Utility Bill).
- Display Name approval (must match registered business name).
- Phone number verification (SMS OTP to dedicated line).

This process takes **3 to 14 business days**. Without the Web Sandbox:
- Customers felt "blocked" immediately after signup.
- Drop-off rates spiked because they could not see the product working.

With StarX-Flow's Web Sandbox:
1. Customers immediately test their bot on the web on Day 1.
2. They refine their FAQs, business hours, and booking rules.
3. They share the sandbox link with colleagues for internal sign-off.
4. When Meta grants approval, activating WhatsApp requires a single toggle in `/setup/whatsapp`.

**Readiness Verdict: Tier A — Production Verified.**
