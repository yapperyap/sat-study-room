# SAT Study Room

**Start practicing at** https://yapperyap.github.io/sat-study-room/

A free, browser-based SAT practice workspace with subject and topic filters, answer explanations, and progress saved on your device.

## Features

- 3,770 Reading and Writing and Math questions from the collegeboard question bank organized by domain and skill
- Multiple-topic selection, difficulty filters, shuffled practice, and marked questions
- Answer explanations, answer elimination, and question ID navigation
- Per-topic progress, correct and incorrect counts, and selective resets
- Light, dark, and system themes, custom fonts, and adjustable interface sizing
- Independent reading panes, responsive layouts, and a resizable calculator
- A portable HTML download for local practice

## EASILY access locally

Download a local HTML file to run from the releases page https://github.com/yapperyap/sat-study-room/releases

Open that file in your browser (this is the low cortisol way to do it).

## Host Site Locally
Python 3 is the only build prerequisite. No package installation is required.

```sh
git clone https://github.com/yapperyap/sat-study-room.git
cd sat-study-room
python3 prepare-site.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Application files and the compressed question bank are included in `dist/`; running or deploying the site does not fetch another hosted copy.

## Portable download

Download `sat-study-room-local.html` from [Releases](https://github.com/yapperyap/sat-study-room/releases), then open it in a modern browser. The application, question bank, styles, and legal information are embedded in that file. The external Desmos calculator requires an internet connection.

To rebuild the download:

```sh
python3 prepare-site.py
```

The command unpacks the question files, validates them, and writes `dist/sat-study-room-local.html`.

## Deploy

GitHub Pages deploys `dist/` on pushes to `main` or a manual workflow run. The workflow validates the question bank and rebuilds the portable download before publishing. It does not poll or download a separate website.

Push a version tag such as `v1.0.1` to publish a GitHub release containing the portable HTML and a ZIP of the complete static website. Both downloads are built from the tagged source.

## Project structure

| Path | Purpose |
| --- | --- |
| `dist/` | Complete static website, assets, and question data |
| `prepare-site.py` | Unpacks question data and builds the complete site |
| `build-local.py` | Self-contained HTML packager |
| `validate.py` | Static release and question-bank validation |
| `build-bank.py` | Converts locally supplied question records |
| `fetch-bank.mjs` | Question-bank acquisition utility |
| `.github/workflows/` | Pages deployment and release automation |

## Privacy

Practice progress and preferences are stored in your browser. Clearing site data removes them. Browser storage is separate for each website address. The optional calculator and external links may connect to third-party services.

## License and attribution

Original application code is licensed under the [MIT License](LICENSE). College Board questions, passages, explanations, images, trademarks, and third-party services are excluded from that license and remain subject to their respective owners' terms. See the site's legal page and `dist/source-manifest.json` for attribution and source information.

SAT Study Room is an independent study tool and is not affiliated with or endorsed by College Board. Question-bank snapshot: October 28, 2026.
