---

title: A thousand prefixes seems fundamentally dishonest.

---
## Counting prefixes the same way my wife counts my mistakes

If you're using Route Server in Azure then you will have read that the prefix limit is 1000. Prefix limits are pretty common as anyone who has every advertised more than they should and seen their BGP peerings torn down by their ISP will know - I am looking at _you_ BT. While looking at [anycast in Azure](../Anycast/anycast-route-server.md) I was diligent about checking the prefix limit of how many routes you can advertise into Azure and the official documented limit is 1000. More recently though I found this discrete little nugget on the [RouteServer prefix limit and how it's calculated](https://learn.microsoft.com/en-us/azure/route-server/route-server-faq#how-is-the-1000-route-limit-calculated-on-a-bgp-peering-session-between-an-nva-and-azure-route-server).

>Currently, Route Server can accept a maximum of 1000 routes from a single BGP peer. When processing BGP route updates,
>this limit is calculated as the number of current routes learnt from a BGP peer plus the number of routes coming in the
>BGP route update. For example, if an NVA initially advertises 501 routes to Route Server and later re-advertises these
>501 routes in a BGP route update, the route server calculates this as 1002 routes and tear down the BGP session.

I had to run to the lab to confirm that behaviour - a single vnet with a default subnet and a RouteServerSubnet with the RouteServer in it. I put an Ubuntu VM into the default subnet, installed [BIRD](https://bird.network.cz) and set up a boilerplate pair of peerings.

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

The test involved creating a load of /32 routes. I would love to say I wrote some quick script to generate the config but excel and concatenate() were just sat there eyeing me up from the corner. 

```bash
protocol static static_bgp {
route   192.168.0.1:255.255.255.255     via     10.0.0.8;
route   192.168.0.2:255.255.255.255     via     10.0.0.8;
...
route   192.168.1.249:255.255.255.255     via     10.0.0.8;
route   192.168.1.250:255.255.255.255     via     10.0.0.8;
}
```

This gave me my 500 prefixes which I confirmed in the Azure CLI and via a pretty metrics graph.

```bash
az network routeserver peering list-learned-routes 
    --routeserver Route_Server 
    --resource-group Route_Injection_Test 
    --name bird_peering
```

I tested updating the 500 prefixes by doing a find and replace in the config and then using the bird CLI to refresh the config. Everything nice and stable. 

```bash
bird> configure
Reading configuration from /etc/bird/bird.conf
Reconfigured
bird> show protocols 
name     proto    table    state  since       info
kernel1  Kernel   master   up     13:59:59    
device1  Device   master   up     13:59:59    
bgp1     BGP      master   up     14:20:07    Established
bgp2     BGP      master   up     14:20:03    Established
static_bgp Static   master   up     13:59:59    
bird> 
```

When I introduced another route into the config to bring it up to 501 the peerings also stayed established however when I then updated the 501 prefixes with a different next hop IP I saw the BGP peering torn down briefly and then re-established.

```bash
bird> configure
Reading configuration from /etc/bird/bird.conf
Reconfigured
bird> show protocols 
name     proto    table    state  since       info
kernel1  Kernel   master   up     13:59:59    
device1  Device   master   up     13:59:59    
bgp1     BGP      master   start  15:04:18    Active        Received: Maximum number of prefixes reached
bgp2     BGP      master   start  15:04:18    Active        Received: Maximum number of prefixes reached
static_bgp Static   master   up     13:59:59    
bird> 
```

While I can't argue that the behaviour is not documented, it's pretty obscure and perhaps not all that well known. It's also probably not that critical for many because those updates are probably coming as part of a reconvergence that is already causing an outage however the closer you get to 1000 prefixes advertise the fewer updated routes are needed to take down the whole peering and cause a wider outage. In an SD-WAN deployment with 1000 prefixes coming from sites it would only take one site updating to cause a, albeit brief, outage for all sites.
For my own deployments where reliability matters we'll not be going over 500.

