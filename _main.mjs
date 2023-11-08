import { spawn } from "node:child_process";
import { once } from "node:events";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
const file = join(dirname(process.argv[1]), "main.ts"); // 👈 CHANGE ME!
const response1 = await fetch("https://go.dev/dl/?mode=json&include=all");
const json = await response1.json();
const tag = json.map((x) => x.version).find((x) => x.startsWith("go1."));
const version = tag.slice(2);
let install = join(process.env.RUNNER_TOOL_CACHE, "go", version, process.arch);
if (!existsSync(install)) {
  const platform = {
    darwin: "darwin",
    linux: "linux",
    win32: "windows",
  }[process.platform];
  const arch = {
    x64: "amd64",
    arm64: "arm64",
  }[process.arch];
  const ext = platform === "windows" ? "zip" : "tar.gz";
  const filename = `${tag}.${platform}-${arch}.${ext}`;
  const response2 = await fetch(`https://go.dev/dl/${filename}`);
  await pipeline(response2.body, createWriteStream(join(install, filename)))
}

const DENO_INSTALL = join(
  process.env.RUNNER_TOOL_CACHE,
  "deno",
  version,
  process.arch
);
if (!existsSync(DENO_INSTALL)) {
  const subprocess1 = spawn(
    `curl -fsSL https://deno.land/x/install/install.sh | sh -s "$tag"`,
    { shell: "bash", env: { ...process.env, DENO_INSTALL, tag } }
  );
  await once(subprocess1, "exit");
}
const subprocess2 = spawn(
  join(DENO_INSTALL, "bin", "deno"),
  ["run", "-Aq", file],
  { stdio: "inherit" }
);
await once(subprocess2, "spawn");
subprocess2.on("exit", (x) => process.exit(x));
