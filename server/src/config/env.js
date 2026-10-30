/**
 * Environment configuration with startup validation.
 * Required vars cause a clean exit if missing.
 * Optional AI vars degrade gracefully.
 */

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`\nFATAL: Missing required environment variable: ${key}`);
    console.error(`Copy server/.env.example to server/.env and fill in the values.\n`);
    process.exit(1);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // AI — optional; app starts without these
  LLM_API_KEY: process.env.LLM_API_KEY || null,
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-1.5-flash',
  LLM_BASE_URL: process.env.LLM_BASE_URL || null,
  AI_ENABLED: Boolean(process.env.LLM_API_KEY),

  get isDev() {
    return this.NODE_ENV === 'development';
  },
  get isProd() {
    return this.NODE_ENV === 'production';
  },
};

