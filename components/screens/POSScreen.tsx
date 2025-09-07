


import React, { useState, useMemo, useCallback } from 'react';
import { Product, StockBalance, CartItem, PaymentType, Sale, SettingsData, PriceType, DiscountType, DiscountInfo, User } from '../../types';
import GlassCard from '../GlassCard';
import Modal from '../Modal';
import { formatCurrency } from '../../constants';

interface POSScreenProps {
    products: Product[];
    stock: StockBalance[];
    settings: SettingsData;
    onAddSale: (sale: Omit<Sale, 'id' | 'date' | 'userId'>) => void;
    activeLocationId: string;
    currentUser: User;
}

const PhotoInput: React.FC<{
    photoUrl: string | null;
    onPhotoSet: (url: string) => void;
    onPhotoRemove: () => void;
}> = ({ photoUrl, onPhotoSet, onPhotoRemove }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onPhotoSet(event.target.result as string);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    return (
        <div>
            {photoUrl ? (
                <div className="flex items-center space-x-4">
                    <img src={photoUrl} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-gray-900/10 dark:border-white/20" />
                    <button onClick={onPhotoRemove} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs">Remove</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <label className="w-full text-center cursor-pointer px-3 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50">
                        Upload
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <label className="w-full text-center cursor-pointer px-3 py-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-semibold rounded-lg hover:bg-green-200 dark:hover:bg-green-800/50">
                        Take Photo
                        <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
            )}
        </div>
    );
};

const POSScreen: React.FC<POSScreenProps> = ({ products, stock, settings, onAddSale, activeLocationId, currentUser }) => {
    const [saleItems, setSaleItems] = useState<Record<string, CartItem>>({});
    const [priceType, setPriceType] = useState<PriceType>(PriceType.Retail);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc'>('name-asc');
    const [isSortModalOpen, setSortModalOpen] = useState(false);
    
    // Modal & Sale State
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.Cash);
    const [deliveryFee, setDeliveryFee] = useState('');
    const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.None);
    const [discountPercent, setDiscountPercent] = useState(5);
    const [customerName, setCustomerName] = useState('');
    const [customerIdPhoto, setCustomerIdPhoto] = useState<string | null>(null);
    const [paymentRefNo, setPaymentRefNo] = useState('');
    const [paymentPhotoUrl, setPaymentPhotoUrl] = useState<string | null>(null);

    const [isReceiptModalOpen, setReceiptModalOpen] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);

    const sortOptions = [
        { key: 'name-asc', label: 'Name (A-Z)' },
        { key: 'name-desc', label: 'Name (Z-A)' },
        { key: 'price-asc', label: 'Price (Low-High)' },
        { key: 'price-desc', label: 'Price (High-Low)' },
        { key: 'stock-desc', label: 'Stock (High-Low)' },
        { key: 'stock-asc', label: 'Stock (Low-High)' },
    ];

    const activeStockMap = useMemo(() => {
        const stockMap = new Map<string, number>();
        stock.forEach(s => {
            stockMap.set(s.productId, s.fullQty);
        });
        return stockMap;
    }, [stock]);
    
    const getStockQty = useCallback((productId: string) => activeStockMap.get(productId) || 0, [activeStockMap]);

    const filteredAndSortedProducts = useMemo(() => {
        let displayProducts = [...products];

        if (searchQuery.trim() !== '') {
            displayProducts = displayProducts.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        displayProducts.sort((a, b) => {
            switch (sortKey) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    const priceA = priceType === PriceType.Retail ? a.price : a.wholesalePrice;
                    const priceB = priceType === PriceType.Retail ? b.price : b.wholesalePrice;
                    return priceA - priceB;
                case 'price-desc':
                    const priceADesc = priceType === PriceType.Retail ? a.price : a.wholesalePrice;
                    const priceBDesc = priceType === PriceType.Retail ? b.price : b.wholesalePrice;
                    return priceBDesc - priceADesc;
                case 'stock-asc':
                    return getStockQty(a.id) - getStockQty(b.id);
                case 'stock-desc':
                    return getStockQty(b.id) - getStockQty(a.id);
                default:
                    return 0;
            }
        });

        return displayProducts;
    }, [products, searchQuery, sortKey, priceType, getStockQty]);

    const handlePriceTypeChange = (newPriceType: PriceType) => {
        setPriceType(newPriceType);
        setSaleItems(prevItems => {
            const newItems = { ...prevItems };
            Object.keys(newItems).forEach(productId => {
                const product = products.find(p => p.id === productId);
                if (product) {
                    newItems[productId].unitPrice = newPriceType === PriceType.Retail ? product.price : product.wholesalePrice;
                }
            });
            return newItems;
        });
    };

    const updateItemQuantity = (product: Product, change: 1 | -1) => {
        setSaleItems(prevItems => {
            const newItems = { ...prevItems };
            const existingItem = newItems[product.id];
            
            let stockQty;
            if (product.isBundle && product.bundleItems) {
                const componentQtys = product.bundleItems.map(item => Math.floor(getStockQty(item.productId) / item.quantity));
                stockQty = Math.min(...componentQtys);
            } else {
                stockQty = getStockQty(product.id);
            }

            if (change === 1) {
                if (existingItem) {
                    if (existingItem.qty < stockQty) {
                        existingItem.qty += 1;
                    }
                } else if (stockQty > 0) {
                    const unitPrice = priceType === PriceType.Retail ? product.price : product.wholesalePrice;
                    newItems[product.id] = {
                        productId: product.id,
                        productName: product.name,
                        qty: 1,
                        unitPrice,
                        returnedEmpty: product.depositAmt > 0 ? true : false,
                        deposit: product.depositAmt,
                    };
                }
            } else if (change === -1 && existingItem) {
                existingItem.qty -= 1;
                if (existingItem.qty <= 0) {
                    delete newItems[product.id];
                }
            }
            return newItems;
        });
    };
    
    const toggleReturnedEmpty = (productId: string) => {
        setSaleItems(prevItems => {
            const newItems = { ...prevItems };
            const item = newItems[productId];
            if (item) {
                item.returnedEmpty = !item.returnedEmpty;
            }
            return newItems;
        });
    };
    
    const cart = useMemo(() => Object.values(saleItems), [saleItems]);

    const { subtotal, depositTotal } = useMemo(() => {
        const currentCart = Object.values(saleItems);
        const subtotalCalc = currentCart.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
        const depositTotalCalc = currentCart.reduce((acc, item) => acc + (item.returnedEmpty ? 0 : item.qty * item.deposit), 0);
        return { subtotal: subtotalCalc, depositTotal: depositTotalCalc };
    }, [saleItems]);
    
    const { discountAmount, finalTotal } = useMemo(() => {
        const deliveryFeeNum = parseFloat(deliveryFee) || 0;
        let calculatedDiscount = 0;
        if (discountType === DiscountType.SeniorPWD) {
            calculatedDiscount = subtotal * (discountPercent / 100);
        }
        const calculatedTotal = subtotal + depositTotal - calculatedDiscount + deliveryFeeNum;
        return { discountAmount: calculatedDiscount, finalTotal: calculatedTotal };
    }, [subtotal, depositTotal, deliveryFee, discountType, discountPercent]);

    const resetSaleState = () => {
        setSaleItems({});
        setPaymentModalOpen(false);
        setDeliveryFee('');
        setDiscountType(DiscountType.None);
        setDiscountPercent(5);
        setCustomerName('');
        setCustomerIdPhoto(null);
        setPaymentRefNo('');
        setPaymentPhotoUrl(null);
    };

    const handleFinalizeSale = useCallback(() => {
        const currentCart = Object.values(saleItems);
        if (currentCart.length === 0) return;

        if ((paymentType === PaymentType.EWallet || paymentType === PaymentType.Bank) && (!paymentRefNo.trim() || !paymentPhotoUrl)) {
            alert('Reference Number and Payment Proof are required for this payment method.');
            return;
        }

        let discountInfo: DiscountInfo | undefined = undefined;
        if (discountType === DiscountType.SeniorPWD) {
            if (!customerName.trim() || !customerIdPhoto) {
                alert('Customer Name and ID Photo are required for Senior/PWD discount.');
                return;
            }
            discountInfo = {
                type: DiscountType.SeniorPWD,
                percentage: discountPercent,
                customerName,
                customerIdPhotoUrl: customerIdPhoto,
            };
        }
        
        const newSale: Omit<Sale, 'id' | 'date' | 'userId'> = {
            locationId: activeLocationId,
            items: currentCart,
            subtotal,
            depositTotal,
            discountAmount,
            discountInfo,
            deliveryFee: parseFloat(deliveryFee) || 0,
            priceType,
            tax: 0,
            total: finalTotal,
            paymentType,
            paymentRefNo: paymentRefNo,
            paymentPhotoUrl: paymentPhotoUrl,
        };
        
        onAddSale(newSale);
        setLastSale({ ...newSale, id: `temp-${Date.now()}`, date: new Date(), userId: currentUser.id }); // For receipt preview
        resetSaleState();
        setReceiptModalOpen(true);
    }, [saleItems, subtotal, depositTotal, paymentType, onAddSale, priceType, deliveryFee, discountType, discountPercent, discountAmount, finalTotal, customerName, customerIdPhoto, paymentRefNo, paymentPhotoUrl, activeLocationId, currentUser.id]);
    
    const handlePrintReceipt = () => {
        window.print();
    };

    const commonLabelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1";
    const commonInputClasses = "w-full bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20 placeholder:text-gray-500 dark:placeholder:text-gray-500";
    const commonSelectClasses = "w-full bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 pl-3 pr-10 py-2";

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Products</h2>
                    <div className="flex items-center space-x-2 p-1 rounded-full bg-black/5 dark:bg-white/5">
                        <button onClick={() => handlePriceTypeChange(PriceType.Retail)} className={`px-4 py-1 text-sm font-semibold rounded-full transition ${priceType === PriceType.Retail ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Retail</button>
                        <button onClick={() => handlePriceTypeChange(PriceType.Wholesale)} className={`px-4 py-1 text-sm font-semibold rounded-full transition ${priceType === PriceType.Wholesale ? 'bg-blue-600 text-white shadow' : 'text-gray-600 dark:text-gray-300'}`}>Wholesale</button>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`${commonInputClasses} pl-10`}
                        />
                    </div>
                    <button 
                        onClick={() => setSortModalOpen(true)}
                        className="flex-shrink-0 px-3 bg-white/60 dark:bg-gray-900/60 rounded-md border border-black/5 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
                        aria-label="Sort products"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto -mr-2 pr-2">
                    <div className="space-y-3 pb-24 md:pb-0">
                        {filteredAndSortedProducts.map(p => {
                            let stockQty;
                            if (p.isBundle && p.bundleItems) {
                                const componentQtys = p.bundleItems.map(item => {
                                    const componentStock = getStockQty(item.productId);
                                    return Math.floor(componentStock / item.quantity);
                                });
                                stockQty = componentQtys.length > 0 ? Math.min(...componentQtys) : 0;
                            } else {
                                stockQty = getStockQty(p.id);
                            }

                            const itemInSale = saleItems[p.id];
                            const isAvailable = stockQty > 0;
                            const isLowStock = isAvailable && stockQty <= p.lowStockThreshold;
                            const itemQtyInSale = itemInSale?.qty || 0;
                            const currentPrice = priceType === PriceType.Retail ? p.price : p.wholesalePrice;
                            
                            return (
                                <div key={p.id} className={`p-3 rounded-xl shadow-md transition-colors duration-200 flex flex-col ${itemInSale ? 'bg-blue-500/40' : 'bg-white/60 dark:bg-gray-900/60'} backdrop-blur-2xl border border-black/5 dark:border-white/10`}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{p.name}</p>
                                            {p.isBundle && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300">PROMO SET</span>}
                                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">₱{formatCurrency(currentPrice)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateItemQuantity(p, -1)} disabled={!itemInSale} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-lg font-bold text-gray-700 dark:text-gray-200 disabled:opacity-30">-</button>
                                            <span className="w-8 text-center text-lg font-bold text-gray-800 dark:text-gray-100">{itemQtyInSale}</span>
                                            <button onClick={() => updateItemQuantity(p, 1)} disabled={!isAvailable || itemQtyInSale >= stockQty} className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-lg font-bold text-gray-700 dark:text-gray-200 disabled:opacity-30">+</button>
                                        </div>
                                        <div className="w-12 text-right">
                                            {!isAvailable ? <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-500/20 text-red-600 dark:text-red-300">OUT</span> : isLowStock ? <span className="text-sm font-bold px-2 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-300">{stockQty}</span> : <span className="text-sm font-bold text-green-600 dark:text-green-400">{stockQty}</span>}
                                        </div>
                                    </div>
                                    {itemInSale && p.depositAmt > 0 && (
                                        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/20 flex justify-end">
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <span className="text-sm text-gray-600 dark:text-gray-300">Returned Empty? (-₱{formatCurrency(p.depositAmt)})</span>
                                                <div className="relative"><input type="checkbox" className="sr-only" checked={itemInSale.returnedEmpty} onChange={() => toggleReturnedEmpty(p.id)} /><div className={`block w-12 h-6 rounded-full transition ${itemInSale.returnedEmpty ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-600'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${itemInSale.returnedEmpty ? 'transform translate-x-6' : ''}`}></div></div>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </GlassCard>

            {cart.length > 0 && (
                <div className="fixed bottom-20 md:relative md:bottom-auto md:mt-4 w-full md:w-auto left-0 md:left-auto px-4 md:px-0">
                    <GlassCard className="p-2 md:p-3 shadow-2xl">
                         <div className="flex justify-between items-center gap-4">
                            <div className="text-gray-800 dark:text-gray-100 flex-shrink min-w-0">
                                <span className="text-lg md:text-2xl font-bold">TOTAL: ₱{formatCurrency(finalTotal)}</span>
                            </div>
                            <button onClick={() => setPaymentModalOpen(true)} className="px-4 md:px-8 py-2 md:py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg text-sm md:text-lg flex-shrink-0">Checkout</button>
                        </div>
                    </GlassCard>
                </div>
            )}
            
            <Modal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Finalize Payment">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 border-b border-black/10 dark:border-white/10 pb-1">Order Summary</h4>
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 -mr-2 text-sm text-gray-700 dark:text-gray-300">
                            {cart.map(item => {
                                const product = products.find(p => p.id === item.productId);
                                
                                let savingsInfo = null;
                                if (product?.isBundle && product.bundleItems) {
                                    const regularPriceTotal = product.bundleItems.reduce((acc, bundleItem) => {
                                        const componentProduct = products.find(p => p.id === bundleItem.productId);
                                        if (componentProduct) {
                                            const componentPrice = priceType === PriceType.Retail ? componentProduct.price : componentProduct.wholesalePrice;
                                            return acc + (componentPrice * bundleItem.quantity);
                                        }
                                        return acc;
                                    }, 0) * item.qty;

                                    const bundlePriceTotal = item.qty * item.unitPrice;
                                    const savings = regularPriceTotal - bundlePriceTotal;

                                    if (savings > 0) {
                                        savingsInfo = { regularPriceTotal, savings };
                                    }
                                }

                                return (
                                    <div key={item.productId} className="py-1">
                                        <div className="flex justify-between">
                                            <span className="font-semibold">{item.qty}x {item.productName}</span>
                                            <span>₱{formatCurrency(item.qty * item.unitPrice)}</span>
                                        </div>
                                        
                                        {savingsInfo && (
                                            <div className="text-xs text-right pr-1">
                                                <span className="line-through text-gray-500 dark:text-gray-400">
                                                    ₱{formatCurrency(savingsInfo.regularPriceTotal)}
                                                </span>
                                                <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                                                    You Save ₱{formatCurrency(savingsInfo.savings)}
                                                </span>
                                            </div>
                                        )}
                                        
                                        {product?.isBundle && product.bundleItems && (
                                            <ul className="pl-5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {product.bundleItems.map(bundleItem => {
                                                    const componentProduct = products.find(p => p.id === bundleItem.productId);
                                                    return (
                                                        <li key={bundleItem.productId}>
                                                            - {bundleItem.quantity * item.qty}x {componentProduct?.name || 'Unknown Item'}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="text-center pt-2 border-t border-black/10 dark:border-white/10">
                        <p className="text-gray-700 dark:text-gray-400">Total Amount Due</p>
                        <p className="text-4xl font-bold text-blue-600 dark:text-blue-500">₱{formatCurrency(finalTotal)}</p>
                    </div>
                     <div className="text-center text-xs text-gray-700 dark:text-gray-400 grid grid-cols-2 gap-x-2">
                        <p>Subtotal: ₱{formatCurrency(subtotal)}</p>
                        <p>Deposits: ₱{formatCurrency(depositTotal)}</p>
                        <p>Discount: -₱{formatCurrency(discountAmount)}</p>
                        <p>Delivery: ₱{formatCurrency(parseFloat(deliveryFee))}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div>
                            <label className={commonLabelClasses}>Delivery Fee</label>
                            <input type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} placeholder="0.00" className={commonInputClasses} />
                        </div>
                        <div>
                            <label className={commonLabelClasses}>Discount</label>
                            <select value={discountType} onChange={e => setDiscountType(e.target.value as DiscountType)} className={commonSelectClasses}>
                                {Object.values(DiscountType).map(dt => <option key={dt} value={dt}>{dt}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {discountType === DiscountType.SeniorPWD && (
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg space-y-3">
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={commonLabelClasses}>Customer Name</label>
                                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Juan Dela Cruz" className={commonInputClasses} />
                                </div>
                                <div>
                                    <label className={commonLabelClasses}>Discount %</label>
                                    <select value={discountPercent} onChange={e => setDiscountPercent(parseInt(e.target.value))} className={commonSelectClasses}>
                                        {[5, 10, 15, 20].map(p => <option key={p} value={p}>{p}%</option>)}
                                    </select>
                                </div>
                             </div>
                             <div>
                                <label className={commonLabelClasses}>Customer ID Photo</label>
                                <PhotoInput
                                    photoUrl={customerIdPhoto}
                                    onPhotoSet={setCustomerIdPhoto}
                                    onPhotoRemove={() => setCustomerIdPhoto(null)}
                                />
                             </div>
                        </div>
                    )}

                    <div>
                        <label className={commonLabelClasses}>Payment Method</label>
                        <select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)} className={commonSelectClasses}>
                            {Object.values(PaymentType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                        </select>
                    </div>

                    {(paymentType === PaymentType.EWallet || paymentType === PaymentType.Bank) && (
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg space-y-3">
                            <div>
                                <label className={commonLabelClasses}>Reference Number</label>
                                <input type="text" value={paymentRefNo} onChange={e => setPaymentRefNo(e.target.value)} placeholder="e.g., G-12345678" className={commonInputClasses} />
                            </div>
                            <div>
                                <label className={commonLabelClasses}>Payment Proof Photo</label>
                                <PhotoInput
                                    photoUrl={paymentPhotoUrl}
                                    onPhotoSet={setPaymentPhotoUrl}
                                    onPhotoRemove={() => setPaymentPhotoUrl(null)}
                                />
                            </div>
                        </div>
                    )}

                    <button onClick={handleFinalizeSale} className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">
                        Confirm Sale
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isSortModalOpen} onClose={() => setSortModalOpen(false)} title="Sort Products">
                <div className="flex flex-col space-y-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.key}
                            onClick={() => {
                                setSortKey(option.key as any);
                                setSortModalOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                sortKey === option.key
                                    ? 'bg-blue-600 text-white font-semibold'
                                    : 'text-gray-700 dark:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </Modal>

            {lastSale && (
                <Modal isOpen={isReceiptModalOpen} onClose={() => setReceiptModalOpen(false)} title={`Receipt #${lastSale.id.slice(-6)}`}>
                    <div className="printable-area p-4 rounded-md">
                         <div className="text-center mb-4">
                            <h3 className="text-lg font-bold">{settings.shopName}</h3>
                            <p className="text-xs">Your friendly LPG provider</p>
                        </div>
                        <div className="text-xs mb-2">
                            <p><strong>Date:</strong> {new Date(lastSale.date).toLocaleString()}</p>
                            <p><strong>Cashier:</strong> {currentUser.name}</p>
                            {lastSale.discountInfo?.customerName && <p><strong>Customer:</strong> {lastSale.discountInfo.customerName}</p>}
                        </div>
                        <hr className="my-2" />
                        <div className="space-y-1 text-xs">
                            {lastSale.items.map(item => (
                                <div key={item.productId} className="receipt-item">
                                    <span>{item.qty}x {item.productName}</span>
                                    <span>₱{formatCurrency(item.qty * item.unitPrice)}</span>
                                </div>
                            ))}
                        </div>
                        <hr className="my-2" />
                        <div className="space-y-1 text-xs">
                             <div className="receipt-item"><span>Subtotal</span><span>₱{formatCurrency(lastSale.subtotal)}</span></div>
                             <div className="receipt-item"><span>Deposits</span><span>₱{formatCurrency(lastSale.depositTotal)}</span></div>
                             {lastSale.deliveryFee > 0 && <div className="receipt-item"><span>Delivery</span><span>₱{formatCurrency(lastSale.deliveryFee)}</span></div>}
                             {lastSale.discountAmount > 0 && <div className="receipt-item"><span>Discount ({lastSale.discountInfo?.percentage}%)</span><span>-₱{formatCurrency(lastSale.discountAmount)}</span></div>}
                             <div className="receipt-item total-row text-sm"><span>TOTAL</span><span>₱{formatCurrency(lastSale.total)}</span></div>
                        </div>
                        <div className="text-center mt-4 text-xs">
                            <p>Thank you!</p>
                        </div>
                    </div>
                     <div className="flex justify-end space-x-2 mt-4 non-printable">
                        <button onClick={() => setReceiptModalOpen(false)} className="px-4 py-2 bg-gray-500 text-gray-100 rounded-lg hover:bg-gray-600 transition text-sm font-semibold">Close</button>
                        <button onClick={handlePrintReceipt} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">Print</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default POSScreen;