"use server";

import { ContactSchema, CourtSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export const saveCourt = async (
  image: string,
  prevState: unknown,
  formData: FormData
) => {
  if (!image) return { message: "Image is required." };

  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    capacity: formData.get("capacity"),
    price: formData.get("price"),
    amenities: formData.getAll("amenities"),
  };

  const validatedFields = CourtSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }
  const { name, description, capacity, price, amenities } =
    validatedFields.data;

  try {
    await prisma.court.create({
      data: {
        name,
        description,
        image,
        price,
        capacity,
        CourtAmenities: {
          createMany: {
            data: amenities.map((item) => ({
              amenitiesId: item,
            })),
          },
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
  redirect("/admin/court");
};

export const ContactMessage = async (
  prevState: unknown,
  formData: FormData
) => {
  const validatedFields = ContactSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, subject, message } = validatedFields.data;

  try {
    await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });
    return { message: "Thanks for contact us." };
  } catch (error) {
    console.log(error);
  }
};

// Delete Court
export const deleteCourt = async (id: string, imagae: string) => {
  try {
    await del(image);
    await prisma.court.delete({
      where: { id },
    });
  } catch (error) {
    console.log(error);
  }

  revalidatePath("/admin/court");
};
