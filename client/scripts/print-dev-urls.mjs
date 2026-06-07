#!/usr/bin/env node
// Dev URL banner. Run via `predev`. ⌘-click in the integrated terminal to open.

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const PURPLE = '\x1b[35m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

const PORT = process.env.PORT || 3900;
const base = `http://localhost:${PORT}`;

const row = (label, url) => `  ${CYAN}${url.padEnd(44)}${RESET} ${DIM}${label}${RESET}`;

console.log('');
console.log(`${PURPLE}${BOLD}━━━ Drew-It — dev URLs ━━━${RESET}`);
console.log('');
console.log(`  ${BOLD}Public${RESET}`);
console.log(row('Home — community gallery + search', `${base}/`));
console.log(row('Create — generate an image', `${base}/create-post`));
console.log('');
console.log(`  ${BOLD}Backend${RESET}`);
console.log(row('Express server (Stability AI + Cloudinary + MongoDB)', 'http://localhost:8081'));
console.log('');
console.log(`${DIM}  ⌘-click any link to open. Starting Vite…${RESET}`);
console.log('');
