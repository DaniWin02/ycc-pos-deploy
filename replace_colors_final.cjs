
const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'jorma', 'Documents', 'CountryClubPOS-master', 'CountryClubPOS-master', 'YCC_POS_IMPLEMENTATION', '04_CORE_POS', 'src', 'App.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 1. More Emerald replacements
content = content.replace(/bg-emerald-500/g, 'bg-primary');
content = content.replace(/border-emerald-500/g, 'border-primary');
content = content.replace(/focus:ring-emerald-500/g, 'focus:ring-primary');
content = content.replace(/focus:border-emerald-500/g, 'focus:border-primary');
content = content.replace(/text-emerald-500/g, 'text-primary');
content = content.replace(/text-emerald-100/g, 'text-primary-foreground/80');
content = content.replace(/shadow-emerald-600\/20/g, 'shadow-primary/20');
content = content.replace(/ring-emerald-600/g, 'ring-primary');
content = content.replace(/border-emerald-300/g, 'border-accent');
content = content.replace(/hover:border-emerald-300/g, 'hover:border-accent');
content = content.replace(/hover:border-emerald-200/g, 'hover:border-accent');
content = content.replace(/shadow-emerald-100/g, 'shadow-accent/20');
content = content.replace(/bg-emerald-400/g, 'bg-primary');
content = content.replace(/hover:bg-emerald-700/g, 'hover:bg-primary/90');
content = content.replace(/hover:bg-emerald-200/g, 'hover:bg-accent/80');
content = content.replace(/from-emerald-500 to-emerald-600/g, 'from-primary/90 to-primary');

// Ensure text visibility on primary gradients
content = content.replace(/bg-gradient-to-r from-primary\/90 to-primary text-white/g, 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final replacements completed successfully.');
