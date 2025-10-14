import { existsSync } from "fs";
import { config } from "dotenv";
import { resolve } from "path";

const rootEnvPath = resolve(process.cwd(), ".env");
const serverEnvPath = resolve(process.cwd(), "server/.env");
const envPath = existsSync(rootEnvPath) ? rootEnvPath : serverEnvPath;

config({ path: envPath });

const requiredEnv = ["MONGODB_URI", "JWT_SECRET"] as const;

type RequiredEnvKey = typeof requiredEnv[number];

type EnvConfig = Record<RequiredEnvKey, string>;

const loadedEnv: Partial<EnvConfig> = {};

requiredEnv.forEach((key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  loadedEnv[key] = value;
});

export const env = loadedEnv as EnvConfig;
