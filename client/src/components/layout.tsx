import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <button
          onClick={() => {
            document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-2.5 group"
          data-testid="link-home"
        >
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="Afwikkeltest logo">
            <circle cx="16" cy="16" r="14" stroke="hsl(var(--primary))" strokeWidth="2" />
            <path
              d="M16 6 C10 12, 10 20, 16 26 C22 20, 22 12, 16 6Z"
              fill="hsl(var(--primary))"
              opacity="0.15"
            />
            <path
              d="M16 10 C13 14, 13 18, 16 22 C19 18, 19 14, 16 10Z"
              fill="hsl(var(--primary))"
              opacity="0.4"
            />
            <circle cx="16" cy="16" r="2.5" fill="hsl(var(--primary))" />
          </svg>
          <span className="font-semibold text-base tracking-tight text-foreground">
            De Afwikkeltest
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Schakel naar ${theme === "dark" ? "licht" : "donker"} thema`}
          data-testid="button-theme-toggle"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-auto">
      <div className="max-w-3xl mx-auto px-5 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} De Afwikkeltest &mdash; gebaseerd op het boek <em>Afwikkelen</em></p>
        <p className="mt-1">Een initiatief van Volop in Balans</p>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
