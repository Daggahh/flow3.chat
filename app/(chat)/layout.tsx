import { cookies } from "next/headers";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "../(auth)/auth";
import Script from "next/script";
import { OnboardingHandler } from "@/components/OnboardingHandler";
import { ApiKeyProvider } from "@/hooks/use-api-keys";

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get("sidebar:state")?.value !== "true";

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <ApiKeyProvider>
          <AppSidebar user={session?.user} />
          <OnboardingHandler>
            <SidebarInset>{children}</SidebarInset>
          </OnboardingHandler>
        </ApiKeyProvider>
      </SidebarProvider>
    </>
  );
}
