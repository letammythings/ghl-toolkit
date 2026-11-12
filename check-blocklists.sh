#!/usr/bin/env bash
# Check a sending IP and domains against public blocklists via DNS (free, no API key).
# Usage: bash check-blocklists.sh <ip> <domain> [domain...]
# Verify: each list's test entry must answer (printed first); "not listed" is only trusted if it does.
# Get the IP from Gmail "Show original" (Received: from ... [IP]) or header X-Mailgun-Sending-Ip.
ip="$1"; shift
rev=$(echo "$ip" | awk -F. '{print $4"."$3"."$2"."$1}')
echo "== test entries (must answer, else results are meaningless)"
for z in zen.spamhaus.org bl.spamcop.net b.barracudacentral.org; do echo "$z: $(dig +short 2.0.0.127.$z | tr '\n' ' ')"; done
echo "dbl.spamhaus.org: $(dig +short dbltest.com.dbl.spamhaus.org)"
echo "== IP $ip"
for bl in zen.spamhaus.org bl.spamcop.net b.barracudacentral.org psbl.surriel.com bl.mailspike.net dnsbl-1.uceprotect.net dnsbl-2.uceprotect.net dnsbl-3.uceprotect.net ix.dnsbl.manitu.net truncate.gbudb.net rbl.0spam.org; do
  r=$(dig +short +time=3 +tries=1 "$rev.$bl" A | tr '\n' ' '); echo "$bl: ${r:-not listed}"
done
echo "mailspike reputation (127.0.0.15 neutral, higher = better): $(dig +short $rev.rep.mailspike.net)"
echo "== domains"
for d in "$@"; do
  for bl in dbl.spamhaus.org multi.surbl.org multi.uribl.com dbl.0spam.org; do
    r=$(dig +short +time=3 +tries=1 "$d.$bl" A | tr '\n' ' '); echo "$d @ $bl: ${r:-not listed}"
  done
  echo "$d Google Safe Browsing: $(curl -s --max-time 10 "https://transparencyreport.google.com/transparencyreport/api/v3/safebrowsing/status?site=$d" | tail -c 80)  (2nd field 1 = no unsafe content)"
done
