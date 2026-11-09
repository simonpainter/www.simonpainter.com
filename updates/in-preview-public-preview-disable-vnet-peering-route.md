---
title: "Public Preview: Disable VNet peering route propagation"
authors: simonpainter
tags:
  - azure
  - networks
  - routing-protocols
  - firewall
  - ipv6
date: 2026-11-09
---

Azure now lets you suppress the system-generated routes that direct traffic over VNet peering. The peering connection stays in place, but you can use your own routes to send traffic through an Azure Firewall or network virtual appliance (NVA).

That gives hub-and-spoke networks another way to keep inspection paths manageable as they grow. Instead of adding a more-specific route for every spoke, you can suppress peering routes on selected subnets and use a summarised user-defined route (UDR).

<!-- truncate -->

## What it is

Disable peering route propagation is a route-table setting in public preview. Set `disablePeeringRoute` to `All` to suppress system-generated IPv4 and IPv6 peering routes for supported workloads on subnets associated with that route table. The default, `None`, keeps those routes.

This changes route selection, not connectivity: the VNets remain peered. It also doesn't add replacement routes or create an inspection path. You need to configure the UDRs and make sure the next hop can reach the destinations.

## Who should care

This is most useful for teams with larger hub-and-spoke networks that need traffic to pass through a firewall or NVA. A summarised UDR can replace multiple per-spoke overrides when the address plan and intended traffic path allow it.

It can also help when Azure's more-specific system peering route would otherwise take precedence over a summarised UDR. Suppressing that route lets Azure select the UDR you configured.

## How to use it

First, register the preview feature for the subscription that contains the route table. After its state becomes `Registered`, refresh the network resource provider:

```bash
az feature register \
  --namespace Microsoft.Network \
  --name AllowDisablePeeringRoutes

az feature show \
  --namespace Microsoft.Network \
  --name AllowDisablePeeringRoutes \
  --query properties.state \
  --output tsv

# Run this after the feature state is Registered
az provider register --namespace Microsoft.Network
```

Create or update a route table with the replacement UDRs in place, associate it with the subnets where you want to suppress peering routes, then run:

```bash
az network route-table update \
  --resource-group "<resource-group>" \
  --name "<route-table-name>" \
  --disable-peering-route All
```

To restore the system-generated peering routes, use `--disable-peering-route None`. Check the effective routes on a network interface in an affected subnet and confirm the UDR sends traffic to the intended next hop.

## Gotchas and limits

The route table only affects subnets associated with it. During preview, the Azure Firewall or NVA next hop must be in the same VNet as the source workload's network interface; a next hop in a peered VNet isn't supported. Azure BareMetal Infrastructure workloads don't use this route suppression.

The preview feature must be registered before you configure the route table. For ARM or Bicep, use route table API version `2025-07-01` or later. Terraform users need the AzAPI provider for this setting; the AzureRM provider doesn't support it yet.

## Quick takeaway

This preview keeps VNet peering intact while giving you control over its automatically added routes. Put the replacement UDRs and supported inspection path in place first, then enable suppression only on the subnets that need it.

## Links

- Official announcement: [Public Preview: Disable VNet peering route](https://azure.microsoft.com/updates?id=576242)
- Learn: [Configure disable peering route propagation](https://learn.microsoft.com/en-us/azure/virtual-network/configure-disable-peering-route-propagation)
- Learn: [Disable peering route propagation overview and limitations](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview#disable-peering-route-propagation-preview)
- Learn: [Set up preview features in an Azure subscription](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/preview-features)
- Learn: [Diagnose a virtual machine routing problem](https://learn.microsoft.com/en-us/azure/virtual-network/diagnose-network-routing-problem)
