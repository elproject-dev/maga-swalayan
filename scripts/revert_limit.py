import sys

files = ['app/pelanggan/page.tsx', 'app/settings/page.tsx']

for file_path in files:
    with open(file_path, 'r') as f:
        text = f.read()

    text = text.replace(' * 5,', ' * 20,')
    text = text.replace(' * 5)', ' * 20)')
    text = text.replace('/ 5)}', '/ 20)}')

    with open(file_path, 'w') as f:
        f.write(text)

print("Reverted limit to 20")
