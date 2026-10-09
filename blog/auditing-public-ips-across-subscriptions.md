---
title: "Auditing Azure Public IP resources across all your subscriptions"
authors: simonpainter
tags:
  - azure
  - scripting
date: 2026-10-08
---

Public IP Address resources are a good starting point when you want to see what's reachable from the internet, not whatever's in the architecture diagram. If you've got more than a couple of subscriptions, nobody has that list in their head, and "nobody" includes you.
<!-- truncate -->

This loops every subscription you have access to, switches context into each one, and pulls each Public IP Address resource along with the resource group and SKU:

```powershell
$subscriptions = Get-AzSubscription

$results = foreach ($sub in $subscriptions) {
    Set-AzContext -SubscriptionId $sub.Id | Out-Null
    $publicIps = Get-AzPublicIpAddress
    foreach ($ip in $publicIps) {
        [PSCustomObject]@{
            SubscriptionName = $sub.Name
            SubscriptionId   = $sub.Id
            ResourceGroup    = $ip.ResourceGroupName
            Name             = $ip.Name
            IpAddress        = $ip.IpAddress
            Sku              = $ip.Sku.Name
        }
    }
}

$results
```

[`Get-AzSubscription`](https://learn.microsoft.com/en-us/powershell/module/az.accounts/get-azsubscription) gives you every subscription the signed-in account can see, [`Set-AzContext`](https://learn.microsoft.com/en-us/powershell/module/az.accounts/set-azcontext) switches the active one, and [`Get-AzPublicIpAddress`](https://learn.microsoft.com/en-us/powershell/module/az.network/get-azpublicipaddress) does the actual listing within that subscription's scope. That's a useful inventory of standalone Public IP Address resources, but not per-instance public IPs on VM scale sets.

Pipe `$results` into `Export-Csv` and you've got a flat inventory of Public IP Address resources you can hand to a pen tester, check against Shodan, or just stare at uncomfortably. Run it on a schedule and you'll also catch the IP someone allocated for a quick test eighteen months ago and forgot about.
