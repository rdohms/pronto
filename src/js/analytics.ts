/**
 * Analytics module — MV3-compliant GA4 Measurement Protocol implementation.
 *
 * Replaces the old CDN script-tag injection (blocked by MV3 CSP).
 * All tracking calls go through fetch() to the GA4 /mp/collect endpoint.
 * When analytics is disabled (dev mode), calls are logged to console only.
 */

const ANALYTICS_ENABLED = import.meta.env.VITE_ANALYTICS === 'true';
const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string) || 'G-PT4Y4BRDQW';
const API_SECRET = (import.meta.env.VITE_GA_API_SECRET as string) || '';

/**
 * Generate or retrieve a persistent client ID from chrome.storage.
 * GA4 uses this to identify returning users.
 */
async function getClientId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get('ga_client_id', (result) => {
      if (result['ga_client_id']) {
        resolve(result['ga_client_id'] as string);
      } else {
        const newId = `${Math.random().toString(36).slice(2)}.${Date.now()}`;
        chrome.storage.local.set({ ga_client_id: newId });
        resolve(newId);
      }
    });
  });
}

/**
 * Send a GA4 event via Measurement Protocol.
 *
 * @param eventName - GA4 event name (e.g. 'page_view', 'fill_talk')
 * @param params    - Additional event parameters
 */
export async function trackEvent(
  eventName: string,
  params: Record<string, string | number | boolean> = {}
): Promise<void> {
  if (!ANALYTICS_ENABLED) {
    console.log('[analytics (disabled)]', eventName, params);
    return;
  }

  if (!API_SECRET || !MEASUREMENT_ID || MEASUREMENT_ID === 'G-XXXXXXXX') {
    console.log('[analytics (no API secret)]', eventName, params);
    return;
  }

  try {
    const clientId = await getClientId();
    const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`;

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        events: [
          {
            name: eventName,
            params: {
              ...params,
              engagement_time_msec: 100,
            },
          },
        ],
      }),
    });
  } catch (err) {
    // Analytics should never crash the extension — fail silently
    console.warn('[analytics] failed to send event:', err);
  }
}

/**
 * Track a page view (equivalent of old ga('send', 'pageview', path)).
 */
export async function trackPageView(pagePath: string): Promise<void> {
  await trackEvent('page_view', { page_location: pagePath });
}
