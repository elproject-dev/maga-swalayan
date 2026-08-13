import sys

with open('components/nav-main.tsx', 'r') as f:
    text = f.read()

import_stmt = 'import { ModeToggle } from "@/components/mode-toggle"\n'
if import_stmt not in text:
    text = text.replace('import { CirclePlusIcon, MailIcon } from "lucide-react"\n', 'import { CirclePlusIcon, MailIcon } from "lucide-react"\n' + import_stmt)

old_buttons = """              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <MailIcon />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>"""

new_buttons = """              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <MailIcon />
                <span className="sr-only">Inbox</span>
              </Button>
              <div className="group-data-[collapsible=icon]:opacity-0">
                <ModeToggle />
              </div>
            </SidebarMenuItem>"""

text = text.replace(old_buttons, new_buttons)

with open('components/nav-main.tsx', 'w') as f:
    f.write(text)

print("Inserted ModeToggle")
