import { NextResponse } from 'next/server';

export async function GET() {
  const jsSnippet = `
(function() {
  var currentScript = document.currentScript;
  var orgId = currentScript ? (currentScript.getAttribute('data-org-id') || currentScript.getAttribute('data-business-id')) : 'default-org';
  var scriptUrl = (currentScript && currentScript.src) ? new URL(currentScript.src) : window.location;
  var host = scriptUrl.origin;

  // Create widget container
  var container = document.createElement('div');
  container.id = 'starx-chat-widget-root';
  document.body.appendChild(container);

  // Load iframe
  var iframe = document.createElement('iframe');
  iframe.src = host + '/chat?orgId=' + encodeURIComponent(orgId);
  iframe.style.position = 'fixed';
  iframe.style.bottom = '20px';
  iframe.style.right = '20px';
  iframe.style.width = '420px';
  iframe.style.height = '600px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '999999';
  iframe.style.background = 'transparent';
  iframe.allow = 'clipboard-write';
  
  // Responsive mobile support
  if (window.innerWidth < 480) {
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.bottom = '0';
    iframe.style.right = '0';
  }

  container.appendChild(iframe);
})();
`;

  return new NextResponse(jsSnippet.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
