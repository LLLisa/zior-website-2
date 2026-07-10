import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

// Render user-authored HTML, sanitized at display time.
export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={cn("prose-content", className)}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
    />
  );
}
