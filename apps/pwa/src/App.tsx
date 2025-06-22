import { useState } from "react";
import { Button } from "@workspace/ui/components/button";

import PWABadge from "./PWABadge.tsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Button
        variant="outline"
        className="bg-red-500 text-white hover:bg-red-600"
        onClick={() => setCount((count) => count + 1)}
      >
        count is {count}
      </Button>

      <PWABadge />
    </>
  );
}

export default App;
