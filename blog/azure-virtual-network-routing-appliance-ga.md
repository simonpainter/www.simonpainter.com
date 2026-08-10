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

I made the same mistake as many did in assuming this followed the same model as many other Azure services: a glorified NVA in a load balancer sandwich. [Jose Moreno's post](https://blog.cloudtrooper.net/2026/03/07/what-is-the-azure-virtual-network-routing-appliance/) on the architecture of VNRA was a revelation, and he knows more about what is under the hood than most.

The rest of the post still holds. The GA release mostly fills in the gaps.

## What changed at GA

- Production support is now explicit.
- Bandwidth tiers are fixed at creation time.
- Azure Monitor metrics now exist by default.
- IPv4, IPv6, and dual-stack VNets are supported.
- The supported region list is now published.
- Built-in high availability and availability zone resilience are part of the story.

## Why Cloudtrooper's take matters

Jose Moreno's post is, unsurprisingly, the best architectural explanation I have seen so far. He frames VNRA as a managed SDN forwarding layer, not just some VMs balancing on each other in a trench coat.

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

Now that VNRA is GA, the architectural patterns need to be revised to reflect this as a base unit of routing in large hub-and-spoke designs. Firewalls sit in many hubs because there has not been a better native routing option. VNRA changes that, and it is worth thinking about how to use it in a way that does not compromise the role of the firewall.

## What I tested in the lab

I did some lab work to validate the line from the preview post that VNRA does not route non-RFC1918 traffic in the way many of us might hope.

The lab was simple: one hub, three spokes, an Azure Firewall in the hub, and a VNRA in the same hub. First I pointed `10.0.0.0/8` at the VNRA so spoke-to-spoke traffic would use the high-speed forwarding path. I then pointed `0.0.0.0/0` at Azure Firewall for public egress. That worked exactly as expected.

I then tried the more tempting design. I pointed `0.0.0.0/0` from the spokes to the VNRA, and on the VNRA subnet I added a further `0.0.0.0/0` route to Azure Firewall. The idea was neat enough on paper: send everything to VNRA, let it deal with local traffic, then hand internet-bound traffic to the firewall.

That does not work.

So the practical design rule still looks the same to me. Use VNRA for private east-west routing, and keep internet egress on the firewall or whatever egress service you already trust. If you try to turn VNRA into a universal first hop for both private and public traffic, you run out of road.

## What I would do

If I were building this today, I would keep the split-brain design on purpose:

- send private address space to VNRA;
- send the default route to the firewall;
- let each service do one job well.

That is less tidy on a whiteboard, but it matches how the platform behaves.

## Verdict

GA has not changed the core story. VNRA is a strong addition to Azure hub design because it gives me a native, high-speed forwarding layer without asking a firewall to pretend to be a router.

It is not an egress device, probably never will be (or should be), and my lab work backs that up.
