---

title: Netbox and Terraform
authors: simonpainter
tags:
  - terraform
  - networks
  - netbox
  - github
date: 2025-07-29

---

There is an [excellent Terraform provider for Netbox](https://registry.terraform.io/providers/e-breuninger/netbox/latest/docs) that allows you to manage your Netbox resources using Terraform. This is particularly useful for automating the management of network devices, IP addresses, and other resources in a consistent and repeatable manner. I have been working through the process of setting this up and have found it to be a powerful tool for a documentation first and a documentation as code approach to network management.
<!-- truncate -->
### But first why?

First off let's look at why this is important. Netbox is a fantastic tool for managing your network but like all tools it often relies a lot on manual input. This can lead to inconsistencies and errors, especially in larger environments. By using Terraform you can build the documentation stage in very early in your change workflow and move towards a model where your documentation is treated as code and follows a version control process similar to your infrastructure or application code. By building the actual physical and configuration changes into your workflow your documentation leads the change rather than being an afterthought.

Imagine the scenario where you are installing a new switch into a rack in the datacentre. Typically an engineer would raise the change, install the kit, connect it up and then update the documentation. There may be some steps before to do a design but those are always disconnected from the operational documentation and reality. If you have a remote DC Ops team then you may be required to provide a change form that details cable plans, rack locations and all that but this is a description of the change and not an update to the current state of the infrastructure. 

If you move to a documentation as code model then you can build the change in Terraform as a feature branch in your version control system and then trigger your CI/CD pipeline to review and approve the change. If the DC ops team are part of the workflow then can perform the change as part of the pipeline request and then the documenation is updated as part of the change. The pull request gives a diff of the specific change but forms an update to the current state as well. For configuration changes, with Netbox as the single source of truth, you can deploy automations from it to ensure there is never any drift from the documentation.

### Yes, but why Netbox?

Netbox is excellent, open source and has a great community. It's designed as a single source of truth for your network and has a comprehensive API that allows you to interact with it programmatically. I recently [had a look at the MCP server for Netbox](netbox-mcp.md) and it's a great addition to the ecosystem because it allows you to interact with Netbox using a Model Context Protocol (MCP) server. This means you can use LLMs like Claude or GPT to query and manipulate your Netbox data in a more natural way.

### OK but why Terraform?

Terraform is the de-facto standard for infrastructure as code. It allows you to define your infrastructure in a declarative way and then apply those changes to your environment. The [Netbox Terraform provider](https://registry.terraform.io/providers/e-breuninger/netbox/latest/docs) allows you to manage your Netbox resources using Terraform, which means you can treat your documentation as code and version control it just like you would with your infrastructure. If your organisation is doing anything in cloud then there is a fair chance you are already using Terraform and so this is a natural extension of those workflows. As network engineers we are used to the declarative model of configuration management and so this fits nicely into that mindset - you declare what you want and Terraform will make it so. Terraform has a great selection of providers including things like [Cisco ACI](https://registry.terraform.io/providers/CiscoDevNet/aci/latest), [Juniper Mist](https://registry.terraform.io/providers/Juniper/mist/latest/docs), [FortiManager](https://registry.terraform.io/providers/fortinetdev/fortimanager/latest), [F5](https://registry.terraform.io/providers/F5Networks/bigip/latest), and many more.

### Getting started

Let's start with the overview of the architecture. There are a few components that we'll need to set up in order to get everything working. 

#### Architecture

- NetBox Provider: Uses the e-breuninger/netbox provider v4.1.0
- Remote State: Terraform Cloud with VCS-driven workflow
- CI/CD: GitHub Actions for automated validation and deployment
- Modular Design: Store networking resources are organized in a reusable module

The netbox provider currently isn't tested with the latest version of Netbox. This may or may not be a problem for you but it's worth noting. I had no issues with compatibility with my own testing using version 4.1.0 of the provider and Netbox 4.3.4, even though it kept spitting out an alarming warning.

```text

│ Warning: Possibly unsupported Netbox version
│ 
│   with provider["registry.terraform.io/e-breuninger/netbox"],
│   on provider.tf line 10, in provider "netbox":
│   10: provider "netbox" {
│ 
│ Your Netbox reports version 4.3.4. From that, the provider extracted Netbox version 4.3.4.
│ The provider was successfully tested against the following versions:
│ 
│   4.2.2, 4.2.3, 4.2.4, 4.2.5, 4.2.6, 4.2.7, 4.2.8, 4.2.9
│ 
│ Unexpected errors may occur.

```

For remote state I used terraform cloud with a VCS-driven workflow. This allows you to store your state in a remote location and use version control to manage your changes.There are several optons for remote state but Terraform Cloud is pretty good and very easy to set up. 

I used GitHub Actions for the CI/CD pipeline. I use [GitHub Actions for my own website] so 

#### Prerequisites

- NetBox instance with API access
- Terraform Cloud account
- GitHub repository with Actions enabled