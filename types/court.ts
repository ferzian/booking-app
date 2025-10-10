import { Prisma } from "@prisma/client";

export type CourtProps = Prisma.CourtGetPayload<{
  include: { CourtAmenities: { select: { amenitiesId: true } } };
}>;

export type CourtDetailProps = Prisma.CourtGetPayload<{
  include: {
    CourtAmenities: {
      include: {
        Amenities: {
          select: {
            name: true;
          };
        };
      };
    };
  };
}>;


export type DisabledDateProps = Prisma.ReservationGetPayload<{
  select: {
    startDate: true;
    endDate: true;
  }
}>