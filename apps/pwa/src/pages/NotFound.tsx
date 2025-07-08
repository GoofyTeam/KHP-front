import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Home, AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate({ to: "/inventory" });
  };

  return (
    <div className="h-[calc(100svh-4rem)] flex flex-col justify-center items-center p-6 overflow-hidden">
      <div className="text-center space-y-4 max-w-md mx-auto">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-khp-primary/10">
          <AlertCircle className="h-10 w-10 text-khp-primary" />
        </div>

        <h1 className="text-6xl font-bold text-khp-primary">404</h1>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            Page non trouvée
          </h2>
          <p className="text-gray-600 max-w-md">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <Button onClick={handleGoHome} variant="khp-default" className="mt-8">
          <Home className="mr-2 h-4 w-4" />
          Retour à l'inventaire
        </Button>
      </div>
    </div>
  );
}
