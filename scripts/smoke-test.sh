#!/usr/bin/env bash
set -euo pipefail

# Note: S3 *website* endpoints are typically HTTP-only (no TLS), so default to http.
BASE_URL=${BASE_URL:-"http://www.simonpainter.com.s3-website.eu-west-2.amazonaws.com"}

fail() { echo "FAIL: $*" >&2; exit 1; }

curl_ok() {
  local url="$1"
  # -f: fail on 4xx/5xx, -sS: quiet but show errors, -L: follow redirects
  curl -fsSL --max-time 20 "$url" >/dev/null
}

curl_body() {
  local url="$1"
  curl -fsSL --max-time 20 "$url"
}

retry() {
  local attempts="$1"; shift
  local delay=5
  local n=1
  until "$@"; do
    if [ $n -ge $attempts ]; then
      return 1
    fi
    echo "Retry $n/$attempts failed; sleeping ${delay}s..." >&2
    sleep "$delay"
    n=$((n+1))
    delay=$((delay*2))
    if [ $delay -gt 60 ]; then delay=60; fi
  done
}

echo "Smoke test BASE_URL=$BASE_URL"

# Core pages
PAGES=(
  "/"
  "/azure-virtual-network-appliance/"
  "/tags/" # ensure at least one listing page works
  "/sitemap.xml"
  "/rss.xml"
  "/atom.xml"
)

for p in "${PAGES[@]}"; do
  url="$BASE_URL$p"
  echo "GET $url"
  retry 6 curl_ok "$url" || fail "GET failed: $url"
 done

# Content sanity on homepage
HOME_HTML=$(retry 6 curl_body "$BASE_URL/" || true)
[[ -n "$HOME_HTML" ]] || fail "empty homepage body"

echo "$HOME_HTML" | grep -Eqi "<title[^>]*>[^<]*Simon Painter|content="Simon Painter"" || fail "homepage does not contain expected title/og:title marker for Simon Painter"

# Asset sanity: pick first CSS/JS with a root-relative href/src and ensure it 200s.
ASSET=$(echo "$HOME_HTML" | tr '"' '\n' | grep -E '^/(assets|css|js)/.+\.(css|js)$' | head -n 1 || true)
if [[ -n "$ASSET" ]]; then
  echo "Asset check: $ASSET"
  retry 6 curl_ok "$BASE_URL$ASSET" || fail "asset fetch failed: $ASSET"
else
  echo "WARN: couldn't auto-detect an asset URL from homepage HTML"
fi

echo "OK: smoke tests passed"
