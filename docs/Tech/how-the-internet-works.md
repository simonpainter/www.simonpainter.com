---

title: "How the internet works"

---

## Introduction

On a few occasions I have been asked to explain networks to people with no prior experience and it's quite hard to work out where to start; there is so much history and so many concepts from general computer science that have got us to where we are today. I have long believed that to truly understand a concept it's very valuable to be able to organise your understanding in a way that means you can explain it to someone else. My goal here is not just to explain many of the contributions to networking that make the internet work but also organise some of my own understanding and explore areas where I have taken things on faith rather than asking why they are the way they are. The approach for this will be to assume we're starting with nothing and rebuilding the internet from the ground up and solving the problems that were solved to get us where we are today.

## Let's start with the cable

The first job before us is to connect two computers together. Computers talk in ones and zeros because they are for the most part only able to understand if a signal on a wire is there (a one) or not (a zero). If you connect two computers, or other networked devices, the lowest level of connectivity is likely to be a cable carrying an electricial signal, a fibre optic cable carrying pulses of light or some sort of radio frequency with modulated frequency or amplitude which denotes an on or off. If you are dealing with an electrical signal you need a common ground wire as well to make the circuit but for everything else you just need a wire to transmit in one direction and another to transmit in the other.

### Serial vs Parallel Communication

When connecting two computers, data can be transmitted either serially (one bit at a time) or in parallel (multiple bits simultaneously). Each approach has distinct characteristics that make it suitable for different scenarios.

In serial communication, bits are sent one after another along a single wire (plus ground). Think of it like a single-lane road where cars (bits) must travel in sequence:

```text
Computer A                Computer B
    [Tx] --------------> [Rx]
    [Rx] <-------------- [Tx]
    [G]  --------------- [G]

    Data: 1 0 1 1 0
    Time: 1 2 3 4 5    (each bit sent sequentially)
```

Parallel communication, by contrast, uses multiple wires to send several bits simultaneously. This is like a multi-lane highway where multiple cars (bits) can travel side-by-side:

```text
Computer A                Computer B
    [D0] --------------- [D0]
    [D1] --------------- [D1]
    [D2] --------------- [D2]
    [D3] --------------- [D3]
    [D4] --------------- [D4]
    [D5] --------------- [D5]
    [D6] --------------- [D6]
    [D7] --------------- [D7]
    [G]  --------------- [G]

    Data: 1 0 1 1 0 1 0 1
    Time: 1            (all bits sent simultaneously)
```

While parallel communication might seem superior due to its ability to transmit multiple bits simultaneously, it comes with its own challenges. The primary issue is something called "clock skew" - where bits sent at the same time might arrive slightly offset due to minute differences in wire length or electrical characteristics. This becomes more problematic as distances increase or transmission speeds rise.

> At higher speeds or longer distances, the complexity of keeping multiple data lines synchronized in parallel
> communication becomes increasingly difficult. This is why modern high-speed communications (like USB 3.0, SATA,
> and PCIe) use multiple serial lanes rather than parallel communications. They achieve high throughput by
> running the serial communications at very high frequencies rather than sending bits in parallel.

Serial communication, while seemingly slower at first glance, can actually achieve higher speeds over longer distances because it only needs to maintain timing on a single data line. This is why most modern high-speed computer interfaces have moved away from parallel to serial communications, often using multiple serial lanes when higher bandwidth is needed.

The tradeoff between serial and parallel communications is a perfect example of how engineering decisions in computer networking often involve balancing theoretical performance against practical limitations. In our further discussion of networking, we'll focus primarily on serial communications as they form the basis of most modern network interfaces.

### Serial clocks

The first problem to solve in order to make this work is how we ensure that both computers know when a one and a zero start and finish, serial connections rely on both computers knowing the rate at data is flowing.  In a simple system both computers can be configured to know the rate of transfer, say 9600 bits per second and they sample the data received at that rate and will typically be fine. For faster and more accurate transfer another wire with a clock signal is needed. The clock signal acts like a metronome, providing the timing reference that keeps both sender and receiver synchronised. This synchronisation ensures that bits are sampled at the correct moments to accurately interpret the data.

> The baud rate, measured in *symbols per second*, represents how many signal changes can occur on the communication
> channel in one second. While baud rate was historically equivalent to bits per second in early systems where each
> symbol represented one bit, some communication can encode more than one bit in a signal. For example, if we use four
> different voltage levels to represent two bits per symbol and operates at 1200 baud, it can achieve a data rate of 2400
> bits per second. This is only important so that you realise that while bit rate and baud are often used
> interchangeably they are not the same.

The relationship between clock signals and baud rate is intimate - one computer must generate a clock signal that matches the baud rate so both computers can sample their incoming data stream at the optimal points between signal transitions.

### That's two computers, how about n?

Connecting two computers with a serial connection is great but what about if you want to introduce a third node? The simplest answer is to use a full mesh topology where each computer node has a direct serial connection to the both of the other computer nodes.

```text
+--------+     +--------+
| Node A |-----| Node B |
+--------+     +--------+
    |             |
    |         +--------+
    +---------| Node C |
              +--------+
```

This really doesn't scale well though. You need one serial link to connect two nodes, three serial links to connect three nodes but for four you need six serial links. When you get to five computer nodes in full mesh you need ten serial links.

```text
+--------+      +--------+
| Node A |------| Node B |
+--------+      +--------+
     |     \  /       |
     |      \/        |
     |      /\        |
     |     /  \       |
+--------+      +--------+
| Node C |------| Node D |
+--------+      +--------+
```

> The formula for the number of connections between **n** computer nodes is n(n-1)/2 and the important thing to recognise
> in that forumla is that **n** is multiplied by **n** (OK, it's n-1 but who quibbles about the -1?) which makes it an
> exponential growth. Exponential growth is really bad when you get to big numbers and 50 computer nodes in a small
> office would need 1225 serial connections to be provisioned, configured and working.

## Addressing the problem

Now we have decided that point to point links in a full mesh are a bad idea we need to start connecting more than one device on the same shared wire. In order to do that we need to solve another problem first, and that's making sure that each device gets the right data and that's the start of addressing. If we have a shared wire with all the computers connected, perhaps with some sort of T shaped splitter, we can transmit from any computer node and it will be received by all of the other computer nodes. If we prefix each chunk of data with a destination address and each computer knows its own address then it can ignore data that is not meant for it. This probably sounds bonkers in the current climate of cybersecurity but we used to be a lot more trusting.

```text
Bus Topology
  ---T----T----T---
     |    |    |
     N1   N2   N3
```

Topologies like the single wire (bus topology) above are problematic. A break in the cable at any point will split your network into two separate networks which can't talk to each other. A ring topology will address this to some extent because a single break just turns a ring topology into a bus topology.

Having a star or a *hub and spoke* topology means that any single link failing results in a problem for that spoke only and not any of the others. The hub is a simple electrical repeater device which receives a signal from one computer node and repeats it to the other connected computer nodes. Each computer node receives every signal and if the destination address matches its own then it processes the data and if if doesn't then the data is ignored.

```text
Star Topology
     N1
     |
N2---H---N3
     |
     N4
```

### Frames and MAC addresses

In order to understand when the data for each destination starts and finishes it's useful to organise it, or frame it, in a discrete block with a start and a finish. Data frames have headers with the source and destination addresses and a marker at the end to show that the data payload has finished. The addresses are, like everything in networks, just numbers, but large numbers with trillions of possiblities which ensures they are unique.

> A MAC address (short for medium access control address or media access control address) is a unique identifier
> assigned to a network interface. It is a 48-bit address space which contains potentially 248 (over 281 trillion)
> possible MAC addresses. Blocks of addressing were historically allocated to network interface vendors to locally
> hardcode onto network interfaces; due to the sheer quantity of available addresses it's statistically unlikely that
> two devices on a network could ever have the same MAC addresss.

Now that we have our data organised into frames, our computer nodes connected to a hub and each one uniquely addressed we can start to scale out. We can connect hubs to hubs if we like because the data sent by one hub will be repeated to other hubs. One thing we can't do though is form loops of hubs because they are not clever enough to realise if a data frame is in an endless loop as it is repeated by each hub in the loop and then endlessly repeated to every computer node on the network. This is just one of the many ways we can get to some serious congestion in our hub and spoke network.

### Collisions

As we scale out our hub and spoke network we hit another problem, collisions. We need each computer node to take turns in sending data. This means that computer nodes listen for gaps in the data flow at the end of frames before they start sending their own frames. On occasions, two computers connected to a hub will both want to send data and both will listen for the end of a frame and then try to send their own frames at the same time. When two computer nodes send data at the same time the hub is not clever enough, as it's just a simple electrical repeater, to hold one frame for a bit while it transmits the other. When hubs detect more than one sender at a time they will reject both senders which causes them to stop sending and those senders will then wait a random amount of time (to avoid colliding again) before they attempt to transmit again.

As networks grow there will be an increase in the liklihood of collisions and there will also be a drop in performance because a lot of data is getting sent to computer nodes that will discard it as it is not meant for them.

## Switching to something cleverer

Instead of simple hubs which are just electrical repeaters, we need a device that can look at the destination MAC address, compare it to a table in memory and then send that data out of the correct interface where the destination computer node is connected. In order to do this we have more problems to solve. First of all we need to work out how to populate that table which stores MAC addresses and the ports they are associated with. The easiest way to do this is to look at the source MAC address of frames and associate them with the interfaces they are received on. If we get a frame with a destination MAC addres we don't know about then we can flood it to all interfaces and see which one the computer responds from. As this switching device is going to be a bit cleverer we will need to give it a processor and some memory, taking it from dumb electrical repeater that a hub was into a processing computer in its own right. With memory it can hold frames in a buffer while it looks in its MAC table to work out where to send them. It can also use that buffer in cases where the interfaces get congested.

### Congestion

Congestion happens where several computer nodes want to send data to one computer node at the same time. If two computer nodes are sending at their maximum interface capacity then the receiving computer would need twice as much interface capacity to receive it all. In some cases this is what we do but for the most part we would buffer the traffic as it comes in and then send it out as fast as we can until the buffer empties. If the congestion is sustained over a long period of time then traffic must be prioritised.

### MAC tables and why they don't scale

Maintaining a table of MAC addresses and the ports they are associated has some complexity and that complexity increases as a network scales. Imagine having to know the MAC address for every one of the billions of network devices on the internet and what port to use to get to it? Imagine having to flood the entire internet with a frame to find out which node responds to it? The upper limits to the number of devices on your network will be determined by the size of your MAC address table and the complexity of sorting and searching it.

> MAC tables, like the phone book, are a simple lookup search algoritm. The simplest way is to look at every entry,
> which means that you have to do **n** comparisons where **n** is the size of MAC table. If you sort the MAC table you
> can use cleverer algorithms that are more efficient to search the table but that means you have to sort the table again
> whenever there is a change to the network topology. This is why network loops can be so disasterous for a switch
> because it will see traffic from the same MAC address coming from more than one port and have to keep updating its MAC
> address table and ensuring it's sorted. Even the most efficient sort algorithms can be resource intensive when they
> are done over and over again.

## Finding the router

If our networks are limited by the size of the MAC address table we need to think of them as individual segments that can be joined up into larger networks. For this to work we need to have a more organised addressing system that means we can organise addresses into blocks have have a table of address blocks rather than individual addresses. Internet Protocol organises data into packets, which are similar to frames, which also have a source and a destination address. The common analogy is that the IP packet is an envelope, perhaps addressed to someone in another city, and the frame is the postman's bag that carries it to the post office. A person addresses the letter (packet) and hands it to the postman who puts it in their bag (the frame). That bag is carried to a sorting office (a router) where it is removed from the bag, inspected and put in another bag destined for the sorting office in the right city. Once it is received there the letter is inspected again and the address is compared to a table showing which addresses are on which delivery run and they are put in the appropriate post bag to be delivered.

This introduces a new device, a router, and the new addressing scheme, the Internet Protocol (IP) address. IP addresses are just 32 bit numbers but that means it can be between 0 and 4,294,967,295. Decimal notation isn't really that good for understanding the nuance of how these numbers are organised so we break the 32 bits into four chunks (or octets) of 8 bits and then represent those in decimal.

```text
If we take a dotted decimal IP address like 192.168.0.1 and convert each octet to binary we get 11000000.10101000.00000000.00000001. This is actually a representation of the single 32 bit number 11000000101010000000000000000001 or 3,232,235,521 in decimal. 
```

Our IP addresses can be grouped into networks by splitting the binary into a network, or subnet, portion and a host address portion. The network portion is the address of the network that contains the host and the host portion is the address of the computer node or host within that network. Routers need only maintain a list of routes to other networks and so know the route to every subnet or host within those networks. They also need to know the corresponding MAC address for each IP within their own local subnets but we'll get to that later.

> In the early days of IP there was a concept of address classes - their size dictated by their class. Now we don't
> use those classes so you will see CIDR (Classless Inter-Domain Routing) notation which uses the number of bits used in
> the network address to show which parts are the network address and which parts are the host address.

In a simple network where we have a CIDR of 10.0.0.0/24 we can look at the first 24 bits (conveniently the first three octets) as the network portion and the last 8 bits (the last octet) as the host portion. This means that the first 24 bits will stay the same and we can address our devices with the remaining 8 bits. With 8 bits we have a decimal number range of 0 to 255 inclusive but really we want to reserve the first and the last addresses, 0 and 255 for special purposes. We keep the 0 as the network address so we don't use that for a host and we keep the last as the broadcast address - that means anything sent to that address gets sent to every host on the network segment. That leaves us 254 other addresses (10.0.0.1 - 10.0.0.254) to allocate to our hosts. When you deal with different sized CIDR ranges it gets a bit more complicated because the number if bits doesn't always line up with the octets but the principle still applies.

Now with your new addressing scheme we need one more piece of information - where to send stuff that isn't on our local segment. Routers will have a routing table but for the end host computer they just need a default gateway address on their network segment to send things to if they aren't in their own network. Back in the postman analogy if you hand a letter to the postman that is addressed to someone on his round he'll probably just deliver it but if it's not then he will take it to your local sorting office, your default gateway to the postal routing system.

```text
In an example where our local host has an address of 10.0.0.1 and is on network 10.0.0.0/24 the network portion is 10.0.0.0 and the host portion is 1. The computer works that out using a subnet mask which comprises of 24 ones (from the 24 in the network address CIDR notation) and 8 zeros to make it up to a total of 32 bits. A 24 bit subnet mask is 11111111.11111111.11111111.00000000 or 255.255.255.0
If we use a logical AND on the subnet mask and the local host address 10.0.0.1 we get get the bits that appear in both

11111111.11111111.11111111.00000000
AND
00001010.00000000.00000000.00000001
gives
00001010.00000000.00000000.00000000

Now we do a logical AND with the subnet mask and the destination address 10.1.0.1 00001010.00000001.00000000.00000001

11111111.11111111.11111111.00000000
AND
00001010.00000001.00000000.00000001
gives
00001010.00000001.00000000.00000000

If we now compare those two network addresses, 10.0.0.0 and 10.1.0.0 they are different so know we need to send the packet to the default gateway. 
```

### The Address Configuration Problem

As our networks grow, we encounter a new scaling problem: how do we ensure every device gets the correct network configuration? For a network to function, each device needs:

1. A unique IP address (to avoid conflicts)
2. The correct subnet mask (to know what's local vs remote)
3. A default gateway address (to reach other networks)
4. DNS server addresses (to resolve names to addresses)

Manual configuration quickly becomes unmanageable:

```text
Network Admin's Challenge:
100 devices = 400 configuration items to track
1000 devices = 4000 configuration items to track
10000 devices = 40000 configuration items to track
```

Even in a small office with 50 devices, manual configuration presents several problems:

- Address conflicts when two devices are accidentally given the same IP
- Configuration errors when subnet masks don't match
- Lost connectivity when gateway addresses are typed incorrectly
- Wasted addresses when devices leave the network but their IPs aren't reassigned
- New devices can't connect until an administrator manually configures them

DHCP solves these problems through automation. It maintains a central pool of addresses and dynamically assigns them when devices join the network:

```text
Address Pool Management:
+-------------------+
| 192.168.1.1-50   | → Accounting Department
+-------------------+
| 192.168.1.51-100 | → Engineering Department
+-------------------+
| 192.168.1.101-150| → Available Pool
+-------------------+
| 192.168.1.151-200| → Reserved for Printers
+-------------------+
```

> The beauty of DHCP is that it solves both immediate and future problems. Not only does it handle initial
> configuration, but it also manages address reuse through lease times. When a device leaves the network, its
> address automatically returns to the pool after the lease expires.

### The Address Resolution Dilemma

Our network now has two addressing systems that need to work together:

- IP addresses (for logical network organization)
- MAC addresses (for physical frame delivery)

This creates a problem: when a device wants to send data to an IP address on its local network, how does it know which MAC address to put in the frame? Consider this scenario:

```text
Device A wants to send to 192.168.1.100
BUT
Frame needs a MAC address destination
AND
Device A only knows the IP address
```

Without a solution, every device would need a manually maintained table mapping every local IP to its MAC address - essentially the same scaling problem we had with MAC address tables in switches. Moreover, these mappings would need constant updates as devices join, leave, or change addresses.

ARP solves this through a dynamic discovery process:

```text
Problem: Who has 192.168.1.100?
+-----------------+     Broadcast     +------------------+
| Device A        |----------------->| Every Device     |
| "I need to find |                  | "Is this my IP?" |
|  192.168.1.100" |                  |                  |
+-----------------+                  +------------------+
                                           |
                        Unicast Response   |
                  <------------------------|
                  "Yes, that's me, here's 
                   my MAC address"
```

> ARP's elegant solution is to let devices discover mappings as needed and cache them temporarily. This
> addresses both the scaling problem (you only cache mappings you actually need) and the maintenance problem
> (cached entries expire automatically).

The real genius of ARP is how it handles network changes:

```text
Scenario: IP Address Changes
Before:
  192.168.1.100 → MAC: 00:11:22:33:44:55

After Device Moves:
  192.168.1.100 → MAC: AA:BB:CC:DD:EE:FF

Solution: Gratuitous ARP
  "Hey everyone, 192.168.1.100 is now at MAC AA:BB:CC:DD:EE:FF"
```

Both DHCP and ARP are examples of how networking protocols solve complex management problems through automation and discovery rather than manual configuration. They're critical pieces that make modern networks scalable and self-managing.

## Route finding

Once a packet has got to the router the router will then compare it to the route table. The biggest difference between the route table and the MAC table is that the route table has the path to whole networks as a single entry without having to list every single host. The network address that we discussed earlier, [with the CIDR prefix length](longest-prefix-matching.md), is used to locate the right path out of all the available paths. So long as each router along the path knows the way to the network that has the host in it they can pass the packet, wrapping it in a fresh frame for each hop, until it reaches the destination network's router and ARP allows it to send it directly to the host computer's MAC address. 