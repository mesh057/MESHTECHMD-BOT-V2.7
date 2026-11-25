'use strict';

const path = require('path');
const { mishu } = require('../mishu');
const { createSessionId } = require('../lib/session-id');

mishu({
    pattern: 'session',
    alias: ['sessionid', 'getsession'],
    desc: 'Create a private recovery ID for this connected WhatsApp account',
    category: 'owner',
    react: '🔐',
    filename: __filename,
}, async (sock, mek, m, { from, isGroup, isOwner, botNumber, reply }) => {
    if (!isOwner) return reply('This recovery command is restricted to the bot owner.');
    if (isGroup || String(from || '').endsWith('@g.us') || from === 'status@broadcast') {
        return reply('For security, use .session in a private chat with the bot. No recovery data was sent here.');
    }

    try {
        const number = String(botNumber || '').replace(/\D/g, '');
        if (!number) return reply('Could not identify this connected WhatsApp account.');
        const authDir = path.join(__dirname, '..', 'session', `session_${number}`);
        const sessionId = createSessionId(authDir, number);
        if (!sessionId) return reply('No registered auth state was found for this account. Pair it first, then try again.');

        await sock.sendMessage(from, {
            text: `🔐 *V2.7 SESSION RECOVERY ID*\n\nThis is a full auth backup for +${number}. Treat it like a password. Store it only as the private "SESSION_ID" deployment secret. Do not forward it, post it, or include it in logs.`
        }, { quoted: mek });

        if (sessionId.length <= 50000) {
            await sock.sendMessage(from, { text: sessionId }, { quoted: mek });
        } else {
            await sock.sendMessage(from, {
                document: Buffer.from(sessionId, 'utf8'),
                mimetype: 'text/plain',
                fileName: `meshtech-session-${number}.txt`,
                caption: 'Private V2.7 recovery ID. Keep this file confidential.'
            }, { quoted: mek });
        }
    } catch (error) {
        console.error('[SESSION] Recovery ID generation failed:', error.message);
        return reply(`Could not create a recovery ID: ${error.message}`);
    }
});
