import { spawn } from "node:child_process";
import { once } from "node:events";
import { join, dirname } from "node:path";
import { existsSync, createWriteStream } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
const file = join(dirname(process.argv[1]), "main.go"); // 👈 CHANGE ME!
const response1 = await fetch("https://go.dev/dl/?mode=json&include=all");
const json = await response1.json();
const tag = json.map((x) => x.version).find((x) => x.startsWith("go1."));
const version = tag.slice(2);
const install = join(
  process.env.RUNNER_TOOL_CACHE,
  "go",
  version,
  process.arch
);
if (!existsSync(install)) {
  const DEST = join(process.env.RUNNER_TEMP, tag);
  await mkdir(DEST, { recursive: true });
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
  const SRC = join(DEST, filename);
  await pipeline(response2.body, createWriteStream(SRC));
  let subprocess1;
  if (process.platform === "windows" && filename.endsWith(".zip")) {
    subprocess1 = spawn(
      `Expand-Archive -LiteralPath $Env:SRC -DestinationPath $Env:DEST`,
      { shell: "powershell", env: { ...process.env, SRC, DEST } }
    );
  } else {
    subprocess1 = spawn("tar", ["-xzf", SRC, "-C", DEST]);
  }
  await once(subprocess1, "exit");
  await mkdir(join(install, ".."), { recursive: true });
  await rename(join(DEST, "go"), install);
}
const subprocess2 = spawn(join(install, "bin", "go"), ["run", file], {
  stdio: "inherit",
});
await once(subprocess2, "spawn");
subprocess2.on("exit", (x) => process.exit(x));
