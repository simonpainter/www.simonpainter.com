---
title: "Public Preview: IPv6 support in Azure Firewall"
authors: simonpainter
tags:
  - azure
  - networks
  - firewall
  - ipv6
date: 2026-08-21
---

Azure Firewall now supports IPv6 in public preview. You can run the service in dual-stack mode, attach an IPv6 public IP, and inspect IPv6 traffic with network rules instead of forcing everything back through IPv4.

That matters if you're trying to build a clean dual-stack Azure network. Before this, Azure Firewall was one of those awkward IPv4-only choke points that made IPv6 designs feel like a modern road with an old toll booth in the middle.

It's still an early preview, so the support matrix is narrow. Even so, this closes a real gap for teams that want Azure Firewall in an IPv6 migration plan.

<!-- truncate -->

## What it is

This preview adds IPv6 support to Azure Firewall and Azure Firewall Policy. In practice, that means you can deploy a firewall in dual-stack mode, give it both IPv4 and IPv6 public addresses, add IPv6 address space to the firewall subnet, and write IPv6 network rules.

It doesn't create an IPv6-only firewall. Microsoft only supports IPv4-only or dual-stack deployments right now.

The official announcement is here: [[In preview] Public Preview: Ipv6 support in Azure Firewall](https://azure.microsoft.com/updates?id=569520). The main setup guide on Learn is [Deploy Azure Firewall in dual stack mode (preview)](https://learn.microsoft.com/azure/firewall/deploy-dual-stack-firewall).

## Who should care

If you're planning an IPv6 rollout in Azure, this is the audience. Platform teams that use Azure Firewall as a central egress or inspection point can now start testing whether that pattern still works once IPv6 traffic enters the picture.

It's also useful for network teams trying to avoid mixed designs where workloads are dual stack but the security layer is stuck on IPv4. Every forced fallback to IPv4 adds more moving parts, more translation, and more places to get routing wrong.

If your firewall rules rely on application rules, DNAT, IDPS, threat intelligence, or Explicit Proxy for IPv6 traffic, you're not the target yet. Those pieces aren't supported in this preview.

## How to use it

The basic flow is simple. Start with a dual-stack virtual network, add an IPv6 prefix to `AzureFirewallSubnet`, create an IPv6 public IP, then attach that IP to a new or existing Azure Firewall.

Right now, Microsoft only supports configuration through Azure CLI and PowerShell. Portal support is listed as coming soon, so this is a feature for people who are happy to work from code or the command line.

### Azure CLI example

This example upgrades an existing firewall to dual stack:

```bash
az network vnet update \
    --resource-group test-rg \
    --name test-vnet \
    --address-prefixes 10.0.0.0/16 fd00:c1d0:3f1f::/48

az network vnet subnet update \
    --resource-group test-rg \
    --vnet-name test-vnet \
    --name AzureFirewallSubnet \
    --address-prefixes 10.0.0.0/24 fd00:c1d0:3f1f:1::/64

az network public-ip create \
    --resource-group test-rg \
    --name test-v6pip \
    --location southcentralus \
    --sku Standard \
    --version IPv6 \
    --allocation-method Static \
    --zone 1 2 3

az network firewall ip-config create \
    --firewall-name test-fw \
    --name fw-ip6-config \
    --resource-group test-rg \
    --public-ip-address test-v6pip
```

After that, add IPv6 network rules in the same way you'd add IPv4 network rules. Microsoft also notes that Azure Firewall can act as a DNS proxy in IPv6 networks, which helps if you're already using the firewall as a shared resolver path.

For a full walkthrough, use these pages:

- [Deploy Azure Firewall in dual stack mode (preview)](https://learn.microsoft.com/azure/firewall/deploy-dual-stack-firewall)
- [Azure Firewall known issues and limitations](https://learn.microsoft.com/azure/firewall/firewall-known-issues)

## Gotchas and limits

This preview has a fairly tight boundary.

**CLI and PowerShell only.** Portal deployment isn't supported yet, even though Microsoft says it's coming soon.

**Network rules only for IPv6.** Application rules and DNAT rules aren't supported yet for IPv6 traffic. If your design depends on L7 filtering or inbound publishing over IPv6, you'll need to wait.

**Not every Azure Firewall shape is covered.** Classic Azure Firewall and Virtual Hub Firewall aren't supported in this preview.

**Some add-on features are missing.** Threat intelligence, IDPS, Explicit Proxy, and IP Groups based scenarios aren't supported for IPv6 in preview.

**Some regions are excluded.** Dual-stack mode isn't available yet in Israel Central, Israel Northwest, Qatar Central, UAE Central, and UAE North.

**The rollback story isn't there yet.** Once you move a firewall to dual stack, you can't switch it back to IPv4-only mode during preview.

**SNAT has one special case.** Microsoft says outbound IPv6 traffic is SNATed to the firewall's IP address, except when the destination sits in the unique local address range `fc00::/7`.

## Quick takeaway

This is a useful preview because it removes one more IPv4-only island from Azure networking. It won't solve every firewall scenario yet, but it does give dual-stack teams a real place to start testing Azure Firewall with IPv6.

My take: if you're already mapping an IPv6 migration, add this to the lab list now. Just go in with clear expectations — network rules first, command-line deployment only, and plenty of preview caveats.
