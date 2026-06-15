import { getApartmentOrNotFound } from "@/lib/apartment";
import ApartmentNavbar from "@/components/ApartmentNavbar";
import SlugMain from "@/components/SlugMain";

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apartment = await getApartmentOrNotFound(slug);

  return (
    <div className="flex-1 flex flex-col">
      <ApartmentNavbar slug={slug} name={apartment.name} />
      <SlugMain slug={slug}>{children}</SlugMain>
    </div>
  );
}
