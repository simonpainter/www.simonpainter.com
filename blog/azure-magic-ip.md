---

title: "168.63.129.16: The Magic IP Address in Azure"
authors: simonpainter
tags:
  - azure
  - networks
  - cloud
date: 2025-10-01

---

From time to time I have a conversation about Azure networking and a topic comes up that I need to dig into a little more. Normally the [documentation is pretty good](https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16) but sometimes I just need to bottom out all the behaviour. Today's topic is 168.63.129.16, an IP address that keeps coming up in various places in Azure.
<!-- truncate -->
There are some capabilities that Azure provides which are handled in the fabric of the Azure network and do not have an allocated IP address within the vnet. Microsoft has reserved the IP address `168.63.129.16` from public use so it can be dedicated to these services. This IP address is reachable from all virtual machines (VMs) deployed in an Azure virtual network (VNet).

## Reserved IPs in a Subnet

In every Azure subnet, the first three *usable* IPs are reserved by Azure for its own use, and the first & last IP addresses are reserved for the subnet network and broadcast addresses. These IPs cannot be assigned to a VM or other resources.
In the subnet 10.0.0.0/24 the following IP addresses are reserved by Azure:

- 10.0.0.0: Network address.
- 10.0.0.1: Reserved by Azure for the default gateway.
- 10.0.0.2: Reserved by Azure to map the Azure DNS IP addresses to the virtual network space.
- 10.0.0.3: Reserved by Azure to map the Azure DNS IP addresses to the virtual network space.
- 10.0.0.255: Network broadcast address.

Although the .2 and .3 addresses are said in the documentation to be used for Azure DNS, they don't actually respond to DNS queries.

```text
simon@lab-simon-mip-vm:~$ dig www.simonpainter.com +short @10.0.0.2
;; communications error to 10.0.0.2#53: timed out
;; communications error to 10.0.0.2#53: timed out
;; communications error to 10.0.0.2#53: timed out

; <<>> DiG 9.18.39-0ubuntu0.24.04.1-Ubuntu <<>> www.simonpainter.com +short @10.0.0.2
;; global options: +cmd
;; no servers could be reached
simon@lab-simon-mip-vm:~$ dig www.simonpainter.com +short @10.0.0.3
;; communications error to 10.0.0.3#53: timed out
;; communications error to 10.0.0.3#53: timed out
;; communications error to 10.0.0.3#53: timed out

; <<>> DiG 9.18.39-0ubuntu0.24.04.1-Ubuntu <<>> www.simonpainter.com +short @10.0.0.3
;; global options: +cmd
;; no servers could be reached
simon@lab-simon-mip-vm:~$ 
```

## DNS & DHCP

The DNS queries are actually handled by `168.63.129.16`, and by default that is the DNS server assigned by DHCP to VMs in Azure. You can look at the DHCP lease information on a Linux VM using `dhcpcd --dumplease <interface>` and see that there are a few relevant options.

```text
simon@lab-simon-mip-vm:~$ sudo dhcpcd --dumplease eth0
reason=CARRIER
interface=eth0
protocol=link
if_configured=true
ifcarrier=up
ifmetric=1002
ifwireless=0
ifflags=69699
ifmtu=1500

reason=REBOOT
interface=eth0
protocol=dhcp
ip_address=10.0.0.4
subnet_cidr=24
broadcast_address=10.0.0.255
network_number=10.0.0.0
server_name=LON240101090863
subnet_mask=255.255.255.0
classless_static_routes=0.0.0.0/0 10.0.0.1 168.63.129.16/32 10.0.0.1 169.254.169.254/32 10.0.0.1
routers=10.0.0.1
domain_name_servers=168.63.129.16
domain_name=bqonim1o5esurn53inr3kbwdpc.zx.internal.cloudapp.net
dhcp_lease_time=4294967295
dhcp_message_type=5
dhcp_server_identifier=168.63.129.16
dhcp_renewal_time=4294967295
dhcp_rebinding_time=4294967295
simon@lab-simon-mip-vm:~$ 
```

`dhcp_server_identifier` is set to the magic IP address, this shows that the broadcasts are being captured and handled by a server that reports the magic IP as it's identity. Additionally the `domain_name_servers` is set to the magic IP, so DNS queries are sent there. There are also static routes added for `168.63.129.16` and `169.254.169.254` via `10.0.0.1` which ensure that traffic to those IPs isn't caught up in a UDR to go elsewhere.

One important callout is that the handling of DNS queries to this IP address in NSGs. If you create an NSG to block TCP and UDP port 53 to any destination, common if you want to force the use of a custom DNS server appliance, Windows DNS, Infoblox etc are all common in hybrid enterprise environments, then it will not block DNS queries to `168.63.129.16`.

![DNS block](img/dns-block.png)

```text
simon@lab-simon-mip-vm:~$ dig www.simonpainter.com +short @8.8.8.8
;; communications error to 8.8.8.8#53: timed out
;; communications error to 8.8.8.8#53: timed out
;; communications error to 8.8.8.8#53: timed out

; <<>> DiG 9.18.39-0ubuntu0.24.04.1-Ubuntu <<>> www.simonpainter.com +short @8.8.8.8
;; global options: +cmd
;; no servers could be reached
simon@lab-simon-mip-vm:~$ dig www.simonpainter.com +short @168.63.129.16
104.21.53.33
172.67.208.85
simon@lab-simon-mip-vm:~$ 
```

This has some serious implications for security because DNS data exfiltration is a common technique nowadays. If you are relying on an NSG to block DNS queries to external servers, you need to be aware that there is a specific service tag `AzurePlatformDNS` you can use to block DNS queries to the magic IP address.

![DNS block with tag](img/dns-block-tag.png)

```
simon@lab-simon-mip-vm:~$ dig www.simonpainter.com +short @168.63.129.16
;; communications error to 168.63.129.16#53: timed out
;; communications error to 168.63.129.16#53: timed out
;; communications error to 168.63.129.16#53: timed out

; <<>> DiG 9.18.39-0ubuntu0.24.04.1-Ubuntu <<>> www.simonpainter.com +short @168.63.129.16
;; global options: +cmd
;; no servers could be reached
simon@lab-simon-mip-vm:~$ dig www.simonpainter.com +short @8.8.8.8
104.21.53.33
172.67.208.85
simon@lab-simon-mip-vm:~$ 
```

## Load Balancer Health Probes

Another place you will find the magic IP is in your logs if you have an Azure Load Balancer (ALB) in front of your VM. The ALB uses the magic IP to perform health probes on the backend pool members. The default probe is a TCP probe on port 80, but you can change this to HTTP or HTTPS and specify a different port and path. The ALB will use the magic IP to send the probe requests, so you will see this IP address in your web server logs.

```
simon@lab-simon-mip-vm:~$ tail /var/log/apache2/access.log 
168.63.129.16 - - [30/Sep/2025:21:06:07 +0000] "GET / HTTP/1.1" 200 10982 "-" "Load Balancer Agent"
168.63.129.16 - - [30/Sep/2025:21:06:22 +0000] "GET / HTTP/1.1" 200 10982 "-" "Load Balancer Agent"
168.63.129.16 - - [30/Sep/2025:21:06:37 +0000] "GET / HTTP/1.1" 200 10982 "-" "Load Balancer Agent"
simon@lab-simon-mip-vm:~$ 
```

You normally don't need to do anything special to allow these probes to reach your VM, as the ALB is a first party service and is allowed by default using the service tag `AzureLoadBalancer`. 

![Load Balancer Health Probe](img/lb-inbound.png)

## Azure VM Agent

Finally you will see communication to this IP address from the Azure VM Agent. The Azure VM Agent is a lightweight process that runs on the VM and is responsible for handling various tasks such as provisioning, extensions, and other management tasks. The agent communicates with the Azure fabric using the magic IP address. If you're persistent and look at the open connections on a Linux VM you will see a connection to `168.63.129.16` on port `32526`.

```text
simon@lab-simon-mip-vm:~$ sudo netstat -tupn
Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0    446 10.0.0.4:43546          168.63.129.16:32526     ESTABLISHED 1632/python3 
```

The Azure VM Agent for Linux is written in python and runs as a service called waagent. The source code is available on [GitHub](https://github.com/Azure/WALinuxAgent/).
