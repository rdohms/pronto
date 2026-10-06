/**
 * Debug logging utility.
 * Reads the debug flag from the Vite environment at build time.
 */

const ENABLED = import.meta.env.VITE_DEBUG === 'true';

class Debug {
  private readonly enabled: boolean;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  log(...messages: unknown[]): void {
    if (!this.enabled) return;
    console.log(...messages);
  }
}

export default new Debug(ENABLED);
