import { redirect } from "next/navigation";

function slugToCategoryName(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function CategoryRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const categoryName = slugToCategoryName(slug);

  // ✅ redirect to shop with category selected
  redirect(`/shop?category=${encodeURIComponent(categoryName)}&page=1`);
}
