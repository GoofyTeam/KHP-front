export type ExpiryStatus = "soon" | "expired";

export type ExpiryTableItem = {
  id: string;
  name: string;
  quantity: number;
  location: string;
  expirationDate: string;
  status: ExpiryStatus;
};