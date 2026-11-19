---
title: "Public Preview: Perimeter link (cross perimeter) in network security perimeter"
authors: simonpainter
tags:
  - azure
  - networks
  - private-link
  - zero-trust
  - security
date: 2026-11-19
---

Microsoft's 17 November Azure update lists perimeter links for Network Security Perimeter (NSP) as a public preview. A link connects selected profiles in two separate perimeters, so their associated services can communicate without you writing matching access rules by hand.

The announcement doesn't describe a new API or changed limits. The practical details remain in Microsoft's Learn guidance: managed identity is required, only six PaaS services are supported in preview, and each perimeter can have up to ten links.
<!-- truncate -->

## What it is

A perimeter link creates a trust relationship between two NSPs. Azure adds the required inbound and outbound allow rules to the selected profiles on both sides. The link is symmetric, so *local* and *remote* describe the side from which you create it, not the direction traffic can flow.

For example, a workload in one perimeter can reach a Key Vault associated with a profile in another perimeter. The services still need to authenticate with managed identities; the link doesn't replace identity checks.

## Who should care

This is useful if you've split PaaS resources across perimeters by application, environment, team, or subscription, but some of those services still need to communicate. It avoids keeping equivalent rules in step on both perimeters.

The preview supports Azure SQL Database, Azure Storage, Azure Cosmos DB, Azure Key Vault, Azure Monitor, and Azure Service Bus. If your application depends on another service, this link won't provide cross-perimeter connectivity for it.

## How to use it

Create two NSPs, give each at least one profile, and associate the PaaS resources with those profiles. Register the preview feature and install the NSP Azure CLI extension:

```bash
az feature register \
    --namespace Microsoft.Network \
    --name AllowNspLink

# Wait for the feature state to show Registered, then refresh the provider
az provider register --namespace Microsoft.Network
az extension add --name nsp
```

Once the feature is registered, create the link from the local perimeter. This example assumes the remote perimeter ID is already in `remotePerimeterId`:

```bash
az network perimeter link create \
    --name link-to-remote \
    --perimeter-name local-nsp \
    --resource-group local-rg \
    --auto-remote-nsp-id "$remotePerimeterId" \
    --local-inbound-profile "['local-profile']" \
    --remote-inbound-profile "['remote-profile']"
```

Use your own resource names and profile names. Microsoft's [configuration guide](https://learn.microsoft.com/en-us/azure/private-link/configure-perimeter-link) also covers the portal and PowerShell, including the permissions needed for links across subscriptions.

## Gotchas and limits

Both sides need the required permissions. Automatic approval works only when the perimeters are in the same subscription; for different subscriptions, the initiating user needs Contributor access to the remote subscription or the `Microsoft.Network/networkSecurityPerimeters/linkPerimeter/action` permission there.

Managed identity is mandatory for cross-perimeter service-to-service traffic. Other authentication methods aren't supported. The preview is available in Azure public and government regions that support NSP, and each perimeter is limited to ten links.

Either perimeter administrator can remove a link without approval from the other side. Removing it also removes the generated rules, so traffic that relied on the link stops unless other rules allow it. As this is a preview, check Microsoft's [preview terms](https://azure.microsoft.com/support/legal/preview-supplemental-terms/) before using it.

## Quick takeaway

Perimeter links reduce the manual rule work involved when services in separate NSPs need to communicate. Check service support, permissions, and managed identity requirements first, and treat link removal as a change that can interrupt traffic.

For the full feature overview, see Microsoft's [perimeter link documentation](https://learn.microsoft.com/en-us/azure/private-link/perimeter-links-overview). I also covered the earlier preview announcement in this [perimeter link walkthrough](/updates/in-preview-public-preview-perimeter-link-feature-in-network-security-perimeter).

## Links

- Official announcement: [[In preview] Public Preview: Perimeter link (cross perimeter) in network security perimeter](https://azure.microsoft.com/updates?id=579206)
- Learn: [Perimeter link feature in Network Security Perimeter (Preview)](https://learn.microsoft.com/en-us/azure/private-link/perimeter-links-overview)
- Learn: [Configure a perimeter link between network security perimeters](https://learn.microsoft.com/en-us/azure/private-link/configure-perimeter-link)
- Learn: [Network security perimeter concepts](https://learn.microsoft.com/en-us/azure/private-link/network-security-perimeter-concepts)
