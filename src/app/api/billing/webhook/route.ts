import { processPolarWebhook } from '@/lib/polarWebhookHandler';

export async function POST(request: Request) {
  return processPolarWebhook(request);
}
