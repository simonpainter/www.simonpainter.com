---
title: Building Azure Multicloud Interconnect to AWS
authors:
  - simonpainter
tags:
  - expressroute
  - azure
  - aws
date: 2026-09-19
---

A few weeks ago I wrote about [the cross connect I didn't have to build](/the-cross-connect-i-didnt-have-to-build), which was me being pleased that Azure Multicloud Interconnect had finally landed in preview. Being pleased about a product announcement is not the same as having built the thing, so this weekend I sat down and built it.

Credit where it's due: I was prompted to stop reading and start clicking by [Yusuke Matsumoto's hands-on write-up on blog.aimless.jp](https://blog.aimless.jp/archives/2026/09/azure-multicloud-interconnect/), which beat me to the lab by a fortnight. If you read Japanese, go and read the original. It's a tidy piece of work and it saved me an afternoon of guessing. What follows is my own build and, in rather greater quantity than planned, my own mistakes.

<!-- truncate -->

## What we're building

The topology is simple, which is the whole point. There's a VNet in Azure with an ExpressRoute gateway, a VPC in AWS with a Direct Connect gateway, and a managed interconnect in the middle that neither of us has to rack.

```mermaid
flowchart LR


subgraph vnet["Azure VNET<br>10.10.0.0/16"]
   ergw["ExpressRoute Gateway"]
end

er_conn["ExpressRoute Connection"]
dxgw["Direct Connect Gateway"]

subgraph peering["Dual Peering Locations"]
  er_int["ExpressRoute type Interconnect"]
  dx_int["AWS Interconnect - multicloud"]
end
subgraph vpc["AWS VPC<br>10.0.0.0/16"]
   vpg["Virtual Private Gateway"]
end

ergw --- er_conn
er_conn --- er_int
er_int ---|"This is where the magic happens"| dx_int
dx_int --- dxgw
dxgw --- vpg


```

The bit in the middle used to be a colo cage, a pair of my routers and a monthly cross connect bill. Now it's two resources and an activation key.

A note on shells before we start. The Azure commands below were run in Azure Cloud Shell with PowerShell, so line continuation is a backtick. The AWS commands were run in AWS CloudShell, which is bash, so it's a backslash. And the Azure CLI takes `-o table` where the AWS CLI wants `--output table` and will tell you so at length.

## Before you start

You need the ordinary furniture at both ends. None of this is specific to the interconnect.

1. **Pick a supported region pair.** Preview regions on the Azure side are Australia East, East US, Germany West Central and West US, per [Microsoft's availability and limits page](https://learn.microsoft.com/azure/multicloud-interconnect/availability-limits). I used Germany West Central, which pairs with eu-central-1. Bandwidth in preview is 1 Gbps and nothing else. AWS limits you to one preview interconnect per region.
2. **Check your address space.** Non-overlapping ranges either side is a documented prerequisite, not a suggestion. Mine is `10.10.0.0/16` in Azure and `10.0.0.0/16` in AWS, which is close enough to make you look twice and different enough to be fine.
3. **Azure: a VNet with a `GatewaySubnet` and an ExpressRoute gateway, in the same region as the interconnect.** The same region part is not optional, for reasons we'll get to. The gateway takes its usual geological age to deploy, so start it first.

   ```powershell
   az network vnet-gateway create `
     -g lab-simon-interconnect `
     -n lab-simon-vng-interconnect `
     --vnet vnet-lab-hub `
     --gateway-type ExpressRoute `
     --sku ErGw1AZ `
     --location germanywestcentral
   ```

4. **AWS: a VPC with a virtual private gateway attached.**

   ```bash
   aws ec2 create-vpn-gateway --type ipsec.1 --amazon-side-asn 64512 --region eu-central-1

   aws ec2 attach-vpn-gateway \
     --vpn-gateway-id <vgw-id> \
     --vpc-id <vpc-id> \
     --region eu-central-1
   ```

5. **AWS: a Direct Connect gateway.** I created mine inline during step 2 below, but here's the CLI if you'd rather have it ready. The Amazon side ASN matters later, because it's what Azure sees in the AS path, so pick something deliberate rather than accepting a default you'll have to look up again in twenty minutes. Mine is 65534, and the virtual private gateway is on 64512.

   ```bash
   aws directconnect create-direct-connect-gateway \
     --direct-connect-gateway-name interconnect-dxgw \
     --amazon-side-asn 65534 \
     --region eu-central-1
   ```

6. **Have your twelve digit AWS account ID to hand.**

   ```bash
   aws sts get-caller-identity --query Account --output text
   ```

## Step 1: create the interconnect in Azure

Either cloud can start the process and generate the activation key for the other to redeem. I started in Azure and claimed the key on the AWS side.

The entry point isn't where you'd expect. You don't start from the ExpressRoute blade, even though a circuit is what you end up with. [Microsoft's create article](https://learn.microsoft.com/azure/multicloud-interconnect/create-interconnect) sends you via **Hybrid connectivity**, then **Azure Multicloud Interconnect** in the left menu, then **Set up Azure Multicloud Interconnect**.

1. On the setup page, choose **Create Multicloud Interconnect Circuit**.
2. On the **Configuration** tab, pick your subscription and resource group.
3. Under **Port details**, set **Port type** to **Azure Multicloud Interconnect**. This is the fork in the road that turns a normal circuit into an interconnect.
4. Name the circuit, then set **Multicloud provider**, **Region** and **Bandwidth**. In my case AWS, Germany West Central and 1 Gbps. There's a **View region mapping** link that tells you which provider region each Azure region pairs with, which is worth a look before you commit to one.
5. Under **Activation key**, choose **Generate**.
6. Enter the **Account ID** for your provider account: the twelve digit AWS account ID from the prerequisites. This is how Azure knows which AWS account is allowed to claim the other end. Without it you'd have an activation key floating about that anyone could redeem, which would be a bad day for everyone.
7. **Review + create**, then **Create**. Open the resource afterwards and copy the **activation key** from the overview page.

Now go and look at what you've made:

```powershell
az network express-route show `
  -g lab-simon-interconnect `
  -n lab-simon-interconnect-1 `
  --query "{circuit:circuitProvisioningState, provider:serviceProviderProvisioningState, sku:sku, location:location}"
```

```json
{
  "circuit": "Enabled",
  "location": "germanywestcentral",
  "provider": "Provisioned",
  "sku": {
    "family": "MeteredData",
    "name": "MultiCloud_MeteredData",
    "tier": "MultiCloud"
  }
}
```

That output is from after activation. Before it, the provider state won't be `Provisioned` yet.

The full JSON has a few more things worth a look:

```json
"serviceProviderProperties": {
  "bandwidthInMbps": 1000,
  "peeringLocation": "germanywc",
  "serviceProviderName": "AWS"
},
"tags": {
  "MultiCloudCircuit": "true",
  "MultiCloudProvider": "AWS",
  "MultiCloudRegion": "germanywc"
}
```

The peering location is `germanywc`, in the style of the classic ExpressRoute peering locations rather than an Azure region name. This is where the two clouds physically meet, not where your gateway lives. The tags are applied for you. I'd leave them alone, on the basis that something in the portal is probably reading them.

The surprise here is that there isn't a new resource type. Multicloud Interconnect is `Microsoft.Network/expressRouteCircuits`, the same type you've been deploying for years. What changes is the SKU, with tier `MultiCloud` instead of `Local`, `Standard` or `Premium`, a service provider of `AWS` rather than a carrier name (which I find quietly satisfying), and a partner account ID property that has no equivalent on a normal circuit.

This matters later, so I'll say it now: because there is no separate resource type, there is nothing else to go looking for. [Microsoft's overview](https://learn.microsoft.com/azure/multicloud-interconnect/overview#how-you-set-up-an-interconnect) describes setup as four stages, the first being "create an ExpressRoute circuit and select the port type" and the second being "create the Azure Multicloud Interconnect resource", which reads like two things. It isn't. Follow the create article and both stages happen in the same form. I spent a while convinced I'd missed the second one. A Resource Graph query for anything with `interconnect` or `multicloud` in the type returns zero rows, and that is the correct answer. The circuit is the interconnect.

On the SKU family: `MeteredData` implies outbound data charges on top of the circuit. During preview [Microsoft says](https://learn.microsoft.com/azure/multicloud-interconnect/availability-limits#pricing) there is no interconnect service charge and no Azure egress charge, so the name isn't describing the bill I'm getting. Whether it describes the bill anyone gets at GA is a more interesting question, and I come back to it at the end.

## Step 2: accept it in AWS

1. Log into the AWS account whose ID you gave Azure. If the key is rejected later, the overwhelmingly likely cause is that you're in a different account. The provider, region, bandwidth and account all have to match or provisioning never starts.
2. Open the **Direct Connect console** and choose **AWS Interconnect** in the navigation pane.
3. Choose **Accept multicloud Interconnect**.
4. Paste the activation key from Azure. AWS validates it as you paste and shows you what it thinks it's accepting: provider, bandwidth, its own region and the provider's region. Check those against what you built, then choose **Next**.

   ![AWS console Enter activation key page. A base64 activation key has been pasted into the Accept Multicloud Interconnect box and a green message reads Activation key is valid. Below it, Multicloud Interconnect details show Provider Microsoft Azure (Preview), Bandwidth 1Gbps, Region eu-central-1 and Provider Region germanywestcentral.](img/building-azure-multicloud-interconnect-to-aws/aws-enter-activation-key.png)

5. Give the interconnect a description and pick the **Direct Connect gateway** to use as the attach point. If you don't have one, **Create DXGW** opens a panel alongside where you give it a name and an Amazon side ASN, then refresh the dropdown and select it. Bandwidth is greyed out at this point: it was fixed when the interconnect was created on the Azure side and can't be changed during acceptance. Choose **Next**.

   ![AWS console Configure interconnect page. Interconnect description is set to AWS-Azure, Bandwidth is fixed at 1Gbps and greyed out, and the Direct Connect gateway dropdown is empty with a Required error and a Create DXGW button beneath it. A side panel titled Direct Connect gateway settings shows Name lab-simon-dxg and Amazon-side ASN 65534, with valid ranges 64512 to 65534 and 4200000000 to 4294967294.](img/building-azure-multicloud-interconnect-to-aws/aws-configure-interconnect-dxgw.png)

6. Review and choose **Finish**.

A small aside on that activation key. AWS asks for "a base64-encoded activation key", which is an invitation. The start of mine decodes to this:

```bash
echo '<activation-key>' | base64 -d
```

```json
{
  "version": 1,
  "destinationEnvironmentUri": "https://partner-interconnect.eu-central-1.api.aws/providers/azure/environments/aws-azure-env-1-germany-wc",
  "sharedConnectionUuid": "<shared-id>",
  "connectionSizeMbps": 1000,
  ...
}
```

So it isn't an opaque token. It's a small JSON document naming the AWS partner API endpoint for this environment, the connection size, and a shared connection UUID that both clouds use to refer to the same thing. There's more after that, which I'd guess includes the destination account, given that's one of the things validation checks. This is the open interoperability spec AWS published showing through, and it's rather nice to be able to read it.

If you'd rather start from AWS, it's the mirror image: **Create new multicloud Interconnect**, pick Azure, pick the two regions, give it your Azure identifier, and AWS hands you a key to redeem on the Azure side. Microsoft covers that direction in [Redeem an activation key](https://learn.microsoft.com/azure/multicloud-interconnect/redeem-activation-key). AWS notes that for providers in preview you may need the CLI to complete activation on the other side.

This is the part that used to be an LOA-CFA, a cross connect order and a fortnight of waiting. It took about four minutes.

Check it from the CLI. AWS Interconnect has its own namespace, `aws interconnect`, and you need a recent AWS CLI v2 for it to exist.

```bash
aws interconnect list-connections --region eu-central-1
```

```json
{
    "connections": [
        {
            "id": "mcc-xxxxxxxx",
            "description": "AWS-Azure",
            "bandwidth": "1Gbps",
            "attachPoint": {
                "directConnectGateway": "<dxgw-id>"
            },
            "environmentId": "mce-aws-azure-fra-prod",
            "provider": {
                "cloudServiceProvider": "azure"
            },
            "location": "germanywestcentral",
            "type": "Multicloud",
            "state": "available",
            "sharedId": "<shared-id>"
        }
    ]
}
```

The state is the thing to read. `requested` means created but not accepted on the partner side, `pending` means it's being provisioned between the two clouds, and `available` means done. A minute or two after AWS reaches `available`, the Azure circuit flips to `Provisioned`.

One red herring for later: the `sharedId` here does not match the `serviceKey` on the Azure circuit, which briefly had me wondering whether I'd paired the wrong things. It's the `sharedConnectionUuid` from inside the activation key. If you need to prove which Azure circuit an AWS connection belongs to, decode the key, don't compare service keys.

## Step 3: finish the AWS side

The interconnect on its own is a dead end. It's the equivalent of having a patch lead in the rack with nothing plugged into the far end. It needs attaching to something that knows about your VPCs.

The attachment to the Direct Connect gateway was done for you in step 2. There's no VLAN to pick and no BGP ASN to type in. If you look at the gateway's attachments, the connection turns up dressed as a private virtual interface, with the connection ID where the VIF ID would be:

```bash
aws directconnect describe-direct-connect-gateway-attachments \
  --direct-connect-gateway-id <dxgw-id> \
  --region eu-central-1
```

```json
{
    "directConnectGatewayAttachments": [
        {
            "directConnectGatewayId": "<dxgw-id>",
            "virtualInterfaceId": "mcc-xxxxxxxx",
            "virtualInterfaceRegion": "eu-central-1",
            "attachmentState": "attached",
            "attachmentType": "privateVirtualInterface"
        }
    ]
}
```

What you still own is the other side of the Direct Connect gateway.

1. **Find your virtual private gateway and VPC CIDR.**

   ```bash
   aws ec2 describe-vpn-gateways --region eu-central-1 \
     --query "VpnGateways[].{id:VpnGatewayId,state:State,asn:AmazonSideAsn,vpc:VpcAttachments[0].VpcId,attach:VpcAttachments[0].State}" \
     --output table

   aws ec2 describe-vpcs --region eu-central-1 \
     --query "Vpcs[].{id:VpcId,cidr:CidrBlock,name:Tags[?Key=='Name']|[0].Value}" \
     --output table
   ```

2. **Associate the Direct Connect gateway with the virtual private gateway.** The allowed prefixes are what gets advertised towards Azure, so this is your VPC CIDR. For a transit gateway, use its ID as the gateway ID instead.

   ```bash
   aws directconnect create-direct-connect-gateway-association \
     --direct-connect-gateway-id <dxgw-id> \
     --gateway-id <vgw-id> \
     --add-allowed-prefixes-to-direct-connect-gateway cidr=10.0.0.0/16 \
     --region eu-central-1
   ```

3. **Wait for it to reach `associated`.** A few minutes.

   ```bash
   aws directconnect describe-direct-connect-gateway-associations \
     --direct-connect-gateway-id <dxgw-id> \
     --region eu-central-1 \
     --query "directConnectGatewayAssociations[].{state:associationState,gw:associatedGateway.id,prefixes:allowedPrefixesToDirectConnectGateway[].cidr}"
   ```

4. **Enable route propagation on the VPC route tables.** Easy to skip, and skipping it produces a working BGP session with no routes in the table, which is a confusing way to spend half an hour.

   ```bash
   aws ec2 describe-route-tables --region eu-central-1 \
     --filters "Name=vpc-id,Values=<vpc-id>" \
     --query "RouteTables[].{id:RouteTableId,propagating:PropagatingVgws[].GatewayId}"

   aws ec2 enable-vgw-route-propagation \
     --route-table-id <rtb-id> \
     --gateway-id <vgw-id> \
     --region eu-central-1
   ```

   Substitute the placeholders before you paste. In bash, `<rtb-id>` is an input redirect from a file called `rtb-id`, and the error you get for it, `rtb-id: No such file or directory`, is not as self-explanatory as it might be. I know this now.

Reader, the first time round I did not do item 2. I had the interconnect attached to the Direct Connect gateway, a virtual private gateway attached to the VPC, and nothing joining the two. Having just written a paragraph about patch leads with nothing plugged into the far end, I had built exactly that one hop further along. More on how I found out below.

## Step 4: connect the ExpressRoute gateway

### It behaves like a Local circuit

Matsumoto's first attempt was to connect his `useast` circuit to a gateway in Japan East, and the error he got back is worth reading properly:

```
ErrorCode: InvalidParameter
ErrorMessage: The creation of the virtual network gateway connection failed
because your circuit in useast cannot be connected to Japan East on a Local
circuit. A Local ExpressRoute circuit can only connect to a designated
Azure region. Please upgrade the circuit to Standard SKU or Premium SKU.
```

So Multicloud Interconnect behaves like a Local SKU circuit. It reaches the Azure region associated with its peering location, and nothing else. The advice to upgrade to Standard or Premium is boilerplate from the classic ExpressRoute code path and doesn't apply here. There is no Standard tier of Multicloud Interconnect to upgrade to.

Microsoft's product page words this as a preview limitation: connections only to gateways in the local region, no cross-region. I'm less sure it's a wrinkle to wait out. Local SKU circuits don't charge for outbound data, and Microsoft is unlikely to carry AWS traffic across their backbone for free. Plan for it: the interconnect lands in a region, and if you want other Azure regions to use it, that's what VNet peering and your hub design are for.

I'd read Matsumoto's post, so my gateway was already in Germany West Central alongside the circuit. That was the last thing to go smoothly.

### What the portal did

The intended route is the portal, and the portal has been taught about this. **Create connection** now has a dedicated connection type, **MultiCloud Interconnect**, alongside the usual VPN and ExpressRoute options.

![Azure portal Create connection page on the Basics tab. Subscription is Lab - MVP Azure Credit, resource group is lab-simon-interconnect, and the Connection type dropdown is set to MultiCloud Interconnect.](img/building-azure-multicloud-interconnect-to-aws/azure-create-connection-multicloud-type.png)

So far so promising. On the Settings tab, the virtual network gateway dropdown listed my gateway, in the right resource group and the right region, and wouldn't let me select it.

![Azure portal connection settings. The Virtual network gateway dropdown is open and lists lab-simon-vng-interconnect, resource group lab-simon-interconnect, location germanywestcentral, but the entry is greyed out and cannot be selected.](img/building-azure-multicloud-interconnect-to-aws/azure-gateway-greyed-out.png)

The ExpressRoute circuit dropdown did the same thing with `lab-simon-interconnect-1`, in both the standard form and the "Connection 2 Details" form you get with maximum resiliency selected.

![Azure portal Connection 2 Details form. The ExpressRoute circuit dropdown is open and lists lab-simon-interconnect-1 in resource group lab-simon-interconnect, but the entry is greyed out and cannot be selected.](img/building-azure-multicloud-interconnect-to-aws/azure-circuit-greyed-out.png)

The tooltip on the circuit field offered this:

![Azure portal tooltip on the ExpressRoute circuit field reading: Choose a circuit to connect to. Ensure your circuit is provisioned and has AzurePrivatePeering enabled.](img/building-azure-multicloud-interconnect-to-aws/azure-circuit-tooltip.png)

One gateway, one circuit, both present, both greyed out. A form with two fields and no permitted values for either.

Try the portal first. If it works for you, lovely. If not, do this.

### Creating the connection from the CLI

1. **Make sure the CLI is pointed at the subscription that holds the circuit and the gateway.** My first command came back with `ResourceGroupNotFound` for a resource group I was looking at in the portal, because Cloud Shell had other ideas.

   ```powershell
   az account show --query "{name:name, id:id}" -o table
   az account set -s <subscription-id>
   ```

2. **Get the circuit's resource ID.**

   ```powershell
   $circuitId = az network express-route show `
     -g lab-simon-interconnect `
     -n lab-simon-interconnect-1 `
     --query id -o tsv
   ```

3. **Create the connection.**

   ```powershell
   az network vpn-connection create `
     -g lab-simon-interconnect `
     -n conn-vng-to-interconnect `
     --vnet-gateway1 lab-simon-vng-interconnect `
     --express-route-circuit2 $circuitId `
     --routing-weight 0
   ```

4. **Check it.**

   ```powershell
   az network vpn-connection list -g lab-simon-interconnect `
     --query "[].{name:name, state:provisioningState, weight:routingWeight}" -o table
   ```

   ```
   Name                      State      Weight
   ------------------------  ---------  --------
   conn-vng-to-interconnect  Succeeded  0
   ```

It worked first time. The same circuit the portal wouldn't let me select, connected to the same gateway, with no complaint from the API at all.

No peering configuration, no VLAN ID, no point-to-point /30s, no MD5 key, no shared secret to email to someone. The private peering is created and managed for you. Coming from a world where I've typed out `10.x.x.x/30` primary and secondary subnets more times than I'd like to admit, this feels like cheating. The price of the cheating, at least in preview, is that when it doesn't work there's correspondingly little for you to look at.

## How I worked out what was wrong

The steps above are the clean version. The order I actually discovered them in was less dignified, and I'm writing the trail down because most of it is reusable the next time a preview portal shrugs at you.

The tooltip named two conditions. Provisioned I could tick off. So, the peerings:

```powershell
az network express-route peering list `
  -g lab-simon-interconnect `
  --circuit-name lab-simon-interconnect-1 -o table
```

Empty. No AzurePrivatePeering, which matches the tooltip exactly and explains the portal's behaviour, if not the underlying cause. The circuit itself was healthy: Enabled, Provisioned, MultiCloud tier, supported region, same region as the gateway.

On a normal circuit you'd go and create the peering. Here you can't sensibly do that, because the VLAN, the /30s and the ASNs are managed between Microsoft and AWS, and anything I typed in would at best be rejected and at worst not match what AWS had configured. Don't.

I then lost some time looking for the interconnect resource I assumed I'd forgotten to create. As above, there isn't one.

There's a relevant line buried in the [classic ExpressRoute documentation](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-howto-linkvnet-portal-resource-manager): where a layer 3 provider configures your peerings, the BGP configuration doesn't show up on your side, and you should still be able to create connections once the circuit is provisioned. A managed interconnect is that same arrangement with AWS playing the layer 3 provider. Which raised the possibility that the portal was validating for something a managed circuit never exposes.

Before blaming the portal, though, I wanted proof that the AWS end was actually finished, so I worked along it with the commands from steps 2 and 3. The connection was `available`, with provider, location and bandwidth all matching the Azure circuit. The Direct Connect gateway attachment was `attached`. And then:

```json
{
    "directConnectGatewayAssociations": []
}
```

There's the patch lead. The interconnect was attached to a Direct Connect gateway that wasn't associated with anything, so no VPC was reachable and no prefixes were being advertised towards Azure. Even with a working Azure connection I'd have learned precisely nothing. I created the association, watched it reach `associated`, and went back to Azure to create the connection from the CLI. It succeeded, BGP came up and routes arrived.

So was the missing association what the portal was complaining about? No. With everything working, the peering list is still empty:

```powershell
az network express-route peering list `
  -g lab-simon-interconnect `
  --circuit-name lab-simon-interconnect-1 -o table
```

Nothing. But the full circuit JSON tells a different story, because there is a peering in there after all:

```json
"peerings": [
  {
    "azureASN": 12076,
    "connections": [],
    "lastModifiedBy": "Customer",
    "name": "AzurePrivatePeering",
    "peerASN": 0,
    "peeringType": "AzurePrivatePeering",
    "primaryAzurePort": "",
    "provisioningState": "Succeeded",
    "secondaryAzurePort": "",
    "state": "Disabled",
    "vlanId": 675
  }
]
```

An AzurePrivatePeering that exists, has a VLAN, reports a peer ASN of zero, claims no connections and says it is `Disabled`. All while four BGP sessions are up across it and carrying routes. The `lastModifiedBy` of `Customer` is a nice touch, given the customer has never been near it.

That, I think, is most of the answer. The portal's circuit dropdown wants a circuit with private peering enabled. A managed interconnect reports its peering as `Disabled`, presumably because the real configuration lives somewhere the customer-facing object doesn't reflect. The portal believes the object. The API that actually creates the connection doesn't check, or checks something else.

It doesn't explain the gateway being greyed out as well, mind. Nothing about a circuit's peering state should stop you selecting a perfectly healthy ErGw1AZ gateway in the same region. So either there's a second validation failing for its own reasons, or the MultiCloud Interconnect connection blade simply isn't finished. Either way it's a preview gap between the portal and the resource provider rather than anything wrong with the build, and worth reporting.

Two caveats, in the interest of honesty. I fixed the AWS association before I ran the CLI create, so I can't prove the create would have succeeded without it, though I can't see why the Azure resource provider would care about an association on the far side of AWS's Direct Connect gateway. And I can't cleanly re-test the dropdown now, because a circuit that's already connected to the gateway would be greyed out for that reason instead.

What the missing association would definitely have done is leave me with a connected circuit and an empty route table. So it was a real fault, just not the one I was chasing.

### The short version

If the circuit is greyed out in the portal:

1. Check your CLI is in the right subscription, and that the circuit and gateway share one.
2. Check the circuit is `Enabled` and `Provisioned`, MultiCloud tier, and in the same region as the gateway.
3. Don't go looking for a separate interconnect resource. There isn't one.
4. Don't create private peering by hand. An empty `peering list`, or a peering showing `Disabled` in the circuit JSON, is apparently what healthy looks like here.
5. On AWS, confirm the connection is `available`, the Direct Connect gateway attachment is `attached`, and the gateway association to your VGW or TGW is `associated` with the right allowed prefixes.
6. Create the connection from the CLI and read the error, if there is one. The dropdown greys things out; the API tells you why.

## Checking it actually works

Two clouds claiming success in their respective consoles is not evidence. Routes in tables is evidence.

### Azure learned routes

```powershell
az network vnet-gateway list-learned-routes `
  -g lab-simon-interconnect `
  -n lab-simon-vng-interconnect -o table
```

```
Network       NextHop    Origin    SourcePeer    AsPath       Weight
------------  ---------  --------  ------------  -----------  --------
10.10.0.0/16             Network   10.10.1.13                 32768
10.0.0.0/16   10.10.1.7  EBgp      10.10.1.7     12076-65534  32769
10.0.0.0/16   10.10.1.4  EBgp      10.10.1.4     12076-65534  32769
10.0.0.0/16   10.10.1.6  EBgp      10.10.1.6     12076-65534  32769
10.0.0.0/16   10.10.1.5  EBgp      10.10.1.5     12076-65534  32769
```

Three things worth pulling out of that.

The AS path is `12076-65534`. 12076 is Microsoft's ASN, the one that's always sat at the Azure end of an ExpressRoute private peering. 65534 is the Amazon side ASN on my Direct Connect gateway. Note that it is not 64512, the ASN on the virtual private gateway: the Direct Connect gateway is what speaks to the outside world, and the gateway behind it never appears in the path. Two hops, no transit AS in between, which is the whole product in eleven characters.

There are four next hops for the same prefix. The BGP peer status confirms four established sessions:

```powershell
az network vnet-gateway list-bgp-peer-status `
  -g lab-simon-interconnect `
  -n lab-simon-vng-interconnect -o table
```

```
Neighbor    ASN    State      ConnectedDuration    RoutesReceived    MessagesSent    MessagesReceived
----------  -----  ---------  -------------------  ----------------  --------------  ------------------
10.10.1.4   12076  Connected  00:06:53.1198960     1                 18              19
10.10.1.5   12076  Connected  00:06:57.3042342     1                 20              19
10.10.1.6   12076  Connected  00:06:54.7825062     1                 18              19
10.10.1.7   12076  Connected  00:06:57.2261057     1                 18              18
```

That matches what Matsumoto saw, and it fits the four-link architecture Microsoft draws in the overview. Genuine path redundancy without having ordered two of anything. On a traditional build that's two circuits, two cross connects and two sets of BGP config.

The weight of 32769 on the learned routes against 32768 on the connected VNet range is standard ExpressRoute behaviour. The local VNet prefix still wins for local destinations, as it should.

### AWS route propagation

From the other direction, looking at the VPC's route tables:

```bash
aws ec2 describe-route-tables --region eu-central-1 \
  --filters "Name=vpc-id,Values=<vpc-id>" \
  --query "RouteTables[].{id:RouteTableId,routes:Routes[].{dst:DestinationCidrBlock,gw:GatewayId,origin:Origin,state:State}}"
```

```json
[
    {
        "id": "rtb-073d022e421b3296b",
        "propagating": ["vgw-03b396b82b3024d70"],
        "routes": [
            { "dst": "10.0.0.0/16", "gw": "local", "origin": "CreateRouteTable", "state": "active" },
            { "dst": "10.10.0.0/16", "gw": "vgw-03b396b82b3024d70", "origin": "EnableVgwRoutePropagation", "state": "active" }
        ]
    },
    {
        "id": "rtb-053c9963c332a16b9",
        "propagating": ["vgw-03b396b82b3024d70"],
        "routes": [
            { "dst": "10.0.0.0/16", "gw": "local", "origin": "CreateRouteTable", "state": "active" },
            { "dst": "0.0.0.0/0", "gw": "igw-078c7d5071c32d94c", "origin": "CreateRoute", "state": "active" },
            { "dst": "10.10.0.0/16", "gw": "vgw-03b396b82b3024d70", "origin": "EnableVgwRoutePropagation", "state": "active" }
        ]
    }
]
```

`EnableVgwRoutePropagation` as the origin is the bit that matters. That route wasn't typed in by me, it arrived over BGP from Azure and AWS installed it automatically. I can vouch for the alternative. Despite having written the warning about route propagation further up this page, I hadn't enabled it. Azure had four BGP sessions up and a route to the VPC, the VPC had no route back, and ping did nothing at all. Two `enable-vgw-route-propagation` commands later it worked. That's the second time in one post I've ignored my own advice, which is at least consistent.

### End to end

Put a VM at each end, open ICMP in the NSG and the security group, and ping across.

```
simon@az-interconnect:~$ ping 10.0.1.78
64 bytes from 10.0.1.78: icmp_seq=1 ttl=125 time=2.68 ms
64 bytes from 10.0.1.78: icmp_seq=2 ttl=125 time=3.52 ms
64 bytes from 10.0.1.78: icmp_seq=3 ttl=125 time=18.5 ms
64 bytes from 10.0.1.78: icmp_seq=4 ttl=125 time=2.69 ms
64 bytes from 10.0.1.78: icmp_seq=5 ttl=125 time=2.69 ms
64 bytes from 10.0.1.78: icmp_seq=6 ttl=125 time=6.27 ms
64 bytes from 10.0.1.78: icmp_seq=7 ttl=125 time=2.84 ms
64 bytes from 10.0.1.78: icmp_seq=8 ttl=125 time=2.71 ms

rtt min/avg/max/mdev = 2.683/5.236/18.482/5.136 ms
```

A floor of about 2.7 ms between a VM in Germany West Central and an instance in eu-central-1, with the odd outlier dragging the average up. Both clouds' Frankfurt regions, a couple of router hops apart. Latency is a function of physics and where the two clouds meet, and there's nothing in my hands to tune. Hold that 2.7 ms lightly, though. It turns out ping is flattering nobody here, and the real figure is better. More on that below.

### The traceroute is the interesting bit

```
simon@az-interconnect:~$ traceroute 10.0.1.78
traceroute to 10.0.1.78 (10.0.1.78), 30 hops max, 60 byte packets
 1  10.10.1.5 (10.10.1.5)  4.702 ms 10.10.1.4 (10.10.1.4)  2.257 ms 10.10.1.6 (10.10.1.6)  6.400 ms
 2  169.254.255.13 (169.254.255.13)  4.650 ms 169.254.255.5 (169.254.255.5)  2.215 ms  6.287 ms
 3  * * *
 ...
30  * * *
```

For a service whose selling point is that you can't see the middle, that's a surprisingly good look at the middle.

**Hop 1 is three different addresses for three probes.** 10.10.1.4, .5 and .6 are three of the four BGP neighbours from the peer status table above, the Microsoft edge routers as they appear from inside the GatewaySubnet. Each traceroute probe is a separate flow, so each one gets hashed independently. That's ECMP across the interconnect's links, visible from a VM with no special tooling. Run it a few more times and .7 will turn up.

**Hop 2 is link-local.** 169.254.255.5 and 169.254.255.13 are the far end of the point-to-point links between Microsoft and AWS. This is the addressing I didn't have to choose, and it turns out to be documented, just not as part of this product. Microsoft [reserves 169.254.255.0/24 for internal use](https://learn.microsoft.com/azure/multicloud-interconnect/availability-limits#routing-requirements) and tells you to keep your own ASNs and addresses out of it. The interconnect's transit links live in that reserved block. The spacing fits a run of /30s (.4/30 and .12/30 seen here, so presumably .0/30 and .8/30 alongside them), one per link, which again gives you four. The /30 inference is mine; the reservation is Microsoft's.

That it's [link-local](https://en.wikipedia.org/wiki/Link-local_address) is the neat part, and it's why the whole arrangement is as tidy as it is. Link-local addresses are valid only on the segment they're configured on, and routers won't forward traffic to them. So these addresses exist purely to let the two edge routers talk to each other and run BGP across the link. They're never advertised, never routed, and can't be reached from either my VNet or my VPC. The only reason I can see them at all is that the routers put their own interface address in the ICMP time exceeded messages that traceroute lives on.

That non-routability is what lets Microsoft use the same block on every interconnect they build without any of them colliding. If the transit links used routable RFC 1918 space, someone would have to allocate it, avoid overlaps with both customers' networks, and document it. Instead the addressing is local to each link and identical everywhere, which is exactly the property you want in plumbing nobody's meant to look at.

Worth noting if you've ever hand-built a Direct Connect VIF: this is *not* the AWS convention. It's Microsoft's reserved range, which tells you which side of the fence owns the point-to-point addressing in a managed interconnect. Also worth checking your own kit isn't already using 169.254.255.0/24 for something, because Microsoft's advice is explicit about staying out of it. That's less far-fetched than it sounds, given how much networking equipment helps itself to link-local space for keepalives, cluster interconnects and similar.

So remember the peering object from earlier that claimed to be `Disabled` with a peer ASN of zero? Here's its actual configuration, leaking out through ICMP time exceeded messages.

**Then silence.** Nothing beyond hop 2 answers. The destination doesn't respond to traceroute's default UDP probes, because the security group only allows ICMP.

So I went back and tested that, rather than leaving it as an assertion:

```
simon@az-interconnect:~$ sudo traceroute 10.0.1.78 -I
traceroute to 10.0.1.78 (10.0.1.78), 30 hops max, 60 byte packets
 1  10.10.1.5 (10.10.1.5)  1.614 ms  1.597 ms  1.582 ms
 2  169.254.255.13 (169.254.255.13)  1.626 ms  1.622 ms  1.614 ms
 3  10.0.1.78 (10.0.1.78)  3.556 ms  3.548 ms  3.541 ms
```

Three hops, end to end, no gaps. The silence was the security group all along, not the AWS side declining to decrement TTL.

That's a remarkably short path between two clouds. A Microsoft edge router, the link-local hop across to AWS, and then the instance itself. Nothing in AWS between the interconnect and the destination announces itself at all: the Direct Connect gateway and the virtual private gateway are both logical constructs rather than hops, so there's nothing there to reply. It also matches the ping TTL of 125, three short of the Linux default of 128.

One difference worth spotting. The earlier UDP run gave three different addresses for hop 1 as each probe hashed onto a different link. This ICMP run gave 10.10.1.5 three times. ICMP echo probes vary the sequence number rather than the port, and the ECMP hash on the Microsoft edge clearly doesn't take that into account, so all three probes followed the same path. The load balancing is still there, it's just that this particular tool stopped revealing it. If you want to see the spread, the UDP version is the better instrument.

### Measuring it properly

Ping told me roughly 2.7 ms, but the average was 5.2 ms and the mdev over 5 ms, which is a lot of variance for a link that should be boring. ICMP echo is a poor instrument for this. Routers treat it as control plane traffic, so replies get generated by a slower path and rate limited when the box has better things to do. What you're measuring is partly the router's mood.

So I used [echo_test](https://github.com/simonpainter/echo_test), a small tool I wrote for exactly this. It opens a long-lived TCP connection to an echo service on port 7 and bounces payloads across it, timing each round trip in microseconds. Because the connection stays open, every measurement after the first is pure forwarding: no handshake, no ARP, no connection setup. That's data plane traffic, handled in hardware, which is what your applications will actually experience.

```
simon@az-interconnect:~/echo_test/client$ python3 echo_client.py 10.0.1.61 7
ECHO 10.0.1.61:7 (64 bytes of data)
64 bytes from 10.0.1.61:7: seq=1 time=1934.220 μs
64 bytes from 10.0.1.61:7: seq=2 time=1931.004 μs
64 bytes from 10.0.1.61:7: seq=3 time=1882.203 μs
...
^C

--- 10.0.1.61:7 echo statistics ---
323 packets transmitted, 323 received, 0.0% packet loss
rtt min/avg/max/stddev = 1848.183/2102.906/3251.470/103.988 μs
```

Side by side with the ping, over the same path:

| | ICMP ping | TCP echo |
|---|---|---|
| Minimum | 2.683 ms | 1.848 ms |
| Average | 5.236 ms | 2.103 ms |
| Maximum | 18.482 ms | 3.251 ms |
| Deviation | 5.136 ms | 0.104 ms |

The real number is 2.1 ms, not 5.2 ms, and the spread is fifty times tighter. Over 323 samples there's no loss at all and a worst case of 3.25 ms, which is the sort of consistency you'd hope for from a circuit inside one building, never mind between two clouds.

That's the useful result. Around 2 ms between clouds, consistently, across a managed interconnect I didn't configure. For comparison, 2 ms is roughly what you'd expect from two datacentres in the same metro with a few router hops between them, which is exactly what this is: both Frankfurt regions, joined at the edge. It's well inside the budget for synchronous database replication or a chatty API crossing between clouds, which is the sort of thing that would have been off the table over an internet VPN.

The wider point is about method. If you're benchmarking a path and the numbers look noisy, check whether you're measuring the network or the control plane. ICMP is convenient and it's the first thing everyone reaches for, but a long-lived TCP connection tells you what your traffic will really see.

### Does it hold up under load?

A quiet link being fast is unremarkable. The question is what happens to that 2.1 ms when something fills the pipe. So I ran a saturating transfer and the latency test at the same time.

```
64 bytes from 10.0.1.61:7: seq=8 time=1888.001 μs
64 bytes from 10.0.1.61:7: seq=9 time=1709.649 μs
64 bytes from 10.0.1.61:7: seq=10 time=3133.667 μs
64 bytes from 10.0.1.61:7: seq=11 time=1715.788 μs
64 bytes from 10.0.1.61:7: seq=12 time=9143.621 μs
64 bytes from 10.0.1.61:7: seq=13 time=1670.731 μs
64 bytes from 10.0.1.61:7: seq=14 time=1761.545 μs
...
64 bytes from 10.0.1.61:7: seq=47 time=1683.701 μs
64 bytes from 10.0.1.61:7: seq=48 time=1757.188 μs
```

Latency went *down*. The median under load settled around 1730 μs against an idle baseline of 2103 μs, and stayed there for the rest of the run.

That isn't the network getting faster. It's the hosts staying awake: with traffic arriving constantly the CPU never drops into a deep idle state and the NIC stays in a hot polling path, so the echo gets serviced sooner. It's an endpoint effect, and a good reminder that an idle baseline can flatter or penalise you depending on which direction the power management falls.

What matters is what isn't there. No sustained climb. If the interconnect had deep buffers, a full pipe would fill them and you'd watch RTT march into the tens of milliseconds and stay there. That's bufferbloat, and it's what makes a saturated link feel broken to interactive traffic even though throughput looks fine.

Instead there are two outliers, 3.1 ms and 9.1 ms, both early in the run while TCP ramps up, and then a flat line. Shallow queues, no standing buffer. The mean of 1969 μs and the stddev of 1080 μs are both artefacts of those two samples; the median is the honest figure.

So a bulk transfer and latency-sensitive traffic can share this circuit without the transfer ruining the latency. That's not guaranteed, and it's worth checking on any path where you intend to run replication alongside anything interactive.

### How much of the gigabit do you get?

Latency is only half the question. The circuit is sold as 1 Gbps, so the other half is whether it delivers one.

```
simon@az-interconnect:~/echo_test/client$ iperf -c 10.0.1.61 -t 60 -i 5
------------------------------------------------------------
Client connecting to 10.0.1.61, TCP port 5001
TCP window size: 16.0 KByte (default)
------------------------------------------------------------
[  1] local 10.10.0.5 port 52600 connected with 10.0.1.61 port 5001 (icwnd/mss/irtt=13/1398/3532)
[ ID] Interval       Transfer     Bandwidth
[  1] 0.0000-5.0000 sec   415 MBytes   697 Mbits/sec
[  1] 5.0000-10.0000 sec   409 MBytes   686 Mbits/sec
[  1] 10.0000-15.0000 sec   430 MBytes   722 Mbits/sec
...
[  1] 50.0000-55.0000 sec   436 MBytes   731 Mbits/sec
[  1] 55.0000-60.0000 sec   429 MBytes   720 Mbits/sec
[  1] 0.0000-60.0428 sec  4.99 GBytes   713 Mbits/sec
```

713 Mbits/sec sustained over a minute, with every five second sample landing between 686 and 731. That's a flat line by the standards of anything crossing a network boundary, and there's no sawtooth, no collapse and no recovery, which is what congestion or policing would look like.

Nearly 5 GB moved in a minute, and the variance across the whole run is about 6%. Whatever shaping sits on that circuit, it isn't fighting me.

Which leaves the obvious question: why 713 and not 1000? The fix, I assumed, was more streams. I was half right, and the half I got wrong turned out to be the interesting part.

### The bandwidth-delay product theory, and why it was wrong

The obvious explanation for 713 is the bandwidth-delay product. A sender can only have one window of unacknowledged data in flight, so a single stream is capped at window divided by round trip time.

```
    def max_single_stream_throughput(window_bytes, rtt_seconds):
        return (window_bytes * 8) / rtt_seconds

    # 713 Mbits/sec at roughly 3 ms implies a window near 310 KB
```

That arithmetic works, which is exactly why it's a trap. It's a plausible number produced by a plausible mechanism, and I nearly left it there. The test that separates theory from coincidence is to force a bigger window and see if anything changes.

```
simon@az-interconnect:~$ iperf -c 10.0.1.61 -t 60 -w 1M
TCP window size:  416 KByte (WARNING: requested 1.00 MByte)
[  1] 0.0000-60.0067 sec  5.00 GBytes   715 Mbits/sec
```

416 KB of window, and 715 Mbits/sec. Identical. So it was never the window, and the bandwidth-delay product had nothing to do with it. There's a per-flow ceiling at roughly 715 Mbits/sec and no amount of buffer will move it.

### Where the ceiling actually is

Adding streams tells you where the limit lives. Two flows:

```
[  1] 0.0000-60.0665 sec  5.01 GBytes   717 Mbits/sec
[  2] 0.0000-60.0664 sec  5.03 GBytes   719 Mbits/sec
[SUM] 0.0000-60.0214 sec  10.0 GBytes  1.44 Gbits/sec
```

Both flows got the full 715-ish, and the total came out at 1.44 Gbits/sec. On a circuit I bought as 1 Gbps.

Four flows:

```
[  4] 0.0000-60.0405 sec  5.04 GBytes   721 Mbits/sec
[  3] 0.0000-60.0407 sec  5.02 GBytes   718 Mbits/sec
[  1] 0.0000-60.0412 sec  4.98 GBytes   712 Mbits/sec
[  2] 0.0000-60.0898 sec  1.69 GBytes   241 Mbits/sec
[SUM] 0.0000-60.0112 sec  16.7 GBytes  2.39 Gbits/sec
```

Three flows at the per-flow ceiling, one at 241, and an aggregate of 2.39 Gbits/sec. Eight flows produced exactly the same aggregate, 2.39 Gbits/sec, just divided up more unevenly.

Two numbers fall out of that, and they're both worth writing down. There's a **per-flow ceiling around 715 Mbits/sec**, and an **aggregate ceiling around 2.39 Gbits/sec**, and neither of them is 1 Gbps.

The aggregate figure is the surprising one. I provisioned a 1 Gbps interconnect and pushed nearly two and a half times that through it, sustained, for a minute. Whatever is enforcing the purchased rate during preview, it isn't a policer on this path.

I'd be careful what you conclude from that. The most likely reading is that preview simply hasn't wired up rate enforcement yet, and that a 1 Gbps circuit will start behaving like one at GA. The per-flow and aggregate ceilings look more like VM and platform limits than anything to do with the interconnect: Azure VM sizes have their own network caps, and 715 Mbits/sec per flow is the sort of number that comes from a host rather than a circuit. Do not design anything around getting 2.39 Gbits/sec out of a 1 Gbps purchase.

What it does tell you is that the underlying fabric has plenty of headroom, which fits the four redundant links the routing showed earlier. The constraint is a billing construct, not a physical one.

### UDP, and knowing when your test is lying

TCP backs off politely and hides the edges of a link. UDP doesn't, so it's the usual way to find a policer. It's also the easiest test to misread, and this one misled me for a few minutes.

| Offered | Sender achieved | Receiver saw | Loss | Jitter |
|---|---|---|---|---|
| 500 Mbits/sec | 524 Mbits/sec | 522 Mbits/sec | 0.38% | 0.018 ms |
| 700 Mbits/sec | 734 Mbits/sec | 245 Mbits/sec | 67% | 0.015 ms |
| 900 Mbits/sec | 944 Mbits/sec | 247 Mbits/sec | 74% | 0.010 ms |
| 1100 Mbits/sec | 1.15 Gbits/sec | 738 Mbits/sec | 36% | 0.010 ms |

Read the loss column on its own and you'd conclude the circuit falls apart somewhere above 500 Mbits/sec. Then look at the last row: offering *more* traffic produced *three times* the delivered throughput of the 900 Mbits/sec run. A policer doesn't behave like that. A policer is monotonic: you get the policed rate and the excess is discarded, every time.

Non-monotonic results like these are the signature of the receiver being the bottleneck, not the network. Single-stream UDP at high packet rates lands the entire receive path on one core, and once the socket buffer overflows the kernel drops datagrams before iperf ever counts them. The 208 KB default buffer in the header is the giveaway. Those loss figures describe a saturated Linux host, not the interconnect.

So I'd throw the loss column away. The two columns worth keeping are jitter and reordering, and both are excellent: **10 to 18 microseconds of jitter** across every run, and between 10 and 26 out-of-order datagrams out of as many as 2.9 million. That's essentially perfect sequencing.

The reordering figure is worth a moment, given we know there are four parallel links. A single UDP flow has one 5-tuple, so the ECMP hash pins it to one link and ordering is preserved. If the interconnect were spraying packets across links per-packet rather than per-flow, that counter would be enormous. It isn't, which confirms flow-based hashing and means you don't need to worry about reordering hurting TCP performance.

The lesson is the one from the ICMP section, arriving from a different direction: before you believe a measurement, work out what it's actually measuring. A number that moves the wrong way when you change the input is telling you about your instrument.

### What about MTU?

One thing I'd assumed would bite turned out fine. The `mss=1398` in every iperf header implies a 1438-byte MTU, which isn't the 1500 you'd expect from either ExpressRoute private peering or an AWS private virtual interface. A reduced path MTU is a classic source of the "small requests work, large uploads hang" fault, so it's worth five minutes to check properly.

```
simon@az-interconnect:~$ ping -M do -s 1472 10.0.1.61
PING 10.0.1.61 (10.0.1.61) 1472(1500) bytes of data.
1480 bytes from 10.0.1.61: icmp_seq=1 ttl=62 time=7.78 ms
1480 bytes from 10.0.1.61: icmp_seq=2 ttl=62 time=3.20 ms
```

`-M do` sets the don't-fragment bit, and 1472 bytes of payload plus 8 bytes of ICMP header plus 20 bytes of IP header is exactly 1500. It goes through. The path carries full-size frames end to end with no fragmentation and no black hole.

Anything larger fails locally rather than in the network:

```
simon@az-interconnect:~$ ping -M do -s 1499 10.0.1.61
ping: local error: message too long, mtu=1500
```

That's my own NIC refusing to build an oversized frame, not the interconnect dropping it. The distinction matters: a local error means you never got on the wire, while a path MTU problem shows up as silence or an ICMP fragmentation-needed message from somewhere in the middle.

So the path is a clean 1500 and PMTUD isn't being black-holed. The MSS of 1398 is something else: TCP MSS clamping, where a device rewrites the MSS option in the SYN to a value below what the path could carry. I haven't pinned down which device does it or why the number is 62 bytes short, and I'd want a packet capture at both ends to say more than that.

Being clamped below path MTU is the safe direction to be wrong in. It costs you about 4% more packets for the same payload and nothing else. It's the opposite case, an MSS larger than the path can carry, that hangs connections. Still, if you're chasing a performance problem over one of these, knowing the path does 1500 while TCP has settled on 1438 is the sort of detail that saves an afternoon.

### The summary

| Measurement | Result |
|---|---|
| Latency, idle | 2.103 ms average, 0.104 ms deviation, 323 samples, no loss |
| Latency, under load | Median around 1.73 ms, no sustained increase |
| Jitter | 10 to 18 μs |
| Reordering | Up to 26 datagrams in 2.9 million |
| Throughput, single flow | 715 Mbits/sec, window-independent |
| Throughput, aggregate | 2.39 Gbits/sec on a 1 Gbps circuit |
| Path MTU | 1500, clean, no fragmentation |
| Negotiated MSS | 1398, clamped below path MTU |

One loose end I'll flag because it's an easy trap. The `irtt` iperf prints at connection setup, around 3 ms here, is not your latency. It's a single sample from the handshake before anything has warmed up, which is roughly what the first echo_test packet sees and why that tool sends a warmup packet before it starts timing. Don't read a latency figure off a throughput tool.

For plumbing I provisioned with an activation key and never configured, that's a better set of numbers than I expected.

## What I'd think about before using it properly

The lab works. Production is a different conversation, and there are a few things I'd want settled first.

**Regional gravity.** The Local SKU behaviour means your interconnect is anchored to a region. If your Azure estate is a hub and spoke with a single hub per region, that's fine. If you've got workloads scattered and you were hoping one interconnect would serve the lot, you'll be routing via VNet peering, and you should model what that does to your east-west charges before you commit. The same is true on the AWS side: virtual private gateways and transit gateways only work with an interconnect in their local region, and it takes Cloud WAN to reach further.

**Bandwidth is a purchase decision, not a dial.** Preview gives you 1 Gbps and no other choice. Whatever options arrive later, changing bandwidth is a circuit change, with the usual caveats about what that means for an in-service connection. Size it with some headroom, and remember that the number you bought is the aggregate across everything using the circuit, not what any one connection will see. My single-flow ceiling was 715 Mbits/sec, so a workload with one big transfer will see roughly 70% of a 1 Gbps circuit no matter how you tune it.

**Don't trust preview rate enforcement.** I pushed 2.39 Gbits/sec through a circuit I bought as 1 Gbps, sustained for a minute. That's preview not policing yet rather than a bonus you get to keep, and I'd expect a 1 Gbps circuit to start behaving like one at GA. If you size a workload against what the link currently delivers, you're sizing against a number that's likely to disappear.

**Pricing at GA is the open question.** Preview waives the Azure service charge and Azure egress, which is generous and explicitly temporary. What replaces it is the interesting part. I [argued a few days ago](/direct-connect-goes-flat-rate) that private connectivity pricing is converging on flat rate, and the AWS end of this exact link is already there: AWS Interconnect multicloud launched with tiered hourly pricing and no per-gigabyte charge at all. It would be an odd outcome for one end of a managed cross-cloud circuit to be flat and the other metered, and I'd be surprised if Microsoft went that way.

The one piece of evidence pointing the other direction is sitting in the SKU family: `MeteredData`. I'd be careful reading much into it. The resource type is shared with ExpressRoute, so the SKU family enum is inherited from a product where metered and unlimited plans have existed for years, and `MultiCloud_MeteredData` may simply be the value that already fitted the schema. If a `MultiCloud_UnlimitedData` turns up alongside it, that tells you Microsoft intends the distinction to mean something here. If it never does, the name was always just the enum. Either way, don't build a business case on preview pricing.

**Preview connections get deleted.** AWS says preview 1 Gbps connections will be removed from your account as the pairing approaches general availability. Don't hang anything you care about off this.

**Managed means opaque.** No peering to inspect, no ARP table, no BGP config on your side. That's the appeal, and it's also why my troubleshooting consisted of checking states at each end and inferring the middle. One thing you get for free: Microsoft says [MACsec is enabled by default](https://learn.microsoft.com/azure/multicloud-interconnect/overview#key-benefits) on the physical links between the two clouds, which is more than you'd get from a cross connect you built yourself. Work out now what your monitoring looks like when the only things you can see are a provisioning state and a route table.

**One connection per interconnect.** The [limits page](https://learn.microsoft.com/azure/multicloud-interconnect/availability-limits#supported-virtual-network-gateway-connections) is clear that an interconnect supports a single gateway connection during preview. Combined with the regional anchoring, that means one interconnect serves one gateway in one region, and everything else reaches it through your hub design.

**The portal isn't finished.** Anything you can't do in the portal, try in the CLI before assuming it can't be done. This is not the first time I've found an Azure portal constraint that the API doesn't share.

**It's preview.** Four regions, one bandwidth, one provider and [no SLA](https://learn.microsoft.com/azure/multicloud-interconnect/availability-limits#service-level-agreement). Build the design, prove the pattern, but keep your existing path until it goes GA. Microsoft's [FAQ](https://learn.microsoft.com/azure/multicloud-interconnect/faq) is short but worth reading before you plan anything around it.

## Worth it

I spent years explaining to people why connecting two clouds privately was a six week project involving a colo contract, and now it's a handful of commands, an activation key and, in my case, an hour of finding out which bit I'd forgotten.

The thing I keep coming back to is what this says about the market. The received wisdom was always that each cloud wants to pull your workloads in and make leaving awkward. A managed, first-party, private path to a competitor is the opposite instinct. It's both vendors accepting that you're going to run things in both places, and deciding they'd rather make that easy than pretend it isn't happening.

Thanks again to [Yusuke Matsumoto](https://blog.aimless.jp/archives/2026/09/azure-multicloud-interconnect/), who writes as kongou_ae, for the nudge and for publishing the resource definition before I had to reverse engineer it. Go and read the original if you can.
