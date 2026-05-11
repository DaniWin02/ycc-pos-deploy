
import re

file_path = r'C:\Users\jorma\Documents\CountryClubPOS-master\CountryClubPOS-master\YCC_POS_IMPLEMENTATION\04_CORE_POS\src\App.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Emerald replacements
content = re.sub(r'bg-emerald-(600|700|800)', 'bg-primary', content)
content = re.sub(r'text-emerald-(600|700)', 'text-primary', content)
content = re.sub(r'bg-emerald-(50|100|200)', 'bg-accent', content)

# 2. Gray replacements
content = re.sub(r'text-gray-(900|800)', 'text-foreground', content)
content = re.sub(r'text-gray-(600|500|400)', 'text-muted-foreground', content)
content = re.sub(r'border-gray-(100|200|300)', 'border-border', content)
content = re.sub(r'bg-gray-(50|100)', 'bg-muted', content)

# 3. Special case: text-white on bg-primary
# We look for bg-primary followed by text-white or vice versa in the same className string
def fix_primary_text(match):
    s = match.group(0)
    if 'bg-primary' in s and 'text-white' in s:
        return s.replace('text-white', 'text-primary-foreground')
    return s

content = re.sub(r'className="[^"]*bg-primary[^"]*"', fix_primary_text, content)
content = re.sub(r"className={`[^`]*bg-primary[^`]*`}", fix_primary_text, content)

# 4. bg-white -> bg-card for containers
# Containers usually have rounded-*, shadow-*, border-*, or are headers/sidebars
def fix_bg_white(match):
    s = match.group(0)
    # Check if it's a container-like element or has container classes
    container_indicators = ['rounded-', 'shadow-', 'border-', 'p-', 'h-14', 'h-16', 'flex-1', 'w-full', 'overflow-']
    if any(indicator in s for indicator in container_indicators):
        return s.replace('bg-white', 'bg-card')
    return s

content = re.sub(r'className="[^"]*bg-white[^"]*"', fix_bg_white, content)
content = re.sub(r"className={`[^`]*bg-white[^`]*`}", fix_bg_white, content)

# Specific fix for headers and sidebars that might not have caught by the regex
content = content.replace('<header className="bg-white', '<header className="bg-card')
content = content.replace('<div className="bg-white', '<div className="bg-card')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replacements completed successfully.")
