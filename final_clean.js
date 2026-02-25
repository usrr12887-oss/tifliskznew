const fs = require('fs');
let code = fs.readFileSync('src/App.js', 'utf8');

const lines = code.split(/\\r?\\n/);
const out = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ApiService')) {
    if (lines[i-1].includes('try {')) {
      out.pop(); // remove try
    }
    // skip until catch
    while (!lines[i].includes('catch')) {
      i++;
    }
    continue;
  }
  out.push(lines[i]);
}

fs.writeFileSync('src/App.js', out.join('\\n'));
