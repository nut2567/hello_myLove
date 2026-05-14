import { attachDatabasePool } from "@vercel/functions";
import { MongoClient, type Db, type MongoClientOptions } from "mongodb";

type MongoConnectionState = {
  client?: MongoClient;
  promise?: Promise<MongoClient>;
  uri?: string;
};

declare global {
  var __mongoConnectionState: MongoConnectionState | undefined;
}

const mongoClientOptions: MongoClientOptions = {
  maxIdleTimeMS: 10_000,
  maxPoolSize: 10,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 5_000,
};

function getConnectionState(): MongoConnectionState {
  if (!globalThis.__mongoConnectionState) {
    globalThis.__mongoConnectionState = {};
  }

  return globalThis.__mongoConnectionState;
}

function createMongoClient(uri: string): MongoClient {
  const client = new MongoClient(uri, mongoClientOptions);

  attachDatabasePool(client);

  return client;
}

function getDatabaseName(): string {
  const databaseName = process.env.DATABASE_NAME?.trim();

  if (!databaseName) {
    throw new Error("DATABASE_NAME is not configured.");
  }

  return databaseName;
}

export async function getMongoClient(): Promise<MongoClient> {
  const uri =
    process.env.MONGODB_URI ?? process.env.nana_technology_MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  const state = getConnectionState();

  if (!state.client || state.uri !== uri) {
    state.uri = uri;
    state.client = createMongoClient(uri);
    state.promise = undefined;
  }

  if (!state.promise) {
    state.promise = state.client.connect().catch((error: unknown) => {
      state.client = undefined;
      state.promise = undefined;
      state.uri = undefined;
      throw error;
    });
  }

  return state.promise;
}

export async function getMongoDatabase(): Promise<Db> {
  const databaseName = getDatabaseName();
  const client = await getMongoClient();

  return client.db(databaseName);
}
