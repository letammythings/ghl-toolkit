// Test: can page code read an email typed into a GHL form on a live funnel page, before send? (read only; runs in your own tab)
// Tested 2026-11-02 on a pop-up form that sits in the page itself (no iframe). Check first: document.querySelector('input[name=email]') finds it.
// Use: open the page + the form, browser_evaluate this, type a FAKE email, press Tab, NEVER click send, then read window.__t.
// Good result: __t.caught has the email; __t.sent says "fetch no-cors type=opaque"; the POST shows in network requests with status 200.
// Swap TEST_URL for a real Inbound Webhook only with the user's OK (it needs a GHL save, and it needs JSON). Check consent before any live use.
async () => {
  const TEST_URL = 'https://httpbin.org/post';
  window.__t = { caught: [], sent: [] };
  document.addEventListener('focusout', async e => {
    const el = e.target;
    if (el && el.name === 'email' && /.+@.+\..+/.test(el.value)) {
      const q = n => (document.querySelector(`input[name=${n}]`) || {}).value || '';
      const payload = { email: el.value, full_name: q('full_name'), phone: q('phone'), source: 'capture-test' };
      window.__t.caught.push(payload);
      const r = await fetch(TEST_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
      window.__t.sent.push('fetch no-cors type=' + r.type);
    }
  }, true);
  return { emailFieldFound: !!document.querySelector('input[name=email]'), inIframe: window.top !== window.self };
}
