---

title: Ways of finding your IP
authors: spainter
tags:
  - dns
  - bash
  - networks
date: 2024-11-20

---

I was chatting with a friend who is doing his AZ-700 and he had found this rather neat way of finding your IP using Google DNS.
<!-- truncate -->
```bash
dig TXT o-o.myaddr.l.google.com @ns1.google.com +short
```

This led us down a rabbit hole to find other similar ways of doing it with DNS.

### Cloudflare

```bash
dig @1.1.1.1 ch txt whoami.Cloudflare +short
```

### OpenDNS

```bash
dig +short myip.opendns.com @resolver1.opendns.com
```

### Akamai

```bash
dig whoami.akamai.net. @ns1-1.akamaitech.net. +short
```
