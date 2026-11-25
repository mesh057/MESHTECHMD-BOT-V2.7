// ============================================
// 📁 lib/githubSession.js - GITHUB SESSION MANAGER
// 👑 Developer: ᴀʀꜱʟᴀɴ-ᴍᴅ
// 🔥 No MongoDB - Pure GitHub API
// ============================================

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// ========== LOAD CONFIG ==========
const config = require('../config');
const { createSessionId } = require('./session-id');

// ========== GITHUB CONFIGURATION ==========
const GITHUB_TOKEN = config.GITHUB_TOKEN || process.env.GITHUB_TOKEN;
const GITHUB_REPO = config.GITHUB_REPO || process.env.GITHUB_REPO;
const GITHUB_BRANCH = config.GITHUB_BRANCH || process.env.GITHUB_BRANCH || 'main';

// ========== GITHUB API HELPER ==========
const githubApi = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
    }
});

let privateRepoVerified = false;
let privateRepoVerification;

async function verifyPrivateRepository() {
    if (privateRepoVerified) return;
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
        throw new Error('Set GITHUB_TOKEN and GITHUB_REPO before using GitHub session storage.');
    }
    if (!privateRepoVerification) {
        privateRepoVerification = githubApi.get(`/repos/${GITHUB_REPO}`)
            .then(response => {
                if (response.data?.private !== true) {
                    throw new Error('Refusing to store WhatsApp sessions in a non-private GitHub repository.');
                }
                privateRepoVerified = true;
            })
            .catch(error => {
                privateRepoVerification = undefined;
                throw error;
            });
    }
    await privateRepoVerification;
}

/**
 * 📁 Get file from GitHub
 * @param {string} path - File path in repo (e.g., "users/923XX/creds.json")
 * @returns {object|null} - Parsed JSON data or null
 */
async function getGitHubFile(path) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return null;
    try {
        await verifyPrivateRepository();
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const response = await githubApi.get(url, {
            params: { ref: GITHUB_BRANCH }
        });
        
        if (response.data && response.data.content) {
            const content = Buffer.from(response.data.content, 'base64').toString('utf8');
            return JSON.parse(content);
        }
        return null;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error('[GitHub] Get file error:', error.response?.data?.message || error.message);
        return null;
    }
}

/**
 * 📁 Save file to GitHub (Create or Update)
 * @param {string} path - File path in repo
 * @param {object} data - Data to save
 * @param {string} message - Commit message
 * @returns {object|null} - GitHub API response
 */
async function saveGitHubFile(path, data, message) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return null;
    try {
        await verifyPrivateRepository();
        // Get current file SHA if exists (for update)
        let sha = null;
        try {
            const url = `/repos/${GITHUB_REPO}/contents/${path}`;
            const response = await githubApi.get(url, {
                params: { ref: GITHUB_BRANCH }
            });
            sha = response.data.sha;
        } catch (e) {
            // File doesn't exist, will create new
        }

        const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
        
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const payload = {
            message: message || `Update ${path}`,
            content: content,
            branch: GITHUB_BRANCH
        };
        if (sha) payload.sha = sha;

        const response = await githubApi.put(url, payload);
        
        if (response.status === 200 || response.status === 201) {
            console.log(`[GitHub] ✅ File saved: ${path}`);
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('[GitHub] Save file error:', error.response?.data?.message || error.message);
        return null;
    }
}

/**
 * 📁 Delete file from GitHub
 * @param {string} path - File path in repo
 * @param {string} message - Commit message
 * @returns {boolean} - Success status
 */
async function deleteGitHubFile(path, message) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return true;
    try {
        await verifyPrivateRepository();
        // Get current file SHA
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const response = await githubApi.get(url, {
            params: { ref: GITHUB_BRANCH }
        });

        if (!response.data || !response.data.sha) {
            console.log(`[GitHub] File not found: ${path}`);
            return true;
        }

        const payload = {
            message: message || `Delete ${path}`,
            sha: response.data.sha,
            branch: GITHUB_BRANCH
        };

        await githubApi.delete(url, { data: payload });
        console.log(`[GitHub] ✅ File deleted: ${path}`);
        return true;
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`[GitHub] File already deleted: ${path}`);
            return true;
        }
        console.error('[GitHub] Delete file error:', error.response?.data?.message || error.message);
        return false;
    }
}

/**
 * 📁 List files in a directory
 * @param {string} directory - Directory path in repo
 * @returns {array} - List of files
 */
async function listGitHubFiles(directory) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return [];
    try {
        await verifyPrivateRepository();
        const url = `/repos/${GITHUB_REPO}/contents/${directory}`;
        const response = await githubApi.get(url, {
            params: { ref: GITHUB_BRANCH }
        });
        
        if (Array.isArray(response.data)) {
            return response.data.filter(item => item.type === 'file');
        }
        return [];
    } catch (error) {
        if (error.response?.status === 404) {
            return [];
        }
        console.error('[GitHub] List files error:', error.response?.data?.message || error.message);
        return [];
    }
}

/**
 * 📁 Create directory (by creating a .gitkeep file)
 * @param {string} directory - Directory path
 * @returns {boolean} - Success status
 */
async function createGitHubDirectory(directory) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return false;
    try {
        await verifyPrivateRepository();
        const path = `${directory}/.gitkeep`;
        const content = Buffer.from('').toString('base64');
        
        const url = `/repos/${GITHUB_REPO}/contents/${path}`;
        const payload = {
            message: `Create directory: ${directory}`,
            content: content,
            branch: GITHUB_BRANCH
        };

        await githubApi.put(url, payload);
        return true;
    } catch (error) {
        console.error('[GitHub] Create directory error:', error.message);
        return false;
    }
}

// ============================================
// 🔥 SESSION FUNCTIONS
// ============================================

function normalizeSessionNumber(number) {
    const digits = String(number || '').replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(digits)) throw new Error('Invalid international phone number for session storage.');
    return digits;
}

/**
 * 💾 Save session to GitHub
 * @param {string} number - WhatsApp number
 * @param {object} creds - Credentials object
 * @returns {boolean} - Success status
 */
async function saveSessionToGitHub(number, creds, authDir = null) {
    try {
        const normalizedNumber = normalizeSessionNumber(number);
        const userDir = `users/${normalizedNumber}`;
        const credsPath = `${userDir}/creds.json`;
        await createGitHubDirectory(userDir);

        if (authDir && creds?.registered === true) {
            try {
                const sessionId = createSessionId(authDir, normalizedNumber);
                if (sessionId) {
                    const backupPath = `${userDir}/session_id.json`;
                    const existing = await getGitHubFile(backupPath);
                    if (existing?.sessionId !== sessionId) {
                        await saveGitHubFile(backupPath, { version: 2, number: normalizedNumber, sessionId }, `Update full auth backup for ${normalizedNumber}`);
                    }
                }
            } catch (backupError) {
                console.error('[GitHub] Full auth backup deferred:', backupError.message);
            }
        }

        const result = await saveGitHubFile(credsPath, creds, `Update session for ${normalizedNumber}`);
        if (!result) return false;
        await updateActiveSessions(normalizedNumber);
        return true;
    } catch (error) {
        console.error('[GitHub] Save session error:', error.message);
        return false;
    }
}

/**
 * 📥 Get session from GitHub
 * @param {string} number - WhatsApp number
 * @returns {object|null} - Credentials object or null
 */
async function getSessionFromGitHub(number) {
    try {
        const normalizedNumber = normalizeSessionNumber(number);
        const data = await getGitHubFile(`users/${normalizedNumber}/creds.json`);
        return data || null;
    } catch (error) {
        console.error('[GitHub] Get session error:', error.message);
        return null;
    }
}

async function getSessionIdFromGitHub(number) {
    try {
        const normalizedNumber = normalizeSessionNumber(number);
        const data = await getGitHubFile(`users/${normalizedNumber}/session_id.json`);
        if (data?.version === 2 && data.number === normalizedNumber && typeof data.sessionId === 'string') return data.sessionId;
        return null;
    } catch (error) {
        console.error('[GitHub] Get full session error:', error.message);
        return null;
    }
}

/**
 * 🗑️ Delete session from GitHub
 * @param {string} number - WhatsApp number
 * @returns {boolean} - Success status
 */
async function deleteSessionFromGitHub(number) {
    if (!GITHUB_TOKEN || !GITHUB_REPO) return true;
    try {
        const normalizedNumber = normalizeSessionNumber(number);
        const credsDeleted = await deleteGitHubFile(`users/${normalizedNumber}/creds.json`, `Delete session for ${normalizedNumber}`);
        const backupDeleted = await deleteGitHubFile(`users/${normalizedNumber}/session_id.json`, `Delete full auth backup for ${normalizedNumber}`);
        if (!credsDeleted || !backupDeleted) return false;
        await removeFromActiveSessions(normalizedNumber);
        return true;
    } catch (error) {
        console.error('[GitHub] Delete session error:', error.message);
        return false;
    }
}

/**
 * 📋 Update active sessions list
 * @param {string} number - WhatsApp number
 * @returns {boolean} - Success status
 */
async function updateActiveSessions(number) {
    try {
        let sessions = await getGitHubFile('sessions.json') || [];
        if (!Array.isArray(sessions)) sessions = [];
        
        if (!sessions.includes(number)) {
            sessions.push(number);
            await saveGitHubFile('sessions.json', sessions, `Add ${number} to active sessions`);
        }
        return true;
    } catch (error) {
        console.error('[GitHub] Update sessions error:', error.message);
        return false;
    }
}

/**
 * 📋 Remove from active sessions
 * @param {string} number - WhatsApp number
 * @returns {boolean} - Success status
 */
async function removeFromActiveSessions(number) {
    try {
        let sessions = await getGitHubFile('sessions.json') || [];
        if (!Array.isArray(sessions)) sessions = [];
        
        sessions = sessions.filter(n => n !== number);
        await saveGitHubFile('sessions.json', sessions, `Remove ${number} from active sessions`);
        return true;
    } catch (error) {
        console.error('[GitHub] Remove sessions error:', error.message);
        return false;
    }
}

/**
 * 📋 Get all active sessions
 * @returns {array} - List of numbers
 */
async function getAllSessionsFromGitHub() {
    try {
        const sessions = await getGitHubFile('sessions.json') || [];
        if (!Array.isArray(sessions)) return [];
        return sessions.filter(number => /^\d{8,15}$/.test(String(number)));
    } catch (error) {
        console.error('[GitHub] Get sessions error:', error.message);
        return [];
    }
}

/**
 * 🔄 Auto reconnect all sessions
 * @returns {array} - List of numbers to reconnect
 */
async function autoReconnectAllSessions() {
    try {
        const numbers = await getAllSessionsFromGitHub();
        console.log(`[GitHub] 🔄 Found ${numbers.length} sessions to reconnect`);
        return numbers;
    } catch (error) {
        console.error('[GitHub] Auto reconnect error:', error.message);
        return [];
    }
}

/**
 * 📊 Get GitHub rate limit status
 * @returns {object} - Rate limit info
 */
async function getGitHubRateLimit() {
    try {
        const response = await githubApi.get('/rate_limit');
        return response.data;
    } catch (error) {
        console.error('[GitHub] Rate limit error:', error.message);
        return null;
    }
}

/**
 * 🧹 Cleanup old sessions (optional)
 * @param {number} days - Days to keep
 * @returns {boolean} - Success status
 */
async function cleanupOldSessions(days = 30) {
    try {
        const files = await listGitHubFiles('users');
        const now = Date.now();
        const cutoff = now - (days * 24 * 60 * 60 * 1000);
        let deleted = 0;

        for (const file of files) {
            if (file.type === 'dir') {
                const number = file.name;
                const credsPath = `users/${number}/creds.json`;
                const creds = await getGitHubFile(credsPath);
                
                if (creds && creds.timestamp) {
                    const fileTime = new Date(creds.timestamp).getTime();
                    if (fileTime < cutoff) {
                        await deleteSessionFromGitHub(number);
                        deleted++;
                    }
                }
            }
        }

        console.log(`[GitHub] 🧹 Cleaned up ${deleted} old sessions`);
        return true;
    } catch (error) {
        console.error('[GitHub] Cleanup error:', error.message);
        return false;
    }
}

// ============================================
// 📤 EXPORT
// ============================================

module.exports = {
    // ── Session Functions ──
    saveSessionToGitHub,
    getSessionFromGitHub,
    getSessionIdFromGitHub,
    deleteSessionFromGitHub,
    getAllSessionsFromGitHub,
    autoReconnectAllSessions,
    
    // ── File Functions ──
    getGitHubFile,
    saveGitHubFile,
    deleteGitHubFile,
    listGitHubFiles,
    createGitHubDirectory,
    
    // ── Utility Functions ──
    updateActiveSessions,
    removeFromActiveSessions,
    getGitHubRateLimit,
    cleanupOldSessions
};

console.log('📁 GitHub Session Manager Loaded!');
