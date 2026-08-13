import sys

with open('app/layout.tsx', 'r') as f:
    text = f.read()

if 'Toaster' not in text:
    text = text.replace('import { ThemeProvider } from "@/components/theme-provider"', 'import { ThemeProvider } from "@/components/theme-provider"\nimport { Toaster } from "@/components/ui/toast"')
    text = text.replace('</SidebarProvider>', '</SidebarProvider>\n          <Toaster />')

with open('app/layout.tsx', 'w') as f:
    f.write(text)

print("Added Toaster")
