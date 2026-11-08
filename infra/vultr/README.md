# Decision model on Vultr

A Vultr instance running a Jev-compatible System One decision model behind a
token-protected HTTPS endpoint. The web app's audience scoring calls
`/v1/systemone` on it, so the decision model runs on Vultr rather than a hosted
API.

Cloud-init installs Docker, pulls `ollama/ollama` from Docker Hub (Ollama's own
installer downloads from GitHub releases, which rate-limits), pulls the models,
and runs Caddy. Caddy obtains a certificate for `<ip>.sslip.io`, which resolves
to the instance, returns 401 unless the request carries the bearer token, and
proxies to Ollama on localhost. Ubuntu's firewall only allows SSH, HTTP and
HTTPS.

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

Changing `user_data` replaces the instance, because Vultr only runs it at first
boot.

## Deploying the web app on the same instance

The stack creates the VM; the app is a Next.js build in a Node container sharing
the host network, so it reaches Ollama on `127.0.0.1:11434` and Caddy proxies to
it on port 3000 as `app.<ip>.sslip.io`.

Credentials live in `/srv/placewise/.env` on the host, mode 600, and are passed
with `--env-file` so they never appear in a command line. It holds
`SYSTEMONE_BASE_URL=http://127.0.0.1:11434`, `SYSTEMONE_MODEL=tev1:4b`,
`OPENAI_API_KEY` and `GEOAPIFY_API_KEY`.

```sh
tar --exclude='web/node_modules' --exclude='web/.next' --exclude='web/.env.local' \
  -czf /tmp/placewise.tgz web data
scp /tmp/placewise.tgz root@<ip>:/tmp/
ssh root@<ip> 'mkdir -p /srv/placewise && tar xzf /tmp/placewise.tgz -C /srv/placewise'
ssh root@<ip> 'docker run --rm -v /srv/placewise:/repo -w /repo/web node:22-bookworm \
  bash -lc "corepack enable && corepack prepare pnpm@10.32.1 --activate && pnpm install --frozen-lockfile && pnpm build"'
ssh root@<ip> 'docker run -d --name placewise-web --restart unless-stopped --network host \
  -v /srv/placewise:/repo -w /repo/web --env-file /srv/placewise/.env node:22-bookworm \
  bash -lc "corepack enable && corepack prepare pnpm@10.32.1 --activate && pnpm start"'
```

Redeploying is the same sequence without the container name conflict: remove
`placewise-web` first.

## Plans

`plan` defaults to `vhp-12c-24gb-amd`, a 12-vCPU, 24 GB CPU instance at
$0.197/h. It runs a 9B model in about 24 tokens per second of prompt
processing: a single question takes seconds, but the 21-question audience
request takes a couple of minutes, so this plan is for proving the setup rather
than for a fast demo.

A GPU plan is the same stack: set `plan` to a `vcg-*` ID and the cloud-init
installs the NVIDIA driver and reboots once before starting the model. Check
what the account can actually deploy, because a plan the account is not enabled
for is listed with an empty `locations` list:

```sh
curl -s -H "Authorization: Bearer $VULTR_API_KEY" \
  'https://api.vultr.com/v2/plans?type=vcg' | jq '.plans[] | {id, gpu_type, gpu_vram, locations}'
for r in $(curl -s -H "Authorization: Bearer $VULTR_API_KEY" \
  'https://api.vultr.com/v2/regions?per_page=500' | jq -r '.regions[].id'); do
  echo "$r: $(curl -s -H "Authorization: Bearer $VULTR_API_KEY" \
    "https://api.vultr.com/v2/regions/$r/availability?type=vcg" | jq -r '.available_plans[]?' | tr '\n' ' ')"
done
```
