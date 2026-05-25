---
title: "Generally Available: Azure Virtual Network default limits increased for NSGs and route tables"
authors: simonpainter
tags:
  - azure
  - networks
  - security
  - cloud
  - architecture
  - troubleshooting
date: 2026-05-25
---

Microsoft has raised the default Azure Virtual Network limits for both Network Security Groups (NSGs) and route tables. This is now generally available, so you get the new limits without opening a support request.

For teams running large hub-and-spoke estates, or anyone segmenting traffic with lots of explicit routes and rules, this removes a common scaling pain. You can keep cleaner designs with fewer workarounds.

The new defaults are 2,000 rules per NSG, up to 6,000 addresses or ports in an NSG rule, 1,000 routes per route table, and 600 route tables per subscription by default.
<!-- truncate -->

## What it is

This update increases baseline Virtual Network scale limits that many of us hit during growth phases. In plain terms, Azure now gives more room for security policy and routing logic before you need redesigns.

Microsoft announced this as generally available here: [Azure Virtual Network updates, default limits increased for NSGs and route tables](https://azure.microsoft.com/updates?id=562695).

You can also validate the live platform limits in the official limits page: [Azure networking limits](https://learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-networking-limits).

## Who should care

If you manage enterprise landing zones, shared services VNets, or centralised inspection patterns, this one matters. These are the environments where NSG and UDR counts can grow quickly.

I also think this helps platform teams that support many app teams. It reduces the need to split resources purely to avoid old ceiling values.

## How to use it

You do not need a migration step. The new defaults apply at the platform level.

A practical next step is to check your current headroom so you can decide whether to simplify existing split-out NSGs or route tables.

```bash
# Count current custom NSG rules
az network nsg rule list \
  --resource-group rg-network \
  --nsg-name nsg-shared-ingress \
  --query "length(@)"

# Count current routes in a route table
az network route-table route list \
  --resource-group rg-network \
  --route-table-name rt-spoke-egress \
  --query "length(@)"
```

If you also need a refresher on day-to-day operations, these two pages are still the best practical references:

- [Create, change, or delete a network security group](https://learn.microsoft.com/azure/virtual-network/manage-network-security-group)
- [Create, change, or delete a route table](https://learn.microsoft.com/azure/virtual-network/manage-route-table)

## Gotchas and limits

Higher limits do not remove design trade-offs. Very large NSGs can still be harder to review, and giant route tables can still increase operational complexity.

I would still keep policy grouped by purpose, keep naming clear, and avoid overloading single objects just because the limit is higher.

Also remember that related services have their own constraints. Always check adjacent limits before you consolidate too aggressively.

## Quick takeaway

This is a useful quality-of-life update for Azure networking. You get more default scale for NSGs and route tables, which gives you cleaner growth paths and fewer forced workarounds.

If you hit old limits in the past, this is a good time to revisit those designs and simplify where it makes sense.
