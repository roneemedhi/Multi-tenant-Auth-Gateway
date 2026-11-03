import Redis from "ioredis";
import { logger } from "./logger";

let client: Redis | null = null;

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 5_000,
    retryStrategy: (attempt) => Math.min(attempt * 250, 2_000),
  });
  client.on("error", (error: Error) => {
    logger.warn({ err: error }, "Redis connection error");
  });
}

export async function getRedis(): Promise<Redis> {
  if (!client) {
    throw new Error("Redis is not configured. Set REDIS_URL to enable authentication.");
  }

  if (client.status === "wait") {
    await client.connect();
  }

  if (client.status !== "ready") {
    throw new Error("Redis is unavailable. Authentication is temporarily disabled.");
  }

  return client;
}

export function redisConfigured(): boolean {
  return client !== null;
}
