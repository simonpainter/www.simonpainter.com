---

title: "DNS AID: decentralized AI agent discovery via DNS"
authors: simonpainter
tags:
  - dns
  - mcp
  - ai
date: 2026-05-28

---

Most teams building agent integrations are still wiring point to point URLs, API docs, and trust assumptions by hand. It works until scale shows up. Then everything gets brittle: stale endpoints, duplicated metadata, and too many side channels for discovery.

[DNS-AID](https://dns-aid.org) proposes a different approach: publish agent discovery metadata in DNS, under domains you already own, using [SVCB from RFC 9460](https://www.rfc-editor.org/rfc/rfc9460). Think "service discovery, but for agents" in the same spirit as SRV, ACME, OIDC discovery, and DNS-SD patterns.
<!-- truncate -->

The Linux Foundation announcement puts real momentum behind it, and there is already an open source reference stack in [`dns-aid-core`](https://github.com/dns-aid/dns-aid-core): Python SDK, CLI, and an MCP server.

## 1) The agent discovery problem

Today's common pattern is simple but fragile:

- Hardcode agent endpoints in clients
- Maintain capability metadata in separate registries or docs
- Handle trust and ownership out of band
- Rebuild the same glue in every environment

That is fine for a demo, but not for an enterprise platform team trying to run internal, partner, and external agents with change control.

## 2) Why DNS is a credible substrate

DNS already gives you what discovery systems need:

- Delegation and ownership tied to domains
- Global and private namespace support
- Caching and TTL-based control
- Existing operational tooling, controls, and audit patterns

DNS-AID does not invent a new naming system. It reuses DNS records and conventions.

## 3) How DNS-AID works

### Naming pattern

The `-02` draft puts the canonical owner at a flat FQDN under the operator's zone:

`{agent-name}.{your-domain}`

Examples:

- `chatbot.example.com`
- `search.example.com`
- `_index._agents.example.com` for the org-level discovery entry (this one keeps the underscore convention)

An optional walkable AliasMode is published at `{agent-name}._agents.{your-domain}` for crawlers and zone enumeration; it's an AliasMode SVCB record pointing back at the canonical flat name. The flat form is the canonical owner because `dNSName` SAN entries in publicly-issued x.509 certificates cannot contain underscores (per RFC 5280 / CA-Browser Forum BR preferred-name syntax in RFC 1034). The draft itself names this constraint in §3: *"the TargetName domain name MUST NOT contain underscores as public x.509 certificates will be used in communications."*

### Minimum record set from the IETF draft

Per [draft-mozleywilliams-dnsop-dnsaid-02](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/):

- **SVCB** is the primary discovery record and should be tried first
- **TLSA (DANE)** is optional, but if used it must be DNSSEC signed
- **DNSSEC** should sign records for origin authenticity and integrity
- **TXT** fallback is possible when SVCB publishing is constrained, but it is second best

### SVCB params and keys to know

From the draft and implementation docs:

- Standard SVCB fields: `TargetName`, `port`, `alpn`, `ipv4hint`, `ipv6hint`, `mandatory`
- Draft-proposed DNS-AID keys: `cap`, `cap-sha256`, `policy`, `realm`, `well-known`, `bap`
- ALPN identifiers in scope include `mcp` and `a2a` (IANA request in draft)

### Discovery chain in practice

`dns-aid-core` describes this practical metadata chain:

1. Read SVCB, including `cap` when present
2. Fetch `/.well-known/agent-card.json` for richer endpoint details
3. Optionally consult an HTTP index (`/.well-known/agent-index.json`)
4. Fall back to TXT where needed

That design gives a useful split: DNS remains the authoritative discovery substrate, HTTP can enrich metadata.

### Runnable examples from `dns-aid-core`

Publish and discover with CLI:

```bash
dns-aid publish \
  --name my-chatbot \
  --domain example.com \
  --protocol mcp \
  --endpoint agent.example.com \
  --capability chat

dns-aid discover example.com --json
```

Local BIND9 playground example from the docs:

```bash
docker compose -f tests/integration/bind/docker-compose.yml up -d
dns-aid publish my-agent --domain test.dns-aid.local --backend ddns
dns-aid discover test.dns-aid.local --backend ddns
```

And inspect DNS directly:

```bash
dig SVCB chatbot.example.com                 # canonical flat owner
dig SVCB chatbot._agents.example.com         # optional walkable AliasMode
dig TXT  _index._agents.example.com          # org-level index
```

## 4) Trust model: what is proven, what is not

DNS-AID can strengthen trust, but it does not magically make an agent safe.

- DNSSEC helps prove record origin and integrity
- TLSA can pin endpoint identity in DANE-aware flows
- `cap-sha256` can detect capability document tampering
- Optional signatures (for example JWS in implementation patterns) can help with metadata provenance

What DNS-AID does **not** prove is runtime behaviour quality. You still need policy, reputation, and runtime controls.

## 5) Enterprise deployment patterns

### Split-horizon and private zones

You can publish different discovery views internally and externally, which matters for:

- Internal-only agent endpoints
- Staged rollouts by environment (`dev`, `prod`)
- Tenant and policy boundaries

### Multi-cloud and hosted endpoints

SVCB `TargetName` supports pointing at hosted service domains, so your namespace ownership can stay local while runtime endpoints live elsewhere.

### Backend reality in tooling

The reference implementation already supports multiple DNS control planes, including Cloudflare, Route 53, Google Cloud DNS, NS1, Infoblox BloxOne, Infoblox NIOS, RFC2136 DDNS, and a local BIND9 test environment.

## 6) Architect checklist: risks and mitigations

| Risk | Why it matters | Mitigation |
| --- | --- | --- |
| Impersonation or squatting | Fake or hijacked records can misroute calls | DNSSEC validation, ownership checks, strict zone governance |
| Stale discovery data | Cached records can point to old endpoints | Shorter TTLs for volatile agents, staged cutovers, rollback playbooks |
| Metadata leakage | Capability and policy fields can expose internals | Metadata minimization, private zones, split-horizon publishing |
| Downgrade or weak validation | Clients may ignore strong signals | Enforce `mandatory` keys where needed, define client trust posture |
| Index blast radius | Bad index data can affect many consumers | Limit index scope, version index docs, monitor query and error rates |

## Org-level indexing, protocol agnostic behavior, and data leakage

Three practical questions matter most for platform teams.

### How org-level indexing works

The draft defines `_index._agents.{domain}` as a well-known DNS entry point that returns an SVCB pointer to the organization index endpoint. In implementation, pure DNS discovery can also use TXT at `_index._agents.{domain}` to enumerate `agent:protocol` pairs before resolving each agent SVCB.

Example pattern:

```dns
_index._agents.example.com. 3600 IN SVCB 1 agent-index.example.com. (
  alpn="h2"
  port=443
)

_index._agents.example.com. 300 IN TXT "chatbot:mcp,search:a2a"
```

### What protocol agnostic means in deployment

Protocol agnostic means DNS-AID can carry endpoint metadata for MCP, A2A, HTTPS, or future protocols without changing the substrate. Under `-02`, agent-protocol carriage moved into a new `bap` SvcParamKey so `alpn` returns to its RFC 9460 transport role. Each protocol suite is represented by a distinct SVCB record with `bap` naming the agent protocol and `alpn` carrying the TLS transport:

```dns
agent-name.example.com. IN SVCB 1 . alpn="h2,h3" bap="mcp"
agent-name.example.com. IN SVCB 1 . alpn="h2"    bap="a2a"
```

This lets clients choose agent protocol and TLS transport independently. (`alpn=<agent-protocol>` alone is still permitted by the draft when only one protocol is supported.)

### How to avoid turning discovery into a data leak

Treat discoverability as a least-data design problem:

- Publish only metadata needed for connection bootstrap
- Keep sensitive capability detail behind authenticated HTTP endpoints
- Use private zones for internal agents
- Use split-horizon policies to expose different records by audience
- Audit what your DNS records reveal, just like you audit public API docs

## Why this matters

For enterprise platform teams, DNS-AID is interesting because it fits existing DNS operating models while giving agent ecosystems a standard discovery layer. If agent fabrics become core infrastructure, then deterministic discovery, delegated ownership, and verifiable metadata are not optional extras. They are table stakes.

If you are building agent platforms today, this is worth piloting now, before hardcoded discovery patterns become your next migration problem.
