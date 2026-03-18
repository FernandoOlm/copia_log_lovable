// =======================
// INÍCIO: IMPORTS
// =======================
import fs from "fs";
import path from "path";
import simpleGit from "simple-git";
// =======================
// FIM: IMPORTS
// =======================


// =======================
// INÍCIO: CONFIG
// =======================
const SOURCE_DIR = "/home/folmdelima/Ferdinando_Cloud/logs";
const DEST_DIR = "/home/folmdelima/chat-insights/logs";

const INTERVAL = 60000; // 1 minuto
const git = simpleGit(DEST_DIR);

let lastSnapshot = "";
// =======================
// FIM: CONFIG
// =======================


// =======================
// INÍCIO: COPIAR ARQUIVOS
// =======================
function copyLogs() {
  if (!fs.existsSync(SOURCE_DIR)) return;

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR);

  files.forEach(file => {
    const src = path.join(SOURCE_DIR, file);
    const dest = path.join(DEST_DIR, file);

    fs.copyFileSync(src, dest);
  });
}
// =======================
// FIM: COPIAR
// =======================


// =======================
// INÍCIO: SNAPSHOT
// =======================
function generateSnapshot() {
  let data = "";

  const files = fs.readdirSync(DEST_DIR);

  files.forEach(file => {
    const content = fs.readFileSync(path.join(DEST_DIR, file), "utf-8");
    data += content;
  });

  return data;
}
// =======================
// FIM: SNAPSHOT
// =======================


// =======================
// INÍCIO: SYNC
// =======================
async function sync() {
  try {
    copyLogs();

    const current = generateSnapshot();

    if (current === lastSnapshot) {
      console.log("Sem mudanças...");
      return;
    }

    lastSnapshot = current;

    console.log("Mudança detectada 🚨");

    await git.add("./logs");
    await git.commit(`logs sync ${new Date().toISOString()}`);
    await git.push("origin", "main");

    console.log("Enviado pro GitHub 🚀");

  } catch (err) {
    console.error("Erro:", err.message);
  }
}
// =======================
// FIM: SYNC
// =======================


// =======================
// INÍCIO: LOOP
// =======================
setInterval(sync, INTERVAL);
// =======================
// FIM: LOOP
// =======================