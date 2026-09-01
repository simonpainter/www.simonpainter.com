---
title: The cross connect I didn't have to build
authors:
  - simonpainter
tags:
  - azure
  - aws
  - expressroute
date: 2026-08-31
---

In January 2024 I was at an AWS event and found myself talking to one of the product managers. I suggested, with the confidence of someone who would never have to build the thing themselves, that AWS already peers directly with the other hyperscalers, so should allow direct private peering, like a back-to-back ER/DX, and sell us the cross connect as a managed service. No colo cage, no LOA-CFA, no smart hands ticket at three in the morning.

He smiled and gave me that knowing look that people give you when something is already in the works and they are contractually obliged to say nothing. It has taken over two years, but as of today it is real: Azure Multicloud Interconnect is in preview, it pairs with AWS Interconnect on the other side, and with Google Cloud already on board the same fabric now spans all three of the big hyperscalers.

<!-- truncate -->

I am sure every customer with workloads in more than one cloud was saying the same thing, and the PM's knowing look was less "what a visionary" and more "you are the fourth person to say this today". Either way, the thing I wanted now exists, and it is worth a proper look at what was announced, how we got here, and what it does to the economics and architecture of multicloud connectivity.

## The problem: you were the interconnect

If you have ever had to build private connectivity between Azure and AWS you will know the drill, because until now the middle of that connection was your problem. Both clouds would sell you their half: an ExpressRoute circuit on one side and a Direct Connect on the other.

Joining them up meant taking space in a carrier neutral facility where both clouds had a presence, ordering cross connects from the meet-me room to each provider's cage, and putting something in the middle to stitch the two layer 2 handoffs together and run BGP with both sides. That something was either a pair of your own routers in a colo rack, with all the lifecycle joy that implies, or a network-as-a-service provider like Megaport or Equinix Fabric doing the layer 2 plumbing for a monthly fee.

Both approaches work. I have built both. But you own the outcome: the circuit orders, the LOAs, the VLAN allocation, the point-to-point addressing, the BGP sessions, the monitoring, and the awkward conversations when a cross connect goes down and each party is certain the fault is on the other side of the patch panel.

For many organisations the response to all that friction was to shrug and run an IPsec VPN over the internet instead, which is fine right up until you look at the egress bill or try to push serious throughput through it. You still had to manage the VPN piece, often with third party NVAs, because back to back AWS and Azure VPN gateways are tricky at best, unworkable at worst.

What was announced removes the middle entirely. The two clouds peer with each other, in facilities they both operate in, over links they own and monitor, and sell you the result as a managed resource you provision from the portal.

## What was actually announced

[Azure Multicloud Interconnect](https://learn.microsoft.com/en-gb/azure/multicloud-interconnect/overview) is a managed service, now in preview, that provides private cloud-to-cloud connectivity between Azure and AWS. On the AWS side it pairs with [AWS Interconnect - multicloud](https://aws.amazon.com/interconnect/), which has been generally available for Google Cloud connectivity since April and now adds Azure in preview.

On the Azure side the construct is familiar because it is built on ExpressRoute. You create an ExpressRoute circuit with a new Azure Multicloud Interconnect port type, then a Multicloud Interconnect resource in your subscription. An activation key ties the two halves together: generate it on either side, redeem it on the other, and the key validates that provider, region, bandwidth and account all match before anything gets provisioned.

Traffic enters your VNets through an ordinary ExpressRoute virtual network gateway, and on the AWS side the connection associates with a VPC, Transit Gateway or Cloud WAN.

The interesting part is the list of things you do not configure: no provider circuits, no cross connects, no VLANs, no point-to-point addressing, and no BGP peering sessions. All of it is managed between the two clouds. A single interconnect is backed by four redundant links across physically separate facilities, MACsec is enabled by default on the physical links, and the clouds coordinate path diversity between themselves.

Microsoft is talking about four nines availability and bandwidth up to 100 Gbps at general availability. That is a substantial chunk of the traditional multicloud network engineering job description quietly absorbed into a managed service.

The preview scope is modest but usable:

- Connectivity between Azure and AWS only
- 1 Gbps bandwidth
- Managed resilient connectivity
- No Azure Multicloud Interconnect service charge during preview
- No Azure egress charge during preview

## Why the open standard matters

The most important strategic detail is that this is not just a bilateral commercial agreement between two clouds. It is built on an open, shared API specification: the [Connection Coordinator API](https://github.com/aws/Interconnect), published as OpenAPI 3.0 with a documented protocol and governance model under Apache 2.0 licensing.

In plain terms, each cloud implements the same control-plane contract for provisioning and lifecycle events, so neither side is forced into a custom, one-off integration for every new partner. That symmetric model is why this now looks like an ecosystem pattern rather than a sequence of isolated announcements.

For customers, that matters because standardisation tends to reduce integration lag, improve operational consistency, and make multicloud connectivity feel more like a product category rather than a bespoke engineering project.

## How we got here: a timeline

The knowing look in 2024 turns out to have had a long fuse, and Azure is arriving later to a party that has been warming up for a while:

- **June 2019**: Oracle and Microsoft [announce the Oracle Interconnect for Azure](https://news.microsoft.com/source/2019/06/05/microsoft-and-oracle-to-interconnect-microsoft-azure-and-oracle-cloud/), direct private peering between OCI and Azure in shared regions.
- **May 2023**: Google announces [Cross-Cloud Interconnect](https://cloud.google.com/blog/products/networking/announcing-google-cloud-cross-cloud-interconnect), managed private connectivity from Google Cloud to AWS, Azure, OCI and Alibaba at 10 or 100 Gbps.
- **November 2025**: AWS announces [preview of AWS Interconnect - multicloud](https://aws.amazon.com/about-aws/whats-new/2025/11/preview-aws-interconnect-multicloud) at re:Invent with Google Cloud as launch partner, and publishes the open specification. Google [announces its side](https://cloud.google.com/blog/products/networking/extending-cross-cloud-interconnect-to-aws-and-partners/) the same week.
- **April 2026**: AWS Interconnect - multicloud [goes GA](https://aws.amazon.com/about-aws/whats-new/2026/04/aws-announces-ga-AWS-interconnect-multicloud/) with Google Cloud, with Azure and OCI named as coming later in the year.
- **May 2026**: [OCI joins in preview](https://aws.amazon.com/about-aws/whats-new/2026/05/aws-announces-AWS-interconnect-multicloud-oci-preview/), using the same open specification.
- **August 2026**: [Azure Multicloud Interconnect for AWS](https://azure.microsoft.com/en-us/blog/introducing-azure-multicloud-interconnect-for-aws/) lands in preview, completing the triangle between the three largest clouds.

Two and a half years from smile to shipping product. In fairness, getting fierce competitors to agree an API specification, peer their edge networks in multiple facilities, and jointly operate the result is the sort of thing that should take a while.

## The pricing question

There is no pricing for the Azure side yet: during preview there is no service charge and, more eye-catchingly, no Azure egress charge. That will not survive contact with general availability, and where pricing lands is the most interesting open question here.

This service has to thread a needle between two existing cost models.

An IPsec VPN over the internet is the low-commitment option: the VPN gateways cost little per hour, and you pay for what you use. The problem is that what you use is charged as internet egress, which is the most expensive per-gigabyte traffic class either cloud sells, and both sides of a cloud-to-cloud flow are paying it.

At low volumes this is fine. At sustained replication or data pipeline volumes the egress line dwarfs the gateway cost, and you also get unpredictable throughput and MTU pain.

The private option inverts that. ExpressRoute is a fixed port fee plus a lower metered egress rate, or a higher fixed fee with unlimited egress if your volumes justify it. Direct Connect on AWS has a similar shape: port hours plus a much lower per-gigabyte rate than internet egress.

But to use either for multicloud you were paying for both halves plus the middle: colo or NaaS, plus your own operational effort.

The apparent model for the new interconnects is different from both: flat rate. AWS has [published pricing](https://aws.amazon.com/interconnect/multicloud/pricing/) for its side of the Google Cloud connectivity, and it is an hourly fee based on bandwidth and geographic tier, with no per-gigabyte data transfer charges.

If Azure follows the same shape, and the current preview waiving egress hints that way, then the pricing conversation for cloud-to-cloud traffic changes from "estimate your gigabytes and multiply" to "size the pipe and budget it".

The needle it has to thread is this: cheaper than VPN total cost at meaningful volume, and competitive with DIY private back-to-back builds. I suspect the DIY option survives only where you need something the managed service cannot do yet: niche regions, specific traffic engineering, or bandwidth beyond service limits.

## What this does to multicloud architecture

The bit I find more interesting than the plumbing is what this does to reference architectures. Until now, sensible multicloud designs treated cross-cloud links as scarce, expensive and slightly fragile, so each cloud got its own mostly self-contained network estate with a carefully rationed connection between them.

If interconnect becomes a cheap, reliable, provision-it-in-an-afternoon commodity, some previously eccentric designs start to look sensible.

The obvious one is multi-provider hub and spoke. Today your hub is in the same cloud as its spokes by necessity. With managed interconnects you could plausibly hang AWS VPC spokes off an Azure hub, or the reverse: a hub VNet or Virtual WAN in Azure doing central inspection and shared services, with the interconnect delivering AWS workloads to it through an ExpressRoute gateway, and Transit Gateway or Cloud WAN aggregating the far side.

GCP can join the same picture through Network Connectivity Center. Whether you would want all inter-VPC traffic hairpinning through another cloud's firewall is a fair question, and the answer will often be no, but for the common pattern of a small satellite estate in a second cloud, the case for giving it a full network stack of its own just got weaker.

It also changes the calculus for DR and data pipelines, where the egress-metered world quietly punished data movement between clouds, and for the current race to reach GPU capacity in whichever cloud has it. And because the Azure service extends to Private Link, you get a private end-to-end path to PaaS services across clouds, which previously needed a lot of DNS and forwarding gymnastics.

> This is the teaser line I keep coming back to. "Extends to Azure Private Link" could be a big deal for cross-cloud private service consumption, but the current announcements stay fairly high-level on implementation details. I will dig into this properly once I have a lab up with interconnect between my Azure and AWS accounts.

There is plenty to test once preview access allows: what routing actually looks like, how the activation key flow behaves, what failover characteristics those four links show, and how hub-and-spoke patterns hold up in real deployments.

That will be the follow-up post, with lab notes and diagrams. For now I am mostly enjoying the fact that it's here and it's going to solve at least one problem that is sat on the edge of my desk gathering dust.
