---

title: The prefix limit in Azure Route Server and how it's counted
authors: spainter
tags:
  - azure
  - networks
  - labs

---
## Counting prefixes the same way my wife counts my mistakes

Anyone who has accidentally advertised too many prefixes and watched their ISP BGP peerings collapse (I'm looking at you, BT) knows that prefix limits are a common safeguard in networking. While exploring [anycast](../Anycast/anycast-route-server.md) configurations in Azure, I carefully noted the official Route Server prefix limit of 1,000 routes. However, I recently discovered something far more interesting in the fine print about [how Azure actually calculates this limit](https://learn.microsoft.com/en-us/azure/route-server/route-server-faq#how-is-the-1000-route-limit-calculated-on-a-bgp-peering-session-between-an-nva-and-azure-route-server).
<!-- truncate -->
The documentation states:

> Currently, Route Server can accept a maximum of 1000 routes from a single BGP peer. When processing BGP route updates, this limit is calculated as the number of current routes learnt from a BGP peer plus the number of routes coming in the BGP route update. For example, if an NVA initially advertises 501 routes to Route Server and later re-advertises these 501 routes in a BGP route update, the route server calculates this as 1002 routes and tear down the BGP session.

This behavior was surprising enough that I had to verify it in the lab.

## Testing the Limit

I set up a simple test environment: a single VNet with a default subnet and a RouteServerSubnet containing the Route Server. In the default subnet, I deployed an Ubuntu VM running [BIRD](https://bird.network.cz) with this basic configuration:

```bash
router id 10.0.0.4

protocol bgp {
  description "BIRD PEER 1";
  local as 65501;
  neighbor 10.0.2.4 as 65515;
  multihop;
  graceful restart;
  import all;
  export all;
}

protocol bgp {
  description "BIRD PEER 2";
  local as 65501;
  neighbor 10.0.2.5 as 65515;
  multihop;
  graceful restart;
  import all;
  export all;
}
```

To test the limit, I needed to generate a bunch of /32 routes. While I should probably have written a script, Excel's concatenate function was right there, tempting me with its simplicity. This gave me 500 routes that looked like:

```bash
protocol static static_bgp {
route   192.168.0.1:255.255.255.255     via     10.0.0.8;
route   192.168.0.2:255.255.255.255     via     10.0.0.8;
...
route   192.168.1.249:255.255.255.255     via     10.0.0.8;
route   192.168.1.250:255.255.255.255     via     10.0.0.8;
}
```

I verified the routes were accepted using Azure CLI:

```bash
az network routeserver peering list-learned-routes \
    --routeserver Route_Server \
    --resource-group Route_Injection_Test \
    --name bird_peering
```

## The Interesting Part

Here's where it gets interesting. With 500 routes, I could update them all simultaneously without issues. At 501 routes, everything still worked fine on initial advertisement. However, when I tried to update all 501 routes at once (by changing the next-hop IP), the BGP peering immediately collapsed:

```bash
bird> show protocols 
name     proto    table    state  since       info
kernel1  Kernel   master   up     13:59:59    
device1  Device   master   up     13:59:59    
bgp1     BGP      master   start  15:04:18    Active        Received: Maximum number of prefixes reached
bgp2     BGP      master   start  15:04:18    Active        Received: Maximum number of prefixes reached
static_bgp Static   master   up     13:59:59    
```

## The Real-World Impact

While this behavior is technically documented, it's buried in the FAQ and could catch many people off guard. For most situations, these updates would likely coincide with a reconvergence event that's already causing disruption. However, the closer you get to the 1,000-prefix limit, the fewer route updates it takes to trigger a complete peering reset.

This could be particularly problematic in SD-WAN deployments. Imagine having 1,000 prefixes from various sites – a single site's route update could temporarily disconnect all sites from Azure.

The option still exists to scale out to multiple NVAs because the prefix limit is per peer and not per route server; the documentation is a bit vague but I have tested this to confirm. The maximum number of peers (the number of NVAs) for a single route server is 8, so realistically you can work with 4000 prefixes per route server.

## The Takeaway

For my deployments where reliability is crucial, I'm setting a hard limit at 500 prefixes. Sometimes, the safest path isn't pushing the documented limits to their maximum, but understanding the nuances and building in a comfortable buffer.
