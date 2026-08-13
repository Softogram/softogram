#!/usr/bin/env bash
# Uptime and TLS expiry check (issue #49).
#
# Exists because api.softogram.in's certificate expired and went unnoticed for
# weeks. Nothing was watching. This does not replace a real uptime service - it
# runs on a schedule, so it cannot see an outage between runs - but it needs no
# third-party account and it would have caught that cert with weeks to spare.
#
# Exits non-zero on any failure so the calling workflow goes red, which is what
# actually sends the notification.
#
# Deliberately avoids `declare -A`: macOS still ships bash 3.2, and the first
# version of this script used an associative array, silently checked nothing,
# and exited 0. A monitor that reports success while doing no work is worse than
# no monitor, so targets are a plain list and the run fails if none were checked.
set -uo pipefail

# One entry per target: "host<TAB>health path".
# Overridable so the failure path can be exercised without waiting for a real
# outage - a monitor nobody has ever seen go red is not a monitor.
TARGETS="${TARGETS:-$(printf 'softogram.in\t/\napi.softogram.in\t/api/')}"

# Warn well before expiry: a cert has to be renewed *and* deployed, and whoever
# can do that may be away.
MIN_CERT_DAYS="${MIN_CERT_DAYS:-21}"
TIMEOUT="${TIMEOUT:-15}"

failures=0
checked=0
note() { printf '%s\n' "$*"; }
fail() { printf '::error::%s\n' "$*"; failures=$((failures + 1)); }

while IFS=$'\t' read -r host path; do
  [ -n "$host" ] || continue
  checked=$((checked + 1))
  url="https://${host}${path}"
  note "--- ${host} ---"

  # --- reachability ---
  # curl already prints 000 when the request never completed; do not append another.
  code=$(curl -s -o /dev/null -m "$TIMEOUT" -w '%{http_code}' "$url")
  [ -n "$code" ] || code="000"
  if [ "$code" = "200" ]; then
    note "  HTTP ${code} ${url}"
  else
    fail "${host} returned HTTP ${code} for ${url} (expected 200)"
  fi

  # --- TLS expiry ---
  end_date=$(echo | openssl s_client -servername "$host" -connect "${host}:443" 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

  if [ -z "$end_date" ]; then
    fail "${host}: could not read the TLS certificate"
    continue
  fi

  # GNU date and BSD date disagree on parsing, so try both.
  if end_epoch=$(date -d "$end_date" +%s 2>/dev/null); then :
  elif end_epoch=$(date -j -f "%b %e %T %Y %Z" "$end_date" +%s 2>/dev/null); then :
  else
    fail "${host}: could not parse certificate expiry '${end_date}'"
    continue
  fi

  days_left=$(( (end_epoch - $(date +%s)) / 86400 ))
  if [ "$days_left" -lt "$MIN_CERT_DAYS" ]; then
    fail "${host}: TLS certificate expires in ${days_left} day(s) on ${end_date} (threshold ${MIN_CERT_DAYS})"
  else
    note "  TLS ok - ${days_left} days left (expires ${end_date})"
  fi
done <<< "$TARGETS"

note ""
if [ "$checked" -eq 0 ]; then
  fail "no targets were checked - the target list failed to parse"
fi

if [ "$failures" -gt 0 ]; then
  note "${failures} check(s) failed."
  exit 1
fi
note "All ${checked} target(s) healthy."
