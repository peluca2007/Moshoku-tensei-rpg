import { Suspense } from "react";
import TreeBrowser from "@/components/tree/TreeBrowser";

export default function ArvoresPage() {
  return (
    <div className="min-h-screen bg-parchment-100 dark:bg-parchment-950">
      <Suspense fallback={null}>
        <TreeBrowser />
      </Suspense>
    </div>
  );
}
