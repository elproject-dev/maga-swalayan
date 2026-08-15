import os
import re

file_path = "/home/elproject/Desktop/elproject/maga-swalayan/app/(dashboard)/settings/page.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Replace mobile card skeletons
content = re.sub(
    r'\{\s*(isLoading[A-Za-z]*)\s*\?\s*\(\s*Array\.from\(\{.*?\}\)\.map\(\([^)]+\)\s*=>\s*\(\s*<div[^>]*>[\s\S]*?</Skeleton>[\s\S]*?</div>\s*\)\s*\)\s*\)\s*:\s*(filtered[A-Za-z]+)\.length\s*===\s*0\s*\?',
    r'{\1 ? null : \2.length === 0 ?',
    content
)

# Replace remaining table skeletons
content = re.sub(
    r'\{\s*(isLoading[A-Za-z]*)\s*\?\s*\(\s*Array\.from\(\{.*?\}\)\.map\(\([^)]+\)\s*=>\s*\(\s*<TableRow[\s\S]*?</TableRow>\s*\)\s*\)\s*\)\s*:\s*\(\s*(filtered[A-Za-z]+)',
    r'{\1 ? null : ( \2',
    content
)

with open(file_path, "w") as f:
    f.write(content)
