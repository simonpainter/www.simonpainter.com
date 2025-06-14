---

title: Useful sed command
authors: 
  - simonpainter
tags:
  - azure
  - bash
date: 2025-06-14

---

This is here primarily as a reminder to me; a note for when I need this again. You may already know this or you may find this useful to learn this.
<!-- truncate -->
I build a lot of labs in Azure. I try to avoid the clickops approach because it's easier to save the labs that I have built if I do them in terraform and I can share the code with others when I write about it. This means that I often go through itterations where I make changes to VMs and terraform is very conservative with azure resources and will repurpose existing ones before recreating them. If you  make a destructive change to a VM you'll often find it gets attached to the same pip as the previous VM.

> A pip is a cute way of saying Azure Public IP. I am not sure if it's official but I think
> it's pretty commonplace to prefix the names with pip and so that's what I call them. Don't
> confuse it with python pip which is the package installer for python.

There is a mechanism in SSH where the fingerprint of the key for a host is added to your known hosts file so if you try to connect again in future and it has changed you get a warning. If you connect by FQDN or hostname it's stored against the host whereas if you connect by IP it's stored against that. It means it's harded for someone to hijack myhost.foo.bar so you SSH into it and hand it your credentials.

You'll have seen this message the first time you connected to a host using ssh and you may have just answered yes without really understanding what it was.

```bash
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '20.2.203.67' (ED25519) to the list of known hosts.
```

When you connect to a VM with the same address but that has changed SSH keys (because either you replaced the keys or replaced the host itself) you get a useful warning that prevents you from connecting.

```bash
simon@MacBook-Pro latency-test % ssh 20.2.203.67
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the ED25519 key sent by the remote host is
SHA256:ZTSAbBMCdno0oVBZIJ3t1YSWMGB5j6v0tf6g4Urk4xo.
Please contact your system administrator.
Add correct host key in /Users/simon/.ssh/known_hosts to get rid of this message.
Offending ECDSA key in /Users/simon/.ssh/known_hosts:68
Host key for 20.2.203.67 has changed and you have requested strict checking.
Host key verification failed.
```

The message explains how you fix it if you are sure that the change was intended and is genuine. You simply remove the offending line from the known_hosts file which you can do with pretty much any text editor. A marginally quicker alternative is to use sed which will output the contents of a file with a search string appled - ```sed nd file.txt``` will return file.txt with line n removed. In our case we want known_hosts without line 68 so ```sed 68d /path/to/known_hosts``` but as we want to save that output we pipe it back into the same file location with ```sed 68d /path/to/known_hosts > /path/to/known_hosts```.
The output looks a bit like the below, and you'll see that I could then connect and add the new fingerprint.

```bash
simon@MacBook-Pro latency-test % sed 68d /Users/simon/.ssh/known_hosts > /Users/simon/.ssh/known_hosts
simon@MacBook-Pro latency-test % ssh 20.2.203.67                                                      
The authenticity of host '20.2.203.67 (20.2.203.67)' can't be established.
ED25519 key fingerprint is SHA256:ZTSAbBMCdno0oVBZIJ3t1YSWMGB5j6v0tf6g4Urk4xo.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '20.2.203.67' (ED25519) to the list of known hosts.
simon@20.2.203.67's password: 
```

There is another way, an arguably more correct way, using ssh-keygen to remove the host. This makes a backup which seems like a fairly redundant step for me.

```bash
simon@MacBook-Pro latency-test % ssh-keygen -R 20.2.203.67
# Host 20.2.203.67 found: line 6
# Host 20.2.203.67 found: line 7
/Users/simon/.ssh/known_hosts updated.
Original contents retained as /Users/simon/.ssh/known_hosts.old
simon@MacBook-Pro latency-test % 
```

The host IPs are random Azure pips that I was using at the time of writing this. Don't bother, there was nothing interesting on them at the time and I returned them to the pool a while ago.
