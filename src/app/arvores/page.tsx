import { Suspense } from "react";
import TreeBrowser from "@/components/tree/TreeBrowser";

export default function ArvoresPage() {
  return (
    <div>
      <Suspense fallback={null}>
        <TreeBrowser />
      </Suspense>
    </div>
  );
}
