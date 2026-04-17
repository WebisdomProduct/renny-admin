const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pagesDir = path.join(root, 'src', 'pages');
const catchPattern = /catch\s*\(err\)\s*\{([\s\S]*?)\}/gm;

fs.readdirSync(pagesDir)
  .filter((file) => /\.(js|jsx|ts|tsx)$/i.test(file))
  .forEach((file) => {
    const filePath = path.join(pagesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(catchPattern, (match, body) => {
      if (/\berr\b/.test(body)) {
        return match;
      }
      return match.replace(/catch\s*\(err\)/, 'catch');
    });

    if (updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log(`converted catch in ${file}`);
    }
  });
