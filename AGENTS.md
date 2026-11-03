# Publication instructions

Public website: https://yapperyap.github.io/sat-study-room/

The repository is a complete standalone static website. Deploy dist/ directly; never replace it with an external redirect, iframe, or scheduled website downloader.

When publishing an update to any supported host, update this repository with the same application files, assets, and question bank. Run python3 prepare-site.py. Verify the Pages deployment succeeds and loads a question before declaring the update complete. Use identical static build outputs for all hosts; do not publish hosted-site URLs, account identifiers, credentials, or .openai configuration in the public repository.

For releases, create a version tag. The workflow attaches dist/sat-study-room-local.html and the complete static-site ZIP. Keep the Pages link at the top of README.md.

Original application code is MIT. Third-party content is excluded from that license; preserve attribution and legal notices.
