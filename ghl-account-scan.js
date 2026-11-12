// Read-only GHL account scan : every workflow with its start rule,
// every form, every funnel with its steps and page ids. Nothing is saved or sent.
// Run: Playwright browser_run_code_unsafe with filename pointing at this file (copy it into the project
// folder first if Playwright refuses the path). Takes ~1 minute.
// Good result: { workflows: ~59 rows each with trig[], forms: [...], funnels: [...] }.
// A form id that appears in no workflow's form.id start rule = that box starts nothing.
// Returns only names, ids and conditions: never the whole workflow JSON (it can hold an ad platform key).
async (page) => {
  const LOC = 'YOUR_LOCATION_ID'; // change per client account
  await page.goto('https://app.gohighlevel.com/');
  await page.waitForURL(/dashboard/, { timeout: 40000 });
  await page.waitForTimeout(3000);
  const H = {};
  const grab = req => { const x = req.headers(); if (/leadconnectorhq\.com/.test(req.url()) && x['token-id'] && !H['token-id']) for (const k of ['token-id', 'version', 'channel', 'source']) if (x[k]) H[k] = x[k]; };
  page.on('request', grab);
  await page.getByRole('link', { name: /Contacts/ }).first().click();
  await page.waitForTimeout(8000);
  page.off('request', grab);
  if (!H['token-id']) return 'No GHL headers caught: is the browser logged in?';
  return await page.evaluate(async ({ H, LOC }) => {
    const g = async u => { const r = await fetch(u, { headers: H }); return r.ok ? r.json() : { err: r.status }; };
    // parentId= (empty) lists every workflow, main list + folders; dedupe by id
    const d = await g(`https://backend.leadconnectorhq.com/workflow/${LOC}/list?parentId=&limit=100&offset=0&sortBy=name&sortOrder=asc`);
    const rows = [...new Map((d.rows || []).filter(r => r.type !== 'directory').map(r => [r._id, r])).values()];
    const workflows = [];
    for (const r of rows) {
      const tr = await g(`https://backend.leadconnectorhq.com/workflow/${LOC}/trigger?workflowId=${r._id}`);
      const trig = (Array.isArray(tr) ? tr : []).map(x => ({ type: x.type, active: x.active, cond: (x.conditions || []).map(c => c.field + ' ' + String(JSON.stringify(c.value)).slice(0, 120)).join(' | ') }));
      workflows.push({ id: r._id, name: r.name, status: r.status, updatedAt: r.updatedAt, trig });
    }
    const f = await g(`https://backend.leadconnectorhq.com/forms/?locationId=${LOC}&limit=100&skip=0`);
    const forms = (f.forms || []).map(x => ({ id: x._id, name: x.name, updated: (x.dateUpdated || '').slice(0, 10) }));
    const fu = await g(`https://backend.leadconnectorhq.com/funnels/funnel/list?locationId=${LOC}&limit=100&offset=0`);
    const funnels = (fu.funnels || []).map(x => ({ id: x._id, name: x.name, folder: x.parentId || '', steps: (x.steps || []).map(s => ({ name: s.name, id: s.id, url: s.url, pages: s.pages })) }));
    const used = new Set(workflows.flatMap(w => w.trig.filter(t => /form\.id/.test(t.cond)).flatMap(t => (t.cond.match(/[A-Za-z0-9]{20}/g) || []))));
    return { workflowCount: workflows.length, workflows, forms: forms.map(x => ({ ...x, startsSomething: used.has(x.id) })), funnels };
  }, { H, LOC });
}
