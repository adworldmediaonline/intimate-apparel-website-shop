# Server-side Google Tag Manager on Vercel

Deploys Google's server-side GTM (sGTM) tagging server and preview server as two
Vercel projects, and proxies the tagging server through the storefront so it is
first-party.

**Nothing here is live yet.** These are Dockerfiles and instructions. Until you
work through the steps below, no container is deployed and the storefront is
unchanged — the proxy rewrite in `website/next.config.js` is inert until
`GTM_SERVER_URL` is set.

Checked against Google's
[manual setup guide](https://developers.google.com/tag-platform/tag-manager/server-side/manual-setup-guide)
and [same-origin guide](https://developers.google.com/tag-platform/tag-manager/server-side/custom-domain?option=same-origin),
and against the tagging server's own source (image `gtm-cloud-image:stable`,
launcher version 4.4.0). Where the docs are silent, the notes below say what the
code does.

---

## How the image actually works

Worth knowing before you deploy, because it changes how updates and cold starts
behave:

- The image is a **thin launcher**. `server_bin.js` is 6 KB. On every boot it
  downloads the real server code from
  `https://www.googletagmanager.com/static/serverjs/server_bootstrap.js` and runs
  it.
- So the container needs **outbound HTTPS at startup** to
  `www.googletagmanager.com`, `tagmanager.google.com` and `publicsuffix.org`.
  Vercel allows outbound traffic, so this works — but if Google's endpoint is
  unreachable at boot, the server does not start.
- A **cold start includes that download**, which makes cold starts on Vercel
  slower than the image size suggests. See step 9.
- Server-code updates arrive **automatically on every boot** — you do not need to
  rebuild the image for them. Only the launcher itself is frozen at build time.

---

## Read this first

sGTM was designed for Google Cloud Run. It runs on Vercel, but two of Google's
requirements have no equivalent here. Decide these are acceptable before you
start.

**1. The preview server cannot be pinned to one instance.**
Google: *"You must deploy exactly 1 preview server. Do not configure autoscaling
beyond 1 instance."* The debug session lives in memory on one instance. Vercel
autoscales Functions and gives no way to cap the count, so GTM's Preview pane may
attach to one instance while your test hits land on another, and events appear to
vanish.

This matters most while you are *building* tags, when you need debugging to be
trustworthy. If preview turns out unusable, deploy only the preview server on
Cloud Run (`--max-instances=1`; it is tiny and idle most of the time) and point
`PREVIEW_SERVER_URL` at it. The tagging server can stay on Vercel.

**2. Idle behaviour is unclear.**
Vercel's container docs say a Function with no traffic for 5 minutes scales down;
Fluid's "scale to one" says production instances stay warm if invoked in the last
14 days. Vercel does not say which applies to container images. Assume the
container may cold-start after quiet periods, and remember each cold start also
downloads the bootstrap from Google.

**If either is a blocker**, host both servers on Cloud Run with
`--min-instances=1` (tagging) and `--max-instances=1` (preview), then skip to
step 7 and point `GTM_SERVER_URL` at the Cloud Run URL. Everything from step 7
onward is identical.

**3. Vercel can see this data.**
Google's guide: *"the owner of the server environment may have access to your
data."* On this setup that is Vercel. Your privacy policy describes analytics
cookies, so this is consistent with it — but it is a processor to be aware of
under the DPDP Act.

---

## Prerequisites

- A Google Tag Manager account with a **Server** container
  (Admin → Container → New, container type "Server").
- A **Web** container already live on the storefront — see
  "Prerequisite: client-side GTM" at the bottom. **Not done yet in this repo.**
- A Vercel account on **Pro or above**.
- Vercel CLI: `npm i -g vercel`

---

## Step 1 — Get your container config

1. Open your **server** container workspace in Tag Manager.
2. Click the **container ID** (`GTM-XXXXXXX`) at the **top-right** of the page.
3. Click **Manually provision tagging server**.
4. Copy the **Container Config** value — a long base64 string.

Treat it as a secret. Anyone with it can send data into your container.

Optional, to see every setting the image accepts (needs Docker locally):

```bash
docker run gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable server_bin.js --help
```

---

## Step 2 — Deploy the preview server

The preview server goes first, because the tagging server needs its URL.

```bash
cd website/gtm-server/preview
vercel link          # create a NEW project, e.g. "unwrapher-gtm-preview"
```

In the Vercel project settings, set **Root Directory** to
`website/gtm-server/preview`. If the root is left at the repository or at
`website/`, Vercel builds the Next.js storefront instead of the container.

Set this environment variable (Production):

| Variable | Value |
|---|---|
| `CONTAINER_CONFIG` | the string from step 1 |

```bash
vercel env add CONTAINER_CONFIG production
vercel --prod
```

Do **not** set these — they are already in `preview/Dockerfile.vercel`:

- `RUN_AS_PREVIEW_SERVER=true` — baked in so it cannot be forgotten.
- `PORT=8080` — the server's default; Vercel routes to it.

Do **not** set `PREVIEW_SERVER_URL` on this project. Google: *"should not be set
with the run_as_preview_server setting set to true."*

**Never set `RUN_AS_PREVIEW_SERVER` to an empty value.** The server's boolean
parser accepts only `1`/`true`/`t` or `0`/`false`/`f`; anything else, including
an empty string, throws `Invalid Boolean flag` and the server crashes on boot.

Check it:

```bash
curl -s https://unwrapher-gtm-preview.vercel.app/healthy
# expect the body: ok
```

---

## Step 3 — Deploy the tagging server

```bash
cd ../tagging
vercel link          # a SECOND new project, e.g. "unwrapher-gtm"
```

Root Directory: `website/gtm-server/tagging`.

| Variable | Value |
|---|---|
| `CONTAINER_CONFIG` | the same string, byte-identical to the preview server's |
| `PREVIEW_SERVER_URL` | the preview URL from step 2, HTTPS, no trailing slash |

```bash
vercel env add CONTAINER_CONFIG production
vercel env add PREVIEW_SERVER_URL production
vercel --prod
```

Google requires every tagging instance to share the same `CONTAINER_CONFIG` and
`PREVIEW_SERVER_URL`. Vercel project variables apply to all instances, so that
holds automatically. A mismatch *between the two projects* fails silently —
preview simply never attaches — so copy both from the same source.

`RUN_AS_PREVIEW_SERVER=false` is baked into `tagging/Dockerfile.vercel`. This is
safe: the parser treats the string `false` as false (checked in the server
source, not assumed).

```bash
curl -s https://unwrapher-gtm.vercel.app/healthy
# expect: ok
```

---

## Step 4 — Confirm the image built

The most likely first failure. Vercel's builder has to pull
`gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable`.

Vercel → Deployments → the deployment → **Build Logs**: confirm the image pulled
and the build succeeded.

If the pull is blocked, mirror the image into
[Vercel Container Registry](https://vercel.com/docs/container-registry) and change
the `FROM` line in both Dockerfiles to your VCR copy.

---

## Step 5 — Keep both projects at 1 vCPU

Google: *"The provisioned servers should have at most 1 vCPU. Additional vCPUs
are not utilized and affect autoscaling negatively."*

Vercel's default is 2 GB / 1 vCPU, which is correct. Pro plans can raise it to
2 vCPU — **do not** raise function memory or CPU on either GTM project.

---

## Step 6 — Check the storefront still deploys as Next.js

This folder lives inside `website/`, the storefront's project root. Vercel
auto-detects `Dockerfile.vercel` at a project's **root**; these are nested under
`gtm-server/`, so the storefront should be unaffected. Confirm it on the next
storefront deploy: the build log should show a Next.js build, not a container
build.

---

## Step 7 — Proxy it first-party from the storefront

Already in `website/next.config.js`, inert until configured:

```js
const GTM_SERVER_URL = process.env.GTM_SERVER_URL?.trim().replace(/\/+$/, '');

// inside rewrites():
...(GTM_SERVER_URL
  ? [{ source: '/metrics/:path*', destination: `${GTM_SERVER_URL}/metrics/:path*` }]
  : []),
```

On the **storefront** Vercel project, set:

| Variable | Value |
|---|---|
| `GTM_SERVER_URL` | `https://unwrapher-gtm.vercel.app` (no trailing slash, no `/metrics`) |

Not `NEXT_PUBLIC_` — it is read at build time by the Next config and must not
reach the browser. Redeploy the storefront.

What this rewrite does, all tested against a stand-in upstream:

| Same-origin requirement | Result |
|---|---|
| Route `/metrics/*` to the server | ✓ every sub-path forwarded |
| Route the `/_/*` sub-path — *"failure to route `/_/*` will break core functionality"* | ✓ `/metrics/_/set_cookie` arrives intact |
| Forward cookies and query strings | ✓ both forwarded |
| `Host` = the tagging server's own domain | ✓ |
| Client IP for geolocation | ✓ `X-Forwarded-For` passed through |
| Path must not contain `/gtm` | ✓ `/metrics` |
| Site's own root `/_/` untouched | ✓ not proxied |

**The `/metrics` prefix is forwarded, not stripped.** Google's docs do not say
either way. The server code settles it: it matches `/healthy` with
`pathname.endsWith("/healthy")` and preview traffic with
`indexOf("/gtm/debug/")` — deliberately tolerant of a prefix arriving — and
Google's reference load-balancer setup routes `/metrics/*` with no path rewrite.

Check the proxy:

```bash
curl -s https://unwrapher.com/metrics/healthy
# expect the body: ok
```

A 200 with an HTML body means the rewrite is not active and Next.js served its
404 page — `GTM_SERVER_URL` is missing or the storefront was not redeployed.

`/metrics` is arbitrary but deliberately dull. Avoid `/gtm`, `/gtag` and
`/analytics` — blocklists match on those, and Google forbids `/gtm`.

---

## Step 8 — Point GTM at the first-party URL

Server container → **Admin** → **Container Settings** → **Server container URL**:

1. **Remove all previous URLs.** Google: *"all server container URLs must share
   the same path."* A leftover `.vercel.app` URL with no path breaks this.
2. **Add URL**: `https://unwrapher.com/metrics` — including the path prefix.
3. **Save**.

Not the `.vercel.app` URL. First-party cookies are the whole reason to do this.

---

## Step 9 — Measure the cold start before you trust it

This decides whether the Vercel route was a good idea:

```bash
# after 15+ minutes with no traffic to the tagging server
curl -o /dev/null -s -w 'cold: %{time_total}s\n' https://unwrapher.com/metrics/healthy
curl -o /dev/null -s -w 'warm: %{time_total}s\n' https://unwrapher.com/metrics/healthy
```

Repeat at several times of day, including early morning. A cold start here
includes downloading the bootstrap from Google, so expect it to be slower than a
plain Node app. Consistently under ~1s is fine. Several seconds means move the
tagging server to Cloud Run with `--min-instances=1`; only `GTM_SERVER_URL`
changes.

---

## Step 10 — Verify in GTM preview

Google's validation, exactly:

1. Server container → **Preview**. The preview page should load.
2. In another tab, open **any path on the Server container URL**, for example
   `https://unwrapher.com/metrics/test`.
3. The preview page should show that request.

Use a direct URL, not the storefront homepage. The storefront sends nothing to the
server container until your web container is configured to use it, so loading the
homepage proves nothing at this stage.

If the request does not appear, in order of likelihood:

- `CONTAINER_CONFIG` differs between the two projects.
- `PREVIEW_SERVER_URL` is wrong, not HTTPS, or has a trailing slash.
- The autoscaling problem from "Read this first" — retry several times. If it is
  intermittent, that is the diagnosis, and moving the preview server to Cloud Run
  is the fix.

---

## Keeping it healthy and up to date

**Health.** The image ships a Docker `HEALTHCHECK` against `/healthy`. Vercel
ignores it and has no liveness probes, so nothing restarts an unhealthy instance
for you. Add an external uptime monitor on `https://unwrapher.com/metrics/healthy`
that alerts when the body is not `ok`.

**Updates.** Google says to restart servers periodically so they pick up new
server code. Because the launcher downloads the server code on boot, a restart is
all it takes — on Vercel, that means a redeploy, and every cold start does it
too.

The launcher image itself only needs refreshing for major versions (e.g. 4.x →
5.x). To pick up a new `:stable`, redeploy **both** projects with the build cache
disabled, so Vercel re-pulls the base image instead of reusing the cached layer:

```bash
vercel --prod --force
```

Deploy preview and tagging together — Google: update *"the single preview server
and all tagging servers."* Vercel retires the old deployment automatically.

To confirm: Server container → **Preview** → send a request in another tab →
**Console** tab should show no "update your tagging server" message. That message
can linger for up to a day after a successful update.

---

## Environment variables, all together

**Preview server project** — Root Directory `website/gtm-server/preview`

| Variable | Notes |
|---|---|
| `CONTAINER_CONFIG` | secret |

**Tagging server project** — Root Directory `website/gtm-server/tagging`

| Variable | Notes |
|---|---|
| `CONTAINER_CONFIG` | must match preview exactly |
| `PREVIEW_SERVER_URL` | HTTPS, no trailing slash |

**Storefront project** — Root Directory `website`

| Variable | Notes |
|---|---|
| `GTM_SERVER_URL` | tagging deployment URL; build-time, not `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_GTM_ID` | your **web** container ID (`GTM-XXXXXXX`) |

Baked into the Dockerfiles, do not set: `RUN_AS_PREVIEW_SERVER`, `PORT`.

Other settings the server accepts (defaults are fine): `HOST` (empty = listen on
all interfaces, which is what Vercel needs), `CONTAINER_REFRESH_SECONDS`,
`HTTP_PROXY` / `NO_PROXY`.

---

## BigQuery or Firestore tags (optional)

Only if you add tags that write to BigQuery or Firestore.

`GOOGLE_APPLICATION_CREDENTIALS` is a **file path**, not the key itself. Google's
guide mounts the JSON key as a volume
(`-v key.json:/app/service_account_key.json`). **Vercel cannot mount volumes**, so
setting the variable to the JSON contents does not work.

Do not `COPY` the key into the image — that bakes a credential into an image stored
in the registry. The workable option on Vercel is a small entrypoint that writes
the key from an environment variable to a file at startup, then execs
`/nodejs/bin/node server_bin.js`. If you need these tags, that is a good reason to
use Cloud Run instead, which handles service-account identity natively.

---

## Prerequisite: client-side GTM

**Not configured in this repo yet.**

- `website/.env` → `NEXT_PUBLIC_GTM_ID=""`
- `brand.config.json` → `integrations.gtmId: null`

The wiring exists: `website/src/app/layout.jsx` renders
`<GoogleTagManager gtmId={GTM_ID} />` only when the ID is non-empty, so today it
renders nothing.

1. Create a **Web** container in GTM (separate from the server container).
2. Set `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX` in `website/.env` and on the Vercel
   storefront project.
3. Redeploy and confirm tags fire in the web container's Preview.

A server container with no web container feeding it receives nothing. Get
client-side GTM working and your events confirmed before moving anything
server-side.

---

## Cost

Vercel bills active CPU. The tagging server is invoked on every pageview and
event, so cost scales with traffic. Cloud Run with a warm instance is roughly
$10–20/month flat. At low volume Vercel is cheaper; the crossover is somewhere in
the tens of thousands of monthly sessions.

---

## Files

```
website/gtm-server/
├── README.md                 this file
├── tagging/
│   └── Dockerfile.vercel     tagging server (RUN_AS_PREVIEW_SERVER=false, PORT=8080)
└── preview/
    └── Dockerfile.vercel     preview server (RUN_AS_PREVIEW_SERVER=true,  PORT=8080)
```

No `vercel.json` is needed. Google requires a timeout over 20 seconds; Vercel's
default function duration is 300 seconds.

Both Dockerfiles use `:stable`, Google's rolling tag. Pin a dated tag instead if
you would rather approve launcher upgrades yourself.

---

## Reference

- [sGTM manual setup guide](https://developers.google.com/tag-platform/tag-manager/server-side/manual-setup-guide)
- [Same-origin custom domain](https://developers.google.com/tag-platform/tag-manager/server-side/custom-domain?option=same-origin)
- [Vercel container images](https://vercel.com/docs/functions/container-images)
- [Vercel function limits](https://vercel.com/docs/functions/limitations)
- [Vercel Container Registry](https://vercel.com/docs/container-registry)
