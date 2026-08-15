import os
import re

file_path = "/home/elproject/Desktop/elproject/maga-swalayan/app/(dashboard)/settings/page.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Remove import
content = re.sub(r'import\s+\{\s*Skeleton\s*\}\s+from\s+["\']@/components/ui/skeleton["\']\s*\n', '', content)

# 1. isMounted block
content = re.sub(
    r'if\s*\(!isMounted\)\s*\{\s*return\s*\(\s*<div[^>]*>[\s\S]*?</div>\s*\)\s*\}',
    'if (!isMounted) {\n    return null\n  }',
    content
)

# 2. Table bodies
content = re.sub(
    r'\{(isLoading[A-Za-z]*)\s*\?\s*\(\s*Array\.from\([^\)]+\)\.map\([^)]+\)\s*=>\s*\(\s*<TableRow[\s\S]*?</TableRow>\s*\)\s*\)\s*\)\s*:\s*',
    r'{\1 ? null : ',
    content
)

# 3. Mobile cards
# For Promo, Pilihan, Kategori, Tipe
content = re.sub(
    r'\{(isLoading[A-Za-z]*)\s*\?\s*\(\s*Array\.from\([^\)]+\)\.map\([^)]+\)\s*=>\s*\(\s*<div[^>]*key=\{i\}[^>]*>[\s\S]*?</Skeleton>[\s\S]*?</div>\s*</div>\s*\)\s*\)\s*\)\s*:\s*(filtered[A-Za-z]+)\.length\s*===\s*0\s*\?',
    r'{\1 ? null : \2.length === 0 ?',
    content
)

with open(file_path, "w") as f:
    f.write(content)
