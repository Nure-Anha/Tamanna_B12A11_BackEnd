const fs = require('fs');
const key = fs.readFileSync('./lifedrop-18df94e8ad.json', 'utf8')
const base64 = Buffer.from(key).toString('base64')
console.log(base64)