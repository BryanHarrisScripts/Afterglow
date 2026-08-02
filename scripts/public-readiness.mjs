import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

const requiredFiles = [
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "ASSET_POLICY.md",
  "PUBLIC_READINESS.md",
  ".github/dependabot.yml",
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`Missing security-baseline file: ${file}`);
}

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const forbiddenNames = [
  /(^|\/)\.env(?:\.|$)/i,
  /\.(?:pem|key|pfx|p12)$/i,
  /(^|\/)(?:credentials?|secrets?)\.json$/i,
  /(^|\/)id_(?:rsa|dsa|ecdsa|ed25519)$/i,
];

for (const file of tracked) {
  if (file === ".env.example") continue;
  if (forbiddenNames.some((pattern) => pattern.test(file))) {
    failures.push(`Tracked private filename: ${file}`);
  }
}

const secretPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["GitHub token", /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}/],
  ["OpenAI key", /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/],
  ["Google API key", /AIza[0-9A-Za-z_-]{30,}/],
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["Slack token", /xox[baprs]-[A-Za-z0-9-]{20,}/],
];

for (const file of tracked) {
  let stats;
  try {
    stats = statSync(file);
  } catch {
    continue;
  }
  if (!stats.isFile() || stats.size > 5_000_000) continue;

  const bytes = readFileSync(file);
  if (bytes.includes(0)) continue;
  const text = bytes.toString("utf8");

  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(text)) failures.push(`Recognizable ${label} pattern in ${file}`);
  }
}

for (const file of tracked.filter((name) => /^\.github\/workflows\/.*\.ya?ml$/i.test(name))) {
  const workflow = readFileSync(file, "utf8");
  const header = workflow.split(/^jobs:\s*$/m)[0];

  if (!/^permissions:\s*$/m.test(header)) {
    failures.push(`Workflow lacks explicit top-level permissions: ${file}`);
  }
  if (/^\s+[A-Za-z-]+:\s*write\s*$/m.test(header)) {
    failures.push(`Workflow grants top-level write permission: ${file}`);
  }
  if (/\bpull_request_target\b/.test(workflow)) {
    failures.push(`Workflow uses pull_request_target: ${file}`);
  }

  for (const line of workflow.split("\n")) {
    const match = line.match(/^\s*-?\s*uses:\s*([^@\s]+)@([^\s#]+)/);
    if (!match || match[1].startsWith("./") || match[1].startsWith("docker://")) continue;
    if (!/^[0-9a-f]{40}$/i.test(match[2])) {
      failures.push(`Workflow action is not pinned to a full commit SHA: ${file}: ${match[1]}`);
    }
  }
}

if (failures.length) {
  console.error("Afterglow security baseline failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Afterglow security baseline passed for ${tracked.length} tracked files.`);
console.log("Publication remains blocked until every item in PUBLIC_READINESS.md is resolved.");
