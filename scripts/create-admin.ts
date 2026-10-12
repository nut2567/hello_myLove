import { randomBytes, randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { getMongoClient, getMongoDatabase } from "../src/lib/mongodb";
import { ensureUserNameIndex, getAdminByName } from "../src/lib/admin-users";
import { getPathUserByCredentials } from "../src/lib/path-access";
import { hashPathPin } from "../src/lib/path-password";
import { getCurrentThaiDateTimeString } from "../src/lib/date-time";

loadEnvConfig(process.cwd());

async function main() {
  const requestedDatabase = process.argv.find(argument => argument.startsWith("--database="))?.slice("--database=".length);
  if (!requestedDatabase || requestedDatabase !== process.env.DATABASE_NAME?.trim()) {
    throw new Error("Pass --database=<DATABASE_NAME> to explicitly select the configured database.");
  }
  const client = await getMongoClient();
  try {
    const database = await getMongoDatabase();
    if (await database.collection("user").findOne({ name: "admin" })) {
      throw new Error("The admin account name already exists; no account was changed.");
    }
    await ensureUserNameIndex();
    const password = randomBytes(18).toString("base64url");
    await database.collection("user").insertOne({
      name: "admin", role: "admin", type: "Administrator", music: [],
      sessionId: randomUUID(), revisionId: randomUUID(),
      pinHash: await hashPathPin(password), createdAt: getCurrentThaiDateTimeString(),
    });
    if (!await getAdminByName("admin") || !await getPathUserByCredentials({ name: "admin", pin: password })) {
      throw new Error("Admin account verification failed.");
    }
    // Show the generated password once for provisioning; do not persist it in files or app logs.
    console.log(JSON.stringify({ database: requestedDatabase, page: "/admin", name: "admin", password, verified: true }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  console.error(message.startsWith("Pass --database=") || message.startsWith("The admin account name already exists") || message === "Admin account verification failed."
    ? message : "Admin account creation failed; no credentials were logged.");
  process.exitCode = 1;
});
