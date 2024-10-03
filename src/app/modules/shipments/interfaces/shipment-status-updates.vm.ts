export interface ShipmentStatusUpdates {
  title?: string;
  description: string;
  finalDeliveryDate?: string;
  eta?: { blocked: boolean; days: number } | { msg: string; blocked: boolean; days: number };
  etaText?: string;
}
