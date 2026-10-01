// Compatibility entry point: checks use an isolated database, never the live site.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const result = spawnSync(
  process.execPath,
  ["--test", fileURLToPath(new URL("./integration.test.mjs", import.meta.url))],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
