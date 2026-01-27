import fs from "fs";

const FILE = "./memory.json";

// Initialize file if empty
if (!fs.existsSync(FILE) || fs.readFileSync(FILE).length === 0) {
    fs.writeFileSync(FILE, JSON.stringify({}));
}

export function getMemory(userId) {
    const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    return data[userId] || [];
}

export function addMemory(userId, role, content) {
    const data = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    if (!data[userId]) data[userId] = [];
    
    data[userId].push({ role, content });

    // Keep only last 15 messages so it stays fast
    if (data[userId].length > 15) {
        data[userId] = data[userId].slice(-15);
    }

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}
