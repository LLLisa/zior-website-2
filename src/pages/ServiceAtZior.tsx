import { Link } from "react-router-dom";
import { FileText, Presentation } from "lucide-react";
import { EditableArticle } from "@/components/EditableArticle";
import { Card } from "@/components/ui/card";

const materials = [
  { path: "/daily-script", label: "Daily Script", icon: FileText },
  { path: "/slide-deck-daily", label: "Slide Deck (daily meeting)", icon: Presentation },
  { path: "/anniversary-script", label: "Anniversary Script", icon: FileText },
  {
    path: "/slide-deck-anniversary",
    label: "Slide Deck (anniversary meeting)",
    icon: Presentation,
  },
];

function ServiceMaterials() {
  return (
    <section className="pt-2">
      <h2 className="mb-3 text-xl font-semibold text-primary">
        Service materials
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {materials.map(({ path, label, icon: Icon }) => (
          <Card key={path} className="transition-colors hover:bg-secondary/50">
            <Link to={path} className="flex items-center gap-3 p-4 font-medium">
              <Icon className="size-5 text-primary" />
              {label}
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ServiceAtZior() {
  return (
    <EditableArticle slug="service-at-zior" afterBody={<ServiceMaterials />} />
  );
}
