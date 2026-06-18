---
title: "Generally Available: ICMP support for Azure StandardV2 NAT Gateway"
authors: simonpainter
tags:
  - azure
  - networks
  - troubleshooting
date: 2026-06-18
---

Azure StandardV2 NAT Gateway now supports outbound ICMP Echo Request and Echo Reply traffic. In plain English, that means `ping` now works for workloads that leave the internet through a StandardV2 NAT Gateway.

I like this update because it fixes a small but real gap in day-to-day troubleshooting. Before this, NAT Gateway handled TCP and UDP well, but basic reachability tests with `ping` were off the table.

The feature is live by default. If your subnet already uses a StandardV2 NAT Gateway, you don't need to switch on a setting or add a rule to start using it.
<!-- truncate -->

## What it is

This update adds outbound ICMP support to Azure StandardV2 NAT Gateway for both IPv4 and IPv6. Microsoft says the supported message types are ICMP Echo Request and Echo Reply, so this is support for `ping`, not every ICMP message under the sun.

That matters because NAT Gateway is the clean way to give private Azure workloads outbound internet access without handing every VM its own public IP. Now the common "can I reach it at all?" test works through that same shared egress path.

For the announcement, see the official Azure update: [Generally Available: ICMP Support for Azure Standard V2 NAT Gateway](https://azure.microsoft.com/updates?id=565487). Microsoft also published a deeper write-up on the Azure Networking Blog: [ICMP Support for Azure StandardV2 NAT Gateway](https://techcommunity.microsoft.com/blog/azurenetworkingblog/icmp-support-for-azure-standardv2-nat-gateway/4528374).

## Who should care

This is for anyone who runs private workloads behind Azure NAT Gateway and has ever had to prove whether the problem is routing, DNS, a firewall, or the remote endpoint. That includes VM estates, scale sets, AKS nodes, and shared outbound designs in hub-and-spoke networks.

I think platform teams will feel this most. When you centralise outbound access, troubleshooting can feel like trying to listen to one voice in a busy café. A simple `ping` gives you a fast first check before you dig into packet captures or app logs.

## How to use it

If your subnet already has a **StandardV2** NAT Gateway attached, you can test from a workload straight away. There's no ICMP toggle in the portal and no separate policy to enable on the NAT Gateway itself.

If you need to build a new StandardV2 NAT Gateway first, the Azure CLI flow is straightforward:

```azurecli
az network public-ip create \
    --resource-group test-rg \
    --name public-ip-nat \
    --location eastus \
    --sku StandardV2 \
    --allocation-method Static \
    --version IPv4 \
    --zone 1 2 3

az network nat gateway create \
    --resource-group test-rg \
    --name nat-gateway \
    --location eastus \
    --public-ip-addresses public-ip-nat \
    --idle-timeout 4 \
    --sku StandardV2 \
    --zone 1 2 3

az network vnet subnet update \
    --resource-group test-rg \
    --vnet-name vnet-1 \
    --name subnet-1 \
    --nat-gateway nat-gateway
```

Then sign in to a VM or other workload in that subnet and run a basic test:

```bash
ping 8.8.8.8
ping bing.com
```

If you get echo replies back, the outbound path through the NAT Gateway is working. Microsoft covers the deployment steps in [Manage a StandardV2 NAT gateway](https://learn.microsoft.com/azure/nat-gateway/manage-nat-gateway-v2) and the service behaviour in [What is Azure NAT Gateway?](https://learn.microsoft.com/azure/nat-gateway/nat-overview).

## Gotchas and limits

There are a few edges to keep in mind. This is **StandardV2** only, so don't expect the older Standard NAT Gateway SKU to gain the same behaviour.

It is also outbound only. NAT Gateway still doesn't allow unsolicited inbound traffic, and Microsoft only documents Echo Request and Echo Reply support rather than all ICMP message types.

Routing still matters as well. If you push `0.0.0.0/0` traffic to a virtual appliance or virtual network gateway with a user-defined route, that path takes priority and can bypass direct internet egress through the NAT Gateway.

Finally, StandardV2 has its own platform limits. It needs StandardV2 public IP resources, you can't upgrade an older Standard NAT Gateway in place, and some Azure regions still don't support the V2 SKU. Check the current list in the [Azure NAT Gateway overview](https://learn.microsoft.com/azure/nat-gateway/nat-overview).

## Quick takeaway

This is a tidy but useful Azure networking improvement. StandardV2 NAT Gateway now lets private workloads use `ping` for outbound reachability checks, which makes first-line troubleshooting much easier.

If you already use StandardV2 for shared egress, you can start using this today with no extra config. That's the sort of quiet platform change I tend to like most.
