const fs = require('fs');
let code = fs.readFileSync('src/App.js', 'utf8');

// remove // Telegram Command & Callback Polling
let p1 = code.indexOf('  // Telegram Command & Callback Polling');
let p2 = code.indexOf('  // Track Pending Deposit Status');
if (p1 !== -1 && p2 !== -1) {
  code = code.substring(0, p1) + code.substring(p2);
}

// rewrite // Track Pending Deposit Status
p1 = code.indexOf('  // Track Pending Deposit Status');
p2 = code.indexOf('  // Sync Admin Settings');
if (p1 !== -1 && p2 !== -1) {
  let pendingBlock = `  // Track Pending Deposit Status locally
  useEffect(() => {
    if (!pendingDeposit || !user) return;
    if (pendingDeposit.status !== "pending") return;

    const checkStatus = () => {
      const txs = MockDataService.getTransactions();
      const current = txs.find((t) => t.id === pendingDeposit.id);
      if (current && current.status !== "pending") {
        const allUsers = MockDataService.getUsers();
        const fresh = allUsers.find((u) => u.username === user.username);
        if (fresh) setUser({ ...fresh });
        setPendingDeposit(current);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [pendingDeposit, user]);

`;
  code = code.substring(0, p1) + pendingBlock + code.substring(p2);
}

// remove // Poll Telegram Pinned Message for Persistent Card Updates
p1 = code.indexOf('  // Poll Telegram Pinned Message for Persistent Card Updates');
p2 = code.indexOf('  // Persistence');
if (p1 !== -1 && p2 !== -1) {
  code = code.substring(0, p1) + code.substring(p2);
}

// remove ApiService import
code = code.replace(/import { ApiService } from "\.\/services\/ApiService";\r?\n?/g, '');
code = code.replace(/import { ApiService } from '\.\/services\/ApiService';\r?\n?/g, '');

// Clean ApiService from handleDepositSubmit
code = code.replace(/try {\s*const res = await ApiService\.addTransaction\([^}]*\);\s*if \(res\?\.transaction\?\.id\) newTx\.id = res\.transaction\.id;\s*} catch \(_\) {}/g, '');

// Clean ApiService from handleWithdrawSubmit
code = code.replace(/try {\s*await ApiService\.addTransaction\([^}]*\);\s*} catch \(_\) {}/g, '');

// Clean ApiService from handleAuth
code = code.replace(/let users = \[\];\s*try {\s*users = await ApiService\.getUsers\(\);\s*} catch {\s*users = MockDataService\.getUsers\(\);\s*}\s*if \(!Array\.isArray\(users\)\) users = \[\];/g, 'const users = MockDataService.getUsers();');

// Clean registerUser in handleAuth
code = code.replace(/try {\s*await ApiService\.registerUser\([^}]*\);\s*} catch \(err\) {\s*console\.error\(err\);\s*return alert\("Xəta baş verdi"\);\s*}/g, '');

// Clean handleQuickEnter
code = code.replace(/try {\s*const res = await ApiService\.registerUser\([^}]*\);\s*const newUser = res\.user[^}]*setUser\(newUser\);\s*setAuthOpen\(false\);\s*return;\s*} catch \(_\) {}/g, '');

// Clean update user balance
code = code.replace(/try {\s*await ApiService\.updateUserBalance\([^\)]*\);\s*} catch \(_\) {}/g, '');

// Clean wheel result
code = code.replace(/try {\s*await ApiService\.setWheelResult\([^\)]*\);\s*} catch \(_\) {}/g, '');

fs.writeFileSync('src/App.js', code);
console.log('clean complete');
