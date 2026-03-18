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
const SOURCE = "/home/folmdelima/Ferdinando_Cloud/src/data";
const DEST = "/home/folmdelima/logs_analitcs";

const INTERVAL = 60000;

const git = simpleGit(DEST);
// =======================
// FIM: CONFIG
// =======================


// =======================
// INÍCIO: COPY RECURSIVO
// =======================
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        console.log("⚠️ erro ao copiar:", entry.name);
      }
    }
  }
}
// =======================
// FIM: COPY RECURSIVO
// =======================


// =======================
// INÍCIO: SYNC
// =======================
async function sync() {
  try {
    console.log("🔄 sincronizando...");

    copyRecursive(SOURCE, DEST);

    await git.add(".");

    const status = await git.status();

    if (status.files.length === 0) {
      console.log("⏸️ Sem mudanças");
      return;
    }

    await git.commit(`sync logs ${new Date().toISOString()}`);
    await git.push("origin", "main");

    console.log("🚀 enviado pro repo");

  } catch (err) {
    console.log("❌ erro:", err.message);
  }
}
// =======================
// FIM: SYNC
// =======================


// =======================
// INÍCIO: START
// =======================
console.log("🔥 Sync V2 iniciado...");
sync();
setInterval(sync, INTERVAL);
// =======================
// FIM: START
// =======================