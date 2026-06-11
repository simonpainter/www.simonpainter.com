---
title: "Retirement: Azure VPN Client for Linux (Preview) ends on 31 August 2026"
authors: simonpainter
tags:
  - azure
  - networks
  - security
date: 2026-06-11
---

Microsoft is retiring the **Azure VPN Client for Linux (Preview)** on **31 August 2026**. If you still rely on the `microsoft-azurevpnclient` package for point-to-site access into Azure, you've now got a clear deadline to move.

The important detail is what *isn't* changing. Your VPN Gateway or Virtual WAN gateway isn't being retired, and neither are the Windows or macOS Azure VPN clients. This is only about the Linux preview client.

If you've got Linux users connecting with Microsoft Entra ID, this matters more than it first appears. The supported Linux replacements don't offer that same Entra ID path, so this isn't just a package swap. For some teams it's a small tidy-up. For others it's a design change.

<!-- truncate -->

## What it is

Microsoft says the Linux client stayed in preview and doesn't have a path to general availability. Rather than keep an unsupported preview hanging around like an old ladder in the garage, Microsoft is retiring it and pushing Linux users towards supported open-source clients instead.

The supported replacements are:

- **OpenVPN** for OpenVPN tunnel type with certificate authentication
- **strongSwan** for IKEv2 with certificate or RADIUS authentication

That applies to both **Azure VPN Gateway** and **Azure Virtual WAN** point-to-site connections.

## Who should care

You should care if you have Linux laptops, jump boxes, admin workstations, or developer machines that connect to Azure over point-to-site VPN. If you publish a VPN profile and tell Linux users to install the Azure VPN Client package, you're in scope.

This is most urgent if your Linux users authenticate with **Microsoft Entra ID** today. Microsoft is explicit here: the supported Linux alternatives don't support Entra ID with Azure P2S. If Linux access depends on that flow, you'll need to redesign the auth method or move those users to a supported client platform.

If you're already using certificate-based OpenVPN, the move may be simple. If you're using Entra ID only, the change is closer to swapping the lock, not just the key.

## How to use it

In practice, this means planning a migration rather than waiting for the retirement date to sneak up on you.

Start by checking which tunnel type and auth method your current point-to-site setup uses. Then map it to one of the supported Linux paths:

| Current need | Supported Linux path |
| --- | --- |
| OpenVPN with certificate auth | OpenVPN client |
| IKEv2 with certificate auth | strongSwan |
| IKEv2 with RADIUS auth | strongSwan |
| Microsoft Entra ID on Linux | Redesign required |

For a certificate-based migration, one sensible step is to generate a fresh VPN client package from the gateway after you update the gateway settings. Microsoft's Azure CLI example looks like this:

```bash
VPN_CLIENT=$(az network vnet-gateway vpn-client generate \
  --resource-group myResourceGroup \
  --name myVpnGateway \
  --authentication-method EAPTLS | tr -d '"')

curl "$VPN_CLIENT" --output vpnClient.zip
unzip vpnClient.zip
```

That won't solve the whole migration on its own, but it gives you the new client material you need for a certificate-based Linux rollout.

At a high level, the migration path is:

1. Enable the right tunnel type and auth method on the gateway.
2. Generate a new client profile package.
3. Install and test OpenVPN or strongSwan on Linux devices.
4. Roll the change out before 31 August 2026.
5. Remove the retired Azure VPN Client for Linux package.

## Gotchas and limits

There are a few catches worth calling out.

The biggest one is **Microsoft Entra ID**. The preview Linux client was the Linux path for Entra ID authentication. OpenVPN and strongSwan don't replace that directly, so if that's your current setup you need a proper migration plan, not a like-for-like swap.

The second is gateway configuration. If your gateway already uses **OpenVPN with certificates**, Microsoft says you can move to the open-source OpenVPN client without changing the gateway. If you want to move to **strongSwan**, you need **IKEv2** enabled. If your setup is **Entra ID only**, you'll also need to enable **certificate** or **RADIUS** authentication.

There's also an operational point here. Microsoft says the package is being removed from the Microsoft Linux repository. Even if an existing install keeps working for a while, you shouldn't treat that as supportable production access.

One small upside is distro support. The preview Azure VPN Client for Linux was limited to Ubuntu 20.04 and 22.04. OpenVPN and strongSwan work across a much wider range of Linux distributions, which may make your long-term client story cleaner.

## Quick takeaway

This retirement is narrow, but the knock-on effect can be wide. Azure isn't retiring VPN Gateway or Virtual WAN point-to-site. It's retiring one preview Linux client.

If your Linux users are already on certificate-based OpenVPN, this should be manageable. If they depend on Microsoft Entra ID, start planning now. August 2026 sounds far away until it's the change window you've left yourself.

## Links

- Official announcement: [Retirement: Azure VPN Client for Linux (Preview) will be retired on August 31, 2026](https://azure.microsoft.com/updates?id=565393)
- Learn: [Azure VPN Client for Linux retirement overview and migration guide for VPN Gateway](https://learn.microsoft.com/azure/vpn-gateway/azure-vpn-client-linux-retirement)
- Learn: [Azure VPN Client for Linux retirement overview and migration guide for Virtual WAN](https://learn.microsoft.com/azure/virtual-wan/azure-vpn-client-linux-retirement)
- Learn: [Configure OpenVPN client for P2S certificate authentication on Linux](https://learn.microsoft.com/azure/vpn-gateway/point-to-site-vpn-client-certificate-openvpn-linux)
- Learn: [Configure strongSwan for P2S IKEv2 on Linux](https://learn.microsoft.com/azure/vpn-gateway/point-to-site-vpn-client-certificate-ike-linux)
- Learn: [Azure VPN Client versions for Windows and macOS](https://learn.microsoft.com/azure/vpn-gateway/azure-vpn-client-versions)
