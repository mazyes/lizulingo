const fs = require('fs');
const path = require('path');

function checkSecrets() {
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    console.error('❌ dist/ directory does not exist. Run "npm run build" first.');
    process.exit(1);
  }

  // Load secret prefix / key if present in .env.local
  let secretKey = '';
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const l of lines) {
      if (l.startsWith('APPWRITE_API_KEY=')) {
        secretKey = l.replace('APPWRITE_API_KEY=', '').trim();
      }
    }
  }

  const suspiciousPatterns = ['standard_', 'APPWRITE_API_KEY'];
  if (secretKey && secretKey.length > 10) {
    suspiciousPatterns.push(secretKey);
  }

  let found = false;

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(js|html|css|json)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of suspiciousPatterns) {
          if (content.includes(pattern)) {
            console.error(`🚨 ALERT: Secret pattern "${pattern.slice(0, 8)}..." detected in built file: ${entry.name}`);
            found = true;
          }
        }
      }
    }
  }

  scanDir(distDir);

  if (found) {
    console.error('❌ Secrets check failed: secrets found in client bundle!');
    process.exit(1);
  } else {
    console.log('✅ Secrets check passed: 0 server secrets or API keys leaked in dist/');
  }
}

checkSecrets();
