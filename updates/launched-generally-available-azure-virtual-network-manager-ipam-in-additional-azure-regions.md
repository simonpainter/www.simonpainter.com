---
title: "Generally Available: Azure Virtual Network Manager IPAM in additional Azure regions"
authors: simonpainter
tags:
  - azure
  - networks
  - automation
date: 2026-09-06
---

Azure Virtual Network Manager IPAM is now generally available in more regions. The new rollout covers **US Gov Virginia**, **US Gov Texas**, **US Gov Arizona**, **China North 3**, and **China East 3**, which gives teams in those regions the same central IP planning model already available elsewhere.

That matters if you run large landing zones, hybrid networks, or multi-region estates and want to stop handing out CIDRs by spreadsheet. IPAM gives you one place to define pools, track allocations, and let Azure hand out non-overlapping address space when teams build virtual networks.

If you've had to keep sovereign or China region deployments on a different process, this update helps close that gap. It gives you a more consistent way to manage address space across public, government, and China environments.

<!-- truncate -->

## What it is

IP address management, or IPAM, in Azure Virtual Network Manager lets you create address pools and allocate space from them to virtual networks and other supported resources. The main win is that Azure can assign non-overlapping CIDR blocks for you, which cuts down the risk of clashes between regions, subscriptions, and teams.

You can also reserve static CIDRs inside a pool for address space that sits outside the current Azure feature set. Microsoft calls out examples like on-premises ranges, Virtual WAN hubs, and Azure VMware Solution private cloud ranges.

The official announcement is here: [Azure Virtual Network Manager IPAM in additional Azure regions](https://azure.microsoft.com/updates?id=570557).

For the product docs, start with:

- [What is IP address management (IPAM) in Azure Virtual Network Manager?](https://learn.microsoft.com/en-us/azure/virtual-network-manager/concept-ip-address-management)
- [Manage IP addresses with Azure Virtual Network Manager](https://learn.microsoft.com/en-us/azure/virtual-network-manager/how-to-manage-ip-addresses-network-manager)
- [Deploy IPAM pools and static CIDRs with Azure Virtual Network Manager - Bicep](https://learn.microsoft.com/en-us/azure/virtual-network-manager/deploy-ip-address-management-pools-bicep)

## Who should care

This update is most useful for platform and network teams that build the same landing zone pattern in more than one geography. If you operate in Azure Government or Azure China, you can now use the same central IP allocation model there instead of keeping a side process for those regions.

It also helps teams that manage overlapping risk across Azure, on-prem, and other clouds. IP space has a habit of turning into a junk drawer if each project picks its own ranges, and IPAM gives you a labelled set of compartments instead.

## How to use it

The basic flow is simple. Create a Network Manager instance, create an IPAM pool, then either associate an existing virtual network with that pool or let Azure allocate address space from the pool when you create a new VNet.

In the portal, go to **Network managers** > your instance > **IP address pools**. Create a root or child pool, set the address range, then use **Allocations** to associate resources or reserve static CIDRs.

If you want to create a new VNet from a pool with infrastructure as code, Microsoft's Bicep example looks like this:

```bicep
@description('Name of new virtual network')
param newVnetName string = 'vnet-learn-prod-001'

@description('Location for virtual network')
param locationName string = resourceGroup().location

@description('Resource ID of an existing IPAM pool')
param existingIpamPoolId string = '/subscriptions/<subscriptionId>/resourceGroups/<resourceGroup>/providers/Microsoft.Network/networkManagers/<networkManagerName>/ipamPools/<ipamPoolName>'

@description('Number of IP addresses for virtual network')
param vnetNumberOfIpAddresses string = '256'

resource newVnet 'Microsoft.Network/virtualNetworks@2024-05-01' = {
  name: newVnetName
  location: locationName
  properties: {
    addressSpace: {
      ipamPoolPrefixAllocations: [
        {
          numberOfIpAddresses: vnetNumberOfIpAddresses
          pool: {
            id: existingIpamPoolId
          }
        }
      ]
    }
  }
}
```

That pattern is handy because it turns address assignment into part of the deployment, rather than a manual step that someone has to remember before they hit create.

## Gotchas and limits

The docs still call out a few boundaries. IPAM is generally available in all regions where Azure Virtual Network Manager is available, **except** Chile Central, Jio India West, Malaysia West, Qatar Central, South Africa West, and West India.

There are also a couple of practical limits to keep in mind. A single virtual network can associate with at most one IPv4 pool and one IPv6 pool, and you need the **Network Contributor** role on the Network Manager to create and manage pools.

If you delegate pool use to someone else, the **IPAM Pool User** role covers allocation, but they might also need **Network Manager Read** so the pools and virtual networks are visible to them. That's one of those small RBAC edges that can waste time if you don't know it's there.

## Quick takeaway

This is a useful expansion rather than a brand new feature. If your Azure Government or Azure China deployments were missing central IP allocation, Azure Virtual Network Manager IPAM now gives you a cleaner and more consistent way to manage address space there too.
