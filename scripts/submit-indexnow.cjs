/**
 * scripts/submit-indexnow.cjs
 * Submits all public sitemap URLs to the IndexNow API (Bing, Yandex, Naver, Seznam).
 *
 * Usage:
 *   node scripts/submit-indexnow.cjs
 */

const https = require('https');

const HOST = 'starx-flow.runs-on.dev';
const KEY = 'a3f81e9b204847e199d750c18d360f72';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URL_LIST = [
  `https://${HOST}`,
  `https://${HOST}/product`,
  `https://${HOST}/features`,
  `https://${HOST}/pricing`,
  `https://${HOST}/about`,
  `https://${HOST}/resources`,
  `https://${HOST}/privacy`,
  `https://${HOST}/terms`,
  // Trust & Architecture
  `https://${HOST}/how-it-works`,
  `https://${HOST}/security`,
  `https://${HOST}/integrations`,
  `https://${HOST}/ai-automation`,
  `https://${HOST}/whatsapp-ai-chatbot`,
  `https://${HOST}/instagram-ai-automation`,
  `https://${HOST}/ai-customer-support`,
  `https://${HOST}/ai-agents`,
  `https://${HOST}/business-workflow-automation`,
  // Industry Solutions
  `https://${HOST}/industries/gyms-fitness`,
  `https://${HOST}/industries/beauty-salons`,
  `https://${HOST}/industries/dental-clinics`,
  `https://${HOST}/industries/wellness-therapy`,
  `https://${HOST}/industries/real-estate`,
  `https://${HOST}/industries/hospitality`,
  `https://${HOST}/industries/restaurants`,
  `https://${HOST}/industries/education`,
  `https://${HOST}/industries/personal-trainer`,
  `https://${HOST}/industries/barber`,
  `https://${HOST}/industries/dentist`,
  `https://${HOST}/industries/med-spa`,
  `https://${HOST}/industries/plumber`,
  // Competitor Comparisons
  `https://${HOST}/compare/starx-flow-vs-manychat`,
  `https://${HOST}/compare/starx-flow-vs-wati`,
  `https://${HOST}/compare/starx-flow-vs-respond-io`,
  `https://${HOST}/compare/starx-flow-vs-mindbody`,
  `https://${HOST}/compare/starx-flow-vs-vagaro`,
  `https://${HOST}/compare/starx-flow-vs-calendly`,
  `https://${HOST}/compare/starx-flow-vs-acuity-scheduling`,
  `https://${HOST}/compare/starx-flow-vs-phorest`,
  `https://${HOST}/compare/starx-flow-vs-intercom`,
  `https://${HOST}/compare/starx-flow-vs-n8n`,
  `https://${HOST}/compare/starx-flow-vs-zapier`,
  `https://${HOST}/compare/starx-flow-vs-make`,
  `https://${HOST}/compare/starx-flow-vs-langflow`,
  // Scenarios
  `https://${HOST}/scenarios/ai-agents`,
  `https://${HOST}/use-cases/whatsapp-automation`,
  // Editorial Runbooks
  `https://${HOST}/resources/articles/calendar-integration`,
  `https://${HOST}/resources/articles/clinic-receptionist`,
  `https://${HOST}/resources/articles/google-reviews-seo`,
];

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: URL_LIST,
});

const ENDPOINTS = [
  { hostname: 'api.indexnow.org', path: '/indexnow' },
  { hostname: 'www.bing.com', path: '/indexnow' },
];

function submitToEndpoint(endpointIndex = 0) {
  if (endpointIndex >= ENDPOINTS.length) {
    console.error('❌ [IndexNow] All endpoints failed.');
    process.exit(1);
  }

  const endpoint = ENDPOINTS[endpointIndex];
  console.log(`[IndexNow] Submitting ${URL_LIST.length} URLs to ${endpoint.hostname}...`);

  const options = {
    hostname: endpoint.hostname,
    port: 443,
    path: endpoint.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  const req = https.request(options, (res) => {
    console.log(`[IndexNow] Response from ${endpoint.hostname}: ${res.statusCode} ${res.statusMessage}`);

    let responseBody = '';
    res.on('data', (chunk) => {
      responseBody += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log(`✅ [IndexNow] URLs submitted successfully via ${endpoint.hostname}!`);
      } else if (res.statusCode === 403) {
        console.warn(`⚠️ [IndexNow] 403 Forbidden received from ${endpoint.hostname}: ${responseBody || 'User unauthorized'}`);
        console.warn('ℹ️ [IndexNow] Note: Bing Webmaster requires its verification crawler to finish validating the key file on starx-flow.runs-on.dev, or requires the key to match the one generated under Bing Webmaster Tools > IndexNow.');
      } else {
        console.warn(`⚠️ [IndexNow] Non-success response (${res.statusCode}): ${responseBody || 'No body returned'}`);
      }
    });
  });

  req.on('error', (error) => {
    console.warn(`⚠️ [IndexNow] Failed connecting to ${endpoint.hostname}: ${error.message}`);
    if (endpointIndex + 1 < ENDPOINTS.length) {
      console.log(`[IndexNow] Trying fallback endpoint...`);
      submitToEndpoint(endpointIndex + 1);
    } else {
      console.error('❌ [IndexNow] All submission attempts failed.');
      process.exit(1);
    }
  });

  req.write(payload);
  req.end();
}

submitToEndpoint(0);
