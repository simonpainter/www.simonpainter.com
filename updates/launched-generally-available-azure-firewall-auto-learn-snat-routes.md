---
title: "Generally Available: Azure Firewall auto-learn SNAT routes"
authors: simonpainter
tags:
  - firewall
  - azure
  - networks
date: 2026-09-03
---

Azure Firewall auto-learn SNAT routes is now generally available. It lets the firewall learn internal prefixes from Azure Route Server, so it can stop source NATing traffic that should stay inside your network.

That sounds small, but it fixes a real operational pain. If you use non-RFC1918 space, hybrid routing, or a secured virtual hub, manual SNAT private range lists can feel like keeping a paper map up to date while the roads keep moving.

This feature gives Azure Firewall a better view of your routing estate. That means fewer manual exceptions, less drift, and cleaner traffic flows for internal destinations.

<!-- truncate -->

## What it is

Azure Firewall SNATs outbound traffic to public destinations by default. For private destinations, it normally skips SNAT only for well-known private ranges such as RFC 1918 and RFC 6598.

That breaks down when your organisation uses registered address space internally, or when your effective internal routes change over time. Auto-learn SNAT routes solves that by learning registered and private prefixes every 30 minutes through Azure Route Server, then treating those learned ranges as internal. Traffic to those destinations won't be SNATed.

The feature works for both VNet deployments and secured virtual hub deployments. In a secured virtual hub, Azure Route Server is already there. In a VNet deployment, you need to add it first.

## Who should care

This is useful if you run Azure Firewall in a hybrid network where not every internal prefix sits inside RFC 1918 space. It's also useful if you manage large estates where route changes happen often and you don't want to keep editing SNAT private ranges by hand.

I'd pay close attention if your firewall sits between Azure and on-prem networks, or if you're using BGP to advertise internal prefixes into Azure. In those setups, the wrong SNAT behaviour can make troubleshooting feel like chasing footprints in the rain.

## How to use it

For a VNet-based firewall, start by deploying Azure Route Server in the same virtual network. The docs call for a `RouteServerSubnet` that is at least `/27`. Once the firewall can associate with Route Server, enable auto-learn in the firewall policy.

For a secured virtual hub firewall, the setup is simpler. Azure Route Server is already deployed and associated, so you just enable the setting in the firewall policy.

Here's a minimal ARM template example that enables auto-learn SNAT routes in an Azure Firewall Policy:

```json
{
  "type": "Microsoft.Network/firewallPolicies",
  "apiVersion": "2024-05-01",
  "name": "my-fw-policy",
  "location": "uksouth",
  "properties": {
    "sku": {
      "tier": "Standard"
    },
    "snat": {
      "autoLearnPrivateRanges": "Enabled"
    }
  }
}
```

If you prefer PowerShell, Microsoft also documents `New-AzFirewallPolicySnat -AutoLearnPrivateRange` for both new and existing firewall policies.

In the portal, the path is straightforward:

1. Associate Azure Route Server with the firewall if you're using a VNet deployment.
2. Open the firewall policy.
3. Go to **Private IP ranges (SNAT)**.
4. Enable **Auto-learn IP prefixes** and apply the change.
5. Check **Learned SNAT IP Prefixes** on the firewall to confirm the learned routes.

## Gotchas and limits

The biggest limit is Route Server dependency. Auto-learn SNAT needs Azure Firewall to be associated with Azure Route Server. For VNet deployments, that means extra plumbing before the toggle does anything useful.

Azure CLI also doesn't support configuring auto-learn SNAT routes at the time of writing. If your team leans on CLI-first workflows, you'll need to use ARM, PowerShell, or the portal instead.

This setting only affects network rules. Application rules still use SNAT through Azure Firewall's transparent proxy behaviour, so don't expect this feature to change every outbound flow.

There's also a timing point to remember: learned ranges update every 30 minutes. That's fine for most routing changes, but it isn't the same as instant convergence.

## Quick takeaway

Azure Firewall auto-learn SNAT routes is a practical quality-of-life feature that removes manual SNAT range maintenance for dynamic or non-standard internal networks. If you already use Azure Route Server, this is an easy win.

If you've been carrying custom SNAT exceptions around like sticky notes on a monitor, this should make your policy cleaner and your routing behaviour easier to trust.

Official announcement: [Generally Available: Azure Firewall auto-learn SNAT routes](https://azure.microsoft.com/updates?id=570474)  
Microsoft Learn: [Azure Firewall SNAT private IP address ranges](https://learn.microsoft.com/azure/firewall/snat-private-range)  
Route Server quickstart: [Quickstart: Create and configure Route Server by using the Azure portal](https://learn.microsoft.com/azure/route-server/quickstart-configure-route-server-portal)
