# Finding dead DHCP scopes

I am working on a DHCP migration and it turns out that the people who managed the DHCP server previously weren’t that great at cleaning up old scopes when sites were closed. It’s next to impossible to identify from the number of leases because some of the live sites are only rarely used so I thought I’d knock up a little script to ping the default gateway to see if the subnet is still there.


```# Requires DHCP Server Module for Powershell
#Select the DHCP Server to run the report against
$DhcpServer = "dhcpserver01.blah.local"

#Get all the DHCP Scopes from the server
$DhcpScopes = Get-DhcpServerv4Scope -ComputerName $DhcpServer

#Where to put the output
$OutputPath = "./Output.csv"

#Begin looping through all the scopes with a temp variable called $DhcpScope for each scope
foreach ($DhcpScope in $DhcpScopes) {
#Extract the Option 003 router value from each scope
$Router = Get-DHCPServerv4OptionValue -ComputerName $DhcpServer -ScopeID $DhcpScope.ScopeId -OptionId 3

#Attempt to ping the router and store the result as a success or failure.
if (Test-Connection $Router.Value -Count 2 -Delay 1 -Quiet) {
$pingresult = "success"
} else {
$pingresult = "failure"
}

#Build an object that holds the results for this scope
$data = [pscustomobject]@{
"Scope ID" = $DhcpScope.ScopeID.IPAddressToString
"Scope Name" = $DhcpScope.Name
"Option 003 Router" = $Router.Value[0]
"Ping Result" = $pingresult
}
#Print the current record to demonstrate progress
$data
#Append the result to the output
$data | Export-Csv -Path $OutputPath -Append
}
```