
export enum UserRole {
    Superadmin = 'Superadmin',
    Admin = 'Admin',
    Staff = 'Staff',
}

export enum Screen {
    POS = 'POS',
    Inventory = 'Inventory',
    Expenses = 'Expenses',
    Reports = 'Reports',
    Settings = 'Settings'
}

export enum ProductType {
    LPG = 'LPG',
    Accessory = 'Accessory'
}

export enum LocationType {
    Main = 'Main',
    Reseller = 'Reseller',
}

export enum PaymentType {
    Cash = 'Cash',
    EWallet = 'E-Wallet',
    Bank = 'Bank Transfer'
}

export enum PriceType {
    Retail = 'Retail',
    Wholesale = 'Wholesale',
}

export enum DiscountType {
    None = 'None',
    SeniorPWD = 'Senior/PWD',
}


export interface SettingsData {
    shopName: string;
    taxRate: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    locationId?: string; // Staff/Admin assigned to a location
}

export interface Product {
    id: string;
    name: string;
    sizeKg: number | null;
    type: ProductType;
    price: number; // Retail price
    wholesalePrice: number;
    depositAmt: number;
    lowStockThreshold: number;
    isBundle?: boolean;
    bundleItems?: {
        productId: string;
        quantity: number;
    }[];
}

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    address: string;
    contactNumber?: string;
}

export interface StockBalance {
    id: string;
    productId: string;
    locationId: string;
    fullQty: number;
    emptyQty: number;
}

export interface Expense {
    id: string;
    date: Date;
    category: string;
    amount: number;
    note?: string;
    photoDataUrl?: string;
    userId: string;
    locationId: string;
}

export interface CartItem {
    productId: string;
    productName: string;
    qty: number;
    unitPrice: number;
    returnedEmpty: boolean;
    deposit: number;
}


export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    qty: number;
    unitPrice: number;
    returnedEmpty: boolean;
}

export interface DiscountInfo {
    type: DiscountType;
    percentage: number;
    customerName: string;
    customerIdPhotoUrl: string;
}

export interface Sale {
    id: string;
    date: Date;
    locationId: string;
    userId: string;
    items: (CartItem & { productId: string; })[];
    subtotal: number;
    depositTotal: number;
    discountAmount: number;
    discountInfo?: DiscountInfo;
    deliveryFee: number;
    priceType: PriceType;
    tax: number;
    total: number;
    paymentType: PaymentType;
    paymentRefNo?: string;
    paymentPhotoUrl?: string;
}

export interface StockTransfer {
    id: string;
    date: Date;
    fromLocationId: string;
    toLocationId: string;
    productId: string;
    qty: number;
    userId: string;
}

export interface StockReceive {
    id: string;
    date: Date;
    locationId: string;
    productId: string;
    qty: number;
    userId: string;
}

export interface StockAdjustment {
    id: string;
    date: Date;
    locationId: string;
    productId: string;
    oldFullQty: number;
    newFullQty: number;
    oldEmptyQty: number;
    newEmptyQty: number;
    reason: string;
    userId: string;
}