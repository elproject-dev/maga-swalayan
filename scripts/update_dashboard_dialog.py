import sys

with open('app/page.tsx', 'r') as f:
    text = f.read()

# Add import
import_stmt = 'import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"\n'
if import_stmt not in text:
    text = text.replace('import { Loader2 } from "lucide-react"\n', 'import { Loader2 } from "lucide-react"\n' + import_stmt)

# Update PromoGallery map
promo_old = """      {images.map((item) => (
        <Card key={item.id} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""
promo_new = """      {images.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""

promo_old_end = """              </p>
            </div>
          </div>
        </Card>
      ))}"""
promo_new_end = """              </p>
            </div>
          </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
            <img src={item.src} alt={item.title} className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />
          </DialogContent>
        </Dialog>
      ))}"""

text = text.replace(promo_old, promo_new)
text = text.replace(promo_old_end, promo_new_end)

# Update PilihanHariIniGallery map
pilihan_old = """      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""
pilihan_new = """      {items.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="overflow-hidden border-none shadow-sm rounded-xl p-0 group cursor-pointer relative aspect-[4/5]">"""

pilihan_old_end = """              </p>
            </div>
          </div>
        </Card>
      ))}"""
pilihan_new_end = """              </p>
            </div>
          </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-lg p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:right-2 [&>button]:top-2 [&>button]:hover:bg-black/70">
            <img src={item.src} alt={item.title} className="w-full h-auto max-h-[85vh] rounded-xl object-contain shadow-2xl" />
          </DialogContent>
        </Dialog>
      ))}"""

text = text.replace(pilihan_old, pilihan_new)
text = text.replace(pilihan_old_end, pilihan_new_end)

with open('app/page.tsx', 'w') as f:
    f.write(text)

print("Updated dashboard with dialogs")
