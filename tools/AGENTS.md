# Python tools

`tools/` holds the data-gathering and analysis code. It is a Python project managed with uv.

Python is pinned to 3.14 in `.python-version`, not 3.15, because data libraries can be slow to publish wheels for a new Python release.

## Commands

Run commands from `tools/`. Use uv for everything Python: no pip or poetry, and no virtual environments made by hand.

- `uv run python -m tools.analyze`: run the analysis, the only entry point
- `uv add <package>`: add a dependency
- `uv run ruff check` and `uv run ruff format --check`: the checks to run before each commit

## How the code is laid out

- `tools/src/tools/sources/<source>.py`: one module per data source, named after it. Each exposes `load(refresh: bool = False)`, which returns the source's data and downloads it first only if its output doesn't exist yet or `refresh` is true. Source modules are imported, not run.
- `tools/src/tools/analyze.py`: the entry point. It imports the sources, combines them for one startup and writes the result for the web app.
- Agents that call a language model, such as the competitor-campaign agent, use Pydantic AI.

## Where data is written

Each source writes to two folders under the repository's `data/`:

- `data/raw/<source>/`: large gathered data, such as full downloads and scrape results. It is git-ignored, so the source must be able to re-create it.
- `data/<source>/`: the processed outputs the analysis reads. These are committed to Git, each under a few MB, so the analysis and demo work offline.

For example, the Census source is `tools/src/tools/sources/census.py`. It keeps the API responses in `data/raw/census/` and writes `data/census/nyc_tracts.csv`.

## Keys

Keys go in `tools/.env`, which is git-ignored. `tools/.env.example` lists every variable a source needs; add a line there when a source needs a new key.
