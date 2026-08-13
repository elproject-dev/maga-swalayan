import sys

with open('app/login/page.tsx', 'r') as f:
    text = f.read()

# Add imports
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
text = text.replace('  const [isLogin, setIsLogin] = useState(true)', state_code)

# Add onSubmit to form
text = text.replace('<form className="space-y-4">', '<form className="space-y-4" onSubmit={handleSubmit}>')

# Update button to show loading
button_old = """          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full text-md font-semibold">
              {isLogin ? "Masuk" : "Daftar Sekarang"}
            </Button>"""
button_new = """          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full text-md font-semibold" disabled={isLoading} onClick={(e) => {
              // Ensure we trigger form submission
              const form = e.currentTarget.closest("form");
              if (form) form.requestSubmit();
            }}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Masuk" : "Daftar Sekarang"}
            </Button>"""

# Since the button is OUTSIDE the form element in my previous code!
# Let's fix that. Wait! My code has `<form>` inside `<CardContent>` and `<Button type="submit">` inside `<CardFooter>`!
# In standard HTML, a submit button outside a form doesn't submit unless it has `form="form-id"`.
# So we need to add an ID to the form, and `form="login-form"` to the button.
pass

