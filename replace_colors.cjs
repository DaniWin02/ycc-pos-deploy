
const fs = require('fs');
const path = require('path');

const filePath = path.join('C:', 'Users', 'jorma', 'Documents', 'CountryClubPOS-master', 'CountryClubPOS-master', 'YCC_POS_IMPLEMENTATION', '04_CORE_POS', 'src', 'App.tsx');

let content = fs.readFileSync(filePath, 'utf8');

// 1. Emerald replacements
content = content.replace(/bg-emerald-(600|700|800)/g, 'bg-primary');
content = content.replace(/text-emerald-(600|700)/g, 'text-primary');
content = content.replace(/bg-emerald-(50|100|200)/g, 'bg-accent');

// 2. Gray replacements
content = content.replace(/text-gray-(900|800)/g, 'text-foreground');
content = content.replace(/text-gray-(600|500|400)/g, 'text-muted-foreground');
content = content.replace(/border-gray-(100|200|300)/g, 'border-border');
content = content.replace(/bg-gray-(50|100)/g, 'bg-muted');

// 3. Special case: text-white on bg-primary
content = content.replace(/className="[^"]*bg-primary[^"]*"/g, (match) => {
    if (match.includes('text-white')) {
        return match.replace('text-white', 'text-primary-foreground');
    }
    return match;
});
content = content.replace(/className={`[^`]*bg-primary[^`]*`}/g, (match) => {
    if (match.includes('text-white')) {
        return match.replace('text-white', 'text-primary-foreground');
    }
    return match;
});

// 4. bg-white -> bg-card for containers
const containerIndicators = ['rounded-', 'shadow-', 'border-', 'p-', 'h-14', 'h-16', 'flex-1', 'w-full', 'overflow-'];
content = content.replace(/className="[^"]*bg-white[^"]*"/g, (match) => {
    if (containerIndicators.some(indicator => match.includes(indicator))) {
        return match.replace('bg-white', 'bg-card');
    }
    return match;
});
content = content.replace(/className={`[^`]*bg-white[^`]*`}/g, (match) => {
    if (containerIndicators.some(indicator => match.includes(indicator))) {
        return match.replace('bg-white', 'bg-card');
    }
    return match;
});

// Specific fix for headers and divs that might not have been caught
content = content.split('<header className="bg-white').join('<header className="bg-card');
content = content.split('<div className="bg-white').join('<div className="bg-card');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replacements completed successfully.');
