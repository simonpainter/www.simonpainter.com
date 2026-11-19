---
title: "Public Preview: Scale ExpressRoute Direct connectivity with link groups"
authors: simonpainter
tags:
  - azure
  - networks
  - expressroute
  - performance
  - high-availability
date: 2026-11-17
---

Azure ExpressRoute Direct link groups are now in public preview. They let you combine multiple physical links into one logical connection, giving high-throughput networks a way to scale capacity without managing each link as a separate connection.

The preview also adds LACP negotiation and failover, group-level monitoring, and a minimum-active-links setting. That threshold lets you decide how many links must remain up for the group to stay operational.
<!-- truncate -->

## What link groups change

ExpressRoute Direct provides dedicated connectivity to Microsoft's network at a peering location. A link group aggregates multiple ExpressRoute Direct physical links into one logical connection. Link Aggregation Control Protocol (LACP) handles link negotiation and failover, while Azure lets you manage and monitor the aggregate as a group.

You can also set the minimum number of active links needed for the group to remain operational. This gives you control over whether a group stays up with reduced capacity after a link failure or goes down when it falls below your chosen threshold.

## Who should care

This is aimed at teams running high-throughput workloads over ExpressRoute Direct, especially where managing several independent connections adds operational work. The group-level view and LACP behaviour may also help teams planning link resilience, though the preview announcement doesn't publish performance figures or a detailed failure model.

## How to approach the preview

The [link groups guidance](https://aka.ms/ERLinkGroup) currently redirects to Microsoft's general ExpressRoute Direct overview. That overview and the [configuration guide](https://learn.microsoft.com/azure/expressroute/how-to-expressroute-direct-portal) don't yet explain how to create a link group, so the announcement doesn't provide a portal path or CLI command to copy. Confirm the preview's onboarding and supported topology with Microsoft before making configuration changes.

As a planning example, if you group four physical links and set the minimum active count to three, the group can remain operational with one link down. If two links fail, it drops below that threshold. Agree the LACP configuration with the team managing the connected equipment, then test link loss and check the group's status before relying on the design.

## Gotchas and limits

This is a public preview, which Microsoft describes as available for non-production use and testing. The announcement doesn't specify the maximum links per group, supported port speeds or locations, allowed threshold values, or whether existing resources can be converted. Check the latest guidance and preview terms before designing around those details.

There's a documentation mismatch to watch for: the current [ExpressRoute Direct overview](https://learn.microsoft.com/azure/expressroute/expressroute-erdirect-about) says the service doesn't support LACP, while the new preview announcement says link groups use LACP. The overview hasn't caught up with the preview, so follow preview-specific guidance rather than applying that older statement to link groups.

The minimum-active-links setting controls whether the group remains operational; it doesn't promise that every application will see uninterrupted traffic during a failure. Test the full path, including routing and application behaviour, with the exact topology you plan to use.

## Quick takeaway

Link groups make ExpressRoute Direct links easier to scale and manage as one connection, with LACP and a configurable active-link threshold. Treat the preview as a chance to test the model, and verify support and limits with Microsoft's current guidance before planning production use.

## Links

- Official announcement: [Public Preview: Scale ExpressRoute Direct connectivity with link groups](https://azure.microsoft.com/updates?id=580926)
- Microsoft Learn: [About Azure ExpressRoute Direct](https://learn.microsoft.com/azure/expressroute/expressroute-erdirect-about)
- Microsoft Learn: [Configure Azure ExpressRoute Direct](https://learn.microsoft.com/azure/expressroute/how-to-expressroute-direct-portal)
- Preview terms: [Supplemental Terms of Use for Microsoft Azure Previews](https://azure.microsoft.com/support/legal/preview-supplemental-terms/)
