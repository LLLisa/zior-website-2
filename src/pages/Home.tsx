import { EditableArticle } from "@/components/EditableArticle";
import { JoinCard } from "@/components/JoinCard";

export function Home() {
  return <EditableArticle slug="home" afterTitle={<JoinCard />} />;
}
