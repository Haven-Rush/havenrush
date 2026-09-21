/**
 * One-time setup: prints the ADMIN_PASSWORD_HASH value to put in your env.
 *
 *   npm run admin:hash-password                 (prompts, input hidden)
 *   echo -n 'my-password' | npm run admin:hash-password   (pipe, no prompt)
 *
 * Avoid passing the password as a CLI arg — it would land in shell history.
 */
import { hashPassword } from "../lib/admin-auth";

async function readPassword(): Promise<string> {
  if (!process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks).toString("utf8").trim();
  }

  return new Promise((resolve) => {
    process.stdout.write("Admin password: ");
    const stdin = process.stdin;
    stdin.resume();
    stdin.setRawMode?.(true);
    stdin.setEncoding("utf8");

    let value = "";
    const onData = (char: string) => {
      if (char === "\n" || char === "\r" || char === "\u0004") {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
        return;
      }
      if (char === "\u0003") {
        process.exit(1); // Ctrl+C
      }
      if (char === "\u007f") {
        value = value.slice(0, -1); // backspace
        return;
      }
      value += char;
    };
    stdin.on("data", onData);
  });
}

async function main() {
  const password = await readPassword();
  if (!password) {
    console.error("No password provided.");
    process.exit(1);
  }
  console.log("\nADMIN_PASSWORD_HASH=" + hashPassword(password));
}

main();
