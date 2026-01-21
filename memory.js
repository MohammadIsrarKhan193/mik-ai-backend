import fs from "fs";

const FILE = "./memory.json";

export function getMemory() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
  }
  return JSON.parse(fs.readFileSync(FILE));
}

export function saveMemory(memory) {
  fs.writeFileSync(FILE, JSON.stringify(memory.slice(-20), null, 2));
}
