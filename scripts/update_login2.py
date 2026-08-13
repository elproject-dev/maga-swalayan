import sys

with open('app/login/page.tsx', 'r') as f:
    text = f.read()

# Add imports
if 'import { useRouter }' not in text:
    text = text.replace('import { ShieldKeyhole, ShoppingCart } from "lucide-react"', 'import { ShieldKeyhole, ShoppingCart, Loader2 } from "lucide-react"\nimport { useRouter } from "next/navigation"')

# Add router and state
state_code = """  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      if (!isLogin) {
        router.push("/pelanggan")
      } else {
        router.push("/")
      }
    }, 1500)
  }"""
if 'const router = useRouter()' not in text:
    text = text.replace('  const [isLogin, setIsLogin] = useState(true)', state_code)

# Fix form structure
if '<form className="space-y-4" onSubmit={handleSubmit}>' not in text:
    text = text.replace('<form className="space-y-4">', '<form id="auth-form" className="space-y-4" onSubmit={handleSubmit}>')

# Update button to show loading and link to form
button_old = """          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full text-md font-semibold">
              {isLogin ? "Masuk" : "Daftar Sekarang"}
            </Button>"""
button_new = """          <CardFooter className="flex-col gap-4">
            <Button type="submit" form="auth-form" disabled={isLoading} className="w-full text-md font-semibold">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Masuk" : "Daftar Sekarang"}
            </Button>"""
if 'form="auth-form"' not in text:
    text = text.replace(button_old, button_new)

with open('app/login/page.tsx', 'w') as f:
    f.write(text)

print("Updated login form functionality")
