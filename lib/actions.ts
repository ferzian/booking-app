"use server";

import { ContactSchema, CourtSchema, ReserveSchema } from "@/lib/zod";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

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
export const deleteCourt = async (id: string, image: string) => {
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

// Update Court
export const updateCourt = async (
  image: string,
  courtId: string,
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
    await prisma.$transaction([
      prisma.court.update({
        where: { id: courtId },
        data: {
          name,
          description,
          capacity,
          price,
          image,
          CourtAmenities: {
            deleteMany: {},
          },
        },
      }),
      prisma.courtAmenities.createMany({
        data: amenities.map((item) => ({
          courtId,
          amenitiesId: item,
        })),
      }),
    ]);
  } catch (error) {
    console.log(error);
  }
  revalidatePath("/admin/court");
  redirect("/admin/court");
};

export const createReserve = async (
  courtId: string,
  price: number,
  date: Date,
  startTime: string,
  endTime: string,
  prevState: unknown,
  formData: FormData
) => {
  const session = await auth();
  if (!session || !session.user || !session.user.id)
    redirect(`/signin?redirect_url=court/${courtId}`);

  const rawData = {
    name: formData.get("name"),
    phone: formData.get("phone"),
  };

  const validatedFields = ReserveSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
      messageDate: "",
      messageTime: "",
    };
  }

  const { name, phone } = validatedFields.data;

  // Validate time format (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return { messageTime: "Invalid time format", messageDate: "", error: {} };
  }

  // Validate end time is after start time
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const startTotalMin = startHour * 60 + startMin;
  const endTotalMin = endHour * 60 + endMin;

  if (endTotalMin <= startTotalMin) {
    return {
      messageTime: "End time must be after start time",
      messageDate: "",
      error: {},
    };
  }

  // Optional: validasi tanggal
  const today = new Date();
  if (date < new Date(today.setHours(0, 0, 0, 0))) {
    return {
      messageDate: "You can’t book a past date",
      messageTime: "",
      error: {},
    };
  }

  // Check existing reservation
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      courtId: courtId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      Payment: {
        status: {
          not: "failure",
        },
      },
      OR: [
        { startTime: { gte: startTime, lt: endTime } },
        { endTime: { gt: startTime, lte: endTime } },
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gte: endTime } },
          ],
        },
      ],
    },
  });

  if (existingReservation) {
    return {
      messageTime: "This time slot is already booked",
      messageDate: "",
      error: {},
    };
  }

  // Calculate total
  const hoursBooked = (endTotalMin - startTotalMin) / 60;
  const total = Math.ceil(hoursBooked) * price;

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        data: { name, phone },
        where: { id: session.user.id },
      });
      return await tx.reservation.create({
        data: {
          date,
          startTime,
          endTime,
          price,
          courtId,
          userId: session.user.id as string,
          Payment: { create: { amount: total } },
        },
      });
    });

    redirect(`/checkout/${reservation.id}`);
  } catch (error) {
    console.log(error);
    return {
      messageTime: "Failed to create reservation",
      messageDate: "",
      error: {},
    };
  }
};
