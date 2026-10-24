"use client";

import { OlarProvider, useOlarStore } from "@/hooks/useOlarStore";
import { Header } from "@/components/Header";
import { StudioView } from "@/components/StudioView";
import { BladesDock, MobileNav } from "@/components/BladesDock";
import { ToastStack } from "@/components/Toast";
import { MobileCompanion } from "@/components/MobileCompanion";
import { MayaWelcomeModal } from "@/components/MayaWelcomeModal";
import { NetworksHubView } from "@/components/views/NetworksHubView";
import { CreativeStudioView } from "@/components/views/CreativeStudioView";
import { BrandGuardianView } from "@/components/views/BrandGuardianView";
import { CalendarQueueView } from "@/components/views/CalendarQueueView";
import { BrandDnaView } from "@/components/views/BrandDnaView";

function AppShell() {
  const { activeBlade, locale } = useOlarStore();
  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <div dir={dir} lang={locale} className="min-h-screen bg-porcelain text-charcoal">
      <Header />
      <main className="pb-24 md:pb-0">
        {activeBlade === "studio" && (
          <>
            <div className="md:hidden">
              <MobileCompanion />
            </div>
            <div className="hidden md:block">
              <StudioView />
            </div>
          </>
        )}
        {activeBlade === "networks" && <NetworksHubView />}
        {activeBlade === "creative" && <CreativeStudioView />}
        {activeBlade === "guardian" && <BrandGuardianView />}
        {activeBlade === "calendar" && <CalendarQueueView />}
        {activeBlade === "dna" && <BrandDnaView />}
      </main>
      {activeBlade === "studio" && (
        <div className="hidden md:block">
          <BladesDock />
        </div>
      )}
      <MobileNav />
      <ToastStack />
      <MayaWelcomeModal />
    </div>
  );
}

export function OlarApp() {
  return (
    <OlarProvider>
      <AppShell />
    </OlarProvider>
  );
}
