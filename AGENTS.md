# Publication instructions

Production source: https://sat-study-room.chalkydaisy5.chatgpt.site/
Independent mirror: https://yapperyap.github.io/sat-study-room/

Preserve independent hosting: never replace Pages with a redirect or iframe. The Pages source is GitHub Actions. The mirror-pages workflow checks production every 15 minutes and deploys validated static files via mirror.py. When changing the ChatGPT-hosted app, rebuild its portable HTML with build-local.py before publishing, update original application source under dist/ here, then manually dispatch the mirror workflow and verify Pages remains on github.io and loads a question. Keep the Pages link at the top of README.

Keep third-party question data and content-embedded downloads out of source commits. They may be fetched from the public production release into a temporary deployment artifact. Original application code is MIT; third-party content is excluded. Never publish .openai configuration, tokens, private data, or other secrets.
