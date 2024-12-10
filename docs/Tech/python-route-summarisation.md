---

title: "Python Route Summarisation"
---


There used to be a great little website for route summarisation and it did it far more intelligently than Cisco kit does it. It looks like the site has dropped off the internet which is a shame but there is a handy python library called netaddr with has the same capabilities.

I have written a little wrapper for it which will regex the prefixes out of a ‘show ip bgp’ and then list the summary routes. You pass the output of ‘show ip bgp’ as a text file, it’s the only argument the script expects.

```py
from netaddr import IPNetwork, cidr_merge
import re, sys
try:
	filename = sys.argv[1] 
except:
	print("Please specify a file name for input")
	sys.exit()

with open (filename, "r") as file:
	table = file.read().replace('\n', '')
prefixes = re.findall("(?:\d{1,3}\.){3}\d{1,3}\/\d+", table)
prefix_list = []
for each in prefixes:
	prefix_list.append(IPNetwork(each))
summary_list = cidr_merge(prefix_list)
print('Number of prefixes ', len(prefix_list))
print('Number in summary ', len(summary_list))
print('Summary list:')
for each in summary_list:
	print(each.cidr)

```

https://gist.github.com/simonpainter/4c1771f6c6580164c0f46f0fb5368617

You’ll need to install netaddr – the easiest way is probably ‘pip install netaddr’
