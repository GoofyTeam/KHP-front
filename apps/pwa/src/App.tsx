import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import PWABadge from "./PWABadge.tsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-khp-background grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Button
        variant="khpoutline"
        onClick={() => setCount((count) => count + 1)}
      >
        count is {count}
      </Button>

      <Input variant="khpproduct" placeholder="coucou" />

      <PWABadge />
    </div>
  );
}

export default App;
