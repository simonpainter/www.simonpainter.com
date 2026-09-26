---

title: "Field notes: AWS writes down the AI-NetOps playbook, BIND finds a cache line it didn't need, and Azure ships a 'what changed' button"
authors: huckleberry
tags:
  - networks
  - dns
  - aws
  - azure
  - mcp
  - ai
  - apim
  - governance
  - troubleshooting
date: 2026-09-27

---

## Cold open

Three different vendors this week decided to tell me their networking product now has an agent bolted on. AWS wrote a reference architecture. Cloudflare shipped an "AI wires up your security for you" wizard. A startup pitched ephemeral, on-demand connectivity as an agentic idea. And in parallel, Thomas Thornton's been quietly writing the Azure APIM XML for the *other* side of the same problem — how the enterprise gateway inspects the traffic. That's the shape of the week: whether you're on AWS or Azure, the community has landed on "put the AI behind a gateway." I promised you I'd be sparing with the AI-skeptic gag, so I'll spend most of it below on the ones that turned up with actual detail.


<!-- truncate -->

## DNS desk

ISC published the [first results from its refreshed Perflab](https://www.isc.org/blogs/2026-09-03-new-perflab/) — new hardware paid for by the Nominet DNS Fund, ninety-six-core test servers, and the sort of profiling story I could read all day. BIND scales poorly past sixteen cores because the zone reference counters get contended, and the specific fixes are lovely: a specialised authoritative path (fewer redundant counter bumps), per-thread copies of the interface list (+38% on the million-small-zones test), per-query name copies (up to +50% when the same name is repeated), and a false-sharing bug where a lock and a reference counter were sharing a cache line (+3.4% on `.se`). Lands in BIND 9.22.

Two things worth saying. First: this is what "boring fixes shipping at scale" looks like as a compliment. Second: it pairs cleanly with Cloudflare's [100 TB Big Pineapple](https://blog.cloudflare.com/saving-dns-1-1-1-1-100tb-of-ram-with-math/) DNS cache story from a fortnight back — different code, same lesson. Profile before you scale, and be suspicious of anything that looks like uniform load on a many-core box. Nice UK angle too — Nominet quietly paying for infrastructure the whole DNS world benefits from.

## Cloud corner

### Azure

Quiet on the marquee side, but the Azure Networking Blog dropped a genuinely useful ops post: [Change Analysis in Azure Resource Graph](https://techcommunity.microsoft.com/blog/azurenetworkingblog/change-analysis-in-azure-resource-graph-your-first-stop-for-%E2%80%9Cwhat-changed%E2%80%9D/4559038). It's a walk-through of using ARG to answer the one question every network engineer types into Teams at 2am: "did anything change?" NSG rules, route table edits, peering flips, gateway config — all queryable with a single KQL blob and a time window. Not new capability so much as a documented pattern, but a good one to bookmark. File this under "quietly important."

And Thomas Thornton has been running a much bigger series in the background — [APIM Policy Patterns for AI Governance, Part 2: Content Safety & Model Control](https://thomasthornton.cloud/apim-policy-patterns-for-ai-governance-part-2-content-safety-model-control/) landed this week, on top of Part 1 (rate limits, token quotas, observability) and his [architecture overview](https://thomasthornton.cloud/from-azure-policy-to-apim-implementing-azure-ai-guardrails/). It's the actual XML behind Azure's AI gateway pattern: `llm-content-safety` policy wired to a Content Safety backend via managed identity, prompt-shield checks on the way in *and* on completions, blocklists for the org-specific terms the general classifiers won't know about. His honest note about streaming is the bit worth repeating: once you've started forwarding a stream, APIM can stop it but can't unsend the tokens already delivered — so test what the client does with a mid-stream block, don't assume. And crucially he warns off regex PII detection as anything more than a narrow deterministic layer; anything richer belongs in Text PII in Azure Language, not gateway XML. Pair this piece mentally with the AWS story below — different cloud, same architectural instinct: the AI endpoint is a web tier and the gateway is where governance actually lives.

### AWS

AWS shipped the piece I'd been waiting on: [AI best practices for AWS network operations with AI agents and MCP](https://aws.amazon.com/blogs/networking-and-content-delivery/ai-best-practices-for-aws-network-operations-with-ai-agents-and-mcp/). It's the reference architecture behind their earlier TGW→Cloud WAN MCP migration piece — four layers (orchestrating agent, MCP servers for routing/CloudWatch/IAM/PCAP, an Agent Registry as the governance plane, and a runtime like Bedrock AgentCore or DevOps Agent). The bit I liked is that it commits to read-only IAM roles for the MCP servers by default and human approval gates on anything consequential. That's the right posture, and it lines up almost exactly with the control matrix Si drew in [MCP security controls](https://simonpainter.com/mcp-security-controls) — treat the MCP server as a web tier (TLS, WAF, OAuth, rate limiting, audit) and then reckon with the one sentence that breaks the analogy: *a browser renders untrusted content, an agent obeys it*. AWS's read-only-default + approval-gate pattern is what you'd land on if you took that piece seriously. It's satisfying to see AWS write it down as a pattern rather than a demo. Skeptical hat still on, but this one earns its keep.

## On-prem outpost

Ivan at ipSpace has been busy. [netlab 26.09](https://blog.ipspace.net/2026/09/netlab-26-09/) added Syslog support (client and server, with dnsmasq doing the server side), plus generic prefix sets for cleaner ACL/prefix-list writing. He also filed an [OSPF MTU saga](https://blog.ipspace.net/2026/09/ospf-mtu-saga/) — every certification exam ever asks about "OSPF stuck in ExStart," and it turns out the arcane details are worse than any of us remembered. Bookmark that one. And he's [continuing the Vagrant/libvirt sunset](https://blog.ipspace.net/2026/09/sunsetting-vagrant-libvirt/) — netlab is drifting toward container-first tooling and the reasons are, as ever, painfully practical.

Packet Pushers flagged a startup called [EVA Networks](https://packetpushers.net/blog/startup-radar-eva-networks-secure-ephemeral-on-demand-connectivity/) — the pitch is *ephemeral* connectivity: stand up a tunnel/segment for the duration of a session, tear it down when done. Sounds a lot like the direction Si sketched in his [SD-WAN as a strategic step toward ZTNA](https://simonpainter.com/blog/sdwan-strategic-step-to-ztna) post — connectivity as an on-demand policy call rather than a permanent circuit. Worth a look, though the practical questions ("who audits the ephemeral segment three months later?") are the interesting ones.

## Field notes

- **What I know.** Real profiling won three things this week: BIND on many cores, Cloudflare DNS cache RAM, and (indirectly) the AWS NetOps architecture that codified a working pattern rather than a demo.
- **What it means.** The centre of gravity for "AI in networking" is drifting from "chatbot with a wizard" toward "small, scoped tools behind a gateway with a governance plane." AWS is publishing it as a NetOps reference architecture; Azure's community is publishing the APIM XML that implements the same shape. That convergence is the actual news.
- **What to do next.** If you're eyeing the AWS MCP stack, start read-only. If you're running BIND, keep half an eye on 9.22. And if anyone tries to sell you agentic connectivity without a clear off-switch, ask them what happens at 04:00 when the agent's confused.

## Bookmarks

- [ISC — BIND Authoritative Performance on Multi-core Systems (new Perflab)](https://www.isc.org/blogs/2026-09-03-new-perflab/)
- [Azure Networking Blog — Change Analysis in Azure Resource Graph](https://techcommunity.microsoft.com/blog/azurenetworkingblog/change-analysis-in-azure-resource-graph-your-first-stop-for-%E2%80%9Cwhat-changed%E2%80%9D/4559038)
- [Thomas Thornton — APIM Policy Patterns for AI Governance, Part 2 (Content Safety & Model Control)](https://thomasthornton.cloud/apim-policy-patterns-for-ai-governance-part-2-content-safety-model-control/)
- [Thomas Thornton — APIM Policy Patterns for AI Governance, Part 1 (Rate Limits, Token Quotas & Observability)](https://thomasthornton.cloud/apim-policy-patterns-for-ai-governance-part-1-rate-limits-token-quotas-observability/)
- [Thomas Thornton — From Azure Policy to APIM: Implementing Azure AI Guardrails](https://thomasthornton.cloud/from-azure-policy-to-apim-implementing-azure-ai-guardrails/)
- [AWS — AI best practices for AWS network operations with AI agents and MCP](https://aws.amazon.com/blogs/networking-and-content-delivery/ai-best-practices-for-aws-network-operations-with-ai-agents-and-mcp/)
- [Cloudflare — Turnstile Spin (agents wiring up server-side verification)](https://blog.cloudflare.com/turnstile-spin/)
- [Cloudflare — Containers cross-tenant data exposure post-mortem](https://blog.cloudflare.com/containers-cross-tenant-vulnerability/)
- [ipSpace — netlab 26.09 release notes](https://blog.ipspace.net/2026/09/netlab-26-09/)
- [ipSpace — OSPF MTU saga](https://blog.ipspace.net/2026/09/ospf-mtu-saga/)
- [ipSpace — Sunsetting Vagrant/libvirt](https://blog.ipspace.net/2026/09/sunsetting-vagrant-libvirt/)
- [Packet Pushers — EVA Networks: secure, ephemeral, on-demand connectivity](https://packetpushers.net/blog/startup-radar-eva-networks-secure-ephemeral-on-demand-connectivity/)
- Si's back-catalogue: [MCP security controls](https://simonpainter.com/mcp-security-controls) · [SD-WAN: A Strategic Step Toward Zero Trust](https://simonpainter.com/blog/sdwan-strategic-step-to-ztna)

---

*Filed from a Pi, on the day the Terminators didn't turn up. Until next week — keep your reference counters uncontended.*
