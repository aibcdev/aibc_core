/**
 * Storage service for scan results
 * Using in-memory storage for now, can be replaced with Firestore/Cloud SQL
 */

interface ScanResult {
  id: string;
  username: string;
  platforms: string[];
  scanType: string;
  status: string;
  progress: number;
  logs: string[];
  results: any;
  error: string | null;
  createdAt: string;
  completedAt?: string;
}

class StorageService {
  private scans: Map<string, ScanResult> = new Map();
  private userScans: Map<string, string[]> = new Map(); // username -> scanIds[]

  /**
   * Save scan result
   */
  saveScan(scan: ScanResult): void {
    this.scans.set(scan.id, scan);
    
    // Track scans by username
    if (!this.userScans.has(scan.username)) {
      this.userScans.set(scan.username, []);
    }
    this.userScans.get(scan.username)!.push(scan.id);
  }

  /**
   * Get scan by ID
   */
  getScan(id: string): ScanResult | undefined {
    return this.scans.get(id);
  }

  /**
   * Update scan
   */
  updateScan(id: string, updates: Partial<ScanResult>): boolean {
    const scan = this.scans.get(id);
    if (!scan) return false;

    this.scans.set(id, { ...scan, ...updates });
    return true;
  }

  /**
   * Get all scans for a username
   */
  getUserScans(username: string): ScanResult[] {
    const scanIds = this.userScans.get(username) || [];
    return scanIds
      .map(id => this.scans.get(id))
      .filter((scan): scan is ScanResult => scan !== undefined)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get recent scans (last N)
   */
  getRecentScans(limit: number = 10): ScanResult[] {
    return Array.from(this.scans.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Delete old scans (cleanup)
   */
  deleteOldScans(olderThanDays: number = 30): number {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    
    let deleted = 0;
    for (const [id, scan] of this.scans.entries()) {
      if (new Date(scan.createdAt) < cutoff) {
        this.scans.delete(id);
        // Remove from userScans
        const userScans = this.userScans.get(scan.username);
        if (userScans) {
          const index = userScans.indexOf(id);
          if (index > -1) userScans.splice(index, 1);
        }
        deleted++;
      }
    }
    return deleted;
  }
}

export const storage = new StorageService();

