import { loadEnvConfig } from "@next/env";
import { getMongoClient } from "../src/lib/mongodb";
import { migratePathPins } from "../src/lib/path-pin-migration";

loadEnvConfig(process.cwd());

const options = process.argv.slice(2);
if (options.some((option) => option !== "--apply" && option !== "--dry-run")
  || (options.includes("--apply") && options.includes("--dry-run"))) {
  throw new Error("Usage: npm run migrate:path-pins -- [--dry-run | --apply]");
}

async function main() {
  const client = await getMongoClient();
  try {
    const databaseName = process.env.DATABASE_NAME?.trim() || "port";
    const report = await migratePathPins(client.db(databaseName), options.includes("--apply"));
    console.log(JSON.stringify(report, null, 2));
    if (report.invalidCredentials > 0 || report.concurrentChangesSkipped > 0) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error && error.message.startsWith("Migration stopped:")
    ? error.message
    : `Credential migration failed (${error instanceof Error ? error.name : "unknown error"}); no credentials or connection details were logged.`);
  process.exitCode = 1;
});
