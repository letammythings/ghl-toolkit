// Replace exact text inside a GHL Send Email body (TipTap/ProseMirror), keeping formatting.
// Use with Playwright browser_evaluate, target:
//   iframe[name="workflow-builder"] >> internal:control=enter-frame >> .ProseMirror
// Edit PAIRS, run, then check the returned text/links, then fill From fields, click "Save action",
// then "Save workflow button" (stays Draft). Tested 2026-10-21 in a client account.
async (el) => {
  const PAIRS = [['OLD TEXT', 'NEW TEXT']];
  let h = el.innerHTML;
  for (const [a, b] of PAIRS) { if (!h.includes(a)) return 'missing: ' + a; h = h.split(a).join(b); }
  const before = el.querySelectorAll(':scope > p').length;
  h = h.replace(/<br class="ProseMirror-trailingBreak">/g, '<br>');
  el.focus();
  const r = document.createRange(); r.selectNodeContents(el);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  await new Promise(f => setTimeout(f, 400));           // let ProseMirror see the selection
  const dt = new DataTransfer(); dt.setData('text/html', h); dt.setData('text/plain', 'x');
  el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  await new Promise(f => setTimeout(f, 600));
  return { paragraphsBefore: before, paragraphsAfter: el.querySelectorAll(':scope > p').length,
           links: [...el.querySelectorAll('a')].map(x => x.getAttribute('href')),
           text: el.innerText.slice(0, 400) };
}
