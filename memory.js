const fs = require("fs");
const path = require("path");

const MEMORY_FILE = path.join(__dirname, "memory.json");

// Load memory from file
function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(MEMORY_FILE, "utf8"));
  } catch {
    return [];
  }
}

// Save memory to file
function saveMemory(memory) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// Add new memory entry
function addMemory(role, content) {
  const memory = loadMemory();
  memory.push({ role, content });

  // Keep last 20 messages only (safe & fast)
  const trimmed = memory.slice(-20);
  saveMemory(trimmed);
}

// Get memory for AI
function getMemory() {
  return loadMemory();
}

module.exports = {
  addMemory,
  getMemory
};
