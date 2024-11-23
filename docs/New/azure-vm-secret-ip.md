---

title: What is with the secret IP on Azure VMs?
---


## The Mystery Begins

>Note: A few people on Reddit and LinkedIn pointed me towards these pages:
>
>[Azure Updates](https://azure.microsoft.com/en-us/updates?id=default-outbound-access-for-vms-in-azure-will-be-retired-transition-to-a-new-method-of-internet-access)
>
>[Default Outbound Access](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access)
>
>While I appreciate the input, those are not secrets and are well known concepts and relate to the public IP used for
>outbound internet access in the absence of a PIP. I thought I had explained well enough in the first part below that
>this relates to another IP which is *not* used for internet access and is used for connecting to the Azure DNS service
>(and maybe some other things). In the second example below I show that a VM without a PIP has one public IP address for
>outbound Internet access (which seems to be an implicit NAT gateway) and another which is used for DNS lookups to the
>Azure DNS.

The reason I fell down the rabbit hole with regard to [finding my public ip](finding-my-ip.md) was because of a section in an old Azure networking book my friend was reading which said:

>To allow Azure internal communication between resources in Virtual Networks and Azure services, Azure assigns public IP
>addresses to VMs, which identifies them internally. Let's call these public IP addresses AzPIP (this is an unofficial
>abbreviation). You can check the Azure internal Public IP address bound to the VM with the command
>dig TXT short o-o.myaddr.google.com.

## Initial Investigation

Using dig to look up the text record from o-o.myaddr.google.com returns the IP of the client doing the lookup. What's interesting is that you get a different response depending on where you look it up - suggesting different interfaces with different routes exist under the hood in the Azure NIC.

### Test Case 1: VM with Public IP

With a VM that has a [pip](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/public-ip-addresses) assigned, you get two different IPs:

```
simon@vm1:~$ dig TXT o-o.myaddr.l.google.com +short
"51.140.144.96"
simon@vm1:~$ dig TXT o-o.myaddr.l.google.com @ns1.google.com +short
"20.108.24.23"
```

Note: You get two different answers because in the first case you're connecting to Azure DNS servers, whereas in the second you're connecting to Google DNS out on the internet. The second IP matches what you get from 'curl ident.me'.

## The Plot Thickens
I thought the hidden public IP might provide outbound internet access when there's no pip associated with the VM. Time to test that theory.

### Test Case 2: VM without Public IP

Spun up a second VM in the vNet without a pip and hopped across from the other VM:

```
simon@vm2:~$ dig TXT o-o.myaddr.l.google.com @ns1.google.com +shortgle.com +short
"172.167.198.97"
simon@vm2:~$ dig TXT o-o.myaddr.l.google.com +short
"51.105.64.87"
```

### Test Case 3: Another VM Check

Just to be thorough, tried another VM:

```
simon@vm3:~$ dig TXT o-o.myaddr.l.google.com @ns1.google.com +short
"172.167.198.97"
simon@vm3:~$ dig TXT o-o.myaddr.l.google.com +short
"51.105.65.76"
```

## The Hidden NAT Gateway Theory

The results suggest that the VMs share a hidden NAT gateway. Unlike AWS, NAT gateways haven't been required in Azure, but I never really checked if this was because of:

1. A hidden gateway was doing the NAT for outbound traffic
2. The secret Azure public IP being used for outbound access and DNS lookups

This made me wonder if the AzPIP might be the underlay IP that the encapsulated private traffic is sent over. But is this per VM or per physical host? The idea of each VM having a public IP for backbone routing plus overlay PIPs seemed excessive.

## The Friday Night Experiment

To figure out if these IPs were being shared, I had what I'll call a *friday night grade idea*: spin up a load of VMs in the same AZ and have them report their AzPIP. Here's the test script:

```bash
OUTPUT=$(dig TXT o-o.myaddr.l.google.com +short | tr -d '"')
curl -s "http://foo.simonpainter.com/?response=$OUTPUT"
```

### Initial Results (10 VMs)

```
172.174.103.61 - - [22/Nov/2024:21:01:15 +0000] "GET /?response=52.168.119.57 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:15 +0000] "GET /?response=40.78.224.106 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:15 +0000] "GET /?response=52.168.118.196 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:16 +0000] "GET /?response=20.42.70.215 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:16 +0000] "GET /?response=20.42.77.37 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:17 +0000] "GET /?response=20.42.77.8 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:17 +0000] "GET /?response=20.42.70.167 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:17 +0000] "GET /?response=40.78.224.108 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:21 +0000] "GET /?response=40.71.9.109 HTTP/1.1" 200 251 "-" "curl/7.58.0"
172.174.103.61 - - [22/Nov/2024:21:01:22 +0000] "GET /?response=40.71.9.123 HTTP/1.1" 200 251 "-" "curl/7.58.0"
```

## Next Steps (That Didn't Quite Work Out)

I decided to scale up to 1000 VMs to get a better sample size. This was, predictably, a terrible idea - hit my quota limit, and Friday night is definitely not the best time to try getting that raised. As luck would have it, I managed to get my quota increased to 50 VMs, not quite the 1000 I was aiming for, but enough for a more substantial test. Here are the results from the expanded test:

### Test Results (50 VMs)

```
52.191.254.129 - - [22/Nov/2024:21:46:48 +0000] "GET /?response=40.79.152.121 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:48 +0000] "GET /?response=20.42.77.3 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:51 +0000] "GET /?response=40.71.8.89 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:51 +0000] "GET /?response=40.79.152.105 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:53 +0000] "GET /?response=40.78.225.87 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:53 +0000] "GET /?response=40.71.9.76 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:57 +0000] "GET /?response=20.42.77.19 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:57 +0000] "GET /?response=52.168.119.54 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:46:59 +0000] "GET /?response=40.79.153.186 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:10 +0000] "GET /?response=40.71.8.127 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:38 +0000] "GET /?response=40.79.153.72 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:42 +0000] "GET /?response=40.79.153.165 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:45 +0000] "GET /?response=40.78.225.110 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:45 +0000] "GET /?response=40.78.224.89 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:46 +0000] "GET /?response=40.78.224.88 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:46 +0000] "GET /?response=40.78.224.103 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:47:47 +0000] "GET /?response=40.79.153.117 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:01 +0000] "GET /?response=40.79.152.85 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:05 +0000] "GET /?response=40.78.225.89 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:10 +0000] "GET /?response=40.78.224.79 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:28 +0000] "GET /?response=40.78.225.231 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:30 +0000] "GET /?response=40.71.9.96 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:30 +0000] "GET /?response=4.156.0.143 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:31 +0000] "GET /?response=40.79.152.119 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:31 +0000] "GET /?response=40.78.225.218 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:33 +0000] "GET /?response=4.156.0.130 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:40 +0000] "GET /?response=40.79.153.88 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:58 +0000] "GET /?response=52.168.119.128 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:48:59 +0000] "GET /?response=40.78.224.102 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:03 +0000] "GET /?response=20.42.70.134 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:16 +0000] "GET /?response=40.71.9.92 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:16 +0000] "GET /?response=52.168.118.195 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:16 +0000] "GET /?response=20.42.70.150 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:16 +0000] "GET /?response=20.42.77.81 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:18 +0000] "GET /?response=40.79.153.113 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:18 +0000] "GET /?response=40.79.152.115 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:42 +0000] "GET /?response=40.71.9.156 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:46 +0000] "GET /?response=40.78.225.252 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:46 +0000] "GET /?response=40.79.153.114 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:46 +0000] "GET /?response=20.42.77.58 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:57 +0000] "GET /?response=40.78.224.118 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:49:57 +0000] "GET /?response=40.78.225.252 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:00 +0000] "GET /?response=40.78.225.215 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:01 +0000] "GET /?response=20.42.77.39 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:02 +0000] "GET /?response=40.79.153.178 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:13 +0000] "GET /?response=40.79.152.78 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:28 +0000] "GET /?response=40.78.225.80 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:30 +0000] "GET /?response=40.78.224.111 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:30 +0000] "GET /?response=40.79.153.180 HTTP/1.1" 200 251 "-" "curl/7.58.0"
52.191.254.129 - - [22/Nov/2024:21:50:32 +0000] "GET /?response=40.71.9.136 HTTP/1.1" 200 251 "-" "curl/7.58.0"
```

All VMs reported through the same (new) NAT gateway (52.191.254.129), but the interesting part was in the reported Azure internal IPs. The IPs fell into several distinct ranges:

1. 4.156.0.x (2 IPs)
2. 20.42.x.x (6 IPs)
3. 40.71.x.x (7 IPs)
4. 40.78.x.x (14 IPs)
5. 40.79.x.x (13 IPs)
6. 52.168.x.x (4 IPs)

The most intriguing finding? We caught our first duplicate! The IP `40.78.225.252` was reported by two different VMs within about 11 seconds of each other. While a single duplicate in 50 VMs isn't conclusive, it's the first evidence supporting the theory that these IPs might be assigned at the host level rather than the VM level.

## Open Questions

If anyone knows more about:

- How the AzPIP system works under the hood
- Whether these IPs are truly per-VM or shared at the host level
- It's also possible they are part of a SNAT pool, which would also be a valid explanation for the overlap. Why there would be SNAT between a VM and the Azure DNS is another question altogether. 
- The relationship between these IPs and Azure's internal routing
- I have another working theory and that it is just the egress for the Azure DNS. If the Azure DNS is forwarding DNS lookups then it's entirely possible the Google DNS servers are seeing that as the client IP rather than the actual client. That makes the original book source a massive misunderstanding. 

Please get in touch! And if anyone has the ability to test this at a larger scale (say, with that originally planned 1000 VMs), I'd love to hear about your results.
