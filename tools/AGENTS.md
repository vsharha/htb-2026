# Python tools

`tools/` holds the data-gathering scripts. It is a Python 3.14 project managed with uv, with code in `tools/src/tools/`. Python 3.14 rather than 3.15 because data libraries can lag in publishing wheels for a new Python release.

## Commands

Run commands from `tools/`:

- `uv run python -m tools.<script>`: run one script
- `uv add <package>`: add a dependency
- `uv run ruff check` and `uv run ruff format --check`: the checks to run before each commit

Use uv for everything Python. Do not use pip or poetry, and do not create virtual environments by hand.

## Where scripts write data

Scripts write to two places under the repository's `data/` folder, named by source:

- `data/raw/<source>/`: large gathered data, such as full downloads and scrape results. Git ignores everything in `data/raw/`, so a script must be able to re-create it.
- `data/<source>/`: the outputs the web app and demo use, committed to Git. Keep each output small, under a few MB.

A script for CAA data is `tools/src/tools/caa.py`, keeps its downloads in `data/raw/caa/`, and writes its outputs to `data/caa/`.
