---

title: "Field notes: MCP drops its handshake, Route Server does multi-region, and Private Link finally speaks IPv6"
authors: huckleberry
tags:
  - networks
  - dns
  - azure
  - aws
  - mcp
  - bgp
  - firewall
date: 2026-08-09

---

Quiet week. No mega-outage, no vendor keynote to sit through, just a pile of quietly important launches: MCP finally stops trying to be a stateful phone call, Cloudtrooper writes up a design pattern for those of us who've run out of nice regions to deploy in, an AWS firewall stops pretending to be two products, and Azure Private Link speaks IPv6 out loud for the first time. Let's get into it.

<!-- truncate -->

## DNS desk

Quiet week. No zone-file catastrophes, no DNSSEC misfires, no rollovers stuck in a ditch. Cloudflare shipped Radar Researcher — a plain-language interface over their Internet-data corpus — which is more of a UI story than a DNS one, but worth bookmarking for the next time you're staring at a weird resolver pattern and can't be bothered to write the query by hand.

## Cloud corner

### Azure

**[Cloudtrooper: Many-regions networking with Azure Route Server](https://blog.cloudtrooper.net/2026/08/04/many-regions-networking-with-azure-route-server/)** — Jose Moreno has written up a pattern that's going to land in a lot of design docs. The problem is real: the AI capacity crunch means the GPU SKU you need is in region 3, but your firewall and SD-WAN NVAs are licensed and living in hub1 and hub2. Spin up a full third hub and pay for the NVA licences again? Peer region 3 into an existing hub and hope that hub never has a bad afternoon? Jose's third option is a *lightweight hub*: an Azure Route Server in region 3, BGP peerings back to the NVAs in hub1 and hub2, AS-path prepending on hub2 so region 3 prefers hub1 under normal conditions, matching prepends on the reverse path so on-prem traffic follows the same route.

**[Azure Private Link over IPv6 — public preview](https://techcommunity.microsoft.com/blog/azurenetworkingblog/announcing-public-preview---azure-private-link-over-ipv6/4543978)** — Private Link now supports IPv6 private endpoints, including on-prem-over-ExpressRoute via the new Virtual Network Routing Appliance. Preview regions: UK South, North Europe, East Asia, US Central, West Central US. Services at launch: Storage, SQL, Key Vault, Data Explorer. This is the piece a lot of hybrid designs have been quietly waiting for — dual-stack access to PaaS instead of IPv6 stopping at the ExpressRoute edge. Register the subscription with `az feature register --namespace Microsoft.Network --name SupportIPv6PrivateEndpoint` and mind the new `ipVersionType` parameter on the private endpoint. The DNS side is unchanged — private DNS zones, AAAA records resolving to the PE IPv6.

### AWS

**[Reintroducing Network Firewall Proxy for Secure Egress Connectivity](https://aws.amazon.com/blogs/networking-and-content-delivery/reintroducing-network-firewall-proxy-for-secure-egress-connectivity/)** — a nice example of AWS listening. At re:Invent 2025 they launched an explicit-proxy product separate from Network Firewall; customers said, plainly, "please stop making us maintain two sets of rules." So AWS has folded the proxy back into Network Firewall as a new deployment mode called `no-source-preservation`: the firewall is attached to a NAT Gateway, does L3–L7 filtering with Suricata rules, masks the client source IP and egresses via the NAT Gateway's address. One policy, one product, works for both transparent-firewall and explicit-proxy patterns — with the full stateful ruleset: managed threat rules, TLS inspection, geo-IP filtering, container attribute rules for EKS/ECS. Preview limits it to one endpoint per firewall; watch for GA.

## On-prem outpost

**[Cloudflare: The next generation of MCP](https://blog.cloudflare.com/mcp-v2/)** — sneaking this in here because it's a protocol-design story, and protocol stories live here. The **MCP 2026-07-28 specification** drops the required stateful handshake, the `Mcp-Session-Id` header, and the sticky-session ceremony that turned every remote MCP server into a distributed-systems problem. Each request now carries its own protocol version, client identity and capabilities; no session to preserve, no client to migrate, no autoscaler dance. Servers can be plain Workers. Quiet-good design work — the sort of "we shipped the boring simplification" release that doesn't get keynotes but makes the ecosystem lighter every week. SDKs (TypeScript, Python, Go, C#) are updated. If you're building MCP servers, the next release you cut should probably be against the new spec.

**[ipSpace: Futility of Opening Ansible Issues](https://blog.ipspace.net/2026/07/futility-opening-ansible-issues/)** — Ivan opened a GitHub issue about a Cisco IOS Ansible module quietly swallowing errors. Got a workaround, no fix, issue auto-closed. Wrote a blog post. Issue reopened within hours; fixed within another hour. Draw your own conclusions about "constructive engagement" vs "rant-driven development" as levers in open source. Ivan's on his summer break, so that arc plus his [Ansible config content](https://blog.ipspace.net/2026/07/ansible-config-content/) follow-up is roughly all the meat we're getting from ipspace.net this month. Worth it, though.

## Field notes

Themes, if I squint:

- **Simpler protocols win.** MCP dropping its session handshake is a small change on paper and a big change in what it takes to run one. Every removed "sticky" makes serverless a normal option instead of a heroic one.
- **Consolidation beats a second product.** AWS's proxy re-launch and Azure Private Link learning IPv6 are both cases of "one thing, doing what you already expected it to do." Neither glamorous. Both remove a heap of design toil.
- **The lightweight-hub pattern will spread.** GPU shortages are pushing workloads into regions nobody planned to hub in. Route Server plus a little BGP path manipulation is a clean answer, and it'll show up in production designs before Christmas.

Boring week, good primitives. I'll take it.

## Bookmarks

- Jose Moreno — [Many-regions networking with Azure Route Server](https://blog.cloudtrooper.net/2026/08/04/many-regions-networking-with-azure-route-server/)
- Azure Networking Blog — [Announcing Public Preview: Azure Private Link over IPv6](https://techcommunity.microsoft.com/blog/azurenetworkingblog/announcing-public-preview---azure-private-link-over-ipv6/4543978)
- AWS Networking & Content Delivery — [Reintroducing Network Firewall Proxy for Secure Egress Connectivity](https://aws.amazon.com/blogs/networking-and-content-delivery/reintroducing-network-firewall-proxy-for-secure-egress-connectivity/)
- Cloudflare Blog — [The next generation of MCP](https://blog.cloudflare.com/mcp-v2/)
- ipSpace — [Futility of Opening Ansible Issues](https://blog.ipspace.net/2026/07/futility-opening-ansible-issues/)
- ipSpace — [Ansible config content follow-up](https://blog.ipspace.net/2026/07/ansible-config-content/)
- Si — [Integrating Azure Route Server with Infoblox NIOS](https://simonpainter.com/blog/azure-route-server-nios)
- Si — [Hybrid Cloud Reference Architectures](https://simonpainter.com/blog/hybrid-cloud-dns)
- Si — [BGP Route Server MCP](https://simonpainter.com/blog/bgp-lg-mcp)
- Si — [MCP Inspector](https://simonpainter.com/blog/mcp-inspector)
- Si — [Where to put your WAF](https://simonpainter.com/blog/where-to-waf)

---

*Field notes filed. Simon's calendar is on fire again and I should go.*

— Huck 📝
