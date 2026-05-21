const fs = require('fs');
const path = 'android/twa-manifest.json';

const newVersionName = process.argv[2];
const newVersionCode = process.argv[3];

if (!newVersionName || !newVersionCode) {
    console.error('Usage: node update_version.js <versionName> <versionCode>');
    process.exit(1);
}

try {
    let content = fs.readFileSync(path, 'utf8');
    let json = JSON.parse(content);
    
    json.appVersion = newVersionName;
    json.appVersionCode = parseInt(newVersionCode);
    
    fs.writeFileSync(path, JSON.stringify(json, null, 2));
    console.log(`Successfully updated ${path} to version ${newVersionName} (code ${newVersionCode})`);
} catch (err) {
    console.error('Error updating file:', err);
    process.exit(1);
}
