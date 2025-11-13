import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const workerSource = resolve(
  __dirname,
  "../node_modules/pdfjs-dist/build/pdf.worker.min.mjs"
);
const workerTargetDir = resolve(__dirname, "../public/vendor");
const workerTarget = resolve(workerTargetDir, "pdf.worker.min.mjs");

async function ensureWorker() {
  try {
    await mkdir(workerTargetDir, { recursive: true });
    await copyFile(workerSource, workerTarget);
  } catch (error) {
    console.warn(
      "[postinstall] Unable to copy pdf.js worker into public assets.",
      error
    );
  }
}

ensureWorker();


