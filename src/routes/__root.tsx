import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GGCart AI — Premium AI Workspace" },
      { name: "description", content: "Codeit by ggcart: ChatGPT + Replit + Midjourney in one premium workspace. Chat, image, deep search, and full-stack app builder." },
      { name: "author", content: "GGCart" },
      { property: "og:title", content: "GGCart AI — Premium AI Workspace" },
      { property: "og:description", content: "Codeit by ggcart: ChatGPT + Replit + Midjourney in one premium workspace. Chat, image, deep search, and full-stack app builder." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "GGCart AI — Premium AI Workspace" },
      { name: "twitter:description", content: "Codeit by ggcart: ChatGPT + Replit + Midjourney in one premium workspace. Chat, image, deep search, and full-stack app builder." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e3d1820d-8a74-47f7-aa88-aec91b992fbe/id-preview-ab79558b--e24edbb1-f9fa-4c3a-9c0b-fe9ef228c370.lovable.app-1776788471987.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/e3d1820d-8a74-47f7-aa88-aec91b992fbe/id-preview-ab79558b--e24edbb1-f9fa-4c3a-9c0b-fe9ef228c370.lovable.app-1776788471987.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster theme="dark" />
    </AuthProvider>
  );
}
