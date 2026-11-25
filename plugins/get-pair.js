'use strict';

const { mishu } = require('../mishu');
const axios = require('axios');
const { sendInteractiveMessage } = require('gifted-btns');
const config = require('../config');

const PAIR_IMAGE = config.PAIR_IMAGE || config.IMAGE_PATH || 'https://i.postimg.cc/vHZz7VWG/bot-logo.png';
const INTERNAL_PAIRING_URL = `http://127.0.0.1:${process.env.PORT || 8000}`;
const PUBLIC_PAIRING_URL = String(process.env.PAIRING_BASE_URL || '').replace(/\/+$/, '');

mishu({
    pattern: 'pair',
    alias: ['getpair', 'clonebot', 'paircode'],
    desc: 'Get a WhatsApp pairing code using this bot server',
    category: 'tools',
    react: '🌸',
    filename: __filename,
}, async (sock, mek, m, { from, q, senderNumber, reply, isOwner, isGroup }) => {
    if (isGroup || String(from || '').endsWith('@g.us')) {
        return reply('For privacy, use .pair in a private chat with the bot.');
    }

    const parts = String(q || '').trim().split(/\s+/).filter(Boolean);
    const forceRequested = parts.some(part => part.toLowerCase() === 'force');
    const numberPart = parts.find(part => /\d/.test(part) && part.toLowerCase() !== 'force');
    const number = String(numberPart || senderNumber || '').replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(number)) {
        return reply('Invalid phone number. Use .pair followed by the full international number, e.g. .pair 254183215028');
    }
    if (forceRequested && !isOwner) {
        return reply('Force pairing deletes the existing session and is restricted to the bot owner.');
    }
    if (forceRequested && String(process.env.PAIRING_ADMIN_TOKEN || '').length < 32) {
        return reply('Force pairing is disabled. Set PAIRING_ADMIN_TOKEN to a random deployment secret of at least 32 characters.');
    }

    try {
        if (!forceRequested) {
            const statusRes = await axios.get(`${INTERNAL_PAIRING_URL}/pair-status`, {
                params: { number },
                timeout: 10000,
            });
            const currentStatus = statusRes.data?.data?.status || statusRes.data?.status;
            if (currentStatus === 'connected') {
                const buttons = [];
                if (PUBLIC_PAIRING_URL) {
                    buttons.push(
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({ display_text: '🌐 Pairing page', url: `${PUBLIC_PAIRING_URL}/pairing.html?number=${number}` }),
                        },
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({ display_text: '📊 Check status', url: `${PUBLIC_PAIRING_URL}/status?number=${number}` }),
                        },
                    );
                }
                if (isOwner) {
                    buttons.push({
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({ display_text: '🔄 Force pair', id: `.pair ${number} force` }),
                    });
                }
                await sock.sendMessage(from, {
                    image: { url: PAIR_IMAGE },
                    caption: `✅ +${number} is already connected. Use the pairing page to check its status.${isOwner ? '\nOwner: you may choose Force pair to reset it.' : ''}`,
                }, { quoted: mek });
                if (buttons.length) {
                    return sendInteractiveMessage(sock, from, {
                        text: 'Choose an available action:',
                        footer: config.BOT_NAME || 'MESH TECH MD',
                        interactiveButtons: buttons,
                    });
                }
                return;
            }
        }

        const response = forceRequested
            ? await axios.post(`${INTERNAL_PAIRING_URL}/force-code`, { number }, {
                timeout: 60000,
                headers: {
                    Accept: 'application/json',
                    'x-pairing-admin-token': process.env.PAIRING_ADMIN_TOKEN,
                },
            })
            : await axios.get(`${INTERNAL_PAIRING_URL}/code`, {
                params: { number },
                timeout: 60000,
                headers: { Accept: 'application/json' },
            });

        const result = response.data || {};
        const code = result.code || result.data?.code;
        if (!response.status || response.status < 200 || response.status >= 300 || !code) {
            return reply(result.message || result.error || 'Pairing did not return a code. Check the number and try again.');
        }

        await sock.sendMessage(from, {
            image: { url: PAIR_IMAGE },
            caption: `🔑 *WhatsApp Pairing Code*\n\nNumber: +${number}\nCode: *${code}*\n\nOpen WhatsApp → Linked devices → Link a device → Link with phone number, then enter this code. Keep the code private.`,
        }, { quoted: mek });
        const buttons = [{
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({ display_text: '📋 Copy code', copy_code: code }),
        }];
        if (PUBLIC_PAIRING_URL) {
            buttons.push({
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({ display_text: '🌐 Pairing page', url: `${PUBLIC_PAIRING_URL}/pairing.html?number=${number}` }),
            });
        }
        return sendInteractiveMessage(sock, from, {
            text: `🔑 *Pairing code:* ${code}\n\nUse the Copy Code button${PUBLIC_PAIRING_URL ? ' or open the pairing page' : ''}.`,
            footer: config.BOT_NAME || 'MESH TECH MD',
            interactiveButtons: buttons,
        });
    } catch (error) {
        const message = error.response?.data?.message || error.response?.data?.error || error.message;
        console.error('[Pair] Request failed:', message);
        return reply(`Pairing failed: ${message}`);
    }
});
