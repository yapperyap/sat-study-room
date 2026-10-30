# SAT Study Room

**Live website: [https://yapperyap.github.io/sat-study-room/](https://yapperyap.github.io/sat-study-room/)**

Browser-based SAT practice with topic filters, explanations, answer elimination, themes, a calculator, and progress saved on your device.

ChatGPT-hosted version: https://sat-study-room.chalkydaisy5.chatgpt.site/

## Independent hosting and automatic mirroring

GitHub Pages serves its own copy of the application, assets, and question data. It does not redirect to or frame the ChatGPT website. Practice runs on the GitHub Pages origin; saved progress is separate for each origin.

The **Mirror ChatGPT site to GitHub Pages** workflow checks the public ChatGPT release every 15 minutes, on pushes to `main`, and on manual dispatch. GitHub may delay scheduled runs. After a successful check, it deploys a complete static copy. A failed download or incomplete bank fails the job and preserves the previous deployment.

`mirror.py` downloads the public portable release, validates and extracts the embedded question bank, and fetches the current application files. Mirrored third-party data exists in the deployment artifact, not in source commits. Rebuild `sat-study-room-local.html` whenever publishing changes to the ChatGPT site. To mirror immediately, run the workflow from the Actions tab. GitHub can disable scheduled workflows after 60 days of repository inactivity; re-enable it from Actions if needed.

## Run source locally

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. The source `dist/index.json` is intentionally empty. Supply data only when you have the necessary permissions. `build-bank.py` converts locally supplied question data and `build-local.py` creates the portable release.

## License and credits

Original application code: MIT; see LICENSE. College Board questions, passages, answer explanations, and images remain third-party content and are **not** covered by the MIT license. The license grants no rights to third-party services, trademarks, or dependencies. This independent project is not affiliated with or endorsed by College Board.

Credits: https://github.com/yapperyap
