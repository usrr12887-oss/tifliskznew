const fs = require('fs');
let code = fs.readFileSync('src/App.js', 'utf8');

// replace that try catch
code = code.replace(/try \{\s*const res = await ApiService\.registerUser.*?\s*setUser\(newUser\);\s*setAuthOpen\(false\);\s*return;\s*\} catch \(_\) \{\}/gs, '');

fs.writeFileSync('src/App.js', code);
console.log('Done cleaning quick enter.');
