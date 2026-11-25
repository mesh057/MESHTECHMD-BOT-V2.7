'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const app = express();
const port = process.env.PORT || 8000;
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

const pairRouter = require('./main');
const { getSessionIdNumber } = require('./lib/session-id');
app.use('/', pairRouter);

async function startConsolePairing() {
    if (process.env.MESH_PAIRING_MODE !== 'console') return;
    if (getSessionIdNumber(process.env.SESSION_ID) && !process.env.MESH_PAIRING_PHONE_NUMBER) {
        console.log('[Console pairing] SESSION_ID is configured; automatic recovery will be attempted instead of prompting.');
        return;
    }

    let number = process.env.MESH_PAIRING_PHONE_NUMBER || '';
    if (!number && stdin.isTTY && stdout.isTTY) {
        const terminal = readline.createInterface({ input: stdin, output: stdout });
        try {
            number = await terminal.question('Enter your WhatsApp number with country code (digits only, e.g. 254183215028): ');
        } finally {
            terminal.close();
        }
    }

    const digits = String(number).replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(digits)) {
        console.error('[Console pairing] No valid phone number supplied. Set MESH_PAIRING_PHONE_NUMBER or start with an interactive panel console.');
        return;
    }
    if (!pairRouter.requestPairingCode) {
        console.error('[Console pairing] Pairing handler is unavailable.');
        return;
    }

    console.log(`[Console pairing] Requesting a WhatsApp pairing code for +${digits}…`);
    const result = await new Promise(resolve => {
        const response = {
            headersSent: false,
            json(payload) { this.headersSent = true; resolve(payload); return this; },
            send(payload) { this.headersSent = true; resolve(payload); return this; },
            status(code) { this.statusCode = code; return this; },
        };
        Promise.resolve(pairRouter.requestPairingCode(digits, response)).catch(error => {
            if (!response.headersSent) resolve({ status: 'error', message: error.message });
        });
    });

    const code = result?.code || result?.data?.code;
    if (code) {
        console.log(`\nPAIRING CODE for +${digits}: ${code}\n`);
        console.log('On WhatsApp: Linked devices → Link a device → Link with phone number.');
    } else {
        console.log(`[Console pairing] ${result?.message || result?.error || result?.status || 'No pairing code was returned.'}`);
    }
}

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    startConsolePairing().catch(error => console.error('[Console pairing] Failed:', error.message));
});

module.exports = app;
