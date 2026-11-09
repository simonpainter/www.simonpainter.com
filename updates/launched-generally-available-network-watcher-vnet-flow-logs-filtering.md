---
title: "Generally Available: Network Watcher VNet flow logs filtering"
authors: simonpainter
tags:
  - azure
  - networks
  - monitoring
  - troubleshooting
  - educational
date: 2026-11-09
---

Azure Network Watcher can now filter virtual network flow logs before it writes them to storage. The filtering capability is generally available, so you can focus logs on the traffic you need to monitor.

Choose criteria such as source or destination IP, direction, protocol, and port. That can make investigations more focused and keep unrelated flow records out of your analysis.
<!-- truncate -->

## What it is

Virtual network (VNet) flow logs record IP traffic that passes through a virtual network. Filtering lets you choose which traffic to record, using fields such as source and destination IP addresses or CIDR ranges, direction, ports, protocol, and encryption status.

Unlike filtering after export, this applies to the flow log itself. You can also select flow record types - for example, to record denied traffic without recording the full lifecycle of every connection.

## Who should care

This is useful for network and security teams that need to investigate a particular service, subnet, or traffic pattern without starting with every flow in a large VNet. It can also help platform teams reduce the volume of records they need to store and analyse.

If you're troubleshooting a connection, filtering on its source or destination range, port, and direction can narrow the evidence to the path you're checking.

## How to use it

Set filtering criteria when you create a flow log with Azure PowerShell. This example records outbound TCP traffic to port 443; replace the sample resource names with your own:

```powershell
$vnet = Get-AzVirtualNetwork -Name 'myVNet' -ResourceGroupName 'myResourceGroup'
$storageAccount = Get-AzStorageAccount -Name 'myStorageAccount' -ResourceGroupName 'myResourceGroup'

New-AzNetworkWatcherFlowLog `
    -Enabled $true `
    -Name 'myVNetFlowLog' `
    -NetworkWatcherName 'NetworkWatcher_eastus' `
    -ResourceGroupName 'NetworkWatcherRG' `
    -StorageId $storageAccount.Id `
    -TargetResourceId $vnet.Id `
    -FormatVersion 2 `
    -EnabledFilteringCriteria 'Direction=Outbound && Protocol=TCP && DstPort=443'
```

For an existing flow log, update the criteria with `Set-AzNetworkWatcherFlowLog`; you don't need to recreate the log. The [filtering guide](https://learn.microsoft.com/en-us/azure/network-watcher/vnet-flow-logs-filtering) covers the supported fields and syntax.

## Gotchas and limits

Filtering expressions support `=` and `!=`, joined with `&&` and `||`. Field names and values are case-insensitive, and the expression can be up to 1,000 characters. Parentheses aren't supported, and `&&` takes precedence over `||`, so split complex logic into separate expressions where needed.

The Azure announcement marks filtering as generally available, but the linked Learn filtering guide still labels the feature as preview. Check the current portal and documentation for availability in your subscription as Microsoft's guidance catches up with the launch.

## Quick takeaway

VNet flow log filtering lets you choose relevant traffic at the point of logging rather than sorting through every record later. Start with a narrow, readable expression, and check its matching behaviour before relying on it for monitoring or investigations.

## Links

- Official announcement: [Network Watcher VNet flow logs filtering](https://azure.microsoft.com/updates?id=577782)
- Learn: [Filter virtual network flow logs](https://learn.microsoft.com/en-us/azure/network-watcher/vnet-flow-logs-filtering)
- Learn: [Virtual network flow logs overview](https://learn.microsoft.com/en-us/azure/network-watcher/vnet-flow-logs-overview)
- PowerShell: [New-AzNetworkWatcherFlowLog](https://learn.microsoft.com/en-us/powershell/module/az.network/new-aznetworkwatcherflowlog)
