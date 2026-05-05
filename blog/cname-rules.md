---

title: "CNAME Rules in DNS: A Comprehensive Reference to RFC 1034 and RFC 1912"
authors: simonpainter
tags:
  - dns
  - networks
  - educational
date: 2026-05-05

---

The CNAME (Canonical Name) record is one of the most straightforward DNS record types in concept—it creates an alias for a domain name. Yet the DNS specifications impose surprisingly rigid constraints on where and how CNAMEs can be used. These rules exist for good reasons: consistency, cache efficiency, and preventing resolver bugs. This post catalogues all the rules relating to CNAME usage, drawing directly from [RFC 1034 (Domain Names - Concepts and Facilities)](https://www.rfc-editor.org/rfc/rfc1034) and [RFC 1912 (Common DNS Operational and Configuration Errors)](https://www.rfc-editor.org/rfc/rfc1912).

<!-- truncate -->

## The Fundamental Coexistence Rule

The foundational rule appears in [RFC 1034, Section 3.6.2](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2): "If a CNAME RR is present at a node, no other data should be present; this ensures that the data for a canonical name and its aliases cannot be different." This is reinforced in [RFC 1912, Section 2.4](https://www.rfc-editor.org/rfc/rfc1912#section-2.4).

The reasoning is elegant and practical: a CNAME redirect says "look up this name instead," so allowing other record types at the same name would create ambiguity. Should a resolver return the CNAME, or follow it to the canonical name and return other records? The rule also ensures that "a cached CNAME can be used without checking with an authoritative server for other RR types."

This single rule cascades into several consequences worth examining.

## The Zone Apex Prohibition

One of the most commonly encountered CNAME restrictions is that you cannot place a CNAME at the zone apex (also called the zone root or bare domain). According to [RFC 1034](https://www.rfc-editor.org/rfc/rfc1034#section-3.6.2), a CNAME record cannot coexist with other records, and since the root domain has mandatory NS and SOA records, it is impossible to specify a CNAME record for the apex domain.

In practical terms, if your zone is `example.com.`, you cannot create a CNAME at `example.com.` itself. You can, of course, create CNAMEs at subdomains like `www.example.com.` or `mail.example.com.`.

This constraint has led to modern workarounds such as CNAME flattening and ALIAS records, which allow some DNS hosting providers to synthesize A/AAAA records from the CNAME target at the zone apex—a feature not possible with standard CNAME semantics.

## CNAME Chains: The Loop Problem

[RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) notes that "having chained records such as CNAMEs pointing to CNAMEs may make administration issues easier, but is known to tickle bugs in some resolvers that fail to check loops correctly. As a result some hosts may not be able to resolve such names."

CNAME chains are not forbidden by the RFCs, but they are explicitly discouraged. The concern is twofold:

1. **Resolver bugs**: Older or non-compliant resolvers may fail to properly detect and break infinite loops. You could end up with chains like:

   ```
   foo.example.com.  CNAME bar.example.com.
   bar.example.com.  CNAME baz.example.com.
   baz.example.com.  A 192.0.2.1
   ```

   Most modern resolvers handle this fine, but [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) warns that some will not.

2. **Unresolvable loops**: It is entirely possible to create circular CNAME chains:

   ```
   foo.example.com.  CNAME bar.example.com.
   bar.example.com.  CNAME foo.example.com.
   ```

   A CNAME record cannot appear at the zone apex, and it is possible to create unresolvable loops with CNAME records. Such configurations will break DNS resolution for those names entirely.

The practical guidance: avoid CNAME chains where possible. If you need multiple levels of indirection, consider whether a different approach (such as DNAME for subtree delegation) might be more appropriate.

## NS Records Cannot Point to CNAMEs

[RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) explicitly warns that "having NS records pointing to a CNAME is bad and may conflict badly with current BIND servers. In fact, current BIND implementations will ignore such records, possibly leading to a lame delegation."

The problem is compounded by another issue noted in the same section: "older BIND servers reportedly will get caught in an infinite query loop trying to figure out the address for the aliased nameserver, causing a continuous stream of DNS requests to be sent."

Practically, this means the delegation will not work. When a resolver encounters an NS record pointing to a CNAME, it will attempt to follow the alias to get the nameserver's IP address, but the chain breaks down or loops. Lame delegations result, where DNS queries for the delegated zone fail.

**Configuration example (do NOT do this):**

```
podunk.xx.  NS ns1.example.com.
            NS ns2.example.com.

ns1.example.com.  CNAME ns1-primary.example.com.
ns1-primary.example.com.  A 192.0.2.1
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

Related to the above: [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035) states that the EXCHANGE field of an MX record must contain a domain name, not an IP address. Several domains on the internet have configured their MX records so that the hostname field contains a textual IP address, which is against the DNS standard.

To understand why this matters, it helps to look at the wire format of these records. [RFC 1035 Section 3.3.9](https://www.rfc-editor.org/rfc/rfc1035#section-3.3.9) defines the MX RDATA structure as a 16-bit PREFERENCE value followed by an EXCHANGE field of type `<domain-name>`. The `<domain-name>` type is itself a defined wire format—a sequence of length-prefixed labels terminated by a zero-length root label. It is, in essence, a structured text representation of a hostname.

Compare this to the A record, defined in [RFC 1035 Section 3.4.1](https://www.rfc-editor.org/rfc/rfc1035#section-3.4.1), whose RDATA is exactly four octets representing a 32-bit IPv4 address in network byte order. There is no parsing required; the four bytes *are* the address.

This difference is fundamental. When a mail server receives an MX response, it gets back a domain-name structure that it must then resolve to an actual address by issuing a follow-up A or AAAA query. To "put an IP in an MX record" you would have to encode the IP as the textual dotted-decimal representation (e.g., `192.0.2.5`) packed into the `<domain-name>` wire format—four labels of digit characters terminated by a root label. The receiving mail server would then have to:

1. Parse the labels back out of the wire format into a string
2. Recognise that the string happens to look like a dotted-decimal IP address
3. Convert the textual representation back into a 32-bit address
4. Skip the normal A-record lookup that would otherwise follow

That is wildly inefficient compared to a single A-record query that returns four bytes ready to use, and crucially it is not what the protocol specifies. [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035#section-3.3.9) says the EXCHANGE field is a `<domain-name>`, full stop. There is no provision in the SMTP or DNS specifications for treating that domain name as anything other than a name to be resolved. A standards-compliant mail server will perform an A/AAAA lookup on whatever string sits in that field, and if the string happens to look like an IP address, the lookup will fail (because there is no A record at the name `192.0.2.5.`).

**Incorrect (forbidden):**

```
example.com.  MX 10 192.0.2.5
```

**Correct:**

```
example.com.  MX 10 mail.example.com.
mail.example.com.  A 192.0.2.5
```

The same principle applies to NS records, which also use a `<domain-name>` in their RDATA — you cannot shortcut the indirection by stuffing an IP literal into the field. This name-based delegation is also what makes glue records necessary, and it's worth examining that in its own right.

## Glue Records: A Consequence of Name-Based Delegation

The fact that NS records contain a `<domain-name>` rather than an IP address creates an interesting bootstrap problem whenever a zone's nameservers are themselves named within that same zone. This is precisely what makes glue records necessary.

Consider a typical delegation. The `.com` registry needs to delegate `example.com` to its nameservers:

```
example.com.  NS ns1.example.com.
example.com.  NS ns2.example.com.
```

A resolver trying to look up anything in `example.com` queries a `.com` nameserver and receives this delegation. But there is now a circular dependency: to query `ns1.example.com`, the resolver needs to know its IP address, and to find that, it needs to query the nameservers for `example.com` — but `ns1.example.com` *is* one of those nameservers. The resolver cannot break out of this cycle with the information it has been given.

The solution is to include the IP addresses of the in-zone nameservers directly in the parent's delegation response, carried in the additional section of the DNS message:

```
;; AUTHORITY SECTION:
example.com.  NS ns1.example.com.
example.com.  NS ns2.example.com.

;; ADDITIONAL SECTION:
ns1.example.com.  A    192.0.2.1
ns1.example.com.  AAAA 2001:db8::1
ns2.example.com.  A    192.0.2.2
ns2.example.com.  AAAA 2001:db8::2
```

These A and AAAA records in the additional section are the **glue**. They are records that the parent zone (`.com`) has no authority over — the authoritative copies live in `example.com` itself — but the parent serves them anyway because the delegation cannot function without them. Conceptually, they are hints copied from the child zone and stored alongside the delegation purely to break the bootstrap cycle.

### When Glue Is Required (and When It Isn't)

Glue is only required when nameservers are **in-bailiwick** — that is, when the nameserver name is a subdomain of (or identical to) the zone being delegated. The distinction is straightforward:

- **Glue required**: `example.com NS ns1.example.com.` — the nameserver lives in the zone it serves, creating the circular dependency.
- **Glue required**: `example.com NS ns1.dns.example.com.` — still beneath `example.com`, same problem.
- **Glue not required**: `example.com NS ns1.example.net.` — the nameserver lives in a completely separate zone. A resolver can independently resolve `ns1.example.net` via normal recursion from the root, with no chicken-and-egg.

This is why some operators deliberately use out-of-bailiwick nameservers: it eliminates the need for glue, simplifies registrar management, and removes the operational risk of stale or incorrect glue at the parent zone. The trade-off is a dependency on a separate zone for resolution to work.

### Glue Is Not Authoritative Data

A subtle but important point: glue records served by the parent zone are not authoritative data of the parent. The `.com` operators do not own or control the contents of `example.com`'s nameserver IP addresses — they simply hold a copy provided by the zone owner through the registrar's "host record" or "child nameserver" registration interface. The authoritative versions of those A and AAAA records live in the `example.com` zone itself.

This has several practical consequences:

- **DNSSEC**: Glue records cannot be signed by the parent zone because they are not authoritative there. The signed copies live in the child zone, and resolvers validating DNSSEC will fetch and verify them once they have used the glue to bootstrap the connection.
- **Stale glue**: If you change a nameserver's IP address, you must update both the A record in your own zone *and* the glue record at the registrar. Forgetting the latter results in stale glue and intermittent resolution failures that can be maddening to diagnose, because some resolvers will end up at the right address (via cached child-zone data) and others will not (via stale parent glue).
- **Bailiwick checking**: Modern resolvers only accept glue from the parent for names that fall within or beneath the zone being delegated. Out-of-bailiwick "glue" is discarded to prevent cache poisoning attacks — a malicious nameserver cannot use the additional section to inject IP addresses for arbitrary names. This restriction was tightened significantly in the wake of the Kaminsky-class vulnerabilities.

### Tying It Back to CNAMEs

Glue records also explain why the prohibition on NS records pointing to CNAMEs has such teeth in practice. Glue is registered and served by name — the parent zone publishes A and AAAA records for the *exact* nameserver names that appear in the NS RRset. If you tried to set up:

```
example.com.  NS ns1.example.com.

ns1.example.com.      CNAME real-ns.example.com.
real-ns.example.com.  A     192.0.2.1
```

…then the glue at the parent must be for `ns1.example.com`, but no direct A record exists at that name — only a CNAME pointing elsewhere. Registrars generally will not accept a CNAME as a glue target, BIND will not follow it during delegation processing, and the additional-section response from the parent will either be empty or wrong. The result is the lame delegation that [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) warns about. The whole architecture of glue assumes that NS records point straight at host names with direct A and AAAA records, with no further indirection in the path.

In short: glue records exist because NS records carry names rather than addresses, and they only work cleanly because those names resolve directly. Each restriction reinforces the other.

## PTR Records and CNAME

Reverse DNS (PTR) records have their own CNAME restriction. [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) states that "PTR records must point back to a valid A record, not a alias defined by a CNAME."

For reverse DNS to work reliably, the PTR record must resolve to an A or AAAA record directly. Pointing a PTR record to a CNAME breaks the reverse lookup chain and causes mail servers and other systems to reject the configuration.

## General Guidance: Avoid CNAME with Name-Pointer Records

[RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) provides broad guidance: "Don't use CNAMEs in combination with RRs which point to other names like MX, CNAME, PTR and NS. (PTR is an exception if you want to implement classless in-addr delegation.)"

The pattern is clear: records that point to other names in the DNS (rather than to data like addresses or mail preferences) are problematic with CNAMEs. The reason is that following a chain of name pointers compounds complexity and creates opportunities for misconfiguration and resolver errors.

## When CNAMEs Are Appropriate

To balance this cautionary tone, [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) also provides positive guidance on CNAME use:

"Use them when renaming hosts, but plan to get rid of them (and inform your users). However CNAMEs are useful (and encouraged) for generalized names for servers -- `ftp' for your ftp server, `www' for your Web server, `gopher' for your Gopher server, `news' for your Usenet news server, etc."

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
| MX EXCHANGE must be a domain name, not an IP literal | [RFC 1035](https://www.rfc-editor.org/rfc/rfc1035#section-3.3.9) | MUST NOT |
| PTR records must not point to CNAMEs | [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | MUST NOT |
| Do not mix CNAMEs with name-pointer records (MX, NS, PTR) | [RFC 1912](https://www.rfc-editor.org/rfc/rfc1912#section-2.4) | SHOULD NOT |

## Conclusion

The restrictions on CNAME usage, while initially seeming constraining, reflect careful consideration of resolver behavior, cache efficiency, and the avoidance of edge cases that break in older or non-compliant implementations. The rules boil down to a few core principles:

1. **Coexistence**: A CNAME stands alone at its name
2. **Chains**: Follow them sparingly, never in circles
3. **Delegation**: Don't use CNAMEs with delegation (NS) or routing (MX) pointers
4. **Apex**: The zone root is off-limits for CNAME

When used appropriately—as simple, direct aliases for hosts and services—CNAME records remain an elegant and indispensable DNS tool. It is only when you attempt to bend them to other purposes that the restrictions bite.
