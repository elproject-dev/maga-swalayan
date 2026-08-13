import sys

with open('components/table-pagination.tsx', 'r') as f:
    text = f.read()

# I already removed 'if (totalPages <= 1) return null;' with sed.
# Now I just need to make sure totalPages is at least 1 inside the component.

text = text.replace('  return (', '  const safeTotalPages = Math.max(1, totalPages);\n\n  return (')
text = text.replace('length: totalPages', 'length: safeTotalPages')
text = text.replace('=== totalPages', '=== safeTotalPages')
text = text.replace('< totalPages', '< safeTotalPages')
text = text.replace('>= totalPages', '>= safeTotalPages')

with open('components/table-pagination.tsx', 'w') as f:
    f.write(text)

