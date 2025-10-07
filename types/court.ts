import { Prisma } from "@prisma/client";

export type CourtProps = Prisma.CourtGetPayload<{
  include: { CourtAmenities: { select: { amenitiesId: true } } };
}>;
