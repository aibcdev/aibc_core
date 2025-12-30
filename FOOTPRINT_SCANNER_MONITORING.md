# Footprint Scanner Daily Bug Monitoring System

## Overview
This document outlines the systematic bug monitoring approach for the footprint scanner - the most critical component of the AIBC platform.

## Hypotheses Being Tested

### H1: Race Condition in Polling
**Hypothesis:** Multiple polling intervals may conflict, causing state inconsistencies or duplicate requests.
**Instrumentation:** Logs poll execution, poll count, and interval clearing.

### H2: Memory Leaks from Intervals
**Hypothesis:** Intervals/timeouts not cleared on unmount, causing memory leaks over time.
**Instrumentation:** Logs cleanup execution and interval clearing.

### H3: Browser Crashes/Hangs
**Hypothesis:** Playwright browser may crash or hang during scraping operations.
**Instrumentation:** Logs browser launch attempts, connection status, and fallback attempts.

### H4: Network Timeout Failures
**Hypothesis:** Timeouts may be too short or not handled properly, causing silent failures.
**Instrumentation:** Logs network requests, response status, and timeout errors.

### H5: Data Persistence Failures
**Hypothesis:** localStorage writes may fail silently, causing data loss.
**Instrumentation:** Logs localStorage write attempts, success/failure, and data sizes.

### H6: Error Handling Gaps
**Hypothesis:** Some errors may not be caught or logged properly, making debugging difficult.
**Instrumentation:** Logs all error catch blocks and error details.

### H7: Concurrent Scan Handling
**Hypothesis:** Multiple scans may interfere with each other, causing data corruption.
**Instrumentation:** Logs scan initiation, storage operations, and concurrent scan detection.

### H8: Platform Detection Failures
**Hypothesis:** Platform detection logic may fail silently, skipping valid platforms.
**Instrumentation:** Logs platform detection attempts and results.

## Daily Monitoring Checklist

### Morning Check (9 AM)
- [ ] Review overnight logs in `.cursor/debug.log`
- [ ] Check for any error patterns (H3, H4, H6)
- [ ] Verify no memory leaks (H2) - check for uncleared intervals
- [ ] Test a sample scan with a known company

### Midday Check (1 PM)
- [ ] Review morning scan logs
- [ ] Check for race conditions (H1) - multiple polls running
- [ ] Verify data persistence (H5) - check localStorage writes
- [ ] Test concurrent scans (H7) - start 2 scans simultaneously

### Evening Check (5 PM)
- [ ] Review full day's logs
- [ ] Check for browser crashes (H3)
- [ ] Verify platform detection (H8)
- [ ] Test edge cases (invalid URLs, missing platforms)

### Weekly Deep Dive (Fridays)
- [ ] Analyze log patterns for the week
- [ ] Identify recurring issues
- [ ] Review error rates by hypothesis
- [ ] Update monitoring based on findings

## Test Scenarios

### Scenario 1: Standard Scan
1. Enter a valid company name (e.g., "airbnb")
2. Start scan
3. Monitor logs for:
   - H1: Polling behavior
   - H3: Browser launch
   - H5: Data persistence
   - H8: Platform detection

### Scenario 2: Concurrent Scans
1. Open two browser tabs
2. Start scan in both tabs simultaneously
3. Monitor logs for:
   - H7: Concurrent scan handling
   - H1: Race conditions

### Scenario 3: Network Failure
1. Disconnect network mid-scan
2. Monitor logs for:
   - H4: Timeout handling
   - H6: Error handling

### Scenario 4: Browser Crash
1. Start scan
2. Monitor logs for:
   - H3: Browser launch failures
   - H6: Error recovery

### Scenario 5: Data Persistence
1. Complete a scan
2. Refresh page
3. Check dashboard loads data
4. Monitor logs for:
   - H5: localStorage writes/reads

## Log Analysis Commands

```bash
# Count errors by hypothesis
grep -o '"hypothesisId":"[^"]*"' .cursor/debug.log | sort | uniq -c

# Find browser launch failures
grep "browser-launch" .cursor/debug.log | grep -i "fail\|error"

# Find polling issues
grep "scan-poll" .cursor/debug.log | grep -i "error\|clear"

# Find data persistence issues
grep "localStorage" .cursor/debug.log | grep -i "error\|fail"

# Find concurrent scan issues
grep "api-start" .cursor/debug.log | sort | uniq -c
```

## Alert Thresholds

- **Critical:** Browser crashes > 5% of scans
- **Warning:** Network timeouts > 10% of scans
- **Warning:** Data persistence failures > 2% of scans
- **Info:** Memory leaks detected (any uncleared intervals)

## Response Procedures

### If H3 (Browser Crashes) Detected:
1. Check Playwright installation
2. Verify system resources
3. Review browser launch logs
4. Test fallback mechanisms

### If H4 (Network Timeouts) Detected:
1. Review timeout values
2. Check network connectivity
3. Verify backend health
4. Test with different URLs

### If H5 (Data Persistence) Detected:
1. Check localStorage quota
2. Verify data size
3. Test on different browsers
4. Review storage logic

### If H7 (Concurrent Scans) Detected:
1. Review scan storage logic
2. Check for race conditions
3. Test with multiple users
4. Verify scan isolation

## Log File Location
`/Users/akeemojuko/Documents/aibc_core-1/.cursor/debug.log`

## Instrumentation Status
✅ Frontend (AuditView.tsx) - Polling, errors, data persistence
✅ Backend Service (scanService.ts) - Browser launches, scan flow
✅ Backend Routes (scan.ts) - API endpoints, validation

## Next Steps
1. Run daily monitoring checklist
2. Review logs after each scan
3. Document any issues found
4. Update hypotheses based on findings
5. Fix confirmed bugs with evidence-based approach





