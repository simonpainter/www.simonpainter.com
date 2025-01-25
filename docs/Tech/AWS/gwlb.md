---
title: A little look at the AWS Gateway Load Balancer
---

I went down the AWS Gateway Load Balancer rabbit hole recently and it's an interesting solution to some quite specific problems. There are use cases for it on ingress and egress where regulatory requirements, or more likely legacy skillsets, dictate that traffic passes through NVA based network security appliances. The problem with NVAs is often the difficulty scaling them in AWS. You need to distribute traffic and typically you need a loadbalancer but you can't use an ALB or a NLB because unlike Azure the load balancers in AWS do not allow for traffic routing so they cannot be targets for route tables in the same way Azure loadbalancers can be targets for UDRs.

> In Azure you slap a load balancer in front of your scale set of NVAs and hey
> presto you have an autoscaling firewall or whatever. This is equivalent to
> the two arm model lower down.

## Deployment models

There are essentially two models for using a GWLB in AWS - one arm and two arm. The biggest difference between the two models is that in a two arm deployment the 5 tuples of the IP header are not changed

### One arm

The primary advantage of the one arm model is that it supports NVA appliances that are transparent to the traffic flow and do not take part in any routing. This is achieved using a wrapper to transport the traffic to and from the NVA without modifying the source or destination. Let's walk through the traffic flow for a one arm step by step:

> ![One Arm](img/gwlb-1-arm.png)
>
> *A one arm deployment of GWLB*

- Initial Traffic Arrival
When traffic first enters your VPC, it follows a route table entry that points to the GWLB endpoint (GWLBe). This route table contains a specific CIDR range that should be processed by your Network Virtual Appliances (NVAs) for example `10.10.10.0/24 -> gwlbe-id`

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

## GENEVE

[GENEVE](https://datatracker.ietf.org/doc/html/rfc8926) emerged around 2014 as a response to limitations in existing network virtualisation protocols like VXLAN and NVGRE and the proliferation of proprietory adaptations. While these protocols worked well for their specific use cases, the networking community needed something more flexible that could adapt to future requirements. GENEVE was developed through collaboration between companies like VMware, Microsoft, and Red Hat, with the goal of creating a truly extensible encapsulation protocol.

The GENEVE header structure is particularly interesting in its design. It starts with a fixed base header that's 16 bytes long, containing these key fields:

The first 8 bytes include:

- Version (2 bits): Currently set to 0
- Option Length (6 bits): Indicates length of optional metadata in 4-byte multiples
- Control bit (1 bit): Distinguishes control from data packets
- Reserved bits (3 bits): Set aside for future use
- Protocol Type (16 bits): Identifies the encapsulated protocol
- Virtual Network Identifier (24 bits): Like an apartment number in a building, it identifies the virtual network

The next 8 bytes contain:

- Variable Length Options (if any): These are what make GENEVE special. Each option has:
  - Option Class: Identifies who defined the option
  - Option Type: What the option does
  - Option Length: How long the option is
  - Option Data: The actual metadata

What makes GENEVE particularly powerful is its extensibility through these options headers. Unlike older protocols that had fixed formats, GENEVE allows network operators to add new types of metadata as needed. This is similar to how modern email systems can attach various types of metadata to messages, from simple priority flags to complex routing instructions.

In AWS's implementation with Gateway Load Balancer, GENEVE carries important information about the original packet's destination, allowing the security appliances to make informed decisions about traffic handling. The protocol ensures that even after encapsulation, all the necessary context about the traffic is preserved and can be used by the network virtual appliances.

## NVA Support for GENEVE

The need for GENEVE adds some complexity if you aren't using an off the shelf NVA that has built in support for GLWB and implicitly GENEVE.

### Suraicata

 [There are labs available](https://catalog.workshops.aws/gwlb-networking/en-US/50-opensource-suricata) which show how to do it using [Suricata](https://aws.amazon.com/blogs/networking-and-content-delivery/building-an-open-source-ids-ips-service-for-gateway-load-balancer/). Suricata natively understands GENEVE so can strip the GENEVE header (or ignore it) and inspect the contents before (if Suricata agrees to pass it) sending it back to the GWLB with the GENEVE header and the otherwise unchanged inside packet.

### gwlbtun

Alternatively if [you want to use something else](https://aws.amazon.com/blogs/networking-and-content-delivery/how-to-integrate-linux-instances-with-aws-gateway-load-balancer/) instead of Suricata for your NVA there is [gwlbtun](https://github.com/aws-samples/aws-gateway-load-balancer-tunnel-handler) which can provide a linux handler for the GENEVE tunnel that actually works with GWLB and goes [above what tc can do](https://darjchen.medium.com/setting-up-geneve-tunnel-with-linux-tc-571f891618a9).

## Summary

Using off the shelf NVAs is probably the first port of call for most people - if you need to use GWLB it's probably because you have a very specific set of technologies in mind. If you just want Suricata then consider the [AWS Firewall](../Security/aws-dns-firewall.md) which seems to have Suricata under the hood. If you really want to do something clever with your own NVAs then prepare for a bit of pain getting GENEVE support into your Linux boxes.