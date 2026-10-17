---
title: "Generally Available: Standard service endpoint"
authors: simonpainter
tags:
  - private-link
  - azure
  - networks
  - security
date: 2026-10-15
---

Azure standard service endpoint is now generally available. It lets teams use one public IP address as a network identifier across many subnets, reducing the access-rule sprawl that comes with basic service endpoints.

Traffic still travels over the Azure backbone to the service, while Network Security Perimeter controls which network identifiers can reach supported PaaS resources. The feature is paid, so check the pricing before rolling it out.

<!-- truncate -->

## What it is

A standard service endpoint is a scalable way to connect workloads in Azure virtual networks to supported platform services. You assign a static Standard public IP address as a *network identifier*, then associate it with service endpoints on your subnets. The IP identifies traffic from those subnets; it isn't used to route the traffic.

Add the PaaS resources to a [Network Security Perimeter](https://learn.microsoft.com/en-us/azure/private-link/network-security-perimeter-concepts) and allow the identifier with an inbound access rule. One identifier can represent multiple subnets and virtual networks, which means fewer service-side rules to maintain.

## Who should care

This is useful for teams with many VNets or subnets that use service endpoints to reach Azure Storage, Azure Key Vault, Azure SQL Database, or Azure Cosmos DB. It replaces separate subnet entries with a shared network identifier and centralises access control through a perimeter.

If you need a private IP on the service, on-premises connectivity, or data exfiltration protection, use Private Link private endpoints instead. Standard service endpoints don't provide those capabilities.

## How to use it

In the Azure portal, create a static Standard public IP in the same region as the virtual network and use it as the network identifier. Add the relevant service endpoint to each subnet, associate the identifier, then place the target PaaS resource in a Network Security Perimeter and add an inbound rule for the identifier's IP.

For example, to let two application subnets reach the same storage account, attach the same identifier to both subnets' `Microsoft.Storage` service endpoints. In the perimeter, allow that identifier once rather than adding both subnet address ranges. Microsoft's guides cover configuration in the [Azure portal](https://learn.microsoft.com/en-us/azure/private-link/configure-service-endpoint-standard-portal) and with the [Azure CLI](https://learn.microsoft.com/en-us/azure/private-link/configure-service-endpoint-standard-cli).

## Gotchas and limits

All service endpoints on a subnet must use the same network identifier. You can share an identifier across subscriptions in the same tenant and region, but not across tenants or regions.

The feature supports four services: Storage, Key Vault, SQL Database, and Cosmos DB. It is generally available in Azure public cloud, US Sec, and US Nat; some national clouds aren't enabled for GA. Standard service endpoint is billed at a fixed rate per virtual network per hour. Check the [Azure Private Link pricing page](https://azure.microsoft.com/pricing/details/private-link/) for current rates.

## Quick takeaway

Standard service endpoints are now production-ready for reducing ACL overhead when Azure workloads access those four PaaS services. They keep the service endpoint traffic model, not the private connectivity of Private Link, and they add a per-VNet charge.

For the launch details, see Microsoft's [Generally Available: Standard service endpoint announcement](https://azure.microsoft.com/updates?id=571025). The [standard service endpoint overview](https://learn.microsoft.com/en-us/azure/private-link/service-endpoint-standard-overview) has the full feature and availability details.
