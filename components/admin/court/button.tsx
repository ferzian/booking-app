import { deleteCourt } from "@/lib/actions";
import { IoTrashOutline } from "react-icons/io5";

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
