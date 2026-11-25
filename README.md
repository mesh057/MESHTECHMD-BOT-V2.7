<h1 align="center">MESH TECH MD BOT V2.7</h1>

<p align="center">
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7">
    <img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH TECH MD logo" width="240">
  </a>
</p>

<p align="center">A WhatsApp bot project with session data stored separately from the public code repository.</p>

<p align="center">
  <a href="https://github.com/mesh057"><img title="GitHub" src="https://img.shields.io/badge/GITHUB-Mesh%20Tech-red.svg?style=for-the-badge&logo=github" alt="GitHub profile"></a>
</p>

<p align="center">
  <a href="https://github.com/mesh057?tab=followers"><img title="Followers" src="https://img.shields.io/github/followers/mesh057?label=Followers&style=social" alt="GitHub followers"></a>
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7/stargazers/"><img title="Stars" src="https://img.shields.io/github/stars/mesh057/MESHTECHMD-BOT-V2.7?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7/network/members"><img title="Forks" src="https://img.shields.io/github/forks/mesh057/MESHTECHMD-BOT-V2.7?style=social" alt="GitHub forks"></a>
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7/watchers"><img title="Watching" src="https://img.shields.io/github/watchers/mesh057/MESHTECHMD-BOT-V2.7?label=Watching&style=social" alt="GitHub watchers"></a>
</p>

> **⚠️ IMPORTANT:** WhatsApp session data belongs in the separate private session repository. Never make that repository public or commit authentication tokens into this code repository.

## 𝟏. 𝐒𝐄𝐂𝐔𝐑𝐄 𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐒𝐓𝐎𝐑𝐀𝐆𝐄

<details>
<summary><b>🔐 Read the session-storage requirements</b></summary>

<br>

The bot uses the private repository [`mesh057/MESHTECHMD-BOT-V2.7-SESSIONS`](https://github.com/mesh057/MESHTECHMD-BOT-V2.7-SESSIONS) for WhatsApp session data. Keep that repository private. The application checks repository visibility before accessing session files and refuses to use a public repository.

Set `GITHUB_TOKEN` as a secret/environment variable in your bot deployment provider. Never paste a real token into `config.js`, `.env.example`, or any committed file.

Set these values in the deployment environment:

```text
GITHUB_USERNAME=mesh057
GITHUB_REPO_NAME=MESHTECHMD-BOT-V2.7-SESSIONS
GITHUB_BRANCH=main
```

A fine-grained personal access token limited to the private session repository with **Contents: read and write** permission is preferred over a classic token.

</details>

<p align="center">
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7"><img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH TECH MD" width="110"></a>
</p>

## 𝟐. 𝐋𝐎𝐂𝐀𝐋 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐌𝐄𝐍𝐓

<details>
<summary><b>🧰 Tap to open</b></summary>

<br>

For local development, copy `.env.example` to `.env` and add your token locally. Do not commit `.env` or share its contents.

</details>
