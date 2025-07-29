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
- Modular Design: Store networking resources are organised in a reusable module

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

For remote state I used terraform cloud with a VCS-driven workflow. This allows you to store your state in a remote location and use version control to manage your changes.There are several options for remote state but Terraform Cloud is pretty good and very easy to set up. 

I used GitHub Actions for the CI/CD pipeline. I use [GitHub Actions for my own website](s3-docusaurus.md) so I am fairly familiar with it. You can achieve the whole thing without using Terraform Cloud if you like, so long as you have a remote state backend.

Finally you need to design your Terraform, ideally with modules for reusable consistent building blocks. I have a module that does the subnetting for a repeatable site type; I work a lot in retail so think of repeatable store networks that are very much cattle and not pets. This module allows you to define a site IP address range and then it will create the subnets for you. This is useful for creating consistent networks across multiple sites.

#### Prerequisites

- NetBox instance with API access
- Terraform Cloud account
- GitHub repository with Actions enabled

There are some great instructions for setting up a Netbox instance if you want one for you lab. I [recently set one up while playing with the MCP server](netbox-mcp.md) and it was very easy to do. You can use Docker or a virtual machine to run Netbox locally, or you can use a hosted version if you prefer. The rest of the prerequistites are free to set up and you can use the free tier of Terraform Cloud and GitHub Actions to get started.

## Setup Guide

Here's my step-by-step guide to set up the Terraform Cloud and GitHub Actions for managing NetBox infrastructure. This guide is for lab use but gives you the solid foundation to create your own production environment.

### 1. Terraform Cloud Setup

#### 1.1 Create Organisation and Workspace

1. Log in to [Terraform Cloud](https://app.terraform.io)
2. Create an organisation (if you don't have one)
3. Create a new workspace:
   - Choose "VCS-driven workflow"
   - Connect to your GitHub repository
   - Set workspace name to `netbox-lab`

#### 1.2 Configure Workspace Settings

1. Go to your workspace → Settings → General
2. Set **Apply Method** to "Auto apply" for automated deployments
3. Set **Terraform Version** to 1.8.2

#### 1.3 Configure Workspace Variables

1. Go to your workspace → Variables
2. Add the following **Terraform variables**:
   - `netbox_url`: Your NetBox server URL (e.g., `https://netbox.example.com`)
   - `netbox_token`: Your NetBox API token (mark as sensitive)

#### 1.4 Generate API Token

1. Go to [User Settings → Tokens](https://app.terraform.io/app/settings/tokens)
2. Click "Create an API token"
3. Provide a description (e.g., "GitHub Actions")
4. Copy the token (you'll need it for GitHub)

### 2. GitHub Repository Setup

#### 2.1 Add Repository Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add the following secret:
   - **Name**: `TF_API_TOKEN`
   - **Value**: Your Terraform Cloud API token from step 1.4

#### 2.2 Verify Workflow File

The repository includes `.github/workflows/terraform.yml` which:
- Runs on push/pull requests to main branch
- Validates terraform formatting and configuration
- Creates plan comments on pull requests
- Triggers Terraform Cloud runs on main branch pushes

Here's my workflow file for reference:

```yaml
name: 'Terraform'

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  terraform:
    name: 'Terraform'
    runs-on: ubuntu-latest

    defaults:
      run:
        shell: bash

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v3
      with:
        terraform_version: 1.8.2
        cli_config_credentials_token: ${{ secrets.TF_API_TOKEN }}

    - name: Terraform Format
      id: fmt
      run: terraform fmt -check

    - name: Terraform Init
      id: init
      run: terraform init

    - name: Terraform Validate
      id: validate
      run: terraform validate -no-color

    - name: Terraform Plan
      id: plan
      if: github.event_name == 'pull_request'
      run: terraform plan -no-color -input=false
      continue-on-error: true

    - name: Update Pull Request
      uses: actions/github-script@v7
      if: github.event_name == 'pull_request'
      env:
        PLAN: "terraform\n${{ steps.plan.outputs.stdout }}"
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        script: |
          const output = `#### Terraform Format and Style 🖌\`${{ steps.fmt.outcome }}\`
          #### Terraform Initialization ⚙️\`${{ steps.init.outcome }}\`
          #### Terraform Validation 🤖\`${{ steps.validate.outcome }}\`
          #### Terraform Plan 📖\`${{ steps.plan.outcome }}\`

          <details><summary>Show Plan</summary>

          \`\`\`\n
          ${process.env.PLAN}
          \`\`\`

          </details>

          *Pushed by: @${{ github.actor }}, Action: \`${{ github.event_name }}\`*`;

          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: output
          })

    - name: Terraform Plan Status
      if: steps.plan.outcome == 'failure'
      run: exit 1

    - name: Trigger Terraform Cloud Run
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: |
        echo "Push to main detected. Terraform Cloud will automatically trigger a run."

```


### 3. NetBox API Setup

#### 3.1 Generate NetBox API Token

1. Log in to your NetBox instance
2. Go to Admin → Users → Tokens
3. Click "Add Token"
4. Set permissions as needed (typically full access for infrastructure management)
5. Copy the token

#### 3.2 Configure Variables in Terraform Cloud

1. Return to your Terraform Cloud workspace → Variables
2. Update the `netbox_token` variable with your NetBox API token
3. Ensure it's marked as **sensitive**

## My first Terraform

Start simple with a terraform provider configuration. This will allow you to connect to your NetBox instance and start managing resources. Create a file called `provider.tf` in your repository with the following content:

```hcl
terraform {
  cloud {
    organization = "{your-organisation}"
    workspaces {
      name = "netbox-lab"
    }
  }

  required_providers {
    netbox = {
      source  = "e-breuninger/netbox"
      version = "4.1.0"
    }
  }
}

provider "netbox" {
  server_url = var.netbox_url
  api_token  = var.netbox_token
}
```

Then you can create a file called `variables.tf` to define the variables used in the provider configuration:

```hcl
variable "netbox_url" {
  description = "The URL of the NetBox server"
  type        = string
}

variable "netbox_token" {
  description = "The API token for the NetBox server"
  type        = string
  sensitive   = true
}
``` 

This should be enough to get you started with the NetBox provider. When you commit and push changes it should trigger the GitHub Actions workflow and run the Terraform commands to validate and apply your configuration. You can check the Actions tab in your GitHub repository to see the progress of the workflow. 