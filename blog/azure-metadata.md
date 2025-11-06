---

title: "169.254.169.254: The Instance Metadata IP Address in Azure"
authors: simonpainter
tags:
  - azure
  - networks
  - cloud
  - ipv6
date: 2025-10-08

---

We've taken a look at [168.63.129.16](azure-magic-ip.md), the magic IP address in Azure, and now it's time to explore 169.254.169.254, the instance metadata IP address. This IP address is used by Azure virtual machines to access instance metadata, which provides information about the VM and its environment.
<!--truncate-->
When we peeked at the DHCP information received for an Azure VM we saw that there were routes added for both the magic IP and another IP, the metadata IP:

classless_static_routes=0.0.0.0/0 10.0.0.1 168.63.129.16/32 10.0.0.1 **169.254.169.254/32** 10.0.0.1

This time it's a 169.254.x.x address, which is part of the link-local address range defined in [RFC 3927](https://datatracker.ietf.org/doc/html/rfc3927). Link-local addresses are used for communication within a single network segment and are not routable on the internet.

This IP provides a simple REST API for information specific to the VM instance. The endpoints are quite well documented in the [Azure Instance Metadata Service documentation](https://learn.microsoft.com/en-us/azure/virtual-machines/instance-metadata-service?tabs=windows#endpoint-categories).

Most of this is uninteresting however very useful for automation. For example, you can retrieve the VM's location, size, and network configuration. This is particularly useful for scripts and applications running on the VM that need to adapt based on their environment. Here's a simple example in python using the `requests` library to fetch the network information of the VM.

```python
import requests as re

h = {"Metadata":"true"}
v = "?api-version=2025-04-07"
base_url = "http://169.254.169.254/metadata"
endpoint = "/instance/network"

r = re.get(base_url + endpoint + v, headers = h)

print(r.json())
```

The response was a little interesting, and this is the point of the post. The metadata service has a placeholder for the public IP address of the VM, but in this case, it was `null`.

```json
{
  "interface": [
    {
      "ipv4": {
        "ipAddress": [
          {"privateIpAddress": "10.1.0.4", "publicIpAddress": ""}
        ],
        "ipAddressBlock": [],
        "subnet": [ {"address": "10.1.0.0", "prefix": "24"} ]
      },
      "ipv6": {"ipAddress": [], "ipAddressBlock": []},
      "macAddress": "002248439F36"
    }
  ]
}
```

Given that it is a lab box that I was connecting to via SSH on a public IP this didn't make a lot of sense, however when I looked at the loadbalancer endpoint I found some clarity.

```json
{
  "loadbalancer": {
    "publicIpAddresses": [
      {"frontendIpAddress": "20.117.186.136", "privateIpAddress": "10.1.0.4"}
    ],
    "inboundRules": [],
    "outboundRules": []
  }
}
```

It has long been known that Azure Public IPs are not actually assigned to the VM itself, but rather to a NAT rule somewhere in the fabric; it looks like they are now treated as a 1:1 loadbalancer rule. This appears to be a change to the behaviour of the metadata service, as I have seen examples previously where the public IP is populated in the network section.
