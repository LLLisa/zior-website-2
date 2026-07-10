import { EditableArticle } from "@/components/EditableArticle";

/** A plain content page whose title + body are database-managed. */
export function CmsPage({ slug }: { slug: string }) {
  return <EditableArticle slug={slug} />;
}
