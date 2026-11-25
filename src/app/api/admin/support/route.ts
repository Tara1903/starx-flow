import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { InboxService } from '@/lib/inbox/inboxService';
import { sanitizeClientError } from '@/lib/security/sanitizeClientError';

const ADMIN_SUPPORT_ORG_ID = '215ae89e-80bc-40f8-89e4-5dfd1254ddbe';
const ADMIN_SUPPORT_OWNER_ID = '230a2984-8c0b-489f-abda-b31fbcddf742';

async function authenticateAdmin(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { error: 'Unauthorized: missing authorization header', status: 401 as const, user: null };
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return { error: 'Unauthorized: empty bearer token', status: 401 as const, user: null };
  }

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) {
    return { error: 'Unauthorized: invalid or expired session', status: 401 as const, user: null };
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return { error: 'Forbidden: platform administrator privileges required', status: 403 as const, user: null };
  }

  return { error: null, status: 200 as const, user };
}

function getWebhookUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured && configured.startsWith('http')) {
    return `${configured.replace(/\/+$/, '')}/api/whatsapp/webhook`;
  }
  return 'https://starx-flow.runs-on.dev/api/whatsapp/webhook';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userCandidates = Array.from(new Set([ADMIN_SUPPORT_OWNER_ID, auth.user.id]));

    const [channelsRes, profileRes, inboxRes, logsRes, waLeadsRes] = await Promise.all([
      supabaseAdmin
        .from('connected_channels')
        .select('id, user_id, channel_key, is_connected, credentials, last_synced')
        .in('user_id', userCandidates)
        .in('channel_key', ['WhatsApp', 'Instagram'])
        .order('last_synced', { ascending: false }),
      supabaseAdmin
        .from('business_receptionist_profiles')
        .select('organization_id, business_name, business_type, description, location, contact_phone, contact_email, services, faqs, custom_instructions, updated_at')
        .eq('organization_id', ADMIN_SUPPORT_ORG_ID)
        .maybeSingle(),
      InboxService.fetchConversations({
        userId: ADMIN_SUPPORT_OWNER_ID,
        organizationId: ADMIN_SUPPORT_ORG_ID,
        channel: 'WhatsApp',
        limit: 50,
      }),
      supabaseAdmin
        .from('execution_logs')
        .select('id, type, channel, message, created_at')
        .in('user_id', userCandidates)
        .eq('channel', 'WhatsApp')
        .order('created_at', { ascending: false })
        .limit(20),
      supabaseAdmin
        .from('demo_requests')
        .select('id', { count: 'exact', head: true })
        .eq('preferred_contact', 'whatsapp'),
    ]);

    const channels = channelsRes.data || [];
    const waChannel = channels.find(
      (c) => c.channel_key === 'WhatsApp' && c.user_id === ADMIN_SUPPORT_OWNER_ID
    ) || channels.find((c) => c.channel_key === 'WhatsApp');
    const igChannel = channels.find(
      (c) => c.channel_key === 'Instagram' && c.user_id === ADMIN_SUPPORT_OWNER_ID
    ) || channels.find((c) => c.channel_key === 'Instagram');

    const waCreds = (waChannel?.credentials || {}) as Record<string, any>;
    const envToken = process.env.META_ACCESS_TOKEN;
    const hasEnvToken = Boolean(envToken && !envToken.includes('placeholder'));
    const hasDbToken = Boolean(waCreds.access_token && !String(waCreds.access_token).includes('placeholder'));

    const connection = {
      isConnected: Boolean(waChannel?.is_connected ?? (hasEnvToken && process.env.META_PHONE_NUMBER_ID)),
      displayPhoneNumber: String(waCreds.display_phone_number || '+1 555-155-5475'),
      phoneNumberId: String(waCreds.phone_number_id || process.env.META_PHONE_NUMBER_ID || ''),
      wabaId: waCreds.waba_id ? String(waCreds.waba_id) : '1139426225454489',
      webhookUrl: getWebhookUrl(),
      tokenConfigured: hasDbToken || hasEnvToken,
      tokenSource: hasDbToken ? 'connected_channels' : hasEnvToken ? 'environment' : 'none',
      lastSynced: waChannel?.last_synced || null,
    };

    const igCreds = (igChannel?.credentials || {}) as Record<string, any>;
    const instagram = {
      isConnected: Boolean(igChannel?.is_connected),
      accountId: igCreds.ig_account_id ? String(igCreds.ig_account_id) : null,
      lastSynced: igChannel?.last_synced || null,
    };

    const rawProfile = profileRes.data;

    const services = Array.isArray(rawProfile?.services)
      ? rawProfile.services.map((s: Record<string, any>) => ({
          name: String(s.name || 'Service'),
          price: Number(s.price ?? s.priceEur ?? 0),
          currency: s.currency === 'USD' ? 'USD' : 'EUR',
          durationMinutes: Number(s.durationMinutes ?? 0),
          description: s.description ? String(s.description) : '',
        }))
      : [];

    const profile = {
      businessName: rawProfile?.business_name || 'StarX Flow Official Support',
      businessDescription: rawProfile?.description || '',
      aiRole: rawProfile?.business_type || 'AI Receptionist SaaS Platform Support & Onboarding',
      greetingMessage: rawProfile?.custom_instructions || '',
      bookingLink: rawProfile?.location || 'https://starx-flow.runs-on.dev/setup',
      services,
      updatedAt: rawProfile?.updated_at || null,
    };

    const conversations = (inboxRes.conversations || []).map((convo: Record<string, any>) => {
      const msgs = Array.isArray(convo.messages)
        ? [...convo.messages].sort(
            (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
          )
        : [];
      return {
        ...convo,
        messages: msgs,
      };
    });

    return NextResponse.json({
      adminOrgId: ADMIN_SUPPORT_ORG_ID,
      connection,
      instagram,
      profile,
      conversations,
      totalCount: inboxRes.totalCount,
      logs: logsRes.data || [],
      whatsappLeadsCount: waLeadsRes.count || 0,
    });
  } catch (err: unknown) {
    console.error('[API /api/admin/support GET error]:', err);
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to load Admin Support telemetry') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAdmin(request);
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { action, conversationId, content, isInternal = false, controlMode, reason } = body || {};

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json({ error: 'Missing required parameter: conversationId' }, { status: 400 });
    }

    const { data: convo, error: convoErr } = await supabaseAdmin
      .from('conversations')
      .select('id, user_id, organization_id, channel')
      .eq('id', conversationId)
      .maybeSingle();

    if (convoErr || !convo) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const belongsToAdminSupport =
      convo.organization_id === ADMIN_SUPPORT_ORG_ID || convo.user_id === ADMIN_SUPPORT_OWNER_ID;
    if (!belongsToAdminSupport) {
      return NextResponse.json(
        { error: 'Forbidden: conversation belongs to a separate tenant workspace' },
        { status: 403 }
      );
    }

    if (action === 'reply') {
      if (!content || typeof content !== 'string' || !content.trim()) {
        return NextResponse.json({ error: 'Missing required parameter: content' }, { status: 400 });
      }

      const result = await InboxService.postMessage({
        conversationId,
        userId: ADMIN_SUPPORT_OWNER_ID,
        organizationId: ADMIN_SUPPORT_ORG_ID,
        role: 'human',
        content: content.trim(),
        isInternal: Boolean(isInternal),
        agentName: auth.user.email || 'StarX Flow Support',
      });

      return NextResponse.json({
        success: true,
        message: result.message,
        isInternal: result.isInternal,
        deliveredToCustomer: !result.isInternal,
      });
    }

    if (action === 'toggle_control') {
      if (controlMode !== 'ai' && controlMode !== 'human') {
        return NextResponse.json(
          { error: 'Invalid controlMode: must be "ai" or "human"' },
          { status: 400 }
        );
      }

      const updated =
        controlMode === 'human'
          ? await InboxService.takeoverConversation(
              conversationId,
              ADMIN_SUPPORT_OWNER_ID,
              ADMIN_SUPPORT_ORG_ID,
              typeof reason === 'string' && reason.trim()
                ? reason.trim()
                : `Admin Support takeover by ${auth.user.email || 'admin'}`
            )
          : await InboxService.releaseToAI(
              conversationId,
              ADMIN_SUPPORT_OWNER_ID,
              ADMIN_SUPPORT_ORG_ID
            );

      return NextResponse.json({ success: updated, controlMode });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('[API /api/admin/support POST error]:', err);
    return NextResponse.json(
      { error: sanitizeClientError(err, 'Failed to execute Admin Support action') },
      { status: 500 }
    );
  }
}
