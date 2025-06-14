---

title: Useful sed command
authors: 
  - simonpainter
tags:
  - azure
  - bash
date: 2025-01-14

---


```
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
simon@MacBook-Pro latency-test % sed 68d /Users/simon/.ssh/known_hosts > /Users/simon/.ssh/known_hosts
simon@MacBook-Pro latency-test % ssh 20.2.203.67                                                      
The authenticity of host '20.2.203.67 (20.2.203.67)' can't be established.
ED25519 key fingerprint is SHA256:ZTSAbBMCdno0oVBZIJ3t1YSWMGB5j6v0tf6g4Urk4xo.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '20.2.203.67' (ED25519) to the list of known hosts.
simon@20.2.203.67's password: 
```