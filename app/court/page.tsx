import HeaderSection from "@/components/header-section";
import Main from "@/components/main";
import CardSkeleton from "@/components/skeletons/card-skeleton";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Courts & Rates",
  description: "Choose your best court today.",
};

const CourtPage = () => {
  return (
    <div>
      <HeaderSection
        title="Courts & Rates"
        subTitle="Lorem ipsum dolor sit amet."
      />
      <div className="mt-10 px-4">
        <Suspense fallback={<CardSkeleton />}>
          <Main />
        </Suspense>
      </div>
    </div>
  );
};

export default CourtPage;
