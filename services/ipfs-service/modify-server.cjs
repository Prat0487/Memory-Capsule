// Simple script to modify server.js to use PORT env variable
const fs = require('fs');
const path = require('path');

// Read server.js
const serverPath = path.join(__dirname, 'src', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Add PORT env variable if not exists
if (!content.includes('process.env.PORT')) {
  console.log('Adding PORT environment variable');
  
  // Add PORT variable
  let lines = content.split('\n');
  
  // Find express init line
  const expressLineIndex = lines.findIndex(line => line.includes('express()') || line.includes('express('));
  if (expressLineIndex !== -1) {
    lines.splice(expressLineIndex + 1, 0, 'const PORT = process.env.PORT || 3002;');
  }
  
  // Find app.listen line
  const listenLineIndex = lines.findIndex(line => line.includes('app.listen('));
  if (listenLineIndex !== -1) {
    lines[listenLineIndex] = lines[listenLineIndex].replace(/app\.listen\(\d+/, 'app.listen(PORT');
  }
  
  // Write modified content
  fs.writeFileSync(serverPath, lines.join('\n'));
  console.log('Server.js modified to use PORT environment variable');
} else {
  console.log('Server.js already uses PORT environment variable');
}
