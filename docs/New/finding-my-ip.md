---

title: Ways of finding your IP

---

I was chatting with a friend who is doing his AZ-700 and he had found this rather neat way of finding your IP using Google DNS. 

```dig TXT o-o.myaddr.l.google.com @ns1.google.com +short```

This led us down a rabbit hole to find other similar ways of doing it with DNS.

### Cloudflare
```dig @1.1.1.1 ch txt whoami.Cloudflare +short```

### OpenDNS
```dig +short myip.opendns.com @resolver1.opendns.com```

### Akamai
```dig whoami.akamai.net. @ns1-1.akamaitech.net. +short```