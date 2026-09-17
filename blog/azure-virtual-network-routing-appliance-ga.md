---
title: Azure Virtual Network Routing Appliance goes GA
authors: simonpainter
tags:
  - azure
  - performance
  - ipv6
date: 2026-08-10
---

Azure Virtual Network Routing Appliance has moved from [awkward public preview](azure-virtual-network-appliance.md) to general availability. That matters because the preview post left a few open questions: how it would be priced, whether metrics would exist, how much capacity it could really take, and whether it was even remotely ready for production use.

If you want the shorter news version first, I also wrote up the launch notes in [Generally Available: Azure Virtual Network routing appliance](/updates/launched-generally-available-azure-virtual-network-routing-appliance).

<!--truncate-->

:::warning Correction, September 2026

I originally wrote here that pointing a spoke's default route at VNRA, and then sending `0.0.0.0/0` from the VNRA subnet onward to a firewall, "does not work". That claim was too broad and I've now corrected it below.

[Neil Briscoe](https://www.linkedin.com/in/neilbriscoe/) ran a follow-up lab that built the same shape and it worked end to end. I've rewritten [What I tested in the lab](#what-i-tested-in-the-lab) to say what he found, what I got wrong, and the one variable I didn't control.

:::

## TL;DR

Azure now has a managed routing layer for hub-and-spoke traffic that is built for throughput, not inspection. I would treat it as the right answer when I need high-bandwidth east-west routing in the hub and I do not need firewall features in the data path.

It won't NAT for you, so it can't be your internet edge on its own. But it can carry a default route to something that will — I was wrong to say otherwise.

## What I wrote in the preview post

The [preview version of this article](azure-virtual-network-appliance.md) covered the basic shape of the service: a resource that lives in a hub VNet, forwards private traffic between spokes, and sits somewhere between Azure Firewall and a third-party NVA.

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
- NAT, or an internet edge that stands on its own;
- a single box to do routing and filtering together.

## The design question

The main question is no longer "what is this?" It is "where does this fit in a hub design I already trust?"

Now that VNRA is GA, the architectural patterns need to be revised to reflect this as a base unit of routing in large hub-and-spoke designs. Firewalls sit in many hubs because there has not been a better native routing option. VNRA changes that, and it is worth thinking about how to use it in a way that does not compromise the role of the firewall.

## What I tested in the lab

I did some lab work to test the line from the preview post that VNRA does not route non-RFC1918 traffic in the way many of us might hope.

The lab was simple: one hub, three spokes, an Azure Firewall in the hub, and a VNRA in the same hub. First I pointed `10.0.0.0/8` at the VNRA so spoke-to-spoke traffic would use the high-speed forwarding path. I then pointed `0.0.0.0/0` at Azure Firewall for public egress. That worked exactly as expected.

I then tried the more tempting design. I pointed `0.0.0.0/0` from the spokes to the VNRA, and on the VNRA subnet I added a further `0.0.0.0/0` route to Azure Firewall. The idea was neat enough on paper: send everything to VNRA, let it deal with local traffic, then hand internet-bound traffic to the firewall.

Nothing came back. From a VM in a spoke, the internet was simply gone.

I read that as the service refusing to carry a default route, and I wrote it up as a limitation. That was a mistake.

### What Neil's lab found

[Neil Briscoe](https://www.linkedin.com/in/neilbriscoe/) rebuilt more or less the same test and it worked. His lab put a hub in each of two regions, joined by a global VNet peering. Spokes in the second region carried two routes: `10.0.0.0/8` to a local firewall, and `0.0.0.0/0` to a VNRA in their own hub. The VNRA subnet carried exactly one route, `0.0.0.0/0`, pointing at an [Enforza](https://www.enforza.io/) gateway in the *other* region's hub.

A workload in the second region opened a TCP 443 session to a public host. It arrived at the far firewall, was source NATed onto that firewall's public address, and the session reached TLS 1.3 `established`. A half-open path never gets that far, so the reply came back too. The flow appeared on neither east-west firewall, which is what you'd want.

He also caught a detail I like: the packet arrived at the far firewall with its TTL decremented only once, by the local firewall. The VNRA hadn't touched it. It forwards at L3 without spending a hop, so it adds nothing to your TTL budget and shows up in no traceroute.

So VNRA will happily forward a default route. My blanket claim was wrong.

### What I got wrong, and what I still don't know

Two things differed between my lab and Neil's, and I only controlled one of them.

The first is the next hop. Mine was Azure Firewall. His was an Enforza gateway, which is a VM-based NVA. I don't think that's the interesting difference, but I can't rule it out.

The second is the return path, and I think this is what bit me. In Neil's lab, the far firewall's own subnet carries a route for the second region's summary prefix pointing back at the VNRA. That route has to be there. Azure programs a `10.0.0.0/8` route with next hop `None` into every subnet by default, and a de-NATed reply heading back to a private address in another VNet will match that black hole and vanish unless something more specific overrides it.

I never added that route. My outbound leg probably worked fine and the replies went in the bin, which from a VM looks exactly like "it doesn't work".

That's a missing route, not a missing capability. I should have checked the return path before I published a limitation.

### The design rule, revised

VNRA still does no NAT. That hasn't changed and I don't expect it to. So it can't be your internet edge by itself.

What it can be is the first hop for everything, with the hub route table deciding where each class of traffic goes after that. There's a real argument for it: every spoke's next hops sit in its own hub, so moving the internet edge later is a one-line change in the hub rather than an edit to every spoke route table.

If you build it that way, the return path is the bit to get right. Trace the reply all the way back and make sure every subnet it lands in has a route more specific than `10.0.0.0/8 None` pointing where you expect.

The split-brain design I described still works and it's still simpler. I just shouldn't have told you it was the only one that does.

## What I would do

I'd still reach for the split first, because it has fewer moving parts:

- send private address space to VNRA;
- send the default route to the firewall;
- let each service do one job well.

But if the operational argument for a single next hop matters more to you — one device to repoint when the egress design changes — that pattern is available, and Neil has proved it end to end.

## Verdict

GA has not changed the core story. VNRA is a strong addition to Azure hub design because it gives me a native, high-speed forwarding layer without asking a firewall to pretend to be a router.

It is not an egress device and probably never will be, because it doesn't NAT. But it will carry your default route to something that does, and that gives you more design freedom than I first credited it with.

The wider lesson is one I keep relearning. When a path fails in a lab, check the return leg before you write up a limitation. Azure's `10.0.0.0/8 None` black hole is very good at making a routing mistake look like a product boundary.
