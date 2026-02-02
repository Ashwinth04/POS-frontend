export interface Product {
  id: string;
  barcode: string;
  clientName: string;
  name: string;
  mrp: number;
  imageUrl: string;
  quantity: number;
}

export type BulkUploadResponse = {
  status: "SUCCESS" | "UNSUCCESSFUL";
  base64file?: string;
};
