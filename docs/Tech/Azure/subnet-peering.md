---
title: Azure Subnet Peering
---

One of the sneaky under the radar features that is going to be a game changer in the near future is Azure Subnet Peering. This is a feature that is already there under the hood but not really documented or productised.

## What is Azure Subnet Peering?

To answer that we have to go back and look at what VNet peering is. Actually we can go back and have a look at what a VNet itself is: A VNet is a logical collection of subnets. Each VNet has one primary CIDR range and then zero or more secondary CIDR ranges. Those CIDR ranges can then be used in a single subnet or subdivided into more subnets so long as the address space does not overlap.

> You can subnet that however you choose in order to use some or all of the CIDR address space. There
> are some [great tools](https://blog.pichuang.com.tw/azure-subnets.html) to help you use your CIDR
> ranges efficinently.

When you peer two VNets you gain the ability to route between all subnets in those VNets; this is out of the box functionality we have all learned to take for granted. Below is a basic lab with two VNets, each with three subnets.

```text
Azure 
+-------------------------------------------------------------------+
|                                                                   |
|  +------------------------+       +-------------------------+     |
|  |        VNet1           |       |         VNet2           |     |
|  |     (10.1.0.0/16)      |       |      (10.2.0.0/16)      |     |
|  |                        |       |                         |     |
|  |  +------------------+  |       |  +------------------+   |     |
|  |  |    Subnet1       |  |       |  |    Subnet1       |   |     |
|  |  |  (10.1.1.0/24)   |  |       |  |  (10.2.1.0/24)   |   |     |
|  |  |     [VM1]        |  |       |  |                  |   |     |
|  |  +------------------+  |       |  +------------------+   |     |
|  |                        |       |                         |     |
|  |  +------------------+  |       |  +------------------+   |     |
|  |  |    Subnet2       |  |       |  |    Subnet2       |   |     |
|  |  |  (10.1.2.0/24)   |  |       |  |  (10.2.2.0/24)   |   |     |
|  |  +------------------+  |       |  +------------------+   |     |
|  |                        |       |                         |     |
|  |  +------------------+  |       |  +------------------+   |     |
|  |  |    Subnet3       |  |       |  |    Subnet3       |   |     |
|  |  |  (10.1.3.0/24)   |  |       |  |  (10.2.3.0/24)   |   |     |
|  |  +------------------+  |       |  +------------------+   |     |
|  |                        |       |                         |     |
|  +------------------------+       +-------------------------+     |
|                                                                   |
+-------------------------------------------------------------------+
```

If we put a VM in one of the subnets in VNet 1 and look at the effective routes on the NIC we get something like this:

```text
Source    State    Address Prefix    Next Hop Type    Next Hop IP
--------  -------  ----------------  ---------------  -------------
Default   Active   10.1.1.0/24       VnetLocal
Default   Active   10.1.2.0/24       VnetLocal
Default   Active   10.1.2.0/24       VnetLocal
```

If we establish a normal VNet peering we get something like this instead:

```text
Source    State    Address Prefix    Next Hop Type    Next Hop IP
--------  -------  ----------------  ---------------  -------------
Default   Active   10.1.1.0/24       VnetLocal
Default   Active   10.1.2.0/24       VnetLocal
Default   Active   10.1.2.0/24       VnetLocal
Default   Active   10.2.1.0/26       VNetPeering
Default   Active   10.2.2.0/26       VNetPeering
Default   Active   10.2.3.0/26       VNetPeering
```
