
import 'dotenv/config';
console.log("1. dotenv loaded");

try {
    console.log("2. Attempting to import express...");
    const express = await import('express');
    console.log("express imported");
} catch (e) {
    console.error("express import failed:", e);
}

try {
    console.log("3. Attempting to import handleIncomingChannelMessage...");
    const { handleIncomingChannelMessage } = await import('./src/aibc/connectors/multi-channel-bridge.js');
    console.log("multi-channel-bridge imported");
} catch (e) {
    console.error("multi-channel-bridge import failed:", e);
}

console.log("Diagnostic complete.");
