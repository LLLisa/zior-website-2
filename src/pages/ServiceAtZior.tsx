import { EditableArticle } from "@/components/EditableArticle";
import { ServiceMaterials } from "@/components/ServiceMaterials";
import { UserMenu } from "@/components/layout/UserMenu";

export function ServiceAtZior() {
  return (
    <div className="space-y-6">
      <EditableArticle slug="service-at-zior" afterBody={<ServiceMaterials />} />
      <EditableArticle slug="service-at-zior-more" hideTitle />
      <div className="flex justify-center pt-2">
        <UserMenu />
      </div>
    </div>
  );
}
