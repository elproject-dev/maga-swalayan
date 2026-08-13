import sys

with open('app/layout.tsx', 'r') as f:
    text = f.read()

# 1. Add suppressHydrationWarning to html
text = text.replace('outfit.variable)}\n    >', 'outfit.variable)}\n      suppressHydrationWarning\n    >')

# 2. Add ThemeProvider import
if 'ThemeProvider' not in text:
    text = text.replace('import { AppSidebar } from "@/components/app-sidebar"', 'import { ThemeProvider } from "@/components/theme-provider"\nimport { AppSidebar } from "@/components/app-sidebar"')

# 3. Wrap body with ThemeProvider
old_body = """      <body className="min-h-full flex flex-col">
        <SidebarProvider"""
new_body = """      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider"""

text = text.replace(old_body, new_body)

old_body_end = """        </SidebarProvider>
      </body>"""
new_body_end = """        </SidebarProvider>
        </ThemeProvider>
      </body>"""

text = text.replace(old_body_end, new_body_end)

with open('app/layout.tsx', 'w') as f:
    f.write(text)

print("Updated app/layout.tsx")
