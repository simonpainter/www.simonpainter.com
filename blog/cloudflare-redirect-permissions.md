---
title: "Cloudflare redirect ruleset auth error: the permission I couldn't find"
authors: simonpainter
tags:
  - terraform
  - troubleshooting
  - dns
date: 2026-08-13
---

I hit a Cloudflare authorisation error while creating a redirect ruleset in Terraform. The error was correct: the token did not have enough rights.

<!-- truncate -->

The confusing part was not the error itself. It was finding which permission was missing. I had `Zone -> DNS -> Edit` and other zone permissions that looked right for a zone `cloudflare_ruleset` with `phase = "http_request_dynamic_redirect"`, but apply still failed.

This was the anonymised error:

```text
Error: failed to make http request with cloudflare_ruleset.redirect_www on zone.tf line 45, in resource "cloudflare_ruleset" "redirect_www":

resource "cloudflare_ruleset" "redirect_www" {

POST "https://api.cloudflare.com/client/v4/zones/<zone_id>/rulesets":
403 Forbidden {"success":false,"errors":[{"code":10000,"message":"Authentication error"}],"messages":[],"result":null}
```

The missing permission was:

- `Account -> Bulk URL Redirects -> Edit`

That took longer than expected to find, because I expected a Single Redirects or Page Rules style permission. The useful takeaway is that Cloudflare permission names do not always map neatly to the Terraform resource name or scope.

Useful docs:

- [Create a redirect rule using Terraform](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/terraform-example/)
- [Create Bulk Redirects via API](https://developers.cloudflare.com/rules/url-forwarding/bulk-redirects/create-api/)
- [API token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/)
