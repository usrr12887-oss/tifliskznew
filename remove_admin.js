const fs = require('fs');
let code = fs.readFileSync('src/App.js', 'utf8');

// remove AdminDashboard import
code = code.replace(/import AdminDashboard from "\.\/admin\/AdminDashboard";\r?\n?/g, '');
code = code.replace(/import AdminDashboard from '\.\/admin\/AdminDashboard';\r?\n?/g, '');

// Slice off everything after Admin Guard
const adminGuardIndex = code.indexOf('/* ================= ADMIN GUARD ================= */');
if (adminGuardIndex !== -1) {
  const newApp = `
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserApp />} />
      </Routes>
    </BrowserRouter>
  );
}
`;
  code = code.substring(0, adminGuardIndex) + newApp;
}

fs.writeFileSync('src/App.js', code);
console.log('Admin removed!');
