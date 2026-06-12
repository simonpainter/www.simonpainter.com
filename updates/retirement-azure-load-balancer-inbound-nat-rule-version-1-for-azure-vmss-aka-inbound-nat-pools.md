---
title: "Retirement: Azure Load Balancer Inbound NAT rule V1 for Azure VMSS"
authors: simonpainter
tags:
  - azure
  - networks
  - load-balancing
date: 2026-06-12
---

Microsoft is retiring **Inbound NAT Pools** for **Azure Virtual Machine Scale Sets** on **30 September 2027**. This is the VMSS-specific part of **Inbound NAT rule V1** on Azure Load Balancer.

That sounds narrow, but it matters if you still use load balancer frontend port ranges to reach scale set instances for SSH, RDP, or similar admin access. Microsoft also says you won't be able to create new Inbound NAT Pools from **15 November 2026**.

The key point is simple: **single VM Inbound NAT rule V1 isn't being retired**. This change is only for the old VMSS pattern, and the replacement is **Inbound NAT rule V2** that targets a backend pool instead.
<!-- truncate -->

## What it is

Inbound NAT Pools are the older way to map a load balancer frontend port range to instances inside a virtual machine scale set. Azure creates and removes per-instance mappings as the scale set grows or shrinks.

Microsoft now wants VMSS deployments to use **Inbound NAT rule V2** instead. With V2, the rule targets the backend pool on the load balancer, which makes the configuration cleaner and makes port mapping easier to inspect.

If you've ever had NAT config feel like a box of cables behind a TV stand, this is Microsoft asking us to tidy that up before the old lead gets binned.

## Who should care

You should care if you run **Standard Load Balancer** in front of a VM scale set and use inbound port mappings for management access or app traffic to individual instances.

This is most relevant for teams that still depend on:

- SSH to Linux VMSS instances through load balancer ports
- RDP to Windows VMSS instances through load balancer ports
- Per-instance admin access patterns baked into older ARM templates or Terraform code

If you only use **single VM NAT rules** on standalone virtual machines, you're not in scope for this retirement.

## How to use it

I would start by checking whether your load balancer still has any Inbound NAT Pools configured:

```bash
az network lb inbound-nat-pool list \
  --resource-group MyResourceGroup \
  --lb-name MyLoadBalancer
```

If that command returns results, you're using the retiring feature and should plan a move to NAT rule V2.

At a high level, the migration path looks like this:

1. Remove the old inbound NAT pool from the load balancer.
2. Remove the `loadBalancerInboundNatPools` reference from the VMSS network profile.
3. Update the VMSS instances.
4. Create a new Inbound NAT rule V2 that targets the backend pool.

Here's a concrete Azure CLI example based on Microsoft's migration guidance:

```bash
az network lb inbound-nat-pool delete \
  --resource-group MyResourceGroup \
  --lb-name MyLoadBalancer \
  --name MyNatPool

az vmss update \
  --resource-group MyResourceGroup \
  --name MyVmScaleSet \
  --remove virtualMachineProfile.networkProfile.networkInterfaceConfigurations[0].ipConfigurations[0].loadBalancerInboundNatPools

az vmss update-instances \
  --resource-group MyResourceGroup \
  --name MyVmScaleSet \
  --instance-ids '*'

az network lb inbound-nat-rule create \
  --resource-group MyResourceGroup \
  --lb-name MyLoadBalancer \
  --name MyNatRuleV2 \
  --protocol Tcp \
  --frontend-ip-name MyFrontendIp \
  --frontend-port-range-start 5000 \
  --frontend-port-range-end 5099 \
  --backend-port 22 \
  --backend-pool-name MyBackendPool
```

That example creates a V2 rule for SSH on port 22. The frontend range gives you up to 100 instance mappings, one port per backend instance.

## Gotchas and limits

The biggest gotcha is **downtime**. Microsoft says active traffic flowing through the NAT rules is interrupted during migration, so don't treat this as a live lunchtime tweak.

You also need to plan the frontend port range properly. If the range is too small for the backend pool, VMSS scale-out can get blocked because Azure runs out of ports to assign.

There are a few other limits worth keeping in mind:

- NAT rules can't overlap on frontend port range
- Multiple NAT rules can't use the same backend port
- NAT rules and load-balancing rules can't share the same backend port

One more detail matters here. The retirement is about **Inbound NAT Pools on VMSS**, not every V1 NAT rule in Azure. If your setup only uses single VM rules, you don't need to rebuild it just because the version number looks old.

## Quick takeaway

This retirement isn't a panic event, but it does need a proper plan. If your VM scale sets still use Inbound NAT Pools, you've got time to move, but the clock is now visible.

I'd treat this as a good excuse to audit older load balancer patterns, check how instance access works today, and move to NAT rule V2 before November closes the door on new pool creation.

## Links

- Official announcement: [Retirement: Azure Load Balancer Inbound NAT rule version 1 for Azure VMSS (aka Inbound NAT Pools)](https://azure.microsoft.com/updates?id=565482)
- Learn: [Migrate from Inbound NAT rules version 1 to version 2](https://learn.microsoft.com/azure/load-balancer/load-balancer-nat-pool-migration)
- Learn: [Inbound NAT rules](https://learn.microsoft.com/azure/load-balancer/inbound-nat-rules)
- Learn: [Manage inbound NAT rules for Azure Load Balancer](https://learn.microsoft.com/azure/load-balancer/manage-inbound-nat-rules)
