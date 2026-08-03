import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { GovernmentModulePage } from "@/components/government/GovernmentModulePage";
import { isGovernmentModule } from "@/components/government/government-nav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { normalizeOrganizationType } from "@/lib/organization";

export const Route = createFileRoute("/business/dashboard/government/$module")({
  component: GovernmentModuleRoute,
});

function GovernmentModuleRoute() {
  const { module } = Route.useParams();
  const { session } = useAuth();

  if (normalizeOrganizationType(session?.organizationType) !== "government") {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="max-w-md rounded-2xl border border-border/80 bg-surface/80 p-8 text-center shadow-sm">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-[var(--brand)]">
            <Building2 className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-bold">Төрийн байгууллагын модуль</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Энэ модуль зөвхөн government organizationType-тэй байгууллагад харагдана.
          </p>
          <Button asChild className="mt-5">
            <Link to="/business/dashboard">Хяналтын самбарт буцах</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!isGovernmentModule(module)) {
    return (
      <div className="grid min-h-[55vh] place-items-center text-center">
        <div>
          <h1 className="text-xl font-bold">Модуль олдсонгүй</h1>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/business/dashboard">Буцах</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <GovernmentModulePage module={module} />;
}
