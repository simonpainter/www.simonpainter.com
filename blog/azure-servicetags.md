---

title: "Azure Service Tags"
authors: simonpainter
tags:
  - azure
  - networks
  - cloud
date: 2025-10-08

---

While looking at the [magic ip](azure-magic-ip.md) I touched upon the idea of Azure Service Tags. They're supported within NSGs and Azure Firewall rules and are essentially Microsoft managed IP address groups that represent specific services within the Azure ecosystem.
<!-- truncate -->
One of the big problems that network security admins face in cloud environments is the need to update IP ranges for services as they change. Next generation firewalls can solve this in some part by using [FQDN rules](fqdn-deep-dive.md) but they have limitations because they rely on tight integration with DNS or the PKI integration necessary for TLS inspection. The problem is simple: you might want to allow your application server to reach out to Azure Storage in UKSouth but you don't want to open up access to the entire internet. You could use a FQDN rule for `*.blob.core.windows.net` but that would allow access to all Azure regions, not just UKSouth. It also relies on a wildcard DNS rule which can be problematic in some environments.

> I had a particularly bad experience with wildcard DNS rules in a corporate environment where DNS queries were egressing
> through a different path to the application traffic. Fortigate firewalls rely on seeing the DNS query and response to be
> able to cache the IP for the FQDN rule. If the DNS traffic is going out a different path (e.g. through a proxy) then the
> firewall never sees the DNS response and can't cache the IP address. This results in failed connections and a very
> urgent need to change our poorly designed DNS architecture.

If you wanted to use IP address based rules you would need to use this list:

```json
          "20.33.148.0/24",
          "20.33.168.0/24",
          "20.33.234.0/24",
          "20.38.106.0/23",
          "20.47.11.0/24",
          "20.47.34.0/24",
          "20.60.17.0/24",
          "20.60.166.0/23",
          "20.150.18.0/25",
          "20.150.40.0/25",
          "20.150.41.0/24",
          "20.150.69.0/24",
          "20.153.83.0/24",
          "20.157.157.0/24",
          "20.157.182.0/24",
          "20.157.246.0/24",
          "20.209.6.0/23",
          "20.209.30.0/23",
          "20.209.88.0/23",
          "20.209.128.0/23",
          "20.209.158.0/23",
          "20.209.240.0/23",
          "51.140.16.16/28",
          "51.140.16.32/28",
          "51.140.168.64/27",
          "51.140.168.112/28",
          "51.140.168.128/28",
          "51.141.128.32/27",
          "51.141.129.64/26",
          "51.141.130.0/25",
          "52.239.187.0/25",
          "52.239.231.0/24",
          "57.150.236.0/23",
          "135.130.130.0/23",
          "2603:1020:706::/48"
```

That's great but it's probably going to change next week and unless you keep on top of the list of [Azure IP ranges and Service Tags](https://www.microsoft.com/en-us/download/details.aspx?id=56519) your rules are going to become out of date. 
This is where Azure Service Tags come in. You can use `Storage.UKSouth` instead in your NSG or Azure Firewall rules and it is kept up to date by Microsoft. You can see the full list of service tags in the [official documentation](https://learn.microsoft.com/en-us/azure/virtual-network/service-tags-overview).

But you know what, it's pretty well documented so why am I bothering to write a blog post about it? Because there's a link in the paragraph above which is easy to miss. It's the link to the JSON file that contains the list of IP ranges for all the Azure service tags. You can download it pretty easily with `curl` and then parse it with something like python or jq to get the specific ranges you need. This can then be the basis of some automation to update your firewall rules if you are using something on premise or a third party NVA in Azure that doesn't support service tags.

As well as the unauthenticated download link above there are also Azure REST APIs that can be used to [list the service tags](https://learn.microsoft.com/en-us/rest/api/virtualnetwork/servicetags/list) and also get the [IP ranges for a given service tag](https://learn.microsoft.com/en-us/rest/api/virtualnetwork/service-tag-information/list) in a specific region. The Azure REST API requires authentication and you will need to pass it a subscription ID as a parameter but it is a more robust way of getting the data if you are going to be doing this on a regular basis.

Given that service tags are updated weekly and are fairly easy to consume I think they are great. They are also something I think firewall vendors should be supporting in their NVA offerings. One of the biggest advantages of Azure Firewall has over third party NVAs is the ability to use service tags in rules; but it comes at a cost that isn't always justified. If your firewall vendor supported service tags it would make it a much more compelling choice.