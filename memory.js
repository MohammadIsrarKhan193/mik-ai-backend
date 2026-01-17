const fs = require("fs");
const path = require("path");

const memoryFile = path.join(__dirname, "memory.json");

// Load memory
function loadMemory() {
  if (!fs.existsSync(memoryFile)) {
    fs.writeFileSync(memoryFile, JSON.stringify({}), "utf8");
  }
  return JSON.parse(fs.readFileSync(memoryFile, "utf8"));
}

// Save memory
function saveMemory(memory) {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2), "utf8");
}

// Get memory for user
function getMemory(userId = "default") {
  const memory = loadMemory();
  return memory[userId] || [];
}

// Add memory
function addMemory(text, userId = "default") {
  const memory = loadMemory();
  if (!memory[userId]) memory[userId] = [];

  memory[userId].push(text);
  saveMemory(memory);
}

module.exports = { getMemory, addMemory };
