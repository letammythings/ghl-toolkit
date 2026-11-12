#!/usr/bin/env python3
"""Read a public GHL funnel page without logging in: page text, prices, and the funnel's steps.
Usage: python3 -I read-funnel-page.py https://example.com/optin
Correct output: '## Text' (page words), '## Prices' ($ amounts), '## Funnel steps' (name -> path).
"""
import html, re, sys, urllib.request

url = sys.argv[1]
s = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read().decode("utf-8", "replace")
t = re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S)
t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t))).strip()
print("## Text\n" + t[:4000])
print("\n## Prices\n" + ", ".join(sorted(set(re.findall(r"\$\s?\d[\d,.]*", t)))))
# GHL embeds the funnel's steps in page data as bare path strings ("\u002Fbundle") with step names nearby.
print("\n## Funnel steps (path: nearby names)")
for m in re.finditer(r'"\\u002F([\w-]+)"', s):
    near = re.findall(r'"([A-Z][\w ()-]{2,40})"', s[m.end():m.end() + 200])
    print("/" + m.group(1), ":", ", ".join(near[:2]))
