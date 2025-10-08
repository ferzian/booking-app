import Card from "@/components/card";
import { getCourts } from "@/lib/data";
import { notFound } from "next/navigation";

const Main = async () => {
  const courts = await getCourts();
  if (!courts) return notFound();
  return (
    <div className="max-w-screen-xl py-6 pb-20 px-4 mx-auto">
      <div className="grid gap-7 md:grid-cols-3">
        {courts.map((court) => (
          <Card court={court} key={court.id} />
        ))}
      </div>
    </div>
  );
};

export default Main;
