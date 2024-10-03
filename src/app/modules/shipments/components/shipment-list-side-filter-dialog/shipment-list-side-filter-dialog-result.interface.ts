export interface ShipmentListSideFilterDialogResult {
  createdDateRange?: { start?: string; end: string };
  clientReference1?: string;
  shipToCountry?: string[];
  owner?: boolean;
  finalDeliveryDateRange?: { start1?: string; end1: string };
}
