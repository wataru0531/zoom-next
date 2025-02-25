
// previousページ

import CallList from "@/components/CallList";

const PreviousPage = () => {
  return (
    // size-full → width 100% + height 100%
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Previous Calls</h1>

      <CallList type="ended" />
    </section>
  );
};

export default PreviousPage;
