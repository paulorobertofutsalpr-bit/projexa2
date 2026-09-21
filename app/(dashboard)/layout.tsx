import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { computeEffectiveStatus } from "@/lib/subscription";
import Sidebar from "@/components/Sidebar";
import GlobalSearch from "@/components/GlobalSearch";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import SubscriptionBlockedScreen from "@/components/SubscriptionBlockedScreen";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const effectiveStatus = computeEffectiveStatus({
    subscriptionStatus: user.companySubscriptionStatus,
    subscriptionOverdueSince: user.companySubscriptionOverdueSince,
  });

  if (effectiveStatus === "blocked") {
    return <SubscriptionBlockedScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar userName={user.name} companyName={user.companyName} logoData={user.companyLogoData} />
      <div className="flex-1 min-w-0 flex flex-col pt-14 md:pt-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-4 sm:px-6 shrink-0">
          <GlobalSearch />
        </header>
        {effectiveStatus === "overdue" && <SubscriptionBanner overdueSince={user.companySubscriptionOverdueSince} />}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
