---
title: "Comparing BGP communities in AWS and Azure"
authors: simonpainter
tags:
  - cloud
  - aws
  - azure
  - bgp
  - networks
date: 2025-03-11
---

I like to point out to people that _it's easier to train a network person on cloud than it is to train a cloud person on networks_. It's a glib generalisation but it holds true for the most part because there is so much to networking [that comes from history](how-the-internet-works.md) and quite a lot of grounding that a seasoned network engineer or architect will already understand.
A big chunk of the [AWS](/tags/aws) and [Azure](/tags/azure) networking certification covers [BGP](/tags/bgp) and that's one of the reasons they are considered quite hard for some but quite easy for others. [BGP](/tags/bgp) is a topic that many very experienced network engineers in enterprise networking can get through their entire career without touching, but for those who operate at scale or work with MSP and telco networks it's bread and butter.
<!--truncate-->

Both [Azure](/tags/azure) and [AWS](/tags/aws) use [BGP](/tags/bgp) for route exchange on ExpressRoute and Direct Connect respectively to on premise networks; they also use it optionally for route exchange on VPN connections from on premise networks. Both [AWS](/tags/aws) and [Azure](/tags/azure) have a public and private type peering - the public type to give access to public services over the cloud backbone and private ER or DX connections

> I use ER and DX a lot instead of ExpressRoute and Direct Connect. You probably realised that though.

Both [Azure](/tags/azure) and [AWS](/tags/aws) tag their route prefixes with [BGP](/tags/bgp) communities and support specific [BGP](/tags/bgp) communities from customers to influence routing decisions.

> Did you spot that? 'Influence' routing decisions. It's pretty important to remember that as [BGP](/tags/bgp) operates
> across autonomous system boundaries you can only influence your peer's routing, not control it. Conversely
> they can influence your routing in specific and defined ways but cannot directly control it; it's one of the
> important tenets of [BGP](/tags/bgp).

## ER and DX public connections

On [Azure](/tags/azure) ExpressRoute you can create a `Microsoft Peering` to route your traffic to public services over your ExpressRoute rather than over the internet. Microsoft aren't all that keen on this, expecially for [Microsoft 365](https://learn.microsoft.com/en-us/microsoft-365/enterprise/azure-expressroute?view=o365-worldwide). On an [AWS](/tags/aws) Direct Connect you can create a `public vif` which performs the same function allowing you to route connectivity to public [AWS](/tags/aws) services over a low (or at least predictable) latency private connection rather than over the internet.

### NO_EXPORT

[AWS](/tags/aws) explicitly supports the NO_EXPORT community defined in [RFC 1997](https://www.rfc-editor.org/rfc/rfc1997.html). This is defined as:

> NO_EXPORT (0xFFFFFF01)
>
> All routes received carrying a communities attribute
> containing this value MUST NOT be advertised outside a BGP
> confederation boundary (a stand-alone autonomous system that
> is not part of a confederation should be considered a
> confederation itself).

This means that prefixes learned over a DX public peering cannot be exported to other connected ASNs - this prevents customers from unwittingly becoming transit networks for other people to reach [AWS](/tags/aws). [AWS](/tags/aws) also treats all prefixes received from customers as if they were tagged with NO_EXPORT which means that your public DX prefixes will never be exported beyond [AWS](/tags/aws).

The [Azure](/tags/azure) ExpressRoute documentation doesn't explicitly state that NO_EXPORT is used however there is an expectation that customers will not export routes learned from ExpressRoute to elsewhere. This is also enforced by internet providers that peer with Microsoft [who are required to reject any ExpressRoute prefixes on the internet](https://learn.microsoft.com/en-us/azure/internet-peering/policy).

> All parties peering with Microsoft agree not to accept routes from AS12076 (ExpressRoute) under any
> circumstances and should filter out AS12076 on all peers.

### Regional Communities

Both [AWS](/tags/aws) DX and [Azure](/tags/azure) ER public connections support a range of regional and geographic communities. For [Azure](/tags/azure) [the full list is here](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-routing#bgp) and you can filter routes based on region for both public clouds and soverign national clouds (US Government and China).
In [AWS](/tags/aws) there is a simpler scoping mechanism where routes learned from the same region as your DX peering will be tagged with `7224:8100`, those from the same continent will be tagged with `7224:8200` and everything else is untagged. This means you can prefer, for example, US DX for US regions and a European DX for traffic to European regions. In order to ensure that traffic is routed symetrically you can apply corresponding communities to the prefixes you advertise to [AWS](/tags/aws): adding `7224:9100` will instruct [AWS](/tags/aws) to only allow that prefix to the local region of the DX connection, `7224:9200` will instruct [AWS](/tags/aws) to allow it to regions in the same continental area and leaving them untagged will instruct [AWS](/tags/aws) to allow those prefixes to any region

### Service Communities

[Azure](/tags/azure) supports an [extensive list of communities for public services](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-routing#service-to-bgp-community-value) while [AWS](/tags/aws) publishes a detailed JSON formatted list](https://ip-ranges.amazonaws.com/ip-ranges.json) of their prefixes along with information about the services and regions they support; this leaves it for the customer to implement service filtering without communities.

### Local Preference Communities

A rather neat thing from [AWS](/tags/aws) is the ability to influence Local Preference by setting specific communities. Setting one of the communities on prefixes advertised to [AWS](/tags/aws) will instruct [AWS](/tags/aws) to apply the corresponding Local Preference for traffic outbound from [AWS](/tags/aws) to the customer.

> 7224:7100 - Low preference
>
> 7224:7200 — Medium preference
>
> 7224:7300 — High preference

This is particularly useful because _Local Preference Always Wins_ so you can override AS PATH length and home region association to influence path selection and ECMP across regions.

> OK, you're right, [longest prefix](longest-prefix-matching.md) beats LOCAL_PREF. It's probably better to say
> _Local Preference Always Wins In [BGP](/tags/bgp)_ but that's not as catchy.

## ER and DX private connections

[AWS](/tags/aws) support is basically the same over private vifs with regard to the scoping and preference. [Azure](/tags/azure) gives you [granular control to set your own community values](https://learn.microsoft.com/en-us/azure/expressroute/how-to-configure-custom-bgp-communities-portal) for routes exported from [Azure](/tags/azure) to your own network over a private peering.
