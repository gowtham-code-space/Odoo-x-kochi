import { env } from '../config/env.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT = LEVELS[env.isDev ? 'debug' : 'info'];

function formatMsg(level, message, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] ${level.toUpperCase()} ${message}`;
  if (meta && Object.keys(meta).length) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
}

export const logger = {
  error(message, meta = {}) {
    if (LEVELS.error <= CURRENT) console.error(formatMsg('error', message, meta));
  },
  warn(message, meta = {}) {
    if (LEVELS.warn <= CURRENT) console.warn(formatMsg('warn', message, meta));
  },
  info(message, meta = {}) {
    if (LEVELS.info <= CURRENT) console.info(formatMsg('info', message, meta));
  },
  debug(message, meta = {}) {
    if (LEVELS.debug <= CURRENT) console.debug(formatMsg('debug', message, meta));
  },
};

