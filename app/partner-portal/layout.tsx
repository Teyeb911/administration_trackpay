import { PartnerPortalShell } from "@/components/partner-portal/portal-shell"

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  return <PartnerPortalShell>{children}</PartnerPortalShell>
}

