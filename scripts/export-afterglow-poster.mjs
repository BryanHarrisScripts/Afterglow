import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const sourcePath = "Afterglow Poster 2023.png";
const outputRoot = "plotpickle-poster-export";
const base = "afterglow-draft-poster-2023.webp";
const source = await readFile(sourcePath);
const sourceSha256 = createHash("sha256").update(source).digest("hex");
const image = sharp(source, { failOn: "error" });
const metadata = await image.metadata();
if (!metadata.width || !metadata.height) throw new Error("Poster dimensions could not be read.");

const outputs = [
  { kind: "full", dir: "full", resize: null, quality: 90 },
  { kind: "card", dir: "cards", resize: 1600, quality: 90 },
  { kind: "thumb", dir: "thumbs", resize: 640, quality: 86 },
];

const records = [];
for (const spec of outputs) {
  const dir = path.join(outputRoot, spec.dir);
  await mkdir(dir, { recursive: true });
  let pipeline = sharp(source, { failOn: "error" }).rotate();
  if (spec.resize) pipeline = pipeline.resize({ width: spec.resize, height: spec.resize, fit: "inside", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 });
  const target = path.join(dir, base);
  const buffer = await pipeline.webp({ quality: spec.quality, effort: 6, alphaQuality: 100 }).toBuffer();
  await writeFile(target, buffer);
  const derived = await sharp(buffer).metadata();
  records.push({ kind: spec.kind, path: target, width: derived.width, height: derived.height, bytes: buffer.byteLength, sha256: createHash("sha256").update(buffer).digest("hex"), quality: spec.quality });
}

const manifest = {
  id: "afterglow-draft-poster-2023",
  title: "Afterglow 2023 Draft Poster",
  status: "legacy-draft",
  source: { repository: "BryanHarrisScripts/Afterglow-Echoes-of-Sentience", path: sourcePath, blobSha: "8b5b69545b0753edecd7a7fe9cc5526b91d3ff64", sha256: sourceSha256, width: metadata.width, height: metadata.height, bytes: source.byteLength, format: metadata.format, hasAlpha: metadata.hasAlpha ?? false },
  conversion: { tool: "sharp", noUpscaling: true, metadataStrippedAfterRecording: true, resampling: "lanczos3", outputs: records },
  review: { label: "legacy draft key art", visualInspectionRequired: true, titleCreditsFacesFineDetailReview: "required", rightsReview: "required", currentKeyArt: false },
};
await writeFile(path.join(outputRoot, "afterglow-draft-poster-2023.manifest.json"), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));
