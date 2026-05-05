---

title: "CNAME rules in DNS - what you need to know"
authors: simonpainter
tags:
  - dns
  - networks
  - educational
date: 2026-05-05

---

The CNAME (Canonical Name) record is one of the most straightforward DNS record types in concept: it creates an alias for a domain name. Yet the DNS specifications impose very rigid constraints on where and how CNAMEs can be used. These rules exist for good reasons: consistency, cache efficiency, and preventing resolver bugs. This post is about all the rules relating to CNAME usage, drawing directly from [RFC 1034 (Domain Names - Concepts and Facilities)](https://www.rfc-editor.org/rfc/rfc1034) and [RFC 1912 (Common DNS Operational and Configuration Errors)](https://www.rfc-editor.org/rfc/rfc1912). More importantly, it should explain some of the really annoying gotchas that have tripped me up at various points in my career, and that I want you to be better equipped to avoid.

<!-- truncate -->

## The Fundamental Coexistence Rule

The foundational rule appears in [RFC 1034, Section 3.6.2](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2): "If a CNAME RR is present at a node, no other data should be present; this ensures that the data for a canonical name and its aliases cannot be different." This is reinforced in [RFC 1912, Section 2.4](https://www.rfc-editor.org/rfc/rfc1912#section-2.4).

The reasoning is elegant and practical: a CNAME redirect says "look up this name instead," so allowing other record types at the same name would create ambiguity. Should a resolver return the CNAME, or follow it to the canonical name and return other records? The rule also ensures that "a cached CNAME can be used without checking with an authoritative server for other RR types."

This single rule cascades into several consequences.

## The Zone Apex Thing

One of the most commonly encountered CNAME restrictions is that you cannot place a CNAME at the zone apex (also called the zone root or bare domain). According to [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2), a CNAME record cannot coexist with other records, and since the root domain has mandatory NS and SOA records, it is impossible to specify a CNAME record for the apex domain.

In practical terms, if your zone is `example.com.`, you cannot create a CNAME at `example.com.` itself. You can, of course, create CNAMEs at subdomains like `www.example.com.` or `mail.example.com.`.

This is a big one these days because of two developments since RFC 1034 was published in 1987: The default expectation of web use means that people rarely type `www.example.com` because they expect example.com to work in their browser. I recall the purists in the early 2000s insisting that you should not allow the apex to resolve to the web server because it encouraged bad habits and laziness.

Regardless, and in an effort to simplify things for users, many operators added an A record at the apex pointing to the same IP as `www`. For a long time this was fine until cloud hosting, DNS-based load balancers, CDNs, and all sorts of other modern services started to expect you to point your website address to another FQDN using a CNAME rather than to an IP address using an A record.

This constraint has led to modern workarounds such as CNAME flattening and ALIAS records, which allow some DNS hosting providers to synthesize A/AAAA records from the CNAME target at the zone apex—a feature not possible with standard CNAME semantics.

There's also the HTTPS RR type, defined in [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460), which allows for aliasing at the apex without violating the coexistence rule, [but support for this record type is still limited](svcb-https-records.md).

## CNAME Chains: The Loop Problem

[RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) notes that "having chained records such as CNAMEs pointing to CNAMEs may make administration issues easier, but is known to tickle bugs in some resolvers that fail to check loops correctly. As a result some hosts may not be able to resolve such names."

CNAME chains are not forbidden by the RFCs, but they are explicitly discouraged. The concern is twofold:

1. **Resolver bugs**: Older or non-compliant resolvers may fail to properly detect and break infinite loops. You could end up with chains like:

   ```dns
   foo.example.com.  CNAME bar.example.com.
   bar.example.com.  CNAME baz.example.com.
   baz.example.com.  A 192.0.2.1
   ```

   Most modern resolvers handle this fine, but [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) warns that some will not.

2. **Unresolvable loops**: It is entirely possible to create circular CNAME chains:

   ```dns
   foo.example.com.  CNAME bar.example.com.
   bar.example.com.  CNAME foo.example.com.
   ```

   A CNAME record cannot appear at the zone apex, and it is possible to create unresolvable loops with CNAME records. Such configurations will break DNS resolution for those names entirely.

   Avoid CNAME chains where possible. If you need multiple levels of indirection, consider that you probably actually don't.

## NS Records Cannot Point to CNAMEs

[RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) explicitly warns that "having NS records pointing to a CNAME is bad and may conflict badly with current BIND servers. In fact, current BIND implementations will ignore such records, possibly leading to a lame delegation."

The problem is compounded by another issue noted in the same section: "older BIND servers reportedly will get caught in an infinite query loop trying to figure out the address for the aliased nameserver, causing a continuous stream of DNS requests to be sent."

Practically, this means the delegation will not work. When a resolver encounters an NS record pointing to a CNAME, it will attempt to follow the alias to get the nameserver's IP address, but the chain breaks down or loops. Lame delegations result, where DNS queries for the delegated zone fail.

**Configuration example (do NOT do this):**

```dns
podunk.xx.  NS ns1.example.com.
            NS ns2.example.com.

ns1.example.com.  CNAME ns1-primary.example.com.
ns1-primary.example.com.  A 192.0.2.1
ns2.example.com.          A 192.0.2.2
```

The delegation to `ns1.example.com` will be lame because the NS record points to a CNAME.

## MX Records Must Not Point to CNAMEs

One of the clearest restrictions on CNAMEs concerns mail exchange records. [RFC 1034 in section 3.6.2](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2) says this should not be done, and [RFC 974](https://www.rfc-editor.org/rfc/rfc974) explicitly states that MX records shall not point to an alias defined by a CNAME. This results in unnecessary indirection in accessing the data, and DNS resolvers and servers need to work more to get the answer.

[RFC 2181 (on DNS semantics and clarifications)](https://www.rfc-editor.org/rfc/rfc2181#section-10.3) states clearly: "The domain name used as the value of a NS resource record, or part of the value of a MX resource record must not be an alias."

**Prohibited configuration:**

```
example.com.  MX 10 mail.example.com.

mail.example.com.  CNAME mail-server.example.com.
mail-server.example.com.  A 192.0.2.5
```

The MX record should instead point directly to the canonical name:

```
example.com.  MX 10 mail-server.example.com.

mail-server.example.com.  A 192.0.2.5
```

### MX Records Must Not Contain IP Literals

Bit of a side note here, and just because we're talking about MX records and their EXCHANGE field: [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035) states that the EXCHANGE field of an MX record must contain a domain name, not an IP address. So you can't have a CNAME and you can't have an IP literal. You've basically **got** to have a proper hostname, either an A or a AAAA record, that the mail server can resolve to an address.

To understand why this matters, it helps to look at the wire format of these records. [RFC 1035 Section 3.3.9](https://www.rfc-editor.org/rfc/rfc1035#section-3.3.9) defines the MX RDATA structure as a 16-bit PREFERENCE value followed by an EXCHANGE field of type `<domain-name>`. The `<domain-name>` type is a DNS name on the wire: a sequence of length-prefixed labels terminated by a zero-length root label.

Compare this to the A record, defined in [RFC 1035 Section 3.4.1](https://www.rfc-editor.org/rfc/rfc1035#section-3.4.1), whose RDATA is exactly four octets representing a 32-bit IPv4 address in network byte order. In other words, an A record stores an address, while an MX record stores a name.

That's the real reason IP literals are forbidden in MX records. The EXCHANGE field doesn't have an "IP address mode" at all; it always encodes a domain name. If you wrote `192.0.2.5` there, DNS would treat it as the domain name `192.0.2.5.` rather than as an IPv4 literal. Mail delivery then looks up that hostname and expects to find address records such as A or AAAA, which keeps MX tied to names instead of embedding a specific address family into the record itself.

**Incorrect (forbidden):**

```dns
example.com.  MX 10 192.0.2.5
```

**Correct:**

```
example.com.  MX 10 mail.example.com.
mail.example.com.  A 192.0.2.5
```

The same principle applies to NS records, which also use a `<domain-name>` in their RDATA — you cannot shortcut the indirection by stuffing an IP literal into the field. This name-based delegation is also what makes glue records necessary, and it's worth examining that in its own right another time.

## When CNAMEs Are Appropriate

OK, I went wildly off topic there, but all of DNS is a precise endeavour. The point is that the rules around CNAMEs are strict for good reasons, and they are not meant to be a gotcha or a trap. They are designed to ensure that DNS resolution is efficient, consistent, and compatible with all implementations. To balance this cautionary tone, [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) also provides positive guidance on CNAME use:

"Use them when renaming hosts, but plan to get rid of them (and inform your users). However CNAMEs are useful (and encouraged) for generalized names for servers -- `ftp' for your ftp server, `www' for your Web server, `gopher' for your Gopher server, `news' for your Usenet news server, etc."

> Haven't heard of Gopher? It's a pre-web protocol for distributed document search and retrieval. It was popular in the early 1990s but was quickly overshadowed by the rise of the World Wide Web. The mention of Gopher in RFC 1912 is a reminder of how some things go away and some things persevere.

CNAMEs are invaluable for creating semantic aliases: you can point `www.example.com` to the same server as `example.com` without duplicating A records. You can use `ftp.example.com` and `mail.example.com` as logical names that all resolve to the same host. This is excellent practice and explicitly encouraged.

The cautions apply when you break the coexistence rule or create chains and loops. Simple, direct CNAMEs remain one of DNS's most useful and appropriate tools.

## Summary of Rules

| Rule | RFC | Severity |
|------|-----|----------|
| CNAME must not coexist with other record types at the same name | [RFC 1034 3.6.2](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2), [RFC 1912 2.4](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | MUST NOT |
| CNAME cannot exist at zone apex (due to mandatory SOA/NS) | [RFC 1034 4.2.1](https://www.rfc-editor.org/rfc/rfc1034#section-4.2.1), [3.6.2](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2) | MUST NOT |
| CNAME-to-CNAME chains should be avoided | [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | SHOULD NOT |
| CNAME-to-CNAME loops must not be created (unresolvable) | [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034), [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912) | MUST NOT |
| NS records must not point to CNAMEs | [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | MUST NOT |
| MX records must not point to CNAMEs | [RFC 974](https://www.rfc-editor.org/rfc/rfc974), [RFC 1034 3.6.2](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2), [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | MUST NOT |
| PTR records must not point to CNAMEs | [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | MUST NOT |
| Do not mix CNAMEs with name-pointer records (MX, NS, PTR) | [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | SHOULD NOT |