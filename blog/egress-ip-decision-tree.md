---

title: Egress IP decision tree
authors: simonpainter
tags:
  - azure
  - networks

date: 2025-06-23

---

I happened upon the diagram below within the pages on [default outbound internet access](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access#when-is-default-outbound-access-provided) and it seemed a little counterintuitive. The decision flow seems to suggest that a VM will use the egress IP of a NAT gateway preferably over an assigned PIP.
<!-- truncate -->
![What's this all about then?](img/decision-tree-load-balancer-thumb.png)
I am very much of the view that explicitly configured things should always override things that are implicit. It seemed so out of step that I had to test it, in case it was either a mistake in the documentation or my own incorrect interpretation.

I created an [Azure Private Subnet](https://azure.microsoft.com/en-gb/updates?id=492953) - the last thing I wanted was to confuse matters with the individual egress IP that VMs get until the [Azure IP armageddon](https://azure.microsoft.com/en-gb/updates?id=default-outbound-access-for-vms-in-azure-will-be-retired-transition-to-a-new-method-of-internet-access) in September - and then I created a VM with a PIP that I could SSH to.

![This makes sense](img/egress-test-vm.png)

```bash
simon@MacBook-Pro ~ % ssh 20.77.8.0
Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.11.0-1015-azure x86_64)
...

...
simon@vm-test:~$ 
simon@vm-test:~$ dig TXT o-o.myaddr.l.google.com @ns1.google.com +short
"20.77.8.0"
simon@vm-test:~$ 
```

So far so absolutely predictable. Next I added a NAT gateway with a new PIP associated with it.

![This also makes sense](img/egress-test-nat-pip.png)

The first thing I noticed was that my SSH connection hung. This is something to bear in mind if you are retrospectively adding a NAT gateway to a subnet. The next thing I noticed, when I reconnected to the VM was that the egress IP had indeed changed.

```bash
simon@MacBook-Pro ~ % ssh 20.77.8.0
Welcome to Ubuntu 24.04.2 LTS (GNU/Linux 6.11.0-1015-azure x86_64)
...

...
simon@vm-test:~$ dig TXT o-o.myaddr.l.google.com @ns1.google.com +short
"4.234.201.231"
simon@vm-test:~$
```

I am not entirely sure of the thinking behind this but will update if I find out.
