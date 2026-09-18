---
title: "Generally Available: High-scale mesh in Azure Virtual Network Manager"
authors: simonpainter
tags:
  - azure
  - networks
  - performance
date: 2026-09-18
---

High-scale mesh in Azure Virtual Network Manager is now generally available. The big change is scale: you can build a single mesh connectivity configuration that links up to **3,000 virtual networks** through connected groups, instead of stitching together a mass of individual peerings.

That matters if your Azure estate has grown past the point where manual peering feels like wiring a whole office with patch leads. You still get direct VNet-to-VNet connectivity, but Azure Virtual Network Manager handles it as a managed topology rather than a long list of one-off links.

For platform and network teams, this is the sort of update that can simplify large landing zones, shared services estates, and multi-team environments where lots of VNets need to talk without always hairpinning through a hub.

<!-- truncate -->

## What it is

Azure Virtual Network Manager lets you define connectivity with a central policy model. For mesh topologies, it uses a construct called a **connected group** rather than traditional VNet peering entries on every virtual network.

That's the bit that unlocks the higher scale. In a mesh, member virtual networks can talk to each other directly, and Azure shows the next hop as `ConnectedGroup` in effective routes. You can also turn on **global mesh** if you need the same group to span regions.

The official announcement is here: [Generally Available: High-scale mesh in Azure Virtual Network Manager](https://azure.microsoft.com/updates?id=571572).

Useful Microsoft Learn references:

- [Connectivity configurations in Azure Virtual Network Manager](https://learn.microsoft.com/azure/virtual-network-manager/concept-connectivity-configuration)
- [Create network topologies with Azure Virtual Network Manager](https://learn.microsoft.com/azure/virtual-network-manager/how-to-create-network-manager-topologies)
- [Quickstart: Create a mesh network topology with Azure Virtual Network Manager using Terraform](https://learn.microsoft.com/azure/virtual-network-manager/create-virtual-network-manager-terraform)

## Who should care

This is aimed at teams that manage a lot of virtual networks and don't want peering sprawl to become part of daily life. If you run large landing zones, shared platform environments, or separate application VNets for different teams, the jump to 3,000 VNets in one mesh is a real operational gain.

It's also useful if you want spoke networks to talk directly without always crossing a hub firewall or router first. That can reduce latency and remove pressure from central transit components, while still letting you apply security admin rules and NSGs around the edges.

## How to use it

The basic flow stays the same. Create or use an Azure Virtual Network Manager instance, place the target VNets into a network group, create a **connectivity configuration** with the **Mesh** topology, and then deploy that configuration to the target regions.

In the portal, that looks like **Network managers** > your manager > **Configurations** > **Create** > **Connectivity configuration**. Choose **Mesh**, add the network group that contains your VNets, decide whether you also want **Enable mesh connectivity across regions**, and then deploy the configuration.

If you want a quick check that the configuration has landed on a VNet, Microsoft shows this Azure CLI command in the Terraform quickstart:

```azurecli
az network manager list-effective-connectivity-config \
  --resource-group rg-platform-network \
  --vnet-name spoke-app-01
```

That's a handy way to confirm what Azure has actually applied, especially when you're testing at scale and want to spot configuration drift before it turns into a bigger problem.

## Gotchas and limits

A few limits still matter. A virtual network can be part of **up to two connected groups**, so you still need to think about how you slice environments rather than throwing every VNet into one giant bucket.

Address overlap also needs care. Azure Virtual Network Manager can allow overlapping address spaces in a mesh, but traffic to overlapping subnets is dropped because routing becomes nondeterministic. If you want to avoid that trap, use the `ConnectedGroupAddressOverlap` setting to disallow overlaps.

If you also plan to use **high-scale private endpoints** inside the mesh, there are extra steps. Each virtual network needs the right private endpoint network policy setting, and Microsoft says enabling or disabling that feature causes a one-time connection reset, so plan that work for a maintenance window.

## Quick takeaway

This GA release makes Azure Virtual Network Manager mesh far more practical for very large Azure estates. If peering count, central hub bottlenecks, or operational overhead have been slowing you down, high-scale mesh is worth a proper look.
