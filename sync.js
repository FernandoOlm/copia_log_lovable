// =======================
// INÍCIO: IMPORTS
// =======================
const fs = require("fs");
const path = require("path");
const simpleGit = require("simple-git");
// =======================
// FIM: IMPORTS
// =======================


// =======================
// INÍCIO: CONFIG
// =======================
const SOURCE = "/home/folmdelima/Ferdinando_Cloud/logs";
const DEST = "/home/folmdelima/logs_analitcs/logs";
const REPO_PATH = "/home/folmdelima/logs_analitcs";

const INTERVAL = 60000;

const git = simpleGit(REPO_PATH);

let lastSnapshot = "";
// =======================
// FIM: CONFIG
// =======================


// =======================
// INÍCIO: COPY
// =======================
function copyFolder() {
  if (!fs.existsSync(SOURCE)) return false;

  if (!fs.existsSync(DEST)) {
    fs.mkdirSync(DEST, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE);

  for (const file of files) {
    try {
      fs.copyFileSync(
        path.join(SOURCE, file),
        path.join(DEST, file)
      );
    } catch {}
  }

  return true;
}
// =======================
// FIM: COPY
// =======================


// =======================
// INÍCIO: SNAPSHOT
// =======================
function snapshot() {
  if (!fs.existsSync(DEST)) return "";

  let data = "";

  const files = fs.readdirSync(DEST).sort();

  for (const file of files) {
    try {
      data += fs.readFileSync(path.join(DEST, file), "utf-8");
    } catch {}
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
    const ok = copyFolder();
    if (!ok) return;

    const current = snapshot();

    if (current === lastSnapshot) {
      console.log("⏸️ Sem mudanças");
      return;
    }

    lastSnapshot = current;

    console.log("🚨 Mudança detectada");

    await git.add("./logs");

    const status = await git.status();

    if (status.files.length === 0) {
      console.log("📭 Nada pra commitar");
      return;
    }

    await git.commit(`logs ${new Date().toISOString()}`);
    await git.push("origin", "main");

    console.log("🚀 Logs enviados");

  } catch (err) {
    console.log("❌", err.message);
  }
}
// =======================
// FIM: SYNC
// =======================


// =======================
// INÍCIO: START
// =======================
console.log("🔥 Sync logs_analitcs iniciado...");
sync();
setInterval(sync, INTERVAL);
// =======================
// FIM: START
// =======================