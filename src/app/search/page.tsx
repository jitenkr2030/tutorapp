import { useRouter, useSearchParams } from "next/navigation";
import AdvancedSearch from "@/components/search/advanced-search";
import { Suspense } from "react";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <AdvancedSearch />
    </Suspense>
  );
}