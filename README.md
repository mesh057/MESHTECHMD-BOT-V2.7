<h1 align="center">MESH TECH MD BOT V2.7</h1>

<p align="center">
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7">
    <img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH TECH MD logo" width="240">
  </a>
</p>

<p align="center">A multi-device WhatsApp bot with browser, private-chat, console, and full-session recovery pairing methods.</p>

<p align="center">
  <a href="https://github.com/mesh057"><img title="GitHub" src="https://img.shields.io/badge/GITHUB-Mesh%20Tech-red.svg?style=for-the-badge&logo=github" alt="GitHub profile"></a>
</p>

<p align="center">
  <a href="https://github.com/mesh057?tab=followers"><img title="Followers" src="https://img.shields.io/github/followers/mesh057?label=Followers&style=social" alt="GitHub followers"></a>
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7/stargazers/"><img title="Stars" src="https://img.shields.io/github/stars/mesh057/MESHTECHMD-BOT-V2.7?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7/network/members"><img title="Forks" src="https://img.shields.io/github/forks/mesh057/MESHTECHMD-BOT-V2.7?style=social" alt="GitHub forks"></a>
  <a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7/watchers"><img title="Watching" src="https://img.shields.io/github/watchers/mesh057/MESHTECHMD-BOT-V2.7?label=Watching&style=social" alt="GitHub watchers"></a>
</p>

> **Security first:** WhatsApp auth files, recovery IDs, and deployment tokens are credentials. Never commit or post them. Keep the separate GitHub session repository private.

## 𝟏. 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 𝐌𝐄𝐓𝐇𝐎𝐃𝐒

<details open>
<summary><b>🌐 Browser pairing (international number)</b></summary>

<br>

1. Start the bot with `npm start` and open the deployed bot URL (or `http://localhost:8000/`).
2. Enter the WhatsApp number in full international format using digits only, with the country code and no leading `+` or local trunk `0`.
3. Choose **Get Pair Code**, then enter the returned code in WhatsApp under **Linked devices → Link a device → Link with phone number**.

For the configured Kenyan owner number, enter **254183215028**. Do not enter `0183215028` or omit the `254` country code.

The Kenya-specific alternate form is available at `/pairing.html`. It accepts the nine digits after `+254` (for this number, `183215028`) and also normalizes a pasted full Kenyan number.

</details>

<details>
<summary><b>💬 Private WhatsApp `.pair` command</b></summary>

<br>

In a **private chat** with the bot, send:

```text
.pair 254183215028
```

The command calls this V2.7 server locally (not the retired external Heroku pairing service) and sends the code privately. It refuses group-chat pairing so a code is not exposed to a group. Optionally set `PAIRING_BASE_URL` to the bot's public HTTPS URL to include clickable web/status links in the WhatsApp reply; the pairing request itself stays on localhost.

</details>

<details>
<summary><b>⌨️ Panel / console pairing</b></summary>

<br>

Run `npm run start:console-pairing` in an interactive terminal. It prompts for a full international number and prints the generated code in the panel console. On a non-interactive panel, set `MESH_PAIRING_PHONE_NUMBER=254183215028` in the panel environment and run `npm run start:panel` (or execute `bash panel-startup.sh`).

The panel startup script creates the local `session/` directory, installs dependencies if needed, and starts the same server with console pairing enabled. Keep panel logs private: the code printed there can link the WhatsApp account.

</details>

## 𝟐. 𝐅𝐎𝐑𝐂𝐄 𝐏𝐀𝐈𝐑𝐈𝐍𝐆 & 𝐃𝐈𝐒𝐂𝐎𝐍𝐍𝐄𝐂𝐓

Force pairing deletes the existing local and stored session before requesting a fresh code. **It is disabled unless `PAIRING_ADMIN_TOKEN` is configured** as a deployment secret with at least 32 characters. Generate a token, for example, with `openssl rand -hex 32`; do not put the token in this repository.

The browser asks for that token when using **Force Pairing** or **Disconnect**. In WhatsApp, the `.pair <number> force` form is available only to the configured bot owner and only in a private chat. `POST /force-reset` is also protected by the same token. Normal pairing does not require this admin token.

## 𝟑. 𝐅𝐔𝐋𝐋 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘

<details>
<summary><b>🔐 Export and restore a V2.7 SESSION_ID</b></summary>

<br>

1. Confirm that your WhatsApp number is listed in `OWNER_NUMBER` (defaults to **254183215028**).
2. Send `.session` to the bot in a **private chat**. The command is owner-only and refuses group chats.
3. Store the returned V2.7 recovery ID as the `SESSION_ID` secret in your deployment provider. Do not paste it into source code, GitHub issues, a group, or a public log.
4. Restart on a clean host/session directory. The bot verifies the ID's integrity and account number, then imports the complete Baileys auth files. It refuses to overwrite a non-empty auth directory.

The V2.7 recovery bundle uses a versioned format with integrity checking and safe path validation. **Credentials-only V2.5 session IDs are not complete V2.7 backups and are intentionally rejected**; pair again with a current code or export a new `.session` ID.

If a recovery ID is exposed, treat the WhatsApp account as compromised: unlink the bot device from WhatsApp, remove the exposed secret, and create a fresh pairing.

</details>

## 𝟒. 𝐏𝐑𝐈𝐕𝐀𝐓𝐄 𝐆𝐈𝐓𝐇𝐔𝐁 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐒𝐓𝐎𝐑𝐀𝐆𝐄 (𝐎𝐏𝐓𝐈𝐎𝐍𝐀𝐋)

The bot can keep a full V2.7 auth backup in the separate private repository `mesh057/MESHTECHMD-BOT-V2.7-SESSIONS`. It verifies that repository visibility is **private** before storing or restoring auth data. The backup includes credentials and Baileys key files; periodic snapshots refresh key changes, and older credentials-only records remain a fallback.

Set `GITHUB_TOKEN` as a deployment secret with **Contents: read and write** access limited to the private session repository. The repository/branch defaults are shown in `.env.example`. GitHub storage is optional; local auth state remains in `session/` on persistent storage, and `SESSION_ID` can be used to migrate to a clean or ephemeral host.

## 𝟓. 𝐈𝐍𝐒𝐓𝐀𝐋𝐋 & 𝐑𝐔𝐍

<details>
<summary><b>🧰 Local development</b></summary>

<br>

Use Node.js 20, install dependencies, and start the bot:

```bash
npm install
cp .env.example .env
npm start
```

Set secrets in the local untracked `.env` or the hosting provider's secret manager. The repository ignores `.env` and local `session/` auth files. Run the recovery-helper tests with `npm test`.

</details>

## 𝟔. 𝐎𝐖𝐍𝐄𝐑 & 𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘

- Owner WhatsApp: [wa.me/254183215028](https://wa.me/254183215028)
- WhatsApp group: [Join the MESH TECH MD group](https://chat.whatsapp.com/DM1JxxnOJFp0vsTHpej89M?s=cl&p=a&ilr=4)
- Repository: [MESHTECHMD-BOT-V2.7](https://github.com/mesh057/MESHTECHMD-BOT-V2.7)

<p align="center"><b>🌸 MESH TECH MD • Keep your pairing code and SESSION_ID private 🌸</b></p>
