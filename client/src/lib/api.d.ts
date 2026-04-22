declare module '@/lib/api' {
  import { AxiosInstance, AxiosResponse } from 'axios';

  export interface APIResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    meta?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }

  export interface Shipment {
    _id: string;
    shipmentId: string;
    parcels: Array<{
      _id: string;
      trackingId: string;
      status: string;
      weight?: number;
      type?: string;
    }>;
    originHub: string;
    destinationHub: string;
    route?: string[];
    status: 'Dispatched' | 'In Transit' | 'Received';
    statusHistory: Array<{
      status: string;
      location?: string;
      updatedBy?: string;
      note?: string;
      timestamp: string;
    }>;
    createdAt: string;
    updatedAt: string;
    expectedArrival?: string;
    receivedAt?: string;
  }

  export interface Parcel {
    _id: string;
    trackingId: string;
    status: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    senderName?: string;
    senderPhone?: string;
    recipientName?: string;
    recipientPhone?: string;
    pickupAddress?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    destinationAddress?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    description?: string;
    centerCode?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface Pickup {
    _id: string;
    customer: string;
    recipientName: string;
    recipientPhone: string;
    pickupAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    destinationAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    description?: string;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    status: string;
    assignedAgent?: string;
    pickupDate?: string;
    statusHistory: Array<{
      status: string;
      updatedBy?: string;
      note?: string;
      timestamp: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }

  export interface Customer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    createdAt: string;
    updatedAt: string;
  }

  export const shipmentsAPI: {
    getAll: (params?: any) => Promise<AxiosResponse<APIResponse<Shipment[]>>>;
    getById: (id: string) => Promise<AxiosResponse<APIResponse<Shipment>>>;
    create: (data: any) => Promise<AxiosResponse<APIResponse<Shipment>>>;
    addParcels: (id: string, parcelIds: string[]) => Promise<AxiosResponse<APIResponse<Shipment>>>;
    updateStatus: (id: string, status: string, note?: string, location?: string) => Promise<AxiosResponse<APIResponse<Shipment>>>;
    delete: (id: string) => Promise<AxiosResponse<APIResponse<any>>>;
    track: (shipmentId: string) => Promise<AxiosResponse<APIResponse<Shipment>>>;
  };

  export const parcelsAPI: {
    getAll: (params?: any) => Promise<AxiosResponse<APIResponse<Parcel[]>>>;
    getById: (id: string) => Promise<AxiosResponse<APIResponse<Parcel>>>;
    getByTrackingId: (trackingId: string) => Promise<AxiosResponse<APIResponse<Parcel>>>;
    create: (data: any) => Promise<AxiosResponse<APIResponse<Parcel>>>;
    createFromPickup: (data: any) => Promise<AxiosResponse<APIResponse<Parcel>>>;
    update: (id: string, data: any) => Promise<AxiosResponse<APIResponse<Parcel>>>;
    updateStatus: (id: string, status: string, note?: string) => Promise<AxiosResponse<APIResponse<Parcel>>>;
    markAsDamaged: (id: string, damageNote: string) => Promise<AxiosResponse<APIResponse<Parcel>>>;
    delete: (id: string) => Promise<AxiosResponse<APIResponse<any>>>;
    getSortedView: (params?: any) => Promise<AxiosResponse<APIResponse<Parcel[]>>>;
    getConstants: () => Promise<AxiosResponse<APIResponse<any>>>;
    track: (trackingId: string) => Promise<AxiosResponse<APIResponse<Parcel>>>;
  };

  export const pickupsAPI: {
    getAll: (params?: any) => Promise<AxiosResponse<APIResponse<Pickup[]>>>;
    getById: (id: string) => Promise<AxiosResponse<APIResponse<Pickup>>>;
    create: (data: any) => Promise<AxiosResponse<APIResponse<Pickup>>>;
    update: (id: string, data: any) => Promise<AxiosResponse<APIResponse<Pickup>>>;
    updateStatus: (id: string, status: any) => Promise<AxiosResponse<APIResponse<Pickup>>>;
    delete: (id: string) => Promise<AxiosResponse<APIResponse<any>>>;
    assign: (id: string, agentId: string) => Promise<AxiosResponse<APIResponse<Pickup>>>;
  };

  export const customersAPI: {
    getAll: (params?: any) => Promise<AxiosResponse<APIResponse<Customer[]>>>;
    getById: (id: string) => Promise<AxiosResponse<APIResponse<Customer>>>;
    create: (data: any) => Promise<AxiosResponse<APIResponse<Customer>>>;
    update: (id: string, data: any) => Promise<AxiosResponse<APIResponse<Customer>>>;
    delete: (id: string) => Promise<AxiosResponse<APIResponse<any>>>;
  };

  export const healthCheck: () => Promise<AxiosResponse<APIResponse<any>>>;
  
  export default any;
}
