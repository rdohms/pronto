import type { Talk, Bio } from './index.js';

/**
 * Contract that all talk/bio data source adapters must implement.
 * SymposiumApiClient is the reference implementation; future sources
 * (Sessionize, Papercall, etc.) implement this same interface.
 */
export interface SourceAdapter {
  /** Fetch the authenticated user's list of talks */
  getUserTalks(): Promise<Talk[]>;

  /** Fetch full details for a single talk by ID */
  getTalkInfo(id: string): Promise<Talk>;

  /** Fetch the authenticated user's list of bios */
  getBios(): Promise<Bio[]>;

  /** Fetch full details for a single bio by ID */
  getBio(id: string): Promise<Bio>;
}
