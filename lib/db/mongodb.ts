import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | undefined;

function getDatabaseName(uri: string) {
  const path = new URL(uri).pathname.replace(/^\/+|\/+$/g, "");
  return path ? decodeURIComponent(path) : "test";
}

export async function connectDB() {
  const mongodbUri = process.env.MONGODB_URI?.trim().replace(/^["']+|["']+$/g, "");
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is missing");
  }

  const expectedDatabase = getDatabaseName(mongodbUri);
  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.name === expectedDatabase) return mongoose;
    await mongoose.disconnect();
    connectionPromise = undefined;
  }
  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    if (mongoose.connection.name === expectedDatabase) return mongoose;
    await mongoose.disconnect();
    connectionPromise = undefined;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongodbUri).catch((error: unknown) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  return connectionPromise;
}