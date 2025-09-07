

import React from 'react';
import { Product, ProductType, Location, LocationType, StockBalance, Expense, UserRole, Screen, Sale, PaymentType, CartItem, User, SettingsData, PriceType } from './types';

export const INITIAL_SETTINGS: SettingsData = {
    shopName: 'MSP Trading Center',
    taxRate: 0,
};

export const INITIAL_USERS: User[] = [
    { id: 'u1', name: 'Malvin', email: 'malvin.super@example.com', password: 'password123', role: UserRole.Superadmin },
    { id: 'u2', name: 'Samira', email: 'samira.admin@example.com', password: 'password123', role: UserRole.Admin, locationId: 'l2' },
    { id: 'u3', name: 'Pinky', email: 'pinky.admin@example.com', password: 'password123', role: UserRole.Admin, locationId: 'l3' },
    { id: 'u4', name: 'Jane', email: 'jane.staff@example.com', password: 'password123', role: UserRole.Staff, locationId: 'l2' },
    { id: 'u5', name: 'Bart', email: 'bart.staff@example.com', password: 'password123', role: UserRole.Staff, locationId: 'l3' },
    { id: 'u6', name: 'Clarence', email: 'clarence.staff@example.com', password: 'password123', role: UserRole.Staff, locationId: 'l1' },
];

export const INITIAL_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Petron Gasullette GS-3 Burner', sizeKg: null, type: ProductType.Accessory, price: 448.4, wholesalePrice: 380.0, depositAmt: 0, lowStockThreshold: 10 },
    { id: 'p2', name: 'Replacement Burner Head - Large', sizeKg: null, type: ProductType.Accessory, price: 212.4, wholesalePrice: 180.0, depositAmt: 0, lowStockThreshold: 10 },
    { id: 'p3', name: 'Replacement Burner Head - Small', sizeKg: null, type: ProductType.Accessory, price: 141.6, wholesalePrice: 120.0, depositAmt: 0, lowStockThreshold: 10 },
    { id: 'p4', name: 'Fiesta Gas Butane Canister', sizeKg: null, type: ProductType.Accessory, price: 53.1, wholesalePrice: 45.0, depositAmt: 0, lowStockThreshold: 20 },
    { id: 'p5', name: 'Cast-Iron Turbo Burner - Large', sizeKg: null, type: ProductType.Accessory, price: 1062.0, wholesalePrice: 900.0, depositAmt: 0, lowStockThreshold: 5 },
    { id: 'p6', name: 'Cast-Iron Turbo Burner - Medium', sizeKg: null, type: ProductType.Accessory, price: 826.0, wholesalePrice: 700.0, depositAmt: 0, lowStockThreshold: 5 },
    { id: 'p7', name: 'Cast-Iron Turbo Burner - Small', sizeKg: null, type: ProductType.Accessory, price: 649.0, wholesalePrice: 550.0, depositAmt: 0, lowStockThreshold: 5 },
    { id: 'p8', name: 'LPG Rubber Hose (per meter)', sizeKg: null, type: ProductType.Accessory, price: 100.3, wholesalePrice: 85.0, depositAmt: 0, lowStockThreshold: 50 },
    { id: 'p9', name: 'Hose Clamp - Large', sizeKg: null, type: ProductType.Accessory, price: 29.5, wholesalePrice: 25.0, depositAmt: 0, lowStockThreshold: 50 },
    { id: 'p10', name: 'Hose Clamp - Medium', sizeKg: null, type: ProductType.Accessory, price: 23.6, wholesalePrice: 20.0, depositAmt: 0, lowStockThreshold: 50 },
    { id: 'p11', name: 'Hose Clamp - Small', sizeKg: null, type: ProductType.Accessory, price: 17.7, wholesalePrice: 15.0, depositAmt: 0, lowStockThreshold: 50 },
    { id: 'p12', name: 'Fiesta Gas 11 kg Cylinder', sizeKg: 11, type: ProductType.LPG, price: 980.0, wholesalePrice: 830.51, depositAmt: 1200, lowStockThreshold: 10 },
    { id: 'p13', name: 'Fiesta Gas 2.7 kg Cylinder', sizeKg: 2.7, type: ProductType.LPG, price: 240.55, wholesalePrice: 203.85, depositAmt: 500, lowStockThreshold: 10 },
    { id: 'p14', name: 'Gasulito Cylinder', sizeKg: 2.7, type: ProductType.LPG, price: 267.55, wholesalePrice: 226.73, depositAmt: 500, lowStockThreshold: 10 },
    { id: 'p15', name: 'Petron Gasul 11 kg Cylinder', sizeKg: 11, type: ProductType.LPG, price: 1090.0, wholesalePrice: 923.73, depositAmt: 1200, lowStockThreshold: 10 },
    { id: 'p16', name: 'Petron Gasul 22 kg Cylinder', sizeKg: 22, type: ProductType.LPG, price: 2180.0, wholesalePrice: 1847.46, depositAmt: 2500, lowStockThreshold: 5 },
    { id: 'p17', name: 'Petron Gasul 50 kg Cylinder', sizeKg: 50, type: ProductType.LPG, price: 4905.0, wholesalePrice: 4156.78, depositAmt: 4000, lowStockThreshold: 3 },
    { id: 'p18', name: 'Petron Gasul 7 kg Cylinder', sizeKg: 7, type: ProductType.LPG, price: 693.64, wholesalePrice: 587.83, depositAmt: 1000, lowStockThreshold: 10 },
    { id: 'p19', name: 'Petron Gasul Elite 11 kg Cylinder', sizeKg: 11, type: ProductType.LPG, price: 1100.0, wholesalePrice: 932.2, depositAmt: 1200, lowStockThreshold: 10 },
    { id: 'p20', name: 'Reyna Portable Butane Stove', sizeKg: null, type: ProductType.Accessory, price: 1003.0, wholesalePrice: 850.0, depositAmt: 0, lowStockThreshold: 5 },
    { id: 'p21', name: 'High-Pressure Regulator with Gauge', sizeKg: null, type: ProductType.Accessory, price: 1121.0, wholesalePrice: 950.0, depositAmt: 0, lowStockThreshold: 10 },
    { id: 'p22', name: 'Reyna Automatic Low-Pressure Regulator', sizeKg: null, type: ProductType.Accessory, price: 495.6, wholesalePrice: 420.0, depositAmt: 0, lowStockThreshold: 10 },
    { id: 'p23', name: 'Reyna Low-Pressure Regulator (Boxed)', sizeKg: null, type: ProductType.Accessory, price: 424.8, wholesalePrice: 360.0, depositAmt: 0, lowStockThreshold: 10 },
    { id: 'p24', name: 'Reyna Double-Burner Gas Stove', sizeKg: null, type: ProductType.Accessory, price: 1298.0, wholesalePrice: 1100.0, depositAmt: 0, lowStockThreshold: 5 },
    { id: 'p25', name: 'Reyna Single-Burner Gas Stove', sizeKg: null, type: ProductType.Accessory, price: 826.0, wholesalePrice: 700.0, depositAmt: 0, lowStockThreshold: 5 },
    { id: 'p26', name: 'Wok/Pot Support Ring', sizeKg: null, type: ProductType.Accessory, price: 188.8, wholesalePrice: 160.0, depositAmt: 0, lowStockThreshold: 10 },
    {
        id: 'p27',
        name: 'Fiesta Gas Stove Set Promo',
        sizeKg: null,
        type: ProductType.Accessory,
        price: 599.0,
        wholesalePrice: 599.0,
        depositAmt: 0,
        lowStockThreshold: 2,
        isBundle: true,
        bundleItems: [
            { productId: 'p20', quantity: 1 }, 
            { productId: 'p4', quantity: 2 },  
        ]
    },
    {
        id: 'p28',
        name: 'Fiesta Gas Double Burner Set',
        sizeKg: null,
        type: ProductType.Accessory,
        price: 2750.0, // Corrected price to be lower than sum of components (2873.9)
        wholesalePrice: 2350.0, // Corrected price to be lower than sum of components (2435.51)
        depositAmt: 1200, 
        lowStockThreshold: 2,
        isBundle: true,
        bundleItems: [
            { productId: 'p12', quantity: 1 }, 
            { productId: 'p24', quantity: 1 }, 
            { productId: 'p8', quantity: 1 },  
            { productId: 'p22', quantity: 1 }, 
        ]
    },
    {
        id: 'p29',
        name: 'Fiesta Gas Single Burner Set',
        sizeKg: null,
        type: ProductType.Accessory,
        price: 2300.0, // Corrected price to be lower than sum of components (2401.9)
        wholesalePrice: 1950.0, // Corrected price to be lower than sum of components (2011.85)
        depositAmt: 1200, 
        lowStockThreshold: 2,
        isBundle: true,
        bundleItems: [
            { productId: 'p12', quantity: 1 }, 
            { productId: 'p25', quantity: 1 }, 
            { productId: 'p8', quantity: 1 },  
            { productId: 'p22', quantity: 1 }, 
        ]
    }
];


export const INITIAL_LOCATIONS: Location[] = [
    { id: 'l1', name: 'MSP Trading Center', type: LocationType.Main, address: '57 Zurbito St., Brgy. Bapor, Masbate City', contactNumber: '0906 035 6116' },
    { id: 'l2', name: 'PINKY LINGAD STORE 1', type: LocationType.Reseller, address: 'Danao St. Brgy. Bapor, Masbate City' },
    { id: 'l3', name: 'PINKY LINGAD STORE 2', type: LocationType.Reseller, address: 'Cagba, Masbate City' },
];

export const INITIAL_STOCK: StockBalance[] = [
    { id: 's1', productId: 'p15', locationId: 'l1', fullQty: 45, emptyQty: 12 },
    { id: 's2', productId: 'p16', locationId: 'l1', fullQty: 20, emptyQty: 5 },
    { id: 's3', productId: 'p17', locationId: 'l1', fullQty: 8, emptyQty: 2 },
    { id: 's4', productId: 'p22', locationId: 'l1', fullQty: 100, emptyQty: 0 },
    { id: 's5', productId: 'p8', locationId: 'l1', fullQty: 250, emptyQty: 0 },
    { id: 's6', productId: 'p15', locationId: 'l2', fullQty: 250, emptyQty: 30 },
    { id: 's7', productId: 'p16', locationId: 'l2', fullQty: 100, emptyQty: 10 },
    { id: 's8', productId: 'p15', locationId: 'l3', fullQty: 15, emptyQty: 3 },
    { id: 's9', productId: 'p12', locationId: 'l1', fullQty: 30, emptyQty: 5 },
    { id: 's10', productId: 'p13', locationId: 'l1', fullQty: 50, emptyQty: 15 },
    { id: 's11', productId: 'p4', locationId: 'l1', fullQty: 100, emptyQty: 0 },
    { id: 's12', productId: 'p20', locationId: 'l1', fullQty: 10, emptyQty: 0 },
    { id: 's13', productId: 'p24', locationId: 'l1', fullQty: 10, emptyQty: 0 },
    { id: 's14', productId: 'p25', locationId: 'l1', fullQty: 10, emptyQty: 0 },
];

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date();
twoDaysAgo.setDate(today.getDate() - 2);

const createSale = (id: number, date: Date, locId: string, userId: string, items: CartItem[], paymentType: PaymentType, discount: number = 0): Sale => {
    const subtotal = items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
    const depositTotal = items.reduce((acc, item) => acc + (item.returnedEmpty ? 0 : item.qty * item.deposit), 0);
    const total = subtotal + depositTotal - discount;
    return {
        id: `sale-${id}`,
        date,
        locationId: locId,
        userId: userId,
        items: items.map(item => ({ ...item })),
        subtotal,
        depositTotal,
        discountAmount: discount,
        tax: 0,
        total,
        paymentType,
        priceType: PriceType.Retail,
        deliveryFee: 0,
    };
};

export const INITIAL_SALES: Sale[] = [
    createSale(1, today, 'l1', 'u6', [{ productId: 'p15', productName: 'Petron Gasul 11 kg Cylinder', qty: 1, unitPrice: 1090.0, returnedEmpty: true, deposit: 1200 }], PaymentType.Cash),
    createSale(2, today, 'l2', 'u4', [{ productId: 'p15', productName: 'Petron Gasul 11 kg Cylinder', qty: 1, unitPrice: 1090.0, returnedEmpty: false, deposit: 1200 }, { productId: 'p22', productName: 'Reyna Automatic Low-Pressure Regulator', qty: 1, unitPrice: 495.6, returnedEmpty: false, deposit: 0 }], PaymentType.EWallet),
    createSale(3, today, 'l1', 'u1', [{ productId: 'p16', productName: 'Petron Gasul 22 kg Cylinder', qty: 2, unitPrice: 2180.0, returnedEmpty: true, deposit: 2500 }, { productId: 'p17', productName: 'Petron Gasul 50 kg Cylinder', qty: 1, unitPrice: 4905.0, returnedEmpty: false, deposit: 4000 }], PaymentType.Cash, 100),
    createSale(4, today, 'l3', 'u5', [{ productId: 'p8', productName: 'LPG Rubber Hose (per meter)', qty: 3, unitPrice: 100.3, returnedEmpty: false, deposit: 0 }], PaymentType.Cash),
    createSale(5, today, 'l2', 'u2', [{ productId: 'p16', productName: 'Petron Gasul 22 kg Cylinder', qty: 1, unitPrice: 2180.0, returnedEmpty: false, deposit: 2500 }], PaymentType.Bank),
    
    createSale(6, yesterday, 'l1', 'u6', [{ productId: 'p15', productName: 'Petron Gasul 11 kg Cylinder', qty: 5, unitPrice: 1090.0, returnedEmpty: true, deposit: 1200 }], PaymentType.Cash, 50),
    createSale(7, yesterday, 'l2', 'u4', [{ productId: 'p22', productName: 'Reyna Automatic Low-Pressure Regulator', qty: 2, unitPrice: 495.6, returnedEmpty: false, deposit: 0 }, { productId: 'p8', productName: 'LPG Rubber Hose (per meter)', qty: 5, unitPrice: 100.3, returnedEmpty: false, deposit: 0 }], PaymentType.EWallet),
    createSale(8, yesterday, 'l1', 'u1', [{ productId: 'p17', productName: 'Petron Gasul 50 kg Cylinder', qty: 1, unitPrice: 4905.0, returnedEmpty: false, deposit: 4000 }], PaymentType.Cash),
    createSale(9, yesterday, 'l3', 'u3', [{ productId: 'p15', productName: 'Petron Gasul 11 kg Cylinder', qty: 1, unitPrice: 1090.0, returnedEmpty: true, deposit: 1200 }], PaymentType.Cash),
    createSale(10, yesterday, 'l2', 'u2', [{ productId: 'p16', productName: 'Petron Gasul 22 kg Cylinder', qty: 1, unitPrice: 2180.0, returnedEmpty: true, deposit: 2500 }], PaymentType.EWallet),
];


export const INITIAL_EXPENSES: Expense[] = [
    { id: 'e1', date: today, category: 'Fuel', amount: 1500, userId: 'u6', locationId: 'l1', note: 'Diesel for truck' },
    { id: 'e2', date: today, category: 'Refilling', amount: 22500, userId: 'u2', locationId: 'l2', note: 'Payment for 25x 11kg refills' },
    { id: 'e3', date: yesterday, category: 'Salaries', amount: 5000, userId: 'u1', locationId: 'l1', note: 'Weekly salary for staff A' },
    { id: 'e4', date: yesterday, category: 'Utilities', amount: 3500, userId: 'u4', locationId: 'l2', note: 'Electric bill' },
    { id: 'e5', date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), category: 'Freight', amount: 4000, userId: 'u1', locationId: 'l2', note: 'Shipping from main plant' },
    { id: 'e6', date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), category: 'Fuel', amount: 1200, userId: 'u5', locationId: 'l3' },
];

export const ICONS: { [key: string]: React.ReactNode } = {
    [Screen.POS]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    [Screen.Inventory]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
    [Screen.Expenses]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    [Screen.Reports]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    [Screen.Settings]: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export const LOGO_URL = 'https://sofia.static.domains/Logos/MSPLOGO.png';

export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '0.00';
    }
    
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);

    const fixedAmount = absoluteAmount.toFixed(2);
    const parts = fixedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    const formatted = parts.join('.');

    return isNegative ? `-${formatted}` : formatted;
};