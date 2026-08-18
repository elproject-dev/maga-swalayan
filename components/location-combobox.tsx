"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useDebounce } from "use-debounce"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface LocationItem {
  id: string
  name: string
}

function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase())
}

interface LocationComboboxProps {
  value: string
  onChange: (value: string, name: string) => void
  placeholder?: string
  searchPlaceholder?: string
  items: LocationItem[]
  isLoading?: boolean
  disabled?: boolean
}

export function LocationCombobox({
  value,
  onChange,
  placeholder = "Pilih lokasi...",
  searchPlaceholder = "Cari...",
  items,
  isLoading = false,
  disabled = false,
}: LocationComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [debouncedSearch] = useDebounce(searchQuery, 300)

  // We do client-side filtering since the API returns all items for a parent
  const filteredItems = React.useMemo(() => {
    if (!debouncedSearch) return items
    return items.filter((item) => 
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  }, [items, debouncedSearch])

  const selectedItem = items.find((item) => item.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className="flex h-10 w-full items-center justify-start min-w-0 border border-transparent border-b-input bg-transparent px-0 py-1 text-base md:text-sm font-normal normal-case tracking-normal transition-[color,border-color] outline-none focus-visible:border-b-ring rounded-none hover:bg-transparent shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
          />
        }
      >
        <span className={cn("block truncate", !selectedItem && "text-muted-foreground")}>
          {selectedItem ? toTitleCase(selectedItem.name) : placeholder}
        </span>
        {/* Icons removed per user request */}
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
              </div>
            ) : filteredItems.length === 0 ? (
              <CommandEmpty>Lokasi tidak ditemukan.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => {
                      onChange(item.id, item.name)
                      setOpen(false)
                      setSearchQuery("")
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === item.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {toTitleCase(item.name)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
