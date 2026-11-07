# Python tools

`tools/` holds the data-gathering scripts, one module per script in `tools/src/tools/`. It is a Python project managed with uv.

Python is pinned to 3.14 in `.python-version`, not 3.15, because data libraries can be slow to publish wheels for a new Python release.

## Commands

Run commands from `tools/`. Use uv for everything Python: no pip or poetry, and no virtual environments made by hand.

- `uv run python -m tools.<script>`: run one script
- `uv add <package>`: add a dependency
- `uv run ruff check` and `uv run ruff format --check`: the checks to run before each commit

## Where scripts write data

Each script is named after its data source and writes to two folders under the repository's `data/`:

- `data/raw/<source>/`: large gathered data, such as full downloads and scrape results. It is never committed, so the script must be able to re-create it.
- `data/<source>/`: the outputs the web app and demo use. These are committed to Git, each under a few MB.

For example, a script for CAA data would be `tools/src/tools/caa.py`, run as `uv run python -m tools.caa`. It keeps its downloads in `data/raw/caa/` and writes its outputs to `data/caa/`.
