---

title: Microsoft documentation hidden intent
authors: simonpainter
tags:
  - business
  - cloud
  - azure
  - github
  - personal
date: 2025-02-18

---

I found an interesting little field hidden in plain sight in Microsoft documentation. A clever chap recently said this to me: 'if you can figure out what problem the engineers were trying to solve then it makes it easier to understand why the product works the way it does'.
<!--truncate-->

Microsoft documentation is now pretty much all backed by a [GitHub](https://github.com/MicrosoftDocs) repository, much like this site is. The idea is that anyone can improve on it by submitting pull requests as you might do on an open source software project. Also much like this site there is an easy button to link from each page to the markdown file that the page is generated from - you can see it in the top right of the page below; you'll also see that [this particular page](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview) has had contributions from a fair few people.

![Screen capture showing edit button](img/edit_button.png)

The [markdown renders pretty well in GitHub](https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/virtual-network/virtual-networks-overview.md) and you get access to the full version history of the document including the brilliant [Blame view](https://github.com/MicrosoftDocs/azure-docs/blame/main/articles/virtual-network/virtual-networks-overview.md) which shows you who wrote what and when. What I found most interesting though is tucked away as a comment in the markdown and only visible if you look at the [unrendered code](https://github.com/MicrosoftDocs/azure-docs/blob/main/articles/virtual-network/virtual-networks-overview.md?plain=1).

![Screen capture showing code](img/intent.png)

The quality of the intent field does vary but it gives an excellent view of what the document is trying to convey, and with some features it gives an insight into what problem the feature itself is trying to solve.

```markdown
# Customer intent: As someone with a basic network background who is 
new to Azure, I want to understand the capabilities of Azure Virtual
Network so that my Azure resources can securely communicate with each
other, the internet, and my on-premises resources.
```

If you're studying Microsoft documentation a lot it's worth checking this field out.