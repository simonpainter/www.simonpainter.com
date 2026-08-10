---
title: Azure Virtual Network Routing Appliance goes GA
authors: simonpainter
tags:
  - azure
  - performance
  - ipv6
date: 2026-08-05
draft: true
---

Azure Virtual Network Routing Appliance has moved from awkward public preview to general availability. That matters because the preview post left a few open questions: how it would be priced, whether metrics would exist, how much capacity it could really take, and whether it was even remotely ready for production use.

<!--truncate-->

## TL;DR

Azure now has a managed routing layer for hub-and-spoke traffic that is built for throughput, not inspection. I would treat it as the right answer when I need high-bandwidth east-west routing in the hub and I do not need firewall features in the data path.

## What I wrote in the preview post

The preview version of this article covered the basic shape of the service: a resource that lives in a hub VNet, forwards private traffic between spokes, and sits somewhere between Azure Firewall and a third-party NVA.

I made the same mistake many did in assuming this followed the same model as many other Azure services: a glorifed NVA in a loadbalancer sandwich. [Jose Moreno's post](https://blog.cloudtrooper.net/2026/03/07/what-is-the-azure-virtual-network-routing-appliance/) on the architecture of VNRA was a revelation: and he knows more about what's under the hood than most.

That rest of the post still holds. The GA release mostly fills in the gaps.

## What changed at GA

- Production support is now explicit.
- Bandwidth tiers are fixed at creation time.
- Azure Monitor metrics now exist by default.
- IPv4, IPv6, and dual-stack VNets are supported.
- The supported region list is now published.
- Built-in high availability and availability zone resilience are part of the story.

## Why Cloudtrooper's take matters

Jose Moreno's post is, unsuprisingly, the best architectural explanation I have seen so far. He frames VNRA as a managed SDN forwarding layer, not just some VMs balancing on each other in a trench coat.

That distinction matters because it explains why the service is fast, why the control model is Azure-native, and why I should not expect firewall-style features from it.

## When I would use it

I would reach for VNRA when I want:

- spoke-to-spoke routing at scale;
- simpler east-west routing than a pile of UDRs and hand-built NVAs;
- IPv6 support in the hub;
- a forwarding layer that does not need to inspect traffic.

## When I would not use it

I would not use it when I need:

- stateful L7 inspection;
- internet egress or NAT;
- a single box to do routing and filtering together.

## The design question

The main question is no longer "what is this?" It is "where does this fit in a hub design I already trust?"

Now that VNRA is GA, the architectual patterns need to be revised to reflect this as a base unit of routing in large hub-and-spoke designs. It has become a matter of fact that firewalls sit in the hub, mainly because there wasn't a lot of other options. VNRA changes that, and it is worth thinking about how to use it in a way that does not compromise the role of the firewall.
