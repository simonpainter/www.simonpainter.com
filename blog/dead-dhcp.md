---

title: "Finding dead DHCP scopes"
authors: simonpainter
tags:
  - dhcp
  - powershell
date: 2024-11-16

---

I'm working on a DHCP migration and discovered the previous admins didn't clean up old scopes when sites closed. It's hard to identify dead scopes from lease numbers since some live sites are rarely used. So I've created a simple script to ping the default gateway to check if the subnet still exists.
<!-- truncate -->

## How it works

The script grabs all DHCP scopes from a server, then tries to ping each scope's default gateway (Option 003 Router). If the ping succeeds, the subnet likely still exists. If it fails, that scope is probably for a closed site and can be removed.

Here's the PowerShell script:

```powershell
# Requires DHCP Server Module for Powershell
# Select the DHCP Server to run the report against
$DhcpServer = "dhcpserver01.blah.local"

# Get all the DHCP Scopes from the server
$DhcpScopes = Get-DhcpServerv4Scope -ComputerName $DhcpServer

# Where to put the output
$OutputPath = "./Output.csv"

# Begin looping through all the scopes with a temp variable called $DhcpScope for each scope
foreach ($DhcpScope in $DhcpScopes) {
# Extract the Option 003 router value from each scope
$Router = Get-DHCPServerv4OptionValue -ComputerName $DhcpServer -ScopeID $DhcpScope.ScopeId -OptionId 3

# Attempt to ping the router and store the result as a success or failure.
if (Test-Connection $Router.Value -Count 2 -Delay 1 -Quiet) {
$pingresult = "success"
} else {
$pingresult = "failure"
}

# Build an object that holds the results for this scope
$data = [pscustomobject]@{
"Scope ID" = $DhcpScope.ScopeID.IPAddressToString
"Scope Name" = $DhcpScope.Name
"Option 003 Router" = $Router.Value[0]
"Ping Result" = $pingresult
}
# Print the current record to demonstrate progress
$data
# Append the result to the output
$data | Export-Csv -Path $OutputPath -Append
}
```

## Using the script

To use this script:

1. Make sure you have the DHCP Server PowerShell module installed
2. Change the `$DhcpServer` variable to your DHCP server's name
3. Run the script in PowerShell

The script creates a CSV file with all scopes and their ping results. You can then filter for failed pings to identify dead scopes for cleanup.

## Why this matters

Cleaning up unused DHCP scopes isn't just about keeping things tidy. It also:

- Makes DHCP servers easier to manage
- Reduces confusion during troubleshooting
- Speeds up server performance
- Prevents IP address conflicts if you reuse address ranges

Since most migrations are charged by the work required, removing unneeded scopes before migration can also save you money.