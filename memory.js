const fs = require("fs");
const path = require("path");

// We use /tmp because Render allows writing files there more easily
const MEMORY_FILE = "/tmp/memory.json";

function loadMemory() {
  try {
    if (!fs.existsSync(MEMORY_FILE)) {
      // Create an empty file if it doesn't exist
      fs.writeFileSync(MEMORY_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch (err) {
    console.error("Memory load error:", err);
    return [];
  }
}

function saveMemory(memory) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
  } catch (err) {
    console.error("Memory save error:", err);
  }
}

function addMemory(role, content) {
  const memory = loadMemory();
  memory.push({ role, content });
  const trimmed = memory.slice(-20);
  saveMemory(trimmed);
}

function getMemory() {
  return loadMemory();
}

module.exports = { addMemory, getMemory };
