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

## 𝟔. 𝐃𝐄𝐏𝐋𝐎𝐘𝐌𝐄𝐍𝐓 𝐒𝐄𝐂𝐓𝐈𝐎𝐍

<details>
<summary>TAP TO OPEN</summary>

<br>

Deploy the repository root from the `main` branch. The app starts with `npm start` (`node index.js`) and listens on the hosting provider's `PORT`; on a VPS it defaults to port `8000` unless you set `PORT` yourself.

**Node.js runtime:** this repository currently declares `20.x` in `package.json`, which is now end-of-life. Before a production deployment, change `engines.node` to a currently supported LTS release, test with that same Node version, and deploy the updated commit. Heroku currently lists `22.x`, `24.x`, and `26.x` as supported LTS lines; see its [Node.js support policy](https://devcenter.heroku.com/articles/nodejs-support). Use the same runtime on a VPS.

Set secrets in the host's environment-variable or secret manager. To enable the browser's **Force Pairing** and **Disconnect** actions, create a strong `PAIRING_ADMIN_TOKEN` (at least 32 characters). Generate one locally with:

```bash
openssl rand -hex 32
```

Copy the generated value into the provider's secret field; do not commit it or paste it into a public issue. Normal pairing does not require this token. The exact variable names are listed in [`.env.example`](.env.example).

For ongoing recovery on hosts with temporary disks, configure `GITHUB_TOKEN` with Contents read/write access limited to the private session repository. The defaults are `GITHUB_USERNAME=mesh057`, `GITHUB_REPO_NAME=MESHTECHMD-BOT-V2.7-SESSIONS`, and `GITHUB_BRANCH=main`. Keep that repository private. `SESSION_ID` can restore a full session on a clean host, but it is a one-time snapshot and does not update itself after pairing; the private GitHub backup is the recommended option for ongoing recovery.

After deployment, open the host's public HTTPS URL to use browser pairing. The Kenya-specific page is at `/pairing.html`; enter the owner's number as `254183215028`. `PAIRING_BASE_URL` is optional and should be set to the public HTTPS URL when you want `.pair` replies to include clickable links. Do not set `MESH_PAIRING_MODE=console` on a normal web service.

</details>

<p align="center"><a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7"><img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH TECH MD" width="110"></a></p>

**(A) KOYEB DEPLOYMENT**
<details>
<summary>TAP TO OPEN</summary>
<a href="https://app.koyeb.com/"><img src="https://img.shields.io/badge/OPEN-KOYEB-00B2FF?style=for-the-badge" alt="Open Koyeb" width="150"></a>

<br>

1. In Koyeb, choose **Create Web Service** and **GitHub**. Authorize Koyeb for this repository, select `mesh057/MESHTECHMD-BOT-V2.7`, and choose the `main` branch.
2. Select the **Buildpack** builder. Keep the project working directory at the repository root and use `npm start` as the run command. Configure an exposed HTTP port; Koyeb sets `PORT` from the exposed port when it is not set manually, and the app reads that value.
3. Add the shared environment variables in the service configuration before deploying. Koyeb's dashboard also lets you edit them later under **Settings → Environment variables and files**; deploy again after changing them.
4. Deploy and wait for the service to become healthy. Open the public service URL and use `/` or `/pairing.html` for browser pairing.

Koyeb's local instance storage is ephemeral, so local `session/` files may disappear when the instance is replaced. Use the private GitHub session backup for ongoing recovery or restore a `SESSION_ID` on a clean instance. Koyeb volumes are currently a limited public-preview feature; do not rely on one without confirming its region and instance restrictions and keeping a separate backup.

Official guides: [Git deployment](https://www.koyeb.com/docs/build-and-deploy/deploy-with-git), [Node.js buildpack](https://www.koyeb.com/docs/build-and-deploy/build-from-git/nodejs), and [volumes](https://www.koyeb.com/docs/reference/volumes).

</details>

<p align="center"><a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7"><img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH TECH MD" width="110"></a></p>

**(B) RAILWAY DEPLOYMENT**
<details>
<summary>TAP TO OPEN</summary>
<a href="https://railway.com/"><img src="https://img.shields.io/badge/OPEN-RAILWAY-8B5CF6?style=for-the-badge" alt="Open Railway" width="150"></a>

<br>

1. Create a Railway project using **Deploy from GitHub repo**, connect `mesh057/MESHTECHMD-BOT-V2.7`, and deploy the `main` branch. Railway detects the Node.js project; if needed, set the start command to `npm start`.
2. Add secrets and settings in the service's **Variables** tab. Railway stages variable changes, so review and deploy those changes to apply them.
3. To persist WhatsApp auth files on Railway, create a volume for the bot service and set its mount path to **`/app/session`**. Railway places the app under `/app`, and the bot writes auth files to the repository's `session/` directory. Keep a separate backup as well.
4. In **Service Settings → Networking → Public Networking**, choose **Generate Domain**. Once the domain is available, optionally set `PAIRING_BASE_URL` to `https://<your-domain>` and deploy the variable change.

Open the generated domain to use `/` or `/pairing.html`. The volume preserves `session/` across deployments; without it, treat the filesystem as temporary and configure the private GitHub session backup.

Official guides: [Quick Start](https://docs.railway.com/quick-start), [Variables](https://docs.railway.com/variables), [Volumes](https://docs.railway.com/volumes), and [Public Networking](https://docs.railway.com/guides/public-networking).

</details>

<p align="center"><a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7"><img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH TECH MD" width="110"></a></p>

**(C) HEROKU DEPLOYMENT**
<details>
<summary>TAP TO OPEN</summary>
<a href="https://signup.heroku.com/login"><img src="https://img.shields.io/badge/HEROKU-SIGN%20UP-79589F?style=for-the-badge" alt="Heroku signup" width="150"></a>
<a href="https://dashboard.heroku.com/apps"><img src="https://img.shields.io/badge/HEROKU-APP%20DASHBOARD-79589F?style=for-the-badge" alt="Heroku app dashboard" width="180"></a>

<br>

1. Create a Heroku app, open its **Deploy** tab, connect GitHub, and select `mesh057/MESHTECHMD-BOT-V2.7`. Deploy the `main` branch manually or enable automatic deploys for it.
2. Add secrets under **Settings → Config Vars**. Heroku recognizes the root `package.json`, uses its `start` script when there is no `Procfile`, and supplies `PORT`, which this app already reads.
3. This repository currently declares Node `20.x`, which is end-of-life. Follow the shared Node.js runtime note above and commit the updated `engines.node` value before Heroku builds the selected branch.
4. After the build succeeds, open the app's Heroku URL and use `/` or `/pairing.html` for browser pairing. Set `PAIRING_BASE_URL` to that HTTPS URL if you want clickable links in `.pair` replies.

Heroku dyno filesystems are ephemeral. Do not depend on local `session/` files surviving a restart or replacement. Configure the private GitHub session backup for ongoing recovery, or restore a `SESSION_ID` when starting on a clean dyno.

Official guides: [Deploying Node.js apps](https://devcenter.heroku.com/articles/deploying-nodejs), [GitHub integration](https://devcenter.heroku.com/articles/github-integration), [Config Vars](https://devcenter.heroku.com/articles/config-vars), and [Node.js support](https://devcenter.heroku.com/articles/nodejs-support).

</details>

<p align="center"><a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7"><img src="https://i.postimg.cc/vHZz7VWG/bot-logo.png" alt="MESH TECH MD" width="110"></a></p>

**(D) VPS DEPLOYMENT (UBUNTU/DEBIAN + SYSTEMD)**
<details>
<summary>TAP TO OPEN</summary>
<a href="https://github.com/mesh057/MESHTECHMD-BOT-V2.7/archive/refs/heads/main.zip"><img src="https://img.shields.io/badge/DOWNLOAD-V2.7%20ZIP-yellow?style=for-the-badge" alt="Download V2.7 source ZIP" width="180"></a>
<a href="https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html"><img src="https://img.shields.io/badge/OPEN-SYSTEMD%20DOCS-2E8B57?style=for-the-badge" alt="Systemd documentation" width="180"></a>

<br>

Install Git and the supported Node.js LTS version you selected above, then create a dedicated service account and clone the project:

```bash
sudo apt update
sudo apt install -y git
# Install the selected Node.js LTS version and npm using a trusted package source; verify with node --version.
sudo adduser --system --group --home /home/meshbot --shell /usr/sbin/nologin meshbot
sudo install -d -o meshbot -g meshbot /opt/mesh-bot
sudo -u meshbot git clone https://github.com/mesh057/MESHTECHMD-BOT-V2.7.git /opt/mesh-bot
sudo -u meshbot bash -lc 'cd /opt/mesh-bot && npm install --omit=dev'
```

Create a root-owned environment file and put your secrets in it. Leave unused values out or blank; never put real values in the repository's `.env.example`.

```bash
sudo nano /etc/mesh-bot.env
sudo chown root:root /etc/mesh-bot.env
sudo chmod 600 /etc/mesh-bot.env
```

For example, the file can contain `PORT=8000`, `PAIRING_ADMIN_TOKEN=<generated-secret>`, `PAIRING_BASE_URL=https://bot.example.com`, and the optional GitHub backup variables. Set a DNS `A` record for `bot.example.com` to the VPS address.

Create `/etc/systemd/system/mesh-bot.service` (adjust the Node executable path if `command -v node` is not `/usr/bin/node`):

```ini
[Unit]
Description=MESH TECH MD WhatsApp Bot
After=network.target

[Service]
Type=simple
User=meshbot
Group=meshbot
WorkingDirectory=/opt/mesh-bot
EnvironmentFile=/etc/mesh-bot.env
Environment=NODE_ENV=production
ExecStart=/usr/bin/node /opt/mesh-bot/index.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable the service and check its logs:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mesh-bot
sudo systemctl status mesh-bot
sudo journalctl -u mesh-bot -f
```

For a public deployment, put Nginx in front of the app and enable HTTPS with Certbot. Proxy the domain to `http://127.0.0.1:8000`; expose ports 80 and 443 publicly rather than the app port. Set `PAIRING_BASE_URL` to the resulting HTTPS URL. Local session files persist on the VPS disk, but configure the private GitHub backup or keep separate backups for recovery. On a code update, pull the new commit and restart the service.

See the official [systemd execution settings](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) for `EnvironmentFile=` behavior.

To deploy a later code update and restart the service:

```bash
sudo -u meshbot git -C /opt/mesh-bot pull --ff-only
sudo -u meshbot npm --prefix /opt/mesh-bot install --omit=dev
sudo systemctl restart mesh-bot
```

</details>

## 𝟕. 𝐎𝐖𝐍𝐄𝐑 & 𝐂𝐎𝐌𝐌𝐔𝐍𝐈𝐓𝐘

- Owner WhatsApp: [wa.me/254183215028](https://wa.me/254183215028)
- WhatsApp group: [Join the MESH TECH MD group](https://chat.whatsapp.com/DM1JxxnOJFp0vsTHpej89M?s=cl&p=a&ilr=4)
- Repository: [MESHTECHMD-BOT-V2.7](https://github.com/mesh057/MESHTECHMD-BOT-V2.7)

<p align="center"><b>🌸 MESH TECH MD • Keep your pairing code and SESSION_ID private 🌸</b></p>
