const fs = require('fs');
let code = fs.readFileSync('src/App.js', 'utf8');

code = code.replace(/    try \{\n      const res = await ApiService\.addTransaction\(\{\n        username: user\.username,\n        amount: parseFloat\(depositAmount\),\n        type: "deposit",\n        receipt: depositFile,\n      \}\);\n      if \(res\?\.transaction\?\.id\) newTx\.id = res\.transaction\.id;\n    \} catch \(_\) \{\}\n/g, '');

fs.writeFileSync('src/App.js', code);
