#!/bin/zsh
# Check a domain's public email settings (SPF, DMARC, Google DKIM, MX, DNS host, wildcard).
# Usage: zsh check-email-dns.sh domain.com [dkim-selector] [keap-app-id]   (selector defaults to "google")
# keap-app-id = the part after keap.page/ in Keap links (e.g. abc123).
# Read-only public DNS lookups; no login, no keys.
d="$1"; sel="${2:-google}"
[ -z "$d" ] && { echo "usage: $0 domain.com [dkim-selector]"; exit 1; }

echo "== SPF: TXT $d (look for v=spf1)"; dig +short TXT "$d" | sed 's/^/  /'
echo "== DMARC: TXT _dmarc.$d (look for v=DMARC1)"; r=$(dig +short TXT "_dmarc.$d"); echo "  ${r:-(none)}"
echo "== DKIM: TXT $sel._domainkey.$d (none here does NOT prove DKIM is missing)"; r=$(dig +short TXT "$sel._domainkey.$d" | cut -c1-80); echo "  ${r:-(none)}"
echo "== MX $d"; dig +short MX "$d" | sed 's/^/  /'
echo "== NS $d (where DNS is edited)"; dig +short NS "$d" | sed 's/^/  /'
if [ -n "$3" ]; then k="$3"; echo "== Keap ($k): DKIM ${k}1/${k}2._domainkey + bounce host $k.$d (CNAMEs to infusionmail = Keap sends as this domain)"; for n in "${k}1._domainkey" "${k}2._domainkey" "$k"; do r=$(dig +short CNAME "$n.$d"); echo "  $n: ${r:-(none)}"; done; fi
w=$(dig +short TXT "zzz-test-$RANDOM.$d")
echo "== Wildcard test (made-up name): ${w:-(none)}"
[ -n "$w" ] && echo "  ⚠️ Made-up names answer too: any CNAME above that matches this is a catch-all, not a real record."
