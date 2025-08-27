import { httpClient, RequestData } from "../httpClient";

interface LossData extends RequestData {
  trackable_id: number;
  trackable_type: "ingredient" | "preparation";
  location_id: number;
  quantity: number;
  reason: string;
}

interface LossResponse {
  success: boolean;
  message?: string;
}

export async function createLoss(lossData: LossData): Promise<LossResponse> {
  try {
    console.log("Attempting to create loss with data:", lossData);

    // Use the existing HttpClient which handles CSRF automatically
    const result = await httpClient.post<any>("/api/losses", lossData);

    console.log("Loss creation successful:", result);
    return { success: true };
  } catch (error: any) {
    console.error("Error creating loss:", error);

    // Parse error message from HttpClient
    if (error.message) {
      if (error.message.includes("400")) {
        return {
          success: false,
          message: "Stock insuffisant ou localisation inappropriée",
        };
      }

      if (error.message.includes("401")) {
        return { success: false, message: "Non authentifié" };
      }

      if (error.message.includes("422")) {
        return {
          success: false,
          message: "Validation échouée: données invalides",
        };
      }

      if (error.message.includes("Session expired")) {
        return {
          success: false,
          message: "Session expirée, veuillez actualiser la page",
        };
      }
    }

    return {
      success: false,
      message: "Erreur lors de l'enregistrement de la perte",
    };
  }
}
