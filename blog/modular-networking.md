---

title: Modular Networking
description: How to build networks like Lego blocks, not custom sculptures.
authors: simonpainter
tags:
  - terraform
  - networks
  - automation
date: 2025-07-31

---

In a recent blog post I wrote: "As network engineers we are used to the declarative model of configuration management and so this fits nicely into that mindset - you declare what you want and Terraform will make it so." But declaring what you want is only half the battle. The real challenge lies in how you structure that declaration to handle the messy reality of business requirements whilst maintaining the automation benefits that drew us to declarative tools in the first place.
<!-- truncate -->
Some time ago I was chatting to an enthusiastic young network architect at a customer management and contact centre business. He told me of his ambitious plans to create T-shirt sized site network designs - small, medium, and large templates that would transform our dozen sites from individual pets into a standardised, automatable fleet.

He was, of course, deluded.

The organisation had grown through acquisition, and each site carried the DNA of its origins. One site supported a hundred people with basic call centre functions. Another housed six thousand employees with locally hosted services, legacy systems from three different acquisitions, and networking kit spanning multiple technology generations. The variations were endless, and attempting to force them into three buckets was nonsensical.

We ended up with as many network designs as we had sites. Sure, we had some common principles, but automation remained elusive because the sites were simply too different for any meaningful standardisation.

## When Standardisation Actually Works

Fast forward a few years, and I found myself at a large retailer built on genuine standardisation. The retail estate in the UK had just two site types: a small format inherited from an acquisition and a large format that covered every other store. The variation was minimal - perhaps the number of access switches - but you could count on one hand the variables needed in a template.

I created automation tooling using a simple database with PHP templating (a system cheekily called "faff" that survived long after I left). It worked beautifully because the business had genuine similarity. When every large store followed the same layout, served the same functions, and used the same technology stack, simple templating was not just possible but powerful.

The distribution side told a different story. Each of the 29 depots was understood to be a pet because they served different functions, some were chilled, some were ambient, some were returns, and some were highly mechanised. My colleague Paul managed to build a standard design for the core elements whilst handling site-specific variations through modular additions in separate design documents - the beginnings of a more sophisticated approach.

But even the retail standardisation proved fragile. As a flurry of acquisitions brought new site types and features were deployed inconsistently, the simple two-template model fractured. Within a couple of years, we had multiple site variants, and much of the automation aspirations crumbled in the face of complexity.

## Learning from Cloud-Native Thinking

The breakthrough came years later at a fintech firm with an extensive cloud footprint. Their application landing zones followed a radically different approach to variation management. Rather than trying to standardise entire environments, they had decomposed infrastructure into atomic features that could be composed into capabilities.

"No pets" and "evergreen" were key tenets, but variation wasn't eliminated - it was managed through feature composition. Need a different connectivity pattern? Add that feature. Need long lived tcp connections? Enable that feature and it ensured Azure Firewalls were taken out of the traffic path. Each app team selected the capabilities they required for their subscriptions, and the automation logic selected the appropriate features to enable those capabilities.

This approach provided variation within strict guard rails. More importantly, it meant that changes to a feature could be automated across the entire estate because each feature was a modular block, consistent wherever it was deployed.

## Building Networks Like Lego

Think of this approach like building with Lego blocks. Traditional network design is like commissioning a custom sculpture for each site - unique, beautiful perhaps, but impossible to standardise or modify efficiently. The T-shirt sizing approach is like having three pre-built moulds for your sculptures - better than custom sculptures, but still limiting when your needs don't quite fit the available options.

The modular approach treats each infrastructure function as a Lego block. WiFi is a block. VLANs are blocks. Firewall rules are blocks. Each block does one thing well and connects predictably to other blocks. You build capabilities by combining blocks, and you build sites by combining capabilities.

## Applying Modular Design to Retail Networks

Consider how this might work for a retail network. Start with a minimal core capability: site metadata, basic routing, and management networks. Everything else becomes a feature that supports specific business capabilities.

Does the site need handheld scanner guns? That business capability requires two infrastructure features: the WiFi feature and the handheld scanner SSID feature. Is there a back office location? If it's a small store with no back office, we won't enable the corporate SSID feature. Does the site have a cafe? That's a different capability made up of capacity, guest wifi, different payment systems and so on.

Each business capability maps to one or more infrastructure features. Some features have dependencies - you can't have handheld scanners without WiFi. Some have conflicts - certain security policies might be incompatible with guest access features. But these relationships become explicit and manageable rather than hidden within monolithic site templates.

## The Automation Advantage

This modular approach solves the brittleness problem that plagues traditional network automation. When you need to update handheld scanner support across your estate, you modify the scanner capability module once. Every site using that capability gets the update automatically. No hunting through dozens of site-specific configurations. No risk of inconsistent implementations.

Changes become atomic and predictable. Testing becomes manageable because you're testing features in isolation and known combinations. Documentation becomes self-generating because the infrastructure code itself describes what capabilities are active at each site.

## Building the Foundation

Modern tools like Terraform provide the foundation for this approach, and [as I have recently found it works really well with Netbox](netbox-terraform.md) to keep track of your physical infrastructure as well as your configuration in platforms like [Cisco ACI](https://registry.terraform.io/providers/CiscoDevNet/aci/latest), [Juniper Mist](https://registry.terraform.io/providers/Juniper/mist/latest/docs), [FortiManager](https://registry.terraform.io/providers/fortinetdev/fortimanager/latest), [F5](https://registry.terraform.io/providers/F5Networks/bigip/latest), and many more. Terraform's declarative model aligns perfectly with the network engineer's mindset whilst its module system enables the atomic feature design. It serves as the source of truth for site metadata and capability requirements, driving the automation that composes features into working networks.

The result is infrastructure that behaves more like software - composable, testable, and maintainable. Sites are no longer pets or even cattle; they're assemblies of well-understood, reusable components that can be evolved, debugged, and scaled with confidence.

## Conclusion

The path from pets to automation isn't through forced standardisation or T-shirt sizing. It's through decomposing business requirements into atomic infrastructure features and building systems that compose those features into the exact capabilities each site needs.

Like Lego blocks, the power isn't in the individual pieces - it's in how they connect together to build something greater than the sum of their parts. And unlike pets, when you need to change something, you change the block, rather than smashing sculptures and starting again.
