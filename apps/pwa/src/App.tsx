import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card";

import PWABadge from "./PWABadge.tsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-khp-background space-y-4 w-[75%]">
        <Button
          variant="khp-outline"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>

        <Input variant="khp-default" placeholder="coucou" />

        <Card variant="khp-card">
          <CardHeader>
            <CardTitle>Test</CardTitle>
          </CardHeader>
        </Card>

        <PWABadge />
      </div>
    </div>
  );
}

export default App;
