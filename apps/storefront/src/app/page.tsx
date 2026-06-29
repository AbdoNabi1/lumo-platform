import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ThemeToggle,
} from "@platform/ui";

/**
 * Foundation smoke-screen (Sprint 0.1) — NOT a business page.
 * Verifies the design tokens, dark mode, and the shared UI package are wired.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <span className="text-sm font-medium">Platform</span>
        <ThemeToggle />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Foundation ready</CardTitle>
          <CardDescription>
            Monorepo bootstrap — Phase 2, Sprint 0.1. No business features yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Design tokens, dark mode, and the shared UI package are wired. Toggle the theme to
            verify the frozen light/dark palette.
          </p>
          <div className="flex gap-2">
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
