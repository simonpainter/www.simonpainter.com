---
title: AWS Egress Security
---

I took a look at [egress security a little while ago](egress-security.md) and advocated for the 'less is more' approach for most organisations due to the proliferation of VPCs and vNets and the risk of either having a very large amount of very expensive firewalls providing very little value or, perhaps worse, another pet in the form of centralised internet egress. There may be another way.

## Egress: 'me to not me'

Egress security covers everything coming out of your VPCs (I shall continue to use VPC as this is an AWS focussed article however some of the principles apply to other cloud providers). Ingress security is everything that isn't me coming towards me and typically has a greater attack surface so we put a lot of energy into WAFs and the like. We pass our packets through many layers of protection and we make things application aware and we look across all the layers of the OSI model and deep into the application code itself. East-west security covers 'me to me' traffic and exists to address internal threats and lateral movement of attackers once they have gained access.

### But we've always done it this way

Egress security has evolved from the user networks where firewalls, proxies, data loss prevention and other technolgies have existed for a while from the very early days of putting internet access in the hands of our colleagues to prevent them doing something that they shouldn't or perhaps just to know when they have. Most system egress solutions on premise have followed the same model as user egress, because for the most part the boxes were already there on the perimeter and it made sense to just them for system access as well as the user access. As we have moved into cloud many of the capabilities that underpinned on premise perimeter security were assumed to still be needed despite the fact that for the most part cloud egress is system access not user access and for the most part system access is predefined and can be a bit more predictable. [In my earlier article](egress-security.md) I argued that where it's specific egress to prefefined endpoints (software update services, trusted APIs, github et al) and you control the servers initiating the requests then there are plenty of other places you can exert better control so a short list of permitted egress through SGs and nacls may be enough.

### It's cost though isn't it

The elephant in the room which [I touched on in the other article](egress-security.md) is that cost plays a huge part in this. I was chatting with a very pragmatic CISO recently and we agreed that for the most part what you *can do for security* has to be tempered with what you *need to do for security* to get a result what you *should do for security*. We can all argue that adding firewalls everywhere along with all the latest and greatest security products can increase overall security but there are diminishing returns. The example we used in the pub was that we could argue it is more secure to frisk every employee as they leave to make sure they aren't stealing the pencils but the advantages are miniscule when compared to the costs. 
Installing an enterprise firewall NVA in every VPC is prohibitively expensive unless either you really need it or you are using something like [Enforza.io](https://www.enforza.io) that fills a big gap by providing plenty of security at a price that makes you wonder what everyone else is playing at. While I don't think AWS firewall brings that much to the table over [Enforza.io](https://www.enforza.io) at the moment the AWS Route53 Resolver Firewall is a nice way of complimenting either an egress firewall or the SG/nacl lightweight approach mentioned earlier.

## AWS Route53 Resolver Firewall

Anyone who used [OpenDNS](https://www.opendns.com), now borged into Cisco Umbrella, will be familiar with DNS filtering and the benefits; you get solid defence against DNS specific threats along with *just enough* filtering of outbound traffic by only resolving the domains you want to resolve. Domain based filtering at DNS level gives you allow and deny lists which means you can either selectively permit a defined list of domains or block known threats through a combination of your own lists and AWS managed lists. The AWS managed lists cover 

AWS provides the following Managed Domain Lists, in the Regions where they are available, for all users of Route 53 Resolver DNS Firewall.

> **AWSManagedDomainsMalwareDomainList**
> Domains associated with sending malware, hosting malware, or distributing malware.
>
> **AWSManagedDomainsBotnetCommandandControl**
> Domains associated with controlling networks of computers that are infected with spamming malware.
>
> **AWSManagedAggregateThreatList**
> Domains associated with multiple DNS threat categories including malware, ransomware, botnet, spyware, and DNS tunneling to help block multiple types of threats.
>
> **AWSManagedDomainsAmazonGuardDutyThreatList**
> Domains associated with DNS security threats, such as malware, command and control, or cryptocurrency related activity, sourced from Amazon GuardDuty.

AWS Managed Domain Lists cannot be downloaded or browsed. To protect intellectual property, you can't view or edit the individual domain specifications within the AWS Managed Domain Lists. This restriction also helps to prevent malicious users from designing threats that specifically circumvent published lists.

Advanced option also uses heuristics to match DNS tunnelling and Domain Generation Algorithms. Signatures for DNS based threats. Separate pricing.

The **AWSManagedAggregateThreatList** includes threat intelligence with [Recorded Future](https://www.recordedfuture.com) and all lists are updated hourly as new threats emerge and are identified.

### Cross account management

AWS Route53 Resolver Firewall is part of the infrastructure protection portfolio and can be managed across accounts within your organisation using AWS Firewall Manager. Groups can be deployed to VPCs from central management to improve egress security at a very modest price and without having to provision firewalls that may sit idle in VPCs that do not require egress.

## AWS Firewall

Some organisations do have specific needs to deploy firewalls at egress. With the notable exception mentioned above the majority of firewall NVAs are an evolution of on premise technology. Firewalls are a burden that have maintenance overhead, require domain knowledge, aren't built to scale, become performance bottlenecks, and also invariably cost a lot. In the sweet spot where nacls and SGs are devolved to application teams, but egress security must also be centrally managed, the *cloud native firewalls* like AWS Firewall become an expensive necessity. AWS Network firewall is a fully managed HA construct on a pay as you go basis. Arguably the biggest use case is cloud egress security with layer 7 aware filtering and a choice of SNI or TLS inspection for your https traffic. You can use it for east-west traffic as well in highly regulated environments.

### It's [Suricata](https://suricata.io), Jim, but not as we know it.

Under the hood, AWS Network Firewall supports rules built for Suricata, offering a powerful and flexible approach to traffic filtering. Whilst you can manage rules through the AWS Console, I recommend using custom Suricata rules in free-form text rather than UI-generated rules as this provides maximum flexibility and control over your ruleset, including better alerting customisation and easier troubleshooting. You also gain the ability to manage your rulebase in text form and [deploy with terraform through a git pipeline](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/networkfirewall_rule_group#rules_string-1).

When implementing Suricata rules, it's crucial to include the "flow:to_server" keyword. This ensures proper traffic evaluation by making rules operate at the same level and evaluate traffic simultaneously, allowing pass rules to inspect traffic before reject rules block it. Another key best practice is to minimise the number of custom rule groups you create. Having fewer rule groups simplifies management, makes it easier to understand traffic handling, and helps avoid capacity management headaches since rule group capacity cannot be modified after creation.

Suricata provides managed geographic filtering for ingress and egress through rules based on [MaxMind IP geolocation](https://support.maxmind.com/hc/en-us/categories/1260801446650-GeoIP2-and-GeoLite2) - particularly useful for regulated businesses with data sovereignty requirements. Suricata determines the location of requests using MaxMind GeoIP databases. MaxMind reports very high accuracy for their data at the country level, although accuracy varies according to factors such as country and type of IP.

For organisations requiring deeper inspection, AWS Network Firewall supports TLS inspection, though this requires the network firewall's CA to be trusted by the client. Unlike Azure, which restricts TLS inspection for certain categories like education, finance, government, and health and medicine, AWS Network Firewall allows TLS inspection across all traffic categories. However, carefully consider whether TLS inspection is necessary for your use case, as it adds complexity and may require significant management overhead.

To effectively maintain your Suricata ruleset, consider implementing these additional best practices:

* Use unique signature IDs (SIDs) across all rule groups that link to your change control or approval workflows to simplify troubleshooting and governance
* Place an alert rule before any pass rule if you need to log allowed traffic
* Keep rules in as few rule groups as possible to stay within the maximum combined total of 20 rule groups (including both managed and custom groups)
* Document your rules with clear descriptions including creation dates and change request numbers or application IDs