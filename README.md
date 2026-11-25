# MESHTECHMD-BOT-V2.7

WhatsApp bot project. Bot authentication sessions are stored separately from this public code repository.

## Secure GitHub session storage

The bot uses the private repository `mesh057/MESHTECHMD-BOT-V2.7-SESSIONS` for WhatsApp session data. Keep that repository private. The application checks repository visibility before accessing session files and refuses to use a public repository.

Set `GITHUB_TOKEN` as a secret/environment variable in the bot's deployment provider; never paste a real token into `config.js`, `.env.example`, or any committed file. Set `GITHUB_USERNAME=mesh057`, `GITHUB_REPO_NAME=MESHTECHMD-BOT-V2.7-SESSIONS`, and `GITHUB_BRANCH=main` in the deployment environment. A fine-grained personal access token limited to the private session repository with Contents read/write permission is preferred over a classic token.

For local development, copy `.env.example` to `.env`, add the token locally, and do not commit `.env`.
