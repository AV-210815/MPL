import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getApartmentBySlug(slug: string) {
  return prisma.apartment.findUnique({ where: { slug } });
}

export async function getApartmentOrNotFound(slug: string) {
  const apt = await getApartmentBySlug(slug);
  if (!apt) notFound();
  return apt;
}
