---

title: ZTNA is so much better than VPN
authors: 
  - simonpainter
tags:
  - security
  - architecture
  - sdwan
  - zero-trust
  - networks

date: 2026-01-31

---

I distinctly remember the sales guy telling me how this magic box would mean that we could have secure network access that not only granted us access to the applications in our data centre but also ensured that the devices we user to connect were secure and compliant with our security polcies. He also assured us that each user would only be able to access the applications they were authorised to use and nothing else. This wasn't last week when I was talking to the folks at [zScaler](https://www.zscaler.com), it was back in 2008 and the product was a Cisco ASA with Cisco's Anyconnect VPN client.

Nowadays we talk about Zero Trust Network Access (ZTNA) as the solution to this very same problem, but is it really that different from the SSL VPNs of old?
<!--truncate-->
The problem I have with ZTNA is that all the collateral I see about it promises the same things I was promised back in 2008. Realistically those things never materialised for us back then, so what makes us thing that they will materialise now?

I have only ever seen one VPN deployment, in the late twentyteens, where VPN (Checkpoint in this case) was used to enforce application level access control. It was in a payment provider and we connected to our management desktops and the checkpoint client used our group membership to determine which management interfaces we could reach. This enforced both application level access control (on top of the privileged identity to log in to the device itself) and also ensured that legacy kit with poor encryption (for that was the trend back then) with weak ciphers or even telnet and http, could be secured at the network layer from prying snoopers.

The problem is, however, that this is basically exactly what ZTNA promises to do, and it was an edge case in my own experience because managing privileged access to a handful of management interfaces (for a very security conscious card payment provider) was more compeling than creating polcies for the hundreds of applications across hundreds or thousands of different user personas in a typical enterprise.

