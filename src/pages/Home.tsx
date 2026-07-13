import { EditableArticle } from "@/components/EditableArticle";
import { JoinCard } from "@/components/JoinCard";

export function Home() {
  return (
    <EditableArticle
      slug="home"
      afterTitle={<JoinCard />}
      afterBody={
        <p className="pt-2 text-center text-2xl font-bold tracking-wide text-primary">
          KEEP COMING BACK!
        </p>
      }
    />
  );
}
