---
title: "Generally Available: Managed StandardV2 NAT Gateway for AKS"
authors: simonpainter
tags:
  - azure
  - networks
  - high-availability
date: 2026-10-10
---

AKS can now provision and manage a StandardV2 NAT Gateway for clusters using an AKS-managed virtual network. For new clusters in supported regions, StandardV2 is the default when you choose the `managedNATGateway` outbound type.

That gives cluster egress zone redundancy by default, with higher bandwidth and IPv6 support than the older Standard SKU. Existing Standard clusters aren't switched over automatically, so you can plan the change around your own needs.
<!-- truncate -->

## What it is

Managed NAT Gateway is AKS's managed option for outbound traffic from cluster nodes. You choose `managedNATGateway` as the outbound type, and AKS creates and looks after the gateway rather than requiring you to manage a NAT Gateway resource yourself.

StandardV2 is now generally available for this setup. Where the SKU is supported, new clusters use it by default; in regions where it isn't available, AKS uses Standard. StandardV2 is zone-redundant by default, supports IPv4 and IPv6 egress, and offers up to 100 Gbps of bandwidth per gateway.

The official announcement is [Managed StandardV2 NAT Gateway for AKS](https://azure.microsoft.com/updates?id=574430). Microsoft has also updated its [AKS managed NAT Gateway guide](https://learn.microsoft.com/azure/aks/nat-gateway) with setup steps and SKU behaviour.

## Who should care

This is useful if you run AKS Standard with an AKS-managed virtual network and want AKS to manage cluster egress. It gives new clusters a more resilient default, without adding a separate NAT Gateway resource to your deployment.

If you use AKS Automatic, a managed NAT Gateway is already part of its preconfigured setup. If you bring your own virtual network, use the user-assigned NAT Gateway option instead; AKS-managed NAT Gateway isn't compatible with custom virtual networks.

## How to use it

For a new cluster, choose the managed NAT Gateway outbound type. In a region that supports StandardV2, AKS selects that SKU by default:

```azurecli
az aks create \
  --resource-group myResourceGroup \
  --name myAksCluster \
  --location eastus2 \
  --outbound-type managedNATGateway \
  --nat-gateway-managed-outbound-ip-count 1 \
  --generate-ssh-keys
```

The managed outbound IP count controls how many IPv4 public IPs AKS assigns to the gateway. StandardV2 also supports managed IPv6 outbound IPs and customer-defined StandardV2 public IPs or prefixes; see the [AKS configuration guide](https://learn.microsoft.com/azure/aks/nat-gateway#configure-outbound-ips-for-a-managed-standardv2-nat-gateway) for those options.

## Gotchas and limits

StandardV2 isn't available in every Azure region. AKS falls back to Standard for new clusters where StandardV2 isn't supported, so check the [StandardV2 limitations and region list](https://learn.microsoft.com/azure/nat-gateway/nat-overview#key-limitations-of-standardv2) if you need a specific SKU.

The StandardV2 default applies to AKS API version `2026-06-01` and later. Older API versions keep the existing Standard behaviour. Existing Standard managed gateways also stay Standard unless you choose to upgrade them; you can upgrade to StandardV2, but can't downgrade afterwards.

StandardV2 also requires StandardV2 public IPs and prefixes - existing Standard SKU public IP resources won't work with it.

## Quick takeaway

If you're creating an AKS cluster with a managed virtual network, you can now use the generally available StandardV2 managed NAT Gateway for zone-redundant egress. Check regional support and outbound IP requirements before deployment, especially if you need stable egress addresses.
