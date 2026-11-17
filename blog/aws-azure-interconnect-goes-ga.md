---
title: AWS to Azure interconnect goes GA, and I get to mark my own homework
authors:
  - simonpainter
tags:
  - expressroute
  - azure
  - aws
date: 2026-11-18
---

In August I wrote about [the cross-connect I didn't have to build](/the-cross-connect-i-didnt-have-to-build), and in September I [built it anyway](/building-azure-multicloud-interconnect-to-aws). Yesterday AWS announced that [Interconnect - multicloud with Azure is generally available](https://aws.amazon.com/about-aws/whats-new/2026/11/aws-announces-AWS-interconnect-multicloud-azure-ga/), so it's time to do the slightly uncomfortable thing that people who publish predictions on the internet ought to do more often: mark my own homework.
<!-- truncate -->

## What actually went GA

Both halves, which matters. A managed cross-cloud circuit that's GA at one end and preview at the other is still a preview circuit, because the weakest SLA in the path is the one you've got.

On the AWS side, Azure connectivity is GA. You can provision it from the console, CLI or API, with the same experience AWS offers for Google Cloud and OCI. The [Connection Coordinator API](https://github.com/aws/Interconnect) is the open specification that makes that possible: each new partner arrives looking like the last one, rather than as a bespoke integration.

Microsoft has also [announced Azure's AWS connection as GA](https://techcommunity.microsoft.com/blog/AzureNetworkingBlog/connecting-clouds-and-the-last-mile-with-azure/4573283), with connections to Google Cloud in public preview. That's the more interesting part. Google already peers with AWS through this specification, so Azure joining on the Google side closes the triangle between the three biggest clouds, all on one shared control-plane contract.

The AWS announcement lists three Azure region pairs at GA:

| AWS Region | Azure region |
|---|---|
| us-east-1 (N. Virginia) | East US |
| eu-central-1 (Frankfurt) | Germany West Central |
| ap-southeast-2 (Sydney) | Australia East |

Preview had four. US West (N. California), paired with West US, isn't in the GA list. I'd read that as “not GA there yet” rather than “gone”, but if your design depends on the west coast, check the [region availability documentation](https://learn.microsoft.com/en-us/azure/multicloud-interconnect/availability-limits) before you assume.

## What the announcement doesn't say

The AWS press release says little about pricing, bandwidth, limits or the SLA. For a GA announcement that's a fair amount of white space, so the answers live in the documentation rather than the press release.

Microsoft's August launch blog said GA would bring up to 100 Gbps from day one, with capacity able to grow without redesigning the network. The [AWS user guide](https://docs.aws.amazon.com/interconnect/latest/userguide/what-is-interconnect.html) fills in the plumbing common to every partner: four connections, ECMP across physically separate facilities, MACsec by default between AWS and partner devices, and the Direct Connect gateway as the AWS attach point. None of that is new to anyone who read the preview material, but it's now the GA design rather than the preview one.

## Marking the homework

Here's what I said in September, against what GA tells us so far.

| What I said | Status at GA |
|---|---|
| Pricing would converge on a flat rate | AWS is flat rate. Azure has published a bandwidth-based price model, but the listed paid rates still need confirming |
| `MeteredData` in the SKU might be nothing more than an inherited enum | Unknown until I check a GA circuit |
| Preview won't keep letting 1 Gbps carry 2.39 Gbits/sec | Untested |
| Bandwidth is a purchase decision, not a dial | Probably wrong, at least on the AWS end |
| Managed means opaque, so plan your monitoring | Partly answered by AWS |
| Preview connections get deleted | Still true, and now it's happening |

Two of those deserve more than a table row.

### I was probably wrong about bandwidth

In the build post I said changing bandwidth would be a circuit change, with all the in-service pain that implies. The AWS user guide now says you can increase or decrease an interconnect's capacity from the console without reprovisioning or raising a support case. Microsoft's line about capacity expanding without redesign points the same way.

I'd still want to see it done on a live circuit before believing it end to end. The Azure end is an ExpressRoute circuit, and ExpressRoute has historically been happier going up than coming down. But if both ends treat bandwidth as a dial, the sizing advice changes: you stop buying headroom you might need in eighteen months and start buying what you need now.

### Monitoring got a bit less opaque

My biggest operational worry was that a managed interconnect leaves you with a provisioning state, a route table and not much else. AWS now includes one CloudWatch Network Synthetic Monitor per interconnect at no extra cost, for latency and packet loss, plus a bandwidth utilisation metric.

That's not the same as seeing the BGP sessions, and AWS notes the Network Health Indicator isn't supported yet. But it's a long way better than inferring the middle from the two ends, which is what my troubleshooting consisted of in September.

## The pricing is where the decision gets made

AWS has a published model: an hourly charge set by bandwidth and an automatically assigned pricing tier, with no per-gigabyte data transfer charge. The [pricing page](https://aws.amazon.com/interconnect/multicloud/pricing/) lists 10 Gbps at Tier 1 as $12.33 an hour, or about $9,000 a month. A 1 Gbps Tier 1 interconnect is $1.37 an hour, roughly $1,000 a month. There's also one free 500 Mbps interconnect per cloud provider per AWS Region.

The trap is the same one I wrote about when [Direct Connect went flat rate](/direct-connect-goes-flat-rate). The tier isn't decided by where you meant traffic to come from. It's decided by the highest-tier path the interconnect can reach. AWS's example is an interconnect in N. Virginia, attached to a Direct Connect gateway associated with Cloud WAN edges in us-east-1 and Singapore, landing in Tier 4 rather than Tier 1. That's the difference between about $9,000 a month and about $38,000 for the same 10 Gbps.

The Direct Connect gateway is a global object, and it will happily make your Frankfurt interconnect a long-haul circuit if your Cloud WAN core network has an edge on another continent. Model the tier from the topology you've got, not the one you drew.

Azure's [pricing page](https://azure.microsoft.com/en-us/pricing/details/multicloud-interconnect/) now describes a monthly, bandwidth-based charge with Local and Premium connectivity options, and says inbound and outbound data transfer are included. That's useful: there isn't a separate Azure per-GB charge in the published model. But the paid prices currently appear as `$-`, so the number you need for a business case still isn't there. Get a quote before anyone signs anything. The 500 Mbps Local free tier has no SLA, is limited to 90 days and can't be upgraded in place.

## What I'd do now

1. **Rebuild, don't migrate.** AWS says preview connections get removed as the pairing reaches GA. If you've got one carrying traffic you care about, build a GA connection alongside it and move the routes before the old one vanishes.
2. **Check your region pair first.** Three AWS regions at GA, not four. If you're on the west coast, confirm availability before you plan.
3. **Price both halves.** The AWS rate card is public. Microsoft's page explains its charging model but doesn't show paid rates yet; get the Azure number in writing, and don't build a business case on preview pricing.
4. **Work out your tier from the real topology.** If the Direct Connect gateway touches Cloud WAN edges in other regions, assume a higher tier until the bill proves otherwise.
5. **Retest throughput before you size.** My preview numbers showed a 1 Gbps circuit carrying well over 1 Gbps in aggregate and a single flow topping out around 715 Mbits/sec. The first is unlikely to survive GA policing. The second probably will.
6. **Read the SLA, not the press release.** Four nines has been the target since preview. Find the document that makes it a commitment.

I'm going to rebuild my lab on a GA circuit over the next few weeks and rerun the tests, partly to fill in the gaps above and partly because I'd like to know whether that 2.39 Gbits/sec was a preview gift or a lucky afternoon. I suspect I know the answer.
