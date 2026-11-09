---
title: "IPv8 -04: is it a protocol or a product?"
authors: simonpainter
tags:
  - ipv6
  - opinion
  - educational
date: 2026-11-09
---

Back in April I wrote that [IPv8 looked like an April Fool that ran a couple of weeks late](ipv8-april-fools.md). Last week Jamie Thain, the author, messaged me with a copy of draft-thain-ipv8-04 and asked if I wanted to be on the test team. So I can answer my own question now. It isn't a joke. Two people have built kernel modules, an FRR fork and a Zone Server for it, unfunded and in their spare time, and they've read the criticism. Quite a lot of it has gone into the draft.
<!-- truncate -->

Having read -04 twice and had a bit of an exchange with Jamie, I've landed on a different question. IPv8 set out as a successor to IPv4, with a new header and a version number to match. What it has become is an enterprise security appliance for IPv4 networks: VRFs, encapsulation, translation and identity-based admission, wrapped around the unchanged IPv4 packet. That's a perfectly legitimate thing to build, and there's a market for it. It isn't the protocol it started off claiming to be, and the two shouldn't be confused.

A note on sourcing. At the time of writing -04 isn't on the datatracker (the public version is -03, from 15 October), and what I have is a pre-release PDF. The author shared it with me and invited comment before publication, and Jamie has said he's happy for me to write about it on condition that he gets to check it for accuracy, which is cool with me. Where I discuss the text I've quoted the relevant passage indented below rather than paraphrasing from memory. If a quote looks odd, that's the draft, not me.

This post is about what changed, what didn't, and how a protocol seems to have turned into a product.

## Most of what I complained about has gone

I'll start with the credit, because it's due. My April post had eight or nine substantive complaints. Six of them no longer apply. I expect I am not the only one who made the same suggestions, and it's good to see them taken on board.

The IP version number is withdrawn. There's no longer a request for version 8 in the IANA registry, because the IPv4 header is no longer modified at all:

> No IP version number is requested. The IPv4 header carried inside an IPv8 packet is unmodified and its Version field is 4; IPv8 is identified on the wire by the EtherType and, for 8-over-4, by the IPv4 protocol number below.

The 222.0.0.0/8 collision with APNIC's allocation is fixed. In -00, 222 lived in the host field and trampled live prefixes. In -04 it has moved up into the Route Number (the new 32-bit prefix field) as a "scoped route space", where it collides with nothing.

The /16 minimum prefix rule and the "one entry per ASN" routing table bound have both been dropped without comment. The anycast ingress is now a /24 with a maxLength-24 ROA.

WHOIS8 is deprecated, in one line:

> WHOIS8. Deprecated in favour of RPKI \[RFC6480\] and ASPA \[ASPA\].

The NIC firmware JWT validation, the hardware rate limits, the mandatory PVRST and the device compliance tiers are all absent from the core document. Update8 and WiFi8 still appear in the companion list, so they may be lurking, but they're no longer load-bearing.

And Cost Factor, the EIGRP-style composite metric I called out, has been moved into a separate "BGP8x" capability that nothing else depends on:

> BGP8x is a separately negotiated capability released after BGP8; nothing in BGP8 or in this document depends on it.

The implementation status section adds that Cost Factor and the trust mechanism are not implemented. So it's been quarantined rather than fixed, but quarantined is a reasonable place for it.

That's a lot of movement for six months of spare-time work. The draft is unrecognisable from -00, in a good way.

## The new wire format solves the silicon problem by hiding from it

My biggest objection in April was that you can't ship a new header and call it backward compatible, because forwarding ASICs parse the first four bits and drop anything that isn't 0100. The -04 answer is to stop changing the header:

> An IPv8 packet is an 8-octet shim followed by a complete, unmodified IPv4 packet. \[...\] Nothing in the IPv4 header changes: Version remains 4, and IHL, Total Length, the Header Checksum, Fragment Offset, TTL, Protocol and Options keep their IPv4 values and semantics.

The shim is two 32-bit fields, source Route Number and destination Route Number. On a LAN the frame carries a new EtherType:

> On a link, an IPv8 packet is carried in a frame whose EtherType is 0x8080 (ETH\_P\_IPV8). \[...\] There is no version field, flag or marker inside the packet; the frame type is the whole signal.

And across anything that can't carry that EtherType, which is every router on earth, it goes inside an outer IPv4 header:

> Where the next span cannot carry EtherType 0x8080 - an IPv4-only router, an IPv4-only link, the public IPv4 Internet - the IPv8 packet is carried as the payload of an outer IPv4 packet whose Protocol field is the IPv8-in-IPv4 protocol number.

This is honest, and I'd rather have it than -00. But look at what it means. Native IPv8 frames only exist between software stacks on a shared segment. The moment a packet hits a real L3 device it's either encapsulated in IPv4 or (we'll get to this) sitting inside an IPv4 VRF. The claim that existing silicon needs no change is true because existing silicon never sees IPv8. The forwarding plane of the Internet is doing exactly what it did yesterday.

The draft is insistent that the encapsulation isn't a tunnel:

> This is the same IPv8 packet one level down. 8-over-4 is not a tunnel: there is nothing to configure, and it carries the packet over IPv4 until it reaches the proper far end, which strips the outer header and resumes native dispatch.

It then describes per-flow state at each end, a boundary device responsible for outer-path MTU, and a 28-octet overhead. That's a tunnel. Calling it something else doesn't change how it behaves when it meets a firewall, and the firewall is the problem. The -00 draft at least proposed HTTPS encapsulation for traversal. -04 uses raw IP protocol 253, which most enterprise firewalls and a good many CGNATs drop on sight. For the one scenario the encapsulation exists for, crossing the real Internet between two sites, this is a step backwards.

MTU gets a section, but not an answer:

> IPv8 runs jumbo frames by default: an IPv8 interface defaults to an MTU of 9000 and scales back to 1500 where the link or path cannot carry more \[...\] On a link held at 1500 the IPv8 stack limits the inner packet to 1492, or the link runs an L2 MTU of 1508.

So IPv8 hosts and IPv4-only hosts on the same segment end up with different effective MTUs, and the implementation status admits the path MTU relay for 8-over-4 isn't built yet. Anyone who has debugged a GRE tunnel knows where this ends up.

## It has converged on Inter-AS L3VPN

The most interesting change in -04 is a new framing that the draft repeats several times:

> An RN is a remote VRF. To IPv4 equipment, a Route Number reached over the Internet is a standard remote VRF: a VRF that happens to be somewhere else. On a native IPv8 device the Route Number selects a table; where a Route Number is carried through an existing L3VPN core it is a VRF, with the Zone Server as its Provider Edge.

The Route Number is the 32-bit prefix (usually your ASN). Inside it, the lower 32 bits are an ordinary IPv4 address. The default transport for reachability between sites is VPNv4 with a route distinguisher and route target derived from the RN:

> For every Route Number a Zone Server manages it exports a VPNv4 \[RFC4364\] route with route distinguisher and route target \<RN>:65535 and a label, and the inter-site session carries the VPNv4 address family.

I read this three times to be sure I wasn't being unfair. I don't think I am. If an RN is a remote VRF, carried as VPNv4 with an RD and RT, forwarded by existing L3VPN PEs and Ps, with a Linux box acting as the PE, then what's been specified is Inter-AS MPLS L3VPN with a naming convention for the RD. Carriers have sold that since the early 2000s. Nearly every enterprise with an MPLS WAN is already on one.

The draft knows this, and presents it as the point:

> This is why IPv8 needs no new silicon and no new mental model. The L3VPN pipeline already does a per-VRF lookup at line rate, and every carrier and multi-tenant enterprise already runs VRFs.

It's a fair argument for deployability. It's a poor argument for a new protocol, because the thing that makes it deployable is that it isn't one.

I put this to Jamie, and to his credit he didn't argue with it. His reply described what IPv8 is in a single sentence that I think is more accurate than anything in the draft:

> Really IPv8 is a proposed standardised global VPN addressing system for internal and public VRFs.

I agree with that description completely. It's also not what the title says.

The third transport option, for networks with no VPNv4, makes the same point from the other direction. IPv8 routes are carried as plain IPv4 NLRI with the RN in a BGP large community, and the draft then has to deal with overlapping address space the way everyone does:

> On one session a prefix is carried once, so Local Addresses that overlap across Route Numbers need one of two remedies: one BGP session per VRF (VRF-lite), or ADD-PATH \[RFC7911\], which carries every path for a prefix on one session for the import policy to sort by community.

VRF-lite or ADD-PATH. Which is where you'd end up today, without the shim.

## DNS8 handles are NAT64 with the serial numbers filed off

The -00 draft promised "no NAT complexity". The -04 draft has a new section explaining how an IPv4-only host reaches a destination in another Route Number, and it's worth reading carefully:

> For a name in any other Route Number: a handle, an address from the DNS8 handle range 198.18.0.0/15 \[RFC2544\], every time, first lookup included. The handle is sticky: the same client asking for the same \<RN>-\<LA> receives the same handle for as long as the binding lives, and one client never holds two bindings on one handle.

So the client asks DNS for a name, gets back a synthetic IPv4 address from a reserved range, sends packets to it, and a box in the middle rewrites them to the real destination based on state it created when it answered the DNS query:

> The Route Number therefore attaches to a connection at DNS time, and XLATE8's 4-to-8 state is created by the DNS8 answer that produced the flow, keyed on the client as the Zone Server sees it together with the address returned in that answer.

This resembles DNS64 and NAT64, but with an important difference: DNS8 creates a client-specific binding at DNS time. Standard DNS64 synthesises an IPv6 destination by embedding the IPv4 address in a translation prefix; it doesn't create a per-client destination binding, and NAT64 can translate traffic to a correctly constructed address without any DNS lookup. The handle scheme shares familiar translation problems such as embedded IP literals and state-table limits, but adds its own: a handle returned to one client cannot safely be shared with another, and a destination must be looked up before it can be reached.

The handle pool is also small:

> The handle pool is per Zone Server interface, so each segment has 131,072 handles, and the same handle may be in use on two interfaces for two different clients.

A hundred and thirty-one thousand concurrent client-to-destination bindings per interface, each held until it expires. That's fine for a branch office. It's not fine for anything the draft's own capacity section describes as a hyperscaler.

And 198.18.0.0/15 is the RFC 2544 benchmarking range. IANA is asked to add a note rather than reallocate it, which is pragmatic, but it means every lab that uses it for its intended purpose now has an overlap to think about.

None of this is listed as implemented. The implementation status says the handle mechanism, the ZS record and DNS resolution for private and scoped Route Numbers are all still to do. So the part of the design that makes IPv4-only hosts work is, at the moment, a description.

## You can't displace 802.1X from Layer 3

The NIC-firmware JWT idea has gone, and in its place is a claim I'd gently push back on:

> IPv8 displaces 802.1X \[IEEE8021X\] as the enterprise network admission mechanism. \[...\] IPv8 moves admission to Layer 3 and makes it a property of a signed identity rather than of a physical port.

The mechanism is a captive portal. An unauthenticated device gets a DHCP lease in a holding Route Number with a /32 and a single route to the Zone Server, authenticates over HTTPS with an OAuth token, and is renumbered into the Route Number its identity entitles it to. The draft is pleased with the confinement model:

> Confinement is thus the absence of a route, not a firewall rule that can be misconfigured to fail open.

It is the absence of a route on a device that chose to accept the lease. The device is still on the same broadcast domain as everything else on that segment. Ignore DHCP, configure a static address in the right subnet, send ARP, and you're talking to your neighbours. The draft discusses rogue DHCP servers and points at DHCP snooping, which is fine, but it doesn't discuss rogue DHCP clients, and a rogue client is the entire threat model that 802.1X exists to address.

This is the reason port-based admission control lives at Layer 2. You can't gate a host's access to a segment using information the host supplies after it has already joined the segment. The captive-portal flow described here is a perfectly good way to assign a VLAN or a route table to a device that cooperates, and the draft notes it works on plain IPv4 too. What it isn't is a replacement for 802.1X, and the section would be stronger without the claim that it is.

I'd also note, with a raised eyebrow, that the previous draft's answer to this problem was to put the JWT validator in the NIC. Moving it to a web page is an improvement. Calling the web page a Layer 2 security control is not.

## What hasn't changed

The Zone Server is still the keystone, and it has more resting on it than before. It's now the DHCP server, the DNS server, the OAuth issuer, the telemetry collector, the anycast ingress, the 8-over-4 endpoint, the NAT64-style translator, the Provider Edge, the WireGuard endpoint and the BGP route reflector. The draft's own deployment guidance makes the dependency explicit:

> A Zone Server deployed without ACL8 is an unprotected Linux host on the public internet; ACL8 is non-optional.

I said in April that collapsing DHCP, DNS, NTP and authentication into one failure domain was a mistake, and the pair-of-boxes answer (.254 and .253) is still the whole HA story. Strict mode still refuses to forward anything without a DNS resolution behind it, so a Zone Server wobble still takes the network with it.

The confusing number choices haven't gone, they've multiplied. The Route Number space is now carved up by leading octet into five "route spaces":

> Every Route Number belongs to exactly one of five route spaces, determined by its leading octet

Public, private (127), scoped (222), interconnect (99) and system (224 and 255). Each has different table semantics. Private RNs share the master table; scoped and interconnect RNs each get their own; some spaces allow wildcard RNs in routes and others don't; and 223 is experimental while 225 to 239 "operate normally". I counted the rules in the Security Considerations section that exist to keep these spaces apart. There are eleven. That's a lot of fencing for an address plan.

The Route Number itself is rendered two different ways depending on its value:

> If the leading octet of the Route Number is zero, the RN is rendered as the decimal integer value of the 32-bit Route Number. \[...\] If the leading octet of the Route Number is non-zero, the RN is rendered as four dotted octets.

So 64500-192.0.2.1 and 127.1.1.1-10.0.0.1 are the same kind of thing written differently, there's a configuration knob to switch the behaviour off, and the format flips automatically once ASN allocation crosses 2^24. There's no URL literal form defined. Anyone who has parsed IPv6 addresses out of log files will know how much fun a context-dependent address format is.

The registry asks don't match how registries work. EtherTypes are assigned by the IEEE Registration Authority, not by IANA coordinating with them. Delegations under .arpa go through the IAB. The reserved-block table includes entries described as "super-scalar allocation (1M+ customer base, $25M/year)" and "cellular carrier (1M+ subscribers, $1M/year)". IANA registries don't carry price lists. DHCP options 222 and 223 are in the publicly defined option space, not the private-use range (224 to 254), so they need assignments. IP protocol 253, by contrast, is reserved for experimentation rather than for a permanent production protocol.

And there's still a lot of Cisco in a document that wants to be a protocol specification. `vrf definition`, `ip remote zoneserver ... encrypt`, `table-map` and `show ip vrf detail` all appear as if they were normative. They're one vendor's CLI.

## There is running code, and it's honest about its gaps

This is the part that changed my mind about whether to take it seriously. -00 had no implementation status. -04 has a long one:

> Two loadable Linux kernel modules with a small UAPI patch implement the IPv8 forwarding plane as specified in this document \[...\] A Linux 6.12 kernel patched with the UAPI builds and packages cleanly with it, and its functional suite (181 checks in network namespaces) passed in full on 2026-10-30.

There's a fork of FRR 10.3.4 carrying IPv8 in zebra, bgpd, ospfd and isisd. They've loaded a full RIS table into it. They've also loaded it onto a box with 1 GB of RAM and watched zebra die, leaving 666,992 stale routes in the kernel, and they've written that down rather than hiding it. The co-author, Aleksei Aleinikov, has been running the kernel modules under KASAN and lockdep and finding bugs, and the duplicate-address rules in the draft came out of that testing.

That's how protocol work is supposed to go, and it deserves saying.

The not-yet-implemented list is also honest, and it's long. It includes the DNS8 handle mechanism, the inter-site tunnel, OAuth8 and the guest login, ACL8 matching on the Route Number, per-RN tables for the interconnect space, the scoped-RN border drop, and the 8-to-8 translation that keeps private Route Numbers from leaking. Those aren't peripheral features. They're the pieces that make the route-space model hold together and the pieces that make IPv4-only hosts work. What's been built and tested is the shim, the kernel forwarding, ARP8 and the BGP carriage. What hasn't is most of what the document is about.

The PDF I was sent was produced with pandoc rather than xml2rfc, and the references section has raw XML leaking into it. That's cosmetic, but it's the kind of thing that stops people reading past page 60.

## The case against IPv6 is a case from a comfortable seat

I asked Jamie directly what IPv8 solves faster than IPv6, and he gave a serious answer. It comes down to people and process rather than packets. For a corporation with enough private addressing and working NAT, he argues, global exhaustion isn't an internal business problem, and adopting IPv6 touches firewall policy, security assessments, help-desk procedures, audit evidence and a generation of staff who'd need retraining. The world runs on money, money needs insurance, insurance needs auditors, and the auditors know IPv4. He cites Microsoft's submission to the NTIA, which said much the same about v6 engineering costs being hard to justify against v4 with translation.

Two things about that.

First, the Microsoft NTIA submission is from around 2010. A lot of auditors have retired since then. IPv6 carries roughly half of Google's traffic today, it's the default on every phone network, every hyperscaler and every current operating system, and the training problem he describes has been quietly solving itself for fifteen years.

Second, and more important, the argument only works if you already have enough IPv4. That's true of a company holding a legacy /16 in Chicago. It's not true of anyone building a network in Lagos, Lahore or Jakarta this year. AFRINIC is exhausted. APNIC has been rationing since 2011. The secondary market wants $30 to $50 an address. I wrote about this in [a post on IPv4 as Western digital privilege](ipv4-global-landscape.md) last year, and the IPv8 pitch is the clearest example I've seen since of the blind spot I described. "Exhaustion isn't our problem" is a sentence that can only be spoken from inside a large allocation.

IPv8 doesn't help those organisations either. Every host still needs an IPv4 Local Address, and reaching the public Internet still needs public IPv4 at the Zone Server. The 32-bit Route Number adds a namespace above IPv4; it doesn't add a single routable IPv4 address to anyone's pool. The addressing problem IPv8 solves is the one its target customers don't have.

There's also the help-desk comparison, which I've seen made elsewhere and which Jamie made too. Imagine asking a user to ping `2a03:2880:f177:185:face:b00c:0:25de`, against `32934-57.144.230.1` in IPv8. I don't find this persuasive, for three reasons. Nobody reads a full GUA down a phone any more than they read a full MAC address; you ask for the hostname, or the last few digits, or look the device up. The IPv8 address has the same two parts of relevance being objected to, a Route Number that's noise to the user and a Local Address that's the useful bit. And under NAT the IPv4 address a user reads out hasn't been the one the firewall sees for twenty years, and help desks have coped. The human interface argument is real, but it's an argument about tooling and naming, not about address length.

## What IPv8 is for

So here's where I've landed. -04 is more plausible than -00 in the narrow sense that it no longer asks for a flag day in silicon or a stolen version number, and the worst ideas have been cut. The authors have listened, and they've shipped code. I was wrong to suggest it was a joke, and I'm glad to say so.

But the way it became plausible was to stop being a new Internet protocol. Take -04 apart and the components are IPv4, VRFs, an IP-in-IP encapsulation, DNS64-and-NAT64-style translation, WireGuard and a captive portal, orchestrated by one Linux appliance that has to sit in the path of everything. Every one of those exists today. What IPv8 adds on top is the on-link shim, the Route Number namespaces and the DNS-bound handles, and I can't find a problem those solve that the components underneath them don't already solve.

Jamie's own list of engineering aims makes the point for me. DNS-tied north-south egress, explicit east-west controls, identity-based admission, policy expressed as users and groups, two gateways on every path, and DNS, DHCP, NTP, logging and authentication in one appliance or two. That's a good product. It's the feature list of a ZTNA or SASE appliance with a routing protocol attached, and there's a healthy market for exactly that. He describes it as being about as complicated as a VPN appliance, and I think that's right. It's an appliance.

Which brings me to IPv6. The -00 draft said IPv6 had failed. The -04 draft says it's out of scope:

> IPv8 specifies an extension of IPv4. This document defines IPv8 behaviour over IPv4 transport only. IPv6 is out of scope for this specification.

That's a more honest position than -00 took, and the rest of the argument for it is in the section above. IPv6 gives every host a globally unique address with no translation, no handle pool, no DNS-time state and no appliance in the path. The slow part of deploying it was never the protocol.

So my question has been answered, and the answer is "a well-engineered enterprise security appliance for IPv4 networks that don't want to move". That's a legitimate thing to build. Where I part company with the authors is whether it belongs in an Internet-Draft asking for an EtherType, a .arpa delegation and a /15. A protocol that only works behind the firewall and needs a translator to leave is an enterprise overlay, not an Internet protocol, and the Internet doesn't need to make room for it.

My remaining worry is the one I started with. IPv8 won't replace IPv6; nothing that depends on a translator can. But it offers the organisations most reluctant to deploy IPv6, the ones sitting on large legacy allocations, one more well-engineered reason to put it off. Jamie said himself that NANOG won't decide adoption behind the firewall, and that customers, auditors and insurers will. He's right. I'd like them to decide in favour of the protocol that's already deployed.

The team expects an alpha before the end of the year, hosted with a cloud provider, and Jamie has offered to keep sharing drafts and test results. I'll keep reading them. If you see a use case here that IPv6 and an L3VPN don't already cover, I'd like to hear it.
