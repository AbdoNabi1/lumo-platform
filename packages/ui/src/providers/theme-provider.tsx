"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/** App-wide theme provider. Adds `.dark` on <html> to flip the frozen dark tokens. */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
