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
const SOURCE = "/home/folmdelima/Ferdinando_Cloud/logs";
const DEST = "/home/folmdelima/chat-insights/logs";
const REPO_PATH = "/home/folmdelima/chat-insights";

const INTERVAL = 60000; // 1 minuto

const git = simpleGit(REPO_PATH);

let lastSnapshot = "";
// =======================
// FIM: CONFIG
// =======================


// =======================
// INÍCIO: COPIAR PASTA
// =======================
function copyFolder() {
  if (!fs.existsSync(SOURCE)) {
    console.log("⚠️ Pasta de origem não encontrada");
    return;
  }

  if (!fs.existsSync(DEST)) {
    fs.mkdirSync(DEST, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE);

  for (const file of files) {
    const src = path.join(SOURCE, file);
    const dest = path.join(DEST, file);

    fs.copyFileSync(src, dest);
  }
}
// =======================
// FIM: COPIAR PASTA
// =======================


// =======================
// INÍCIO: GERAR SNAPSHOT
// =======================
function generateSnapshot() {
  if (!fs.existsSync(DEST)) return "";

  let data = "";

  const files = fs.readdirSync(DEST);

  for (const file of files) {
    const content = fs.readFileSync(path.join(DEST, file), "utf-8");
    data += content;
  }

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
    copyFolder();

    const currentSnapshot = generateSnapshot();

    if (currentSnapshot === lastSnapshot) {
      console.log("⏸️ Nada mudou...");
      return;
    }

    lastSnapshot = currentSnapshot;

    console.log("🚨 Mudança detectada");

    await git.add("./logs");
    await git.commit(`sync logs ${new Date().toISOString()}`);
    await git.push("origin", "main");

    console.log("🚀 Enviado pro GitHub");

  } catch (err) {
    console.log("❌ Erro:", err.message);
  }
}
// =======================
// FIM: SYNC
// =======================


// =======================
// INÍCIO: START
// =======================
console.log("🔥 Sync iniciado...");
sync(); // roda uma vez ao iniciar
setInterval(sync, INTERVAL);
// =======================
// FIM: START
// =======================