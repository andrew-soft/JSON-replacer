/**
 * Configuration management for the service
 */

export interface Config {
  port: number;
  maxReplacements: number;
}

/**
 * Loads configuration from environment variables with defaults
 */
export function loadConfig(): Config {
  const port = parseInt(process.env.PORT || '3000', 10);
  const maxReplacements = parseInt(process.env.MAX_REPLACEMENTS || '100', 10);

  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Invalid PORT environment variable. Must be a number between 1 and 65535.');
  }

  if (isNaN(maxReplacements) || maxReplacements < 1) {
    throw new Error('Invalid MAX_REPLACEMENTS environment variable. Must be a positive number.');
  }

  return {
    port,
    maxReplacements,
  };
}

