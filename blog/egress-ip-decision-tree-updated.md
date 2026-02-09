---

title: Egress IP decision tree updated
authors: simonpainter
tags:
  - azure
  - networks
  - architecture

date: 2025-11-20

---

I had another one of those weird problems which made me revisit the [egress IP decision tree](egress-ip-decision-tree.md) again.
<!-- truncate -->

You may recall this diagram from last time:
![What's this all about then?](img/egress-ip-decision-tree-updated/decision-tree-load-balancer-thumb.png)

It's taken from the [default outbound internet access](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access#when-is-default-outbound-access-provided) documentation and describes the order in which egress IPs are selected for outbound internet access. I've previously tested the NAT gateway vs PIP scenario and confirmed that the NAT gateway egress IP takes precedence over a VM's assigned PIP.

The question I had this time was around the Load Balancer. Again the NAT gateway takes precedence over the Load Balancer's outbound rules, and you can't have a public loadbalancer coexisting with a PIP on a VM so those are all pretty predictable. But what happens if you have a public load balancer with two sets of outbound rules, on two different front-end IP configurations, and with two different backend pools? Which outbound IP gets used then?

> This is quite a niche scenario and unique to the public load balancer. You can't have two different Public IPs on the same IP Configuration, and you can't have two different NAT Gateways on the same subnet so this is really only relevant to public load balancers.

I'll not bore you with the details of why I had to find this out, that's for another time, but suffice to say it was a real-world scenario (although using private load balancers in that situation). The answer is that the outbound IP used is determined by which backend pool the VM is added to first. This means that if you have multiple backend pools and you want to add a new VM to them you need to be careful to preserve the order in which the VM is added to the backend pools, otherwise you may inadvertently change the egress IP used for outbound internet access.

This is not documented anywhere that I can find, so I thought it worth sharing here. I am off to submit a PR to Microsoft Learn.
