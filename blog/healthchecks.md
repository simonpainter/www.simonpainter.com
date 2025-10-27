---

title: Checking the health of the Internet
authors: simonpainter
tags:
  - personal
  - networks
  - monitoring
  - automation
date: 2025-10-27

---

I was out for a long walk over the weekend and I have now got a rather nasty blister on my heel. If a health check was configured just to detect the blisters on my feet then I would have been marked as dead already.
<!-- truncate -->
The reason I mention this is that health checks, especially in the context of load balancers, failovers, and IPSLA monitors can be a bit binary and either too narrowly or too widely scoped depending on the use case.

> I am going to call myself out there for the use of the phrase "a bit binary", it's like the phrase
> "a little bit absolute" as used in the [movie The Gentlemen](https://www.youtube.com/watch?v=6DvicTTEVug)
> (language warning). Both phrases are inherently contradictory.

This came up recently for me because the out of the box test for Office 365 availability on a Fortigate SDWAN policy is to do a tcp half open on port 80 to `www.office.com`. This is a very basic test which may be sufficient but [reddit has a few examples](https://www.reddit.com/r/fortinet/comments/1em0h0w/fortigate_sdwan_default_default_office_365_sla/) of where it has gone wrong. It appears that the WAF in front of `www.office.com` can see these tcp half opens as malicious and block them, the result being that the Fortigate marks the reachability as down for Office 365 traffic when in fact it is not.

We had this exact issue recently and the quick fix was to change the health check to use 443 because a quick telnet showed that http wasn't working but https was. This lasted for all of about half an hour before the already quite suspicious WAF blocked that as well. We actually had the same health check in use in two places but they were for very different purposes.

## The Fortigate health check for Office 365 reachability

We have a policy based route that allows Office 365 traffic to go out over the direct internet link rather than via a more convoluted path. In a fit of textbook reading the policy includes a health check so that the traffic can fail over to the more complex path if the direct internet link is not working. This being SDWAN and all that, the more complex path relies on the same internet link so the health check is a bit redundant but it is there anyway.

The health check out of the box is the tcp half open connection to `www.office.com` on port 80. It's the one out of the box but also one that Fortinet (and also Reddit) will inform you isn't that reliable. I also question the value of having a single health check to a URL that isn't even really part of the Office 365 service endpoints. A better health check would be to use one of the [Office 365 URLs and IP address ranges](https://learn.microsoft.com/en-us/microsoft-365/enterprise/urls-and-ip-address-ranges?view=o365-worldwide) that are actually used by the service. Even better would be to use multiple health checks to different URLs so that if one is blocked or down then the others can still provide a valid indication of reachability.

> This comes to the AND vs OR health check debate. If you are testing a specific service for not only reachability but also availability then you may want to use an AND health check where all tests must pass. When setting up loadbalancers or application gateways it's common to have the application team create a dedicated `/healthcheck` end point which only responds with a 200 OK if all the application tests and internal dependencies are also working. Without this then relying on reachability to a single URL may not be sufficient to determine if the application is actually healthy.

## The IPSLA health check for Internet reachability

We also had a separate IPSLA health check to manage the failover of our primary internet link on a site to the secondary. This used the same health monitor as the Office 365 one but was used in a different context. In this case the health check was used to determine if the primary internet link was up or down and if down then failover to the secondary link. In this case the health check being blocked by a WAF is less of an issue because if the health check fails then we failover to the secondary link anyway. The problem arose because we had the same health check on the second link as well so both were marked as down when they were in fact otherwise perfectly healthy and usable.

> This is the opposite end of the AND vs OR debate. In this case we want to monitor multiple endpoints across the internet - Google, Cloudflare, Microsoft etc - and only fail over if *all* of them are unreachable. This way we can be more certain that the internet link is actually down rather than just a single endpoint being blocked or unreachable.

## Conditional default route injection

A while ago I was moving the default route from a US internet egress to a newly built regional one in the UK. We wanted to ensure that there was a default route originated in that region from one of two regional egress points. We had the luxury that if both failed (unlikely given there were two separate locations with several separate ISPs) then the default route received from the US parent would be used as the fall back path of last resort. The problem was how to determine if the internet egress points were actually healthy. We looked at seeing if the vendor routes were being received, or their own originated default route but these did not really give us confidence because the ISP could be up but with their own upstream peering down and we wouldn't know about it.
We ended up testing if we had received about few large backbone BGP prefixes from carriers like Level3, NTT, BT etc. If we were receiving those prefixes then we could be more confident that the internet egress points were healthy and able to route traffic. If we were not receiving them then we would withdraw the default route originated from that egress point. We used about 8 different prefixes spread across multiple carriers and then tested to see that 75% of them were being received before we considered the egress point healthy. This meant that a single provider outage, although unlikely, would not cause us to withdraw the default route.\

> This is a compromise position between the AND vs OR debate. We want to ensure that we have a reasonable level of confidence that the internet egress point is healthy without being too sensitive to individual provider outages.

## Conclusion

In conclusion, health checks are a critical component of ensuring the reliability and availability of services. The choice between AND and OR health checks depends on the specific requirements of the service being monitored. It's important to consider the scope and the purpose of the health check and to ensure that it provides a meaningful indication of the service's health. For services like Office 365, it's advisable to use multiple health checks to different endpoints to ensure accurate monitoring. For internet reachability, using multiple endpoints, or multiple received routes, and a threshold for failure can provide a more robust indication of link health. Ultimately, the goal is to ensure that health checks are effective in maintaining service availability without being overly sensitive to transient issues.
