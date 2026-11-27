import { randomBytes, createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const output = process.argv[2];
const names = process.argv.slice(3);
if (!output || !names.length || names.some((name) => !/^[a-z]+\.[a-z]+$/u.test(name)) || new Set(names).size !== names.length) {
  throw new Error("Usage: node scripts/create-collab-access.mjs OUTPUT_DIRECTORY name.surname ...");
}
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const pepper = randomBytes(32).toString("hex");
const entries = names.map((name) => {
  const code = [...randomBytes(20)].map((byte) => alphabet[byte & 31]).join("").match(/.{1,5}/gu).join("-");
  const clean = code.replaceAll("-", "");
  const hash = createHash("sha256").update(`${pepper}:${clean}`).digest("hex");
  return { name, code, hash };
});
await mkdir(output, { recursive: true });
await writeFile(join(output, "member-codes.txt"), `CHECKform — персональные коды. Не пересылайте файл целиком.\n\n${entries.map(({ name, code }) => `${name}: ${code}`).join("\n")}\n`, { flag: "wx", mode: 0o600 });
await writeFile(join(output, "code-pepper.txt"), `${pepper}\n`, { flag: "wx", mode: 0o600 });
await writeFile(join(output, "members.sql"), `${entries.map(({ name, hash }) => `INSERT INTO members(id, code_hash, active) VALUES ('${name}', '${hash}', 1);`).join("\n")}\n`, { flag: "wx", mode: 0o600 });
console.log(`Created ${entries.length} codes in ${output}`);
