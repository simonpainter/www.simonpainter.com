---
title: "Generally Available: NAT64 on StandardV2 NAT Gateway"
authors: simonpainter
tags:
  - ipv6
  - azure
  - networks
date: 2026-08-01
---

IPv6-only workloads have long had a headache: the internet still runs heavily on IPv4, and bridging that gap cleanly hasn't always been easy. Azure's StandardV2 NAT Gateway now supports NAT64 in general availability, giving IPv6 subnets a native way to reach IPv4-only destinations on the public internet without any extra VMs or appliances in the path.

The feature builds on the StandardV2 SKU that brought zone redundancy, higher throughput, and dual-stack support. NAT64 is a natural extension of that work — you already have a high-performance egress point, and now it can translate between IPv6 and IPv4 on your behalf.

This doesn't flip on automatically. You enable it on the NAT Gateway resource and pair it with a DNS64 resolver, then your IPv6 clients can reach IPv4-only sites as if they were dual-stack destinations.

<!-- truncate -->

## What it is

NAT64 is a protocol translation mechanism. Think of it as a live interpreter sitting at the edge of your network. When an IPv6 packet arrives addressed to the well-known prefix `64:ff9b::/96`, the NAT Gateway strips out the embedded IPv4 address from the last 32 bits of that prefix, rewrites the packet headers, and forwards it on to the public IPv4 internet. Responses come back the same way, translated back into IPv6 before they reach the originating client.

The well-known prefix trick is important here. A client can't directly reach an IPv4 address from an IPv6 stack, but if something first synthesises a fake AAAA (IPv6) DNS record that embeds the IPv4 address into that `64:ff9b::/96` range, the client thinks it's talking to an IPv6 destination. NAT Gateway then handles the actual translation. That "something" is DNS64.

NAT64 relies on a third-party DNS64 resolver to do the record synthesis. Azure doesn't bundle one, so you need to set that up separately. Without it, IPv6 clients can't resolve IPv4-only hostnames to the NAT64 prefix, and the feature won't help them.

## Who should care

If you run any Azure workloads on IPv6-only subnets that need outbound internet access to services that haven't gone dual-stack yet, this is the feature you've been waiting for. That includes internal platforms, containerised workloads on AKS, and any greenfield deployments where you've chosen IPv6-first for the subnet design.

It's also relevant if you're planning a migration toward IPv6. You can move workloads to IPv6 subnets incrementally, with NAT64 acting as the safety net for the long tail of IPv4-only destinations you'll still need to reach during the transition.

## How to enable it

Enabling NAT64 is a two-step process: turn it on in the NAT Gateway, then point your subnets at a DNS64 resolver.

**In the Azure portal:** open your StandardV2 NAT Gateway resource, go to **Configuration**, set **NAT64** to **Enabled**, and save. You need at least one StandardV2 IPv4 public IP attached to the gateway for the outbound translation to have an address to use.

**With Azure CLI:**

```bash
az network nat gateway update \
  --resource-group myRG \
  --name myNatGateway \
  --nat64 Enabled
```

**With Bicep:**

```bicep
resource natGateway 'Microsoft.Network/natGateways@2024-05-01' = {
  name: 'myNatGateway'
  location: resourceGroup().location
  sku: {
    name: 'StandardV2'
  }
  properties: {
    nat64: 'Enabled'
    publicIpAddresses: [
      {
        id: publicIp.id
      }
    ]
  }
}
```

**With Terraform:**

```hcl
resource "azurerm_nat_gateway" "example" {
  name                = "my-nat-gateway"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  sku_name            = "StandardV2"
  nat64               = "Enabled"
}
```

Once NAT64 is enabled on the gateway, configure your IPv6 subnet's DNS settings to use a DNS64 resolver. The resolver needs to be reachable from your virtual network — you can run one on a VM, use a third-party service, or deploy an open-source solution like BIND with `dns64` blocks configured.

## Gotchas and limits

**StandardV2 only.** The original Standard NAT Gateway SKU doesn't support NAT64. If you're on the older SKU, you can't enable it there and you can't upgrade in place — you'd need to deploy a new StandardV2 resource.

**DNS64 is your responsibility.** Azure provides the NAT64 translation, not the DNS64 synthesis. If your DNS resolver doesn't synthesise AAAA records for IPv4-only destinations, your IPv6 clients won't know to send traffic via the `64:ff9b::/96` prefix and the translation won't happen. Test your DNS64 resolver before rolling this out to production traffic.

**IPv4 public IP required.** You need at least one StandardV2 public IPv4 address on the NAT Gateway for the translated outbound traffic to use. An IPv6-only public IP on the gateway isn't sufficient.

**Region availability.** StandardV2 NAT Gateway isn't available everywhere yet. Check the [Azure NAT Gateway overview](https://learn.microsoft.com/azure/nat-gateway/nat-overview) for the current region list.

**UDR interaction.** User-defined routes to a virtual appliance or virtual network gateway take precedence over NAT Gateway for outbound internet traffic. If you route `0.0.0.0/0` elsewhere, NAT Gateway won't see the traffic and NAT64 won't apply.

## How NAT64 works (the quick version)

Here's the flow in pseudocode form:

```
# Client sends traffic to an IPv4-only destination (e.g. example.com)
dns_response = dns64_resolver.query("example.com", record_type="AAAA")
# DNS64 sees only an A record exists, so it synthesizes an AAAA record
synthesized_ipv6 = embed_in_prefix(ipv4_address="93.184.216.34", prefix="64:ff9b::/96")
# Returns 64:ff9b::5db8:d822 to the client

# Client sends IPv6 packet to 64:ff9b::5db8:d822
# NAT Gateway recognizes the 64:ff9b::/96 prefix
translated_dest = extract_ipv4_from_prefix(packet.dst)  # returns 93.184.216.34
packet_ipv4 = translate_ipv6_to_ipv4(packet, src=nat_gateway_public_ip, dst=translated_dest)
send_to_internet(packet_ipv4)

# Response arrives as IPv4, NAT Gateway translates back to IPv6 and returns to client
```

## Quick takeaway

NAT64 on StandardV2 NAT Gateway fills a real gap for IPv6-first designs. If your subnets are IPv6-only, you can now reach IPv4-only internet destinations through a clean, managed Azure service rather than running your own translation appliance.

The requirement to manage DNS64 yourself adds some setup work, but once that's in place the gateway handles everything else. If you're building or migrating toward IPv6-first environments on Azure, this is a feature worth enabling sooner rather than later.

For the official announcement, see [Generally Available: NAT64 on StandardV2 NAT Gateway](https://azure.microsoft.com/updates?id=568409). Full technical details are in the [NAT gateway resource documentation](https://learn.microsoft.com/azure/nat-gateway/nat-gateway-resource#nat64) on Microsoft Learn.
