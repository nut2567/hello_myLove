import "server-only";

import type { Db } from "mongodb";
import { hashPathPin, isPathPinHash } from "./path-password";

type CredentialDocument = { pin?: unknown; pinHash?: unknown };

export async function migratePathPins(db: Db, apply = false) {
  const report = {
    mode: apply ? "apply" : "dry-run",
    plaintextCredentials: 0,
    redundantPlaintextCredentials: 0,
    invalidCredentials: 0,
    migratedCredentials: 0,
    removedPlaintextCredentials: 0,
    concurrentChangesSkipped: 0,
    passwordLogs: await db.collection("logOnUser").countDocuments({ wrongpass: { $exists: true } }),
    removedPasswordLogs: 0,
  };

  // Preflight every credential before performing any writes. Never print its contents.
  for (const name of ["user", "newUser"]) {
    const collection = db.collection<CredentialDocument>(name);
    for await (const document of collection.find({ pin: { $exists: true } })) {
      if (isPathPinHash(document.pinHash)) report.redundantPlaintextCredentials += 1;
      else if (document.pinHash === undefined && typeof document.pin === "string") report.plaintextCredentials += 1;
      else report.invalidCredentials += 1;
    }
  }
  if (!apply) return report;
  if (report.invalidCredentials > 0) {
    throw new Error("Migration stopped: unsupported credential records need review. No records were changed.");
  }

  for (const name of ["user", "newUser"]) {
    const collection = db.collection<CredentialDocument>(name);
    for await (const document of collection.find({ pin: { $exists: true } })) {
      const hasHash = isPathPinHash(document.pinHash);
      if (!hasHash && (document.pinHash !== undefined || typeof document.pin !== "string")) {
        report.concurrentChangesSkipped += 1;
        continue;
      }
      const pinHash = hasHash ? document.pinHash : await hashPathPin(document.pin as string);
      const result = await collection.updateOne(
        {
          _id: document._id,
          pin: { $eq: document.pin },
          pinHash: document.pinHash === undefined ? { $exists: false } : { $eq: document.pinHash },
        },
        { $set: { pinHash }, $unset: { pin: "" } },
      );
      if (result.modifiedCount === 0) report.concurrentChangesSkipped += 1;
      else if (hasHash) report.removedPlaintextCredentials += 1;
      else report.migratedCredentials += 1;
    }
  }
  const logs = await db.collection("logOnUser").updateMany(
    { wrongpass: { $exists: true } }, { $unset: { wrongpass: "" } },
  );
  report.removedPasswordLogs = logs.modifiedCount;
  return report;
}
