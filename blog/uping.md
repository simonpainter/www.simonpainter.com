---
title: "Meet uping: pronounced 'micro ping'"
authors: simonpainter
tags:
  - networks
  - performance
date: 2026-05-11

---

I use `ping` a lot, but milliseconds can hide the detail I care about. That's where [uping](https://github.com/simonpainter/uping) comes in. It's a small C tool for macOS and Linux that measures ICMP round-trip time in **microseconds**, with colour-coded output you can read at a glance.

<!-- truncate -->

Under the hood, uping uses `clock_gettime(CLOCK_MONOTONIC)` for accurate timing and reports whole microseconds. It prefers raw sockets for the best signal, then falls back to datagram sockets if you do not have the right privileges. In plain terms: it aims for accuracy first, but it still works when your permissions are limited.

```mermaid
flowchart LR
    A[Resolve host] --> B[Start monotonic timer]
    B --> C[Send ICMP echo]
    C --> D[Receive ICMP reply]
    D --> E[Stop timer]
    E --> F[Print RTT in microseconds]
```

If you like seeing how simple the loop is, this is the mental model:

```python
while keep_running:
    sent_at = monotonic_time_us()
    send_icmp_echo(target)
    reply = wait_for_reply(timeout_seconds=2)
    if reply:
        rtt_us = monotonic_time_us() - sent_at
        print_latency(rtt_us)
    else:
        print_timeout()
    sleep(interval_seconds=1)
```

Getting started is as small as the tool itself:

```bash
make
./uping 1.1.1.1
./uping -c 10 -i 0.5 google.com
./uping -W 1 -6 ipv6.google.com
```

Install is one command (`sudo make install`), with a small platform note. On Linux, `setcap` can let you run it without `sudo`. On macOS, if you want raw-socket accuracy without `sudo`, you can use the same setuid-root pattern as system `ping`.

If you want a faster lens on latency and jitter, give it a go: [github.com/simonpainter/uping](https://github.com/simonpainter/uping).
