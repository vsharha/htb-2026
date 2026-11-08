# Decision model on Vultr

A Vultr Cloud GPU instance running a Jev-compatible System One decision model
behind a token-protected HTTPS endpoint. The web app's audience scoring calls
`/v1/systemone` on it, so the decision model runs on Vultr rather than a hosted
API.

The instance installs NVIDIA drivers (rebooting once if needed), Ollama, the
model and Caddy from cloud-init. Caddy obtains a certificate for
`<ip>.sslip.io`, which resolves to the instance, and returns 401 unless the
request carries the bearer token. Ollama itself stays on localhost.

## Use

```sh
export VULTR_API_KEY=...          # console.vultr.com > API
tofu init
tofu plan
tofu apply
```

Then point the web app at it:

```sh
tofu output -raw url              # https://<ip>.sslip.io
tofu output -raw token            # sensitive
```

and set `SYSTEMONE_BASE_URL` and `SYSTEMONE_API_TOKEN` in `web/.env.local`.

The instance bills hourly from creation. Destroy it when the demo ends:

```sh
tofu destroy
```

## Plan choice

`plan` defaults to `vcg-a16-1c-6gb`, the cheapest NVIDIA plan with enough VRAM
for `clef-flash` (11–12 GB). List what the account can actually deploy:

```sh
curl -s -H "Authorization: Bearer $VULTR_API_KEY" \
  'https://api.vultr.com/v2/plans?type=vcg' | jq '.plans[] | {id, gpu_type, gpu_vram, locations}'
```

Any CPU plan also works — Ollama falls back to CPU when no driver is present —
but a 9B model then takes tens of seconds per request instead of milliseconds.
