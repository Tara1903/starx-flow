import { NextRequest, NextResponse } from 'next/server';
import { BusinessProfileService } from '@/lib/ai/businessProfileService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organizationId') || searchParams.get('businessId') || 'default-org';

    const profile = await BusinessProfileService.getProfile(organizationId);
    const hoursStatus = BusinessProfileService.isWithinBusinessHours(profile);

    // Return sanitized public widget configuration without secrets
    const publicConfig = {
      organizationId: profile.organizationId,
      businessName: profile.businessName,
      businessType: profile.businessType,
      description: profile.description,
      location: profile.location,
      isOpen: hoursStatus.isOpen,
      hoursToday: hoursStatus.hoursToday,
      timezone: profile.timezone,
      services: (profile.services || []).map((s) => ({
        id: s.id,
        name: s.name,
        priceEur: s.priceEur,
        durationMinutes: s.durationMinutes,
      })),
      supportedLanguages: profile.supportedLanguages,
      greetingMessage: `Hello! Welcome to ${profile.businessName}. How can our 24/7 AI Receptionist assist you today?`,
    };

    return NextResponse.json(publicConfig, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, s-maxage=300',
      },
    });
  } catch (err: any) {
    console.error('[API /api/chat/config GET error]:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
