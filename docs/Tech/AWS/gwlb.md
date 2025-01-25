---
title: A little look at the AWS Gateway Load Balancer
---

I went down the AWS Gateway Load Balancer rabbit hole recently and it's an interesting solution to some quite specific problems. There are use cases for it on ingress and egress where regulatory requirements, or more likely legacy skillsets, dictate that traffic passes through NVA based network security appliances. The problem with NVAs is often the difficulty scaling them in AWS. You need to distribute traffic and typically you need a loadbalancer but you can't use an ALB or a NLB because unlike Azure the load balancers in AWS do not allow for traffic routing so they cannot be targets for route tables in the same way Azure loadbalancers can be targets for UDRs.

> In Azure you slap a load balancer in front of your scale set of NVAs and hey
> presto you have an autoscaling firewall or whatever. This is equivalent to
> the two arm model lower down.

There are essentially two models for using a GWLB in AWS - one arm and two arm. The biggest difference between the two models is that in a two arm deployment the 5 tuples of the IP header are not changed

### One arm

The primary advantage of the one arm model is that it supports NVA appliances that are transparent to the traffic flow and do not take part in any routing. This is achieved using a wrapper to transport the traffic to and from the NVA without modifying the source or destination. Let's walk through the traffic flow for a one arm step by step:

> ![One Arm](img/gwlb-1-arm.png)
>
> *A one arm deployment of GWLB*

- Initial Traffic Arrival
When traffic first enters your VPC, it follows a route table entry that points to the GWLB endpoint (GWLBe). This route table contains a specific CIDR range that should be processed by your Network Virtual Appliances (NVAs).

- GWLB and GENEVE Encapsulation
The GWLB receives this traffic and uses GENEVE (Generic Network Virtualization Encapsulation) to encapsulate the packets. This encapsulation is crucial because it preserves the original packet information, including the source and destination addresses, while adding metadata that helps with routing.

- NVA Processing
The encapsulated traffic is sent to one of your NVAs (like a firewall or IPS appliance) for processing. The NVA performs its security checks or other functions and then sends the traffic back to the GWLB.

- Final Routing Decision
When the GWLB receives the processed traffic back from the NVA, it looks at the original destination address preserved in the GENEVE encapsulation. The GWLB then strips off the GENEVE encapsulation and forwards the packet based on the VPC's normal routing rules. This is why it's crucial that your VPC route tables are properly configured not just for the initial traffic flow, but also for the post-processing routing.

### Two arm model

The two arm model is particularly useful for shared internet egress. A Gateway Load Balancer Endpoint in a VPC can be a target for the routing table and that then forwards over GENEVE tunnels to an autoscaling group of NVAs that SNAT the traffic and forward to their internet egress. It might be a cheaper model than using a whole heap of [AWS Firewalls](../Security/aws-dns-firewall.md).

>![Two Arm](img/gwlb-2-arm.png)
>
> *A two arm deployment of GWLB*

- Traffic arrives via the route table
The application instance generates outbound traffic that needs to reach the internet. The VPC route table directs this traffic to the GWLBe, with a route like: `0.0.0.0/0 -> gwlbe-id`

- GWLB and GENEVE Encapsulation
The GWLBe forwards the traffic to the GWLB in the security VPC, which then uses GENEVE encapsulation to send it to an NVA for inspection.

- NVA Processing and egress
Here's the key difference: After the NVA inspects the traffic and performs source NAT on it to ensure correct return path traffic, instead of sending it back through the GWLB, it directly forwards the traffic to its final destination via the next hop in it's routing table, for example an internet gateway. The NVA essentially acts as the last hop before the internet.