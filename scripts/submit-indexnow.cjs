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
  `https://${HOST}/`,
  `https://${HOST}/product`,
  `https://${HOST}/features`,
  `https://${HOST}/pricing`,
  `https://${HOST}/about`,
  `https://${HOST}/resources`,
  `https://${HOST}/privacy`,
  `https://${HOST}/terms`,
  `https://${HOST}/ai-automation`,
  `https://${HOST}/whatsapp-ai-chatbot`,
  `https://${HOST}/instagram-ai-automation`,
  `https://${HOST}/ai-customer-support`,
  `https://${HOST}/ai-agents`,
  `https://${HOST}/business-workflow-automation`,
  `https://${HOST}/compare/starx-flow-vs-manychat`,
  `https://${HOST}/compare/starx-flow-vs-intercom`,
  `https://${HOST}/compare/starx-flow-vs-zapier`,
  `https://${HOST}/compare/starx-flow-vs-make`,
  `https://${HOST}/compare/starx-flow-vs-n8n`,
  `https://${HOST}/compare/starx-flow-vs-wati`,
  `https://${HOST}/compare/starx-flow-vs-respond-io`,
  `https://${HOST}/compare/starx-flow-vs-langflow`,
  `https://${HOST}/compare/starx-flow-vs-mindbody`,
  `https://${HOST}/compare/starx-flow-vs-vagaro`,
  `https://${HOST}/compare/starx-flow-vs-calendly`,
  `https://${HOST}/scenarios/ai-agents`,
  `https://${HOST}/use-cases/whatsapp-automation`,
  `https://${HOST}/industries/plumber`,
  `https://${HOST}/industries/barber`,
  `https://${HOST}/industries/dentist`,
  `https://${HOST}/industries/med-spa`,
  `https://${HOST}/industries/personal-trainer`
];

const payload = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: URL_LIST
});

console.log(`[IndexNow] Submitting ${URL_LIST.length} URLs to api.indexnow.org...`);

const options = {
  hostname: 'api.indexnow.org',
  port: 443,
  path: '/indexnow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = https.request(options, (res) => {
  console.log(`[IndexNow] Response status code: ${res.statusCode} ${res.statusMessage}`);
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log(`✅ [IndexNow] URLs submitted successfully! Key will be validated once deployed to ${HOST}.`);
    } else {
      console.log(`[IndexNow] Response body:`, responseBody || '(empty)');
      console.log(`(Note: Status 400 or 422 occurs if key file is not yet verified on live host ${HOST}).`);
    }
  });
});

req.on('error', (err) => {
  console.error('[IndexNow] Submission error:', err.message);
});

req.write(payload);
req.end();
