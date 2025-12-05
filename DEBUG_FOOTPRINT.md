# Debugging Footprint Data Flow

## Current Flow:
1. User enters username in IngestionView → stored in localStorage as `lastScannedUsername`
2. AuditView starts scan → calls `/api/scan/start`
3. Backend processes scan → stores in `storage` service
4. Scan completes → results stored in `scan.results`
5. AuditView gets results → stores in localStorage as `lastScanResults`
6. Dashboard loads → tries to fetch from `/api/scan/user/:username/latest`
7. Dashboard displays data

## Potential Issues:
1. Scan might not be completing (status not 'complete')
2. Results might not be in correct format
3. Username mismatch (case sensitivity, @ symbol)
4. Storage might be clearing (in-memory storage resets on server restart)

## Debug Steps:
1. Check if scan completes: Look at AuditView logs
2. Check localStorage: Open browser console, check `localStorage.getItem('lastScanResults')`
3. Check API: `curl http://localhost:3001/api/scan/user/joelbeya/latest`
4. Check backend logs: Look for scan completion messages

