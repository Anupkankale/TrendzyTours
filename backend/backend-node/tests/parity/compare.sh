#!/usr/bin/env bash
# Response-parity harness: hits the Laravel and Node backends with the same
# request and diffs the normalised JSON plus the HTTP status.
#
#   LARAVEL=http://127.0.0.1:8888 NODE=http://localhost:5000 bash tests/parity/compare.sh
#
# Both must be freshly seeded from their own seeders. Ids and timestamps of
# rows the seeders generate (leads, bookings) are blanked before diffing;
# everything else must match byte for byte.

set -uo pipefail

LARAVEL="${LARAVEL:-http://127.0.0.1:8888}"
NODE="${NODE:-http://localhost:5000}"
OUT="$(dirname "$0")/out"
NORMALIZE="$(dirname "$0")/normalize.js"

mkdir -p "$OUT"
rm -f "$OUT"/*.json "$OUT"/*.jar 2>/dev/null

PASS=0
FAIL=0
DEVIATIONS=0
FAILED_CASES=()

# Set for the next compare() call only: the body is *expected* to differ, and
# the reason is printed instead of counting as a failure. Used where matching
# Laravel byte for byte would mean shipping PHP internals in a Node response.
EXPECT_DIFF=""

login() { # login <base> <jar> <email> <password>
  curl -s -c "$2" -X POST "$1/api/auth/login" \
    -H 'Content-Type: application/json' -H 'Accept: application/json' \
    -d "{\"email\":\"$3\",\"password\":\"$4\"}" > /dev/null
}

for role in admin sales seo; do
  case $role in
    admin) creds="admin@trendzytours.com admin123" ;;
    sales) creds="sales@trendzytours.com sales123" ;;
    seo)   creds="seo@trendzytours.com seo12345" ;;
  esac
  # shellcheck disable=SC2086
  login "$LARAVEL" "$OUT/l-$role.jar" $creds
  # shellcheck disable=SC2086
  login "$NODE" "$OUT/n-$role.jar" $creds
done

# compare <label> <method> <path> [role] [json-body] [volatile keys...]
compare() {
  local label="$1" method="$2" path="$3" role="${4:-}" body="${5:-}"
  shift 5 2>/dev/null || shift $#
  local volatile=("$@")
  local slug; slug="$(echo "$label" | tr -c 'a-zA-Z0-9' '_')"

  local l_args=(-s -o "$OUT/$slug.laravel.raw" -w '%{http_code}' -X "$method" -H 'Accept: application/json')
  local n_args=(-s -o "$OUT/$slug.node.raw"    -w '%{http_code}' -X "$method" -H 'Accept: application/json')

  if [[ -n "$role" ]]; then
    l_args+=(-b "$OUT/l-$role.jar")
    n_args+=(-b "$OUT/n-$role.jar")
  fi
  if [[ -n "$body" ]]; then
    l_args+=(-H 'Content-Type: application/json' -d "$body")
    n_args+=(-H 'Content-Type: application/json' -d "$body")
  fi

  local l_code n_code
  l_code="$(curl "${l_args[@]}" "$LARAVEL$path")"
  n_code="$(curl "${n_args[@]}" "$NODE$path")"

  node "$NORMALIZE" "${volatile[@]}" < "$OUT/$slug.laravel.raw" > "$OUT/$slug.laravel.json"
  node "$NORMALIZE" "${volatile[@]}" < "$OUT/$slug.node.raw"    > "$OUT/$slug.node.json"

  local reason="$EXPECT_DIFF"
  EXPECT_DIFF=""

  if [[ "$l_code" != "$n_code" ]]; then
    printf '  FAIL  %-46s status %s (laravel) vs %s (node)\n' "$label" "$l_code" "$n_code"
    FAIL=$((FAIL + 1)); FAILED_CASES+=("$label"); return
  fi

  if diff -q "$OUT/$slug.laravel.json" "$OUT/$slug.node.json" > /dev/null; then
    printf '  ok    %-46s %s\n' "$label" "$l_code"
    PASS=$((PASS + 1))
  elif [[ -n "$reason" ]]; then
    printf '  DIFF  %-46s %s — by design: %s\n' "$label" "$l_code" "$reason"
    DEVIATIONS=$((DEVIATIONS + 1))
  else
    printf '  FAIL  %-46s %s — body differs\n' "$label" "$l_code"
    diff "$OUT/$slug.laravel.json" "$OUT/$slug.node.json" | head -20 | sed 's/^/          /'
    FAIL=$((FAIL + 1)); FAILED_CASES+=("$label")
  fi
}

echo "Laravel: $LARAVEL"
echo "Node:    $NODE"
echo
echo "Public tours"
compare "GET /api/tours"                     GET "/api/tours"
compare "GET /api/tours?category=domestic"   GET "/api/tours?category=domestic"
compare "GET /api/tours?region=europe"       GET "/api/tours?region=europe"
compare "GET /api/tours?featured=true"       GET "/api/tours?featured=true"
compare "GET /api/tours?featured=false"      GET "/api/tours?featured=false"
compare "GET /api/tours?category="           GET "/api/tours?category="
compare "GET /api/tours/{slug}"              GET "/api/tours/bali-bliss-7-nights"
compare "GET /api/tours/{slug} x8"           GET "/api/tours/mediterranean-cruise-10-nights"

echo
echo "Auth"
compare "POST /api/auth/login (ok)"          POST "/api/auth/login" "" '{"email":"admin@trendzytours.com","password":"admin123"}'
compare "POST /api/auth/login (bad pw)"      POST "/api/auth/login" "" '{"email":"admin@trendzytours.com","password":"nope123"}'
compare "POST /api/auth/login (empty)"       POST "/api/auth/login" "" '{}'
compare "POST /api/auth/login (bad email)"   POST "/api/auth/login" "" '{"email":"nope","password":"admin123"}'
compare "GET /api/auth/me (admin)"           GET  "/api/auth/me" admin
compare "GET /api/auth/me (sales)"           GET  "/api/auth/me" sales
compare "GET /api/auth/me (anon)"            GET  "/api/auth/me"
compare "POST /api/auth/logout"              POST "/api/auth/logout" admin

echo
echo "RBAC"
compare "GET /api/leads (seo)"               GET "/api/leads" seo
compare "GET /api/bookings (seo)"            GET "/api/bookings" seo
compare "GET /api/admin/tours (sales)"       GET "/api/admin/tours" sales
compare "GET /api/admin/tours (seo)"         GET "/api/admin/tours" seo
compare "GET /api/leads (anon)"              GET "/api/leads"

echo
echo "Dashboard reads"
# Every seeded tour shares one updated_at, so `latest('updated_at')` leaves the
# tie order unspecified in MySQL. Compare as a set; ordering with distinct
# timestamps is covered by the dashboard walkthrough.
compare "GET /api/admin/tours (admin)"       GET "/api/admin/tours" admin "" --sort-by=id
compare "GET /api/admin/tours/{id}"          GET "/api/admin/tours/b3333333-3333-3333-3333-333333333333" admin
# Ids and timestamps are per-database; the rows themselves must match.
compare "GET /api/leads (admin)"             GET "/api/leads" admin "" id createdAt updatedAt
# Compares the created row itself rather than the list, so the case does not
# depend on how many leads each database already holds.
compare "POST /api/leads (created row)"      POST "/api/leads" sales '{"name":"Parity Lead","email":"parity-lead@example.com","phone":"9876543210","message":"Comparing backends","tourInterest":"Bali Bliss"}' id createdAt updatedAt
compare "GET /api/bookings (admin)"          GET "/api/bookings" admin "" id tourId travelDate adults children createdAt updatedAt status message

echo
echo "Validation and errors"
compare "POST /api/newsletter (ok)"          POST "/api/newsletter" "" '{"email":"parity@example.com"}'
compare "POST /api/newsletter (bad email)"   POST "/api/newsletter" "" '{"email":"nope"}'
compare "POST /api/otp/verify (wrong)"       POST "/api/otp/verify" "" '{"email":"parity@example.com","otp":"123456"}'
compare "POST /api/otp/verify (short otp)"   POST "/api/otp/verify" "" '{"email":"parity@example.com","otp":"12"}'
compare "POST /api/contact (bad token)"      POST "/api/contact" "" '{"name":"Par Ity","email":"parity@example.com","phone":"9876543210","message":"A long enough message","emailToken":"bogus"}'
compare "POST /api/contact (empty)"          POST "/api/contact" "" '{}'
compare "POST /api/leads (empty)"            POST "/api/leads" sales '{}'
compare "POST /api/bookings (empty)"         POST "/api/bookings" sales '{}'
compare "POST /api/bookings (bad tour)"      POST "/api/bookings" sales '{"tourId":"11111111-2222-3333-4444-555555555555","customerName":"Ab","customerEmail":"a@b.co","customerPhone":"9876543210","travelDate":"2030-03-15","adults":1,"source":"call"}'
# Creation returns 201 in Laravel (JsonResource on a fresh model); these two
# cases pin that alongside the body.
compare "POST /api/bookings (created row)"   POST "/api/bookings" sales '{"tourId":"b1111111-1111-1111-1111-111111111111","customerName":"Parity Booking","customerEmail":"parity-booking@example.com","customerPhone":"9876543210","travelDate":"2030-03-15","adults":2,"children":1,"source":"call","message":"Comparing backends"}' id createdAt updatedAt
compare "POST /api/bookings (past date)"     POST "/api/bookings" sales '{"tourId":"b1111111-1111-1111-1111-111111111111","customerName":"Ab","customerEmail":"a@b.co","customerPhone":"9876543210","travelDate":"2020-03-15","adults":1,"source":"call"}'
compare "POST /api/admin/tours (empty)"      POST "/api/admin/tours" admin '{}'
compare "POST /api/admin/tours (dup slug)"   POST "/api/admin/tours" admin '{"name":"Dup","slug":"bali-bliss-7-nights","category":"domestic","region":"asia","destination":"Goa","duration":3,"groupSize":{"min":2,"max":10},"pricePerPerson":15000,"heroImage":"https://e.com/a.jpg","gallery":["https://e.com/a.jpg"],"shortDescription":"s","description":"d","seoDescription":"seo","highlights":["h"],"inclusions":["i"],"exclusions":["e"],"itinerary":[{"day":1,"title":"t","description":"d","meals":["Dinner"],"accommodation":null}]}'
compare "PUT /api/admin/tours (bad group)"   PUT  "/api/admin/tours/b3333333-3333-3333-3333-333333333333" admin '{"groupSize":{"min":10,"max":2}}'
compare "DELETE booked tour"                 DELETE "/api/admin/tours/b1111111-1111-1111-1111-111111111111" admin
EXPECT_DIFF="Laravel leaks the Eloquent class name; Node answers a plain 404"
compare "GET /api/tours/{missing slug}"      GET "/api/tours/no-such-tour"
EXPECT_DIFF="Laravel leaks the Eloquent class name; Node answers a plain 404"
compare "GET /api/admin/tours/{missing}"     GET "/api/admin/tours/deadbeef-0000-0000-0000-000000000000" admin
EXPECT_DIFF="Laravel echoes the unmatched route path; Node answers a plain 404"
compare "GET /api/unknown-route"             GET "/api/unknown-route"

echo
echo "-----------------------------------------------"
printf 'passed %d, failed %d, deviations by design %d\n' "$PASS" "$FAIL" "$DEVIATIONS"
if (( FAIL > 0 )); then
  printf 'failing cases:\n'
  printf '  - %s\n' "${FAILED_CASES[@]}"
  echo "raw payloads in $OUT"
  exit 1
fi
