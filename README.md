# GHL Toolkit

Small tools for GoHighLevel (GHL) work: checking email deliverability, reading funnels, and
auditing an account without changing anything. Most are read-only.

| Tool | What it does |
|---|---|
| `check-email-dns.sh` | Checks a domain's SPF, DMARC, DKIM and MX records. Public DNS only, no login. |
| `check-blocklists.sh` | Checks a sending IP and domains against public spam blocklists. Tests each list first, so "not listed" can be trusted. |
| `read-funnel-page.py` | Reads a public GHL funnel page without logging in: the page text, prices and funnel steps. |
| `ghl-account-scan.js` | Read-only account audit: every workflow with its start rule, every form, every funnel and its steps. Shows forms that start no workflow. |
| `replace-email-text.js` | Replaces exact text inside a GHL email body and keeps the formatting. |
| `partial-capture-test.js` | Tests whether a form can catch an email before the visitor clicks submit (for abandoned sign-up follow-up). |

## Usage

```bash
zsh check-email-dns.sh yourdomain.com
bash check-blocklists.sh 203.0.113.10 yourdomain.com
python3 read-funnel-page.py https://yourdomain.com/optin
```

The `.js` tools run inside a logged-in browser through Playwright. Each file's top comment
explains how to run it and what a good result looks like. Set `YOUR_LOCATION_ID` in
`ghl-account-scan.js` to your own sub-account ID.
