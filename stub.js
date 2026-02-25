const fs = require('fs');

let content = fs.readFileSync('src/App.js', 'utf8');

// remove imports
content = content.replace(/import\s*\{\s*ApiService\s*\}\s*from\s*['"].\/services\/ApiService['"];\s*\n?/g, '');

// remove try catch around ApiService operations globally (a bit dangerous if not specific, let's just make the ApiService method return a dummy promise)
// Better: simply prepend `const ApiService = { getTransactions: async () => ([]), getUsers: async () => ([]), addTransaction: async () => ({}), updateTransaction: async () => ({}), updateUserBalance: async () => ({}), assignCodeToUser: async () => ({}), setWheelResult: async () => ({}), registerUser: async () => ({}) };` right after the last import

const mockApiStr = `
const ApiService = {
  getTransactions: async () => ([]),
  getUsers: async () => ([]),
  addTransaction: async () => ({}),
  updateTransaction: async () => ({}),
  updateUserBalance: async () => ({}),
  assignCodeToUser: async () => ({}),
  setWheelResult: async () => ({}),
  registerUser: async () => ({})
};
`;

content = content.replace(/import\s*{\s*TelegramService\s*}\s*from\s*"\.\/services\/TelegramService";/, 'import { TelegramService } from "./services/TelegramService";' + mockApiStr);

fs.writeFileSync('src/App.js', content);
