---
title: "Generally Available: Private endpoint support for Azure HorizonDB clusters"
authors: simonpainter
tags:
  - azure
  - networks
  - private-link
date: 2026-11-17
---

Azure HorizonDB clusters can now be reached through Azure Private Link. Clients connect to a private IP address in a virtual network, and their traffic stays on Microsoft's network rather than crossing the public internet.

That gives teams a private path from Azure virtual networks, peered networks, and on-premises environments connected by VPN or ExpressRoute. The Azure update is marked **In preview**, despite “Generally Available” in its title, so check its current status before using it in production.
<!-- truncate -->

## What it is

A private endpoint is a network interface in your virtual network with a private IP address. For HorizonDB, each endpoint connects to one cluster endpoint: read-write or read-only. Private DNS can map the existing HorizonDB name to that private IP, so applications can keep using the cluster's fully qualified domain name.

## Who should care

This is useful if applications need private connectivity to HorizonDB without relying on its public endpoint. It also gives network teams a way to connect clients in peered virtual networks or on-premises networks over VPN or ExpressRoute private peering.

## How to use it

In the Azure portal, open the cluster's **Networking** settings, select **Private endpoints**, then choose **Create private endpoint**. Select the cluster and the target sub-resource: the cluster name for read-write access, or a pool name such as `defaultpool` for read-only access. You can also configure integration with the `privatelink.horizondb.azure.com` private DNS zone.

With Azure CLI, first find the group ID for the endpoint you want:

```azurecli
az horizondb private-link-resource list \
  --resource-group <resource-group> \
  --cluster-name <cluster-name>
```

Then create a private endpoint. This example connects to the cluster's read-write endpoint; use the pool name as `--group-id` to connect to its read-only endpoint.

```azurecli
az network private-endpoint create \
  --name <private-endpoint-name> \
  --resource-group <resource-group> \
  --vnet-name <virtual-network> \
  --subnet <subnet> \
  --private-connection-resource-id <cluster-resource-id> \
  --connection-name <connection-name> \
  --group-id <cluster-name> \
  --location <virtual-network-region>
```

Make sure DNS resolves the cluster's FQDN to the private endpoint's IP address from every client network. If you create the endpoint with CLI or an ARM template, configure the private DNS zone and link it to those virtual networks; the [Microsoft Learn guide](https://learn.microsoft.com/en-us/azure/horizondb/network/concepts-network-private-link) has the required commands.

## Gotchas and limits

Creating a private endpoint doesn't turn off public access. If clients should connect only through private endpoints, disable public access on the cluster separately and review its firewall rules.

One private endpoint reaches only one endpoint. Create another for read-only access if you also need the pool endpoint. The cluster needs an active pool for automatic approval, and connections can remain pending until someone with permission approves them.

The private endpoint must be in the same region and subscription as its virtual network. The HorizonDB cluster itself can be in a different region, subscription, or Microsoft Entra tenant. If you use separate, non-routable virtual networks, don't link their endpoints for the same cluster endpoint to the same private DNS zone: the later endpoint can replace the earlier A record.

## Quick takeaway

Private Link gives HorizonDB a private network path, but it doesn't configure all the pieces for you. Set up DNS, check approval, and decide separately whether to disable public access. Microsoft's update is [here](https://azure.microsoft.com/updates?id=574153), with details in the [HorizonDB private endpoint guide](https://learn.microsoft.com/en-us/azure/horizondb/network/concepts-network-private-link).
