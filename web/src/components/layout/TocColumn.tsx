import Toc from "@/components/navigation/Toc";

export function TocColumn() {
  return (
    <aside className="hidden lg:block w-[260px] shrink-0">
      <Toc />
    </aside>
  );
}
