---

title: "Azure Private Subnet and IPageddon"
authors: simonpainter
tags:
  - cloud
  - security
  - networks
  - zero-trust
date: 2025-06-23

---

The impending deadline of [Azure IP armageddon](https://azure.microsoft.com/en-gb/updates?id=default-outbound-access-for-vms-in-azure-will-be-retired-transition-to-a-new-method-of-internet-access) is nearly upon us. In September a fairly major shift is taking place in Azure which will see a change to the default behaviour for outbound internet for Azure VMs. The change itself has been fairly well discussed but you can now get ahead of the curve with
[Azure Private Subnet](https://azure.microsoft.com/en-gb/updates?id=492953) and start building things as they will be after September.
<!-- truncate -->

OK, hopefully you know this because of all the Y2K style panicky blog posts of the last few months but in September the default behaviour for new vnets will be without default outbound internet access. At present all VMs get a public IP assigned to them for internet egress. You can't use it for inbound connections, you still need a PIP for that, but if you just create a new vnet with a VM that VM will be able to connect outbound without any further action. This is really handy when you are creating VMs that have a bootstrap script for stuff like running updates or installing software from remote respositories.

> Although it's being billed as a security enhancement, and I guess it is, the reason
> for the change is probably the more mundane desire to reduce public IP address usage.
> Assigning a public IPv4 address to every VM gives some real scaling problems against
> the background of [global IPv4 exhaustion](ipv4-global-landscape.md).

From September nothing changes for existing networks but the behaviour for new ones is that resources created in them will not get this default egress IP. You will only get internet egress if you add one of three things to that vnet: a PIP, a [public loadbalancer](azure-public-lb-nat.md) or a NAT Gateway. You can see what that looks like in practice by enabling [Azure Private Subnet](https://learn.microsoft.com/en-us/azure/virtual-network/ip-services/default-outbound-access#add-the-private-subnet-feature) today to make sure everything behaves how you expect it to.

I automate a lot. So should you. This change in behaviour won't stop your current stuff from working but perhaps you create environments on the fly for devs or perhaps you have scripts to recover your apps or rebuild them. This automation needs to be tested for the post IPageddon world. One fairly simple example is making sure that the egress method is added early enough in the build process that VMs can run any bootstrap scripts that require internet egress. I typically run apt-get update and apt-get upgrade on all new VMs at creation. I'll also often clone a git repository full of scripts for common tools. This works by default at the moment but won't work after the change if I don't make sure that the NAT Gateway is created before the VM is, for example.

I've started building things in my lab now with the [terraform flag](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/subnet#default_outbound_access_enabled-1) `default_outbound_access_enabled` set to `false` so that anything I create now will work the same after the change, I recommend you do the same.

```javascript

# Create public subnet
resource "azurerm_subnet" "public" {
  name                 = "public"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Create private subnet
resource "azurerm_subnet" "private" {
  name                 = "private"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  default_outbound_access_enabled = false
}

```