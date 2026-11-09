---
title: "Generally Available: Change Azure Database for PostgreSQL Flexible Server to a private endpoint-capable network configuration"
authors: simonpainter
tags:
  - azure
  - networks
  - private-link
  - migration
date: 2026-11-09
---

Azure Database for PostgreSQL Flexible Server now lets you move from virtual network integration to a network configuration that supports private endpoints. That gives you a way to use Azure Private Link without rebuilding the server, but the migration interrupts connectivity and can't be reversed.

The change doesn't create a private endpoint for you. Plan how clients will reconnect before you start, especially if they currently rely on the server being inside a delegated subnet.
<!-- truncate -->

## What it is

Servers deployed with private access use virtual network integration to run in a delegated subnet. This generally available change removes that integration and makes the server eligible for private endpoint connections instead.

The server is no longer inside your virtual network after migration. You must add a private endpoint and make sure clients can reach it, or enable public access and allow clients through firewall rules. Public access is disabled by default after the change.

Microsoft announced the update as generally available in [Azure Database for PostgreSQL Flexible Server networking](https://azure.microsoft.com/updates?id=574541). The [migration guide](https://learn.microsoft.com/azure/postgresql/network/how-to-migrate-vnet-private-endpoint-capable-server) covers the process and its effects.

## Who should care

This is for teams running PostgreSQL Flexible Server with virtual network integration who want to use private endpoints. A private endpoint gives clients a private IP address to connect to, and can suit network designs where the database needs private connectivity without being deployed into the client virtual network.

Check every client path before migrating. That includes application subnets, peered virtual networks, VPN or ExpressRoute-connected networks, and any logical replication subscribers.

## How to use it

You can make the change in the Azure portal under the server's **Networking** settings, or use Azure CLI:

```azurecli
az postgres flexible-server migrate-network \
  --resource-group <resource_group> \
  --name <server>
```

The server enters the **Updating** state. Check its state with:

```azurecli
az postgres flexible-server show \
  --resource-group <resource_group> \
  --name <server> \
  --query "state"
```

Once it is ready, [create a private endpoint connection](https://learn.microsoft.com/azure/postgresql/network/how-to-networking-servers-deployed-public-access-add-private-endpoint) and verify that clients resolve and reach the endpoint. If you choose public access instead, enable it and add firewall rules for the clients that need to connect.

## Gotchas and limits

Treat this as a one-way migration. Microsoft says it typically takes up to 20 minutes, and the server can be inaccessible for up to 10 minutes. Existing database connections close during the change, and new connections are rejected. The server stays inaccessible afterwards until you configure a private endpoint or public access with firewall rules.

If this server publishes logical replication, subscribers may lose their connection when the server leaves its delegated subnet. Restore a network path from each subscriber to the server's private endpoint before relying on replication again. Backups made before the change, including geo-redundant backups, remain available.

If Terraform manages the server, update the resource after migration. Remove `delegated_subnet_id`, or Terraform may plan to replace the server. Set `public_network_access_enabled` to match the server's actual setting, then run `terraform plan` and confirm it won't replace the server before applying anything.

## Quick takeaway

This is a supported route from virtual network integration to private endpoint connectivity, but it changes where the server sits in your network. Plan the cutover, endpoint and client paths first; once you migrate, you can't move the server back into a virtual network.
