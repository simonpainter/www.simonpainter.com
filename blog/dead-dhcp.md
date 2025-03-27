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