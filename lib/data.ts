import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const getAmenities = async () => {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized Access");
  }
  try {
    const result = await prisma.amenities.findMany();
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getCourts = async () => {
  try {
    const result = await prisma.court.findMany({
      orderBy: { createdAt: "desc" },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getCourtById = async (courtId: string) => {
  try {
    const result = await prisma.court.findUnique({
      where: { id: courtId },
      include: { CourtAmenities: { select: { amenitiesId: true } } },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getCourtDetailById = async (courtId: string) => {
  try {
    const result = await prisma.court.findUnique({
      where: { id: courtId },
      include: {
        CourtAmenities: {
          include: {
            Amenities: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getReservationById = async (id: string) => {
  try {
    const result = await prisma.reservation.findUnique({
      where: { id },
      include: {
        Court: {
          select: {
            name: true,
            image: true,
            price: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        Payment: true,
      },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getDisabledCourtById = async (courtId: string) => {
  try {
    const result = await prisma.reservation.findMany({
      select: {
        date: true,
      },
      where: {
        courtId: courtId,
        Payment: { status: { not: "failure" } },
      },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getReservationByUserId = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized Access");
  }
  try {
    const result = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      include: {
        Court: {
          select: {
            name: true,
            image: true,
            price: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        Payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getRevenueAndReserve = async () => {
  try {
    // Get all valid reservations
    const reservations = await prisma.reservation.findMany({
      include: {
        Payment: true,
      },
      where: {
        Payment: { status: { not: "failure" } },
      },
    });

    // Calculate total revenue from Payment.amount and count reservations
    const totalRevenue = reservations.reduce((sum, res) => {
      return sum + (res.Payment?.amount || 0);
    }, 0);

    return {
      revenue: totalRevenue,
      reserve: reservations.length,
    };
  } catch (error) {
    console.log(error);
  }
};

export const getTotalCustomers = async () => {
  try {
    const result = await prisma.reservation.findMany({
      distinct: ["userId"],
      where: {
        Payment: { status: { not: "failure" } },
      },
      select: { userId: true },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const getReservations = async () => {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    !session.user.id ||
    session.user.role !== "admin"
  ) {
    throw new Error("Unauthorized Access");
  }
  try {
    const result = await prisma.reservation.findMany({
      include: {
        Court: {
          select: {
            name: true,
            image: true,
            price: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        Payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};
