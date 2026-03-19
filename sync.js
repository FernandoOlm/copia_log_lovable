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
// INÍCIO: LOGGER
// =======================
function log(level, context, message, extra = null) {
  const timestamp = new Date().toISOString();

  let output = `[${timestamp}] [${level}] [${context}] ${message}`;

  if (extra) {
    output += ` | ${JSON.stringify(extra)}`;
  }

  console.log(output);
}
// =======================
// FIM: LOGGER
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
        log("WARN", "COPY", "Erro ao copiar arquivo", {
          file: entry.name
        });
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
  const startTime = Date.now();

  try {
    log("INFO", "SYNC", "Iniciando sincronização");

    copyRecursive(SOURCE, DEST);

    await git.add(".");

    const status = await git.status();

    if (status.files.length === 0) {
      log("INFO", "SYNC", "Sem mudanças detectadas");
      return;
    }

    const changedFiles = status.files.length;

    await git.commit(`sync logs ${new Date().toISOString()}`);
    await git.push("origin", "main");

    const duration = Date.now() - startTime;

    log("INFO", "GIT", "Push realizado com sucesso", {
      arquivosAlterados: changedFiles,
      tempoMs: duration
    });

  } catch (err) {
    log("ERROR", "SYNC", "Falha na sincronização", {
      erro: err.message
    });
  }
}
// =======================
// FIM: SYNC
// =======================


// =======================
// INÍCIO: START
// =======================
log("INFO", "SYSTEM", "Sync iniciado", {
  intervaloMs: INTERVAL,
  source: SOURCE,
  destino: DEST
});

sync();
setInterval(sync, INTERVAL);
// =======================
// FIM: START
// =======================