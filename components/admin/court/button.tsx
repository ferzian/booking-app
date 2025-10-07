import { deleteCourt } from "@/lib/actions";
import Link from "next/link";
import { IoPencil, IoTrashOutline } from "react-icons/io5";

export const EditButton = ({ id }: { id: string }) => {
  return (
    <Link
      className="rounded-sm p-1 hover:bg-gray-200"
      href={`/admin/court/edit/${id}`}
    >
      <IoPencil className="size-5" />
    </Link>
  );
};

export const DeleteButton = ({ id, image }: { id: string; image: string }) => {
  const DeleteCourtWithId = deleteCourt.bind(null, id, image);
  return (
    <form action={DeleteCourtWithId}>
      <button
        type="submit"
        className="rounded-sm p-1 hover:bg-gray-200 cursor-pointer"
      >
        <IoTrashOutline className="size-5" />
      </button>
    </form>
  );
};
