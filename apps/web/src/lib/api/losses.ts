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
    // Use the existing HttpClient which handles CSRF automatically
    await httpClient.post("/api/losses", lossData);

    return { success: true };
  } catch (error: unknown) {
    // Parse error message from HttpClient
    if (error instanceof Error && error.message) {
      if (error.message.includes("400")) {
        return {
          success: false,
          message: "Insufficient stock or inappropriate location",
        };
      }

      if (error.message.includes("401")) {
        return { success: false, message: "Unauthorized" };
      }

      if (error.message.includes("422")) {
        return {
          success: false,
          message: "Validation failed: invalid data",
        };
      }

      if (error.message.includes("Session expired")) {
        return {
          success: false,
          message: "Session expired, please refresh the page",
        };
      }
    }

    return {
      success: false,
      message: "Error saving the loss",
    };
  }
}
