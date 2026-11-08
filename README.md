# Placewise

Placewise shows a startup where to buy outdoor ads in New York. You describe your target customer, and it maps where those customers are, where competitors already advertise to them, and the gap between the two. It ends with a list of placements to buy in the gap areas. Placement prices and minimum spends are invented for now.

Built at HackTheBurgh 2026.

## Run the web app

You need Node.js and pnpm. From `web/`:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The app runs on http://localhost:3000, and the pitch deck is at `/presentation`. Fill in `.env.local` for live results:

- `AI_GATEWAY_API_KEY` scores the audience. Without it, scoring falls back to keyword matching.
- `OPENAI_API_KEY` runs the competitor research.
- `GEOAPIFY_API_KEY` places campaign addresses and landmarks on the map.

## Rebuild the data

The processed data is committed, so the app runs without this step. To rebuild it, you need uv. From `tools/`:

```bash
uv run python -m tools.analyze
```

Some data sources need keys in `tools/.env`, listed in `tools/.env.example`.
