
import React, { useState, useMemo, useEffect } from 'react';
import { StockBalance, Product, Location, StockReceive, StockTransfer, StockAdjustment, User, UserRole } from '../../types';
import GlassCard from '../GlassCard';
import Modal from '../Modal';

type ModalType = 'receive' | 'transfer' | 'adjust' | null;
type SortKey = 'productName' | 'locationName' | 'fullQty' | 'emptyQty';

interface InventoryScreenProps {
    stock: StockBalance[];
    products: Product[];
    locations: Location[];
    onReceiveStock: (data: Omit<StockReceive, 'id' | 'date' | 'userId'>) => void;
    onTransferStock: (data: Omit<StockTransfer, 'id' | 'date' | 'userId'>) => void;
    onAdjustStock: (data: Omit<StockAdjustment, 'id' | 'date' | 'userId' | 'oldFullQty' | 'oldEmptyQty'>) => void;
    currentUser: User;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ stock, products, locations, onReceiveStock, onTransferStock, onAdjustStock, currentUser }) => {
    const [modal, setModal] = useState<ModalType>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'productName', direction: 'asc' });
    
    const assignedLocationId = (currentUser.role === UserRole.Staff || currentUser.role === UserRole.Admin) ? currentUser.locationId : null;

    // Form state
    const [productId, setProductId] = useState(products[0]?.id || '');
    const [locationId, setLocationId] = useState(assignedLocationId || locations[0]?.id || '');
    const [fromLocationId, setFromLocationId] = useState(assignedLocationId || locations[0]?.id || '');
    const [toLocationId, setToLocationId] = useState(locations.find(l => l.id !== fromLocationId)?.id || '');
    const [quantity, setQuantity] = useState(1);
    const [newFullQty, setNewFullQty] = useState(0);
    const [newEmptyQty, setNewEmptyQty] = useState(0);
    const [reason, setReason] = useState('');

    const getProduct = (id: string) => products.find(p => p.id === id);
    const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || 'Unknown';
    
    useEffect(() => {
        if (modal === 'adjust') {
            const selectedStock = stock.find(s => s.locationId === locationId && s.productId === productId);
            if (selectedStock) {
                setNewFullQty(selectedStock.fullQty);
                setNewEmptyQty(selectedStock.emptyQty);
            } else {
                setNewFullQty(0);
                setNewEmptyQty(0);
            }
            setReason('');
        }
    }, [modal, productId, locationId, stock]);


    const sortedStock = useMemo(() => {
        let sortableItems = [...stock];
        sortableItems.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortConfig.key) {
                case 'productName':
                    aValue = getProduct(a.productId)?.name || '';
                    bValue = getProduct(b.productId)?.name || '';
                    break;
                case 'locationName':
                    aValue = getLocationName(a.locationId);
                    bValue = getLocationName(b.locationId);
                    break;
                default:
                    aValue = a[sortConfig.key];
                    bValue = b[sortConfig.key];
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
        return sortableItems;
    }, [stock, products, locations, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: SortKey) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };


    const resetForm = () => {
        setProductId(products[0]?.id || '');
        setLocationId(assignedLocationId || locations[0]?.id || '');
        setFromLocationId(assignedLocationId || locations[0]?.id || '');
        setToLocationId(locations.find(l => l.id !== (assignedLocationId || locations[0]?.id))?.id || '');
        setQuantity(1);
        setNewFullQty(0);
        setNewEmptyQty(0);
        setReason('');
    };
    
    const handleOpenModal = (type: ModalType) => {
        resetForm();
        setModal(type);
    };

    const handleCloseModal = () => {
        setModal(null);
    };

    const handleSubmit = () => {
        if (!modal) return;
        switch(modal) {
            case 'receive':
                onReceiveStock({ locationId, productId, qty: quantity });
                break;
            case 'transfer':
                if (fromLocationId === toLocationId) {
                    alert("Source and destination locations cannot be the same.");
                    return;
                }
                const sourceStock = stock.find(s => s.locationId === fromLocationId && s.productId === productId);
                if (!sourceStock || sourceStock.fullQty < quantity) {
                    alert("Not enough stock at the source location.");
                    return;
                }
                onTransferStock({ fromLocationId, toLocationId, productId, qty: quantity });
                break;
            case 'adjust':
                 onAdjustStock({ locationId, productId, newFullQty, newEmptyQty, reason });
                break;
        }
        handleCloseModal();
    };

    const renderModalContent = () => {
        const titleMap = { receive: 'Receive Stock', transfer: 'Transfer Stock', adjust: 'Adjust Stock' };
        if (!modal) return null;

        const commonSelectClasses = "w-full bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 pl-3 pr-10 py-2 disabled:opacity-70";
        const commonInputClasses = "w-full bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20";
        const commonLabelClasses = "block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1";
        
        const isAdjustConfirmDisabled = modal === 'adjust' && !reason.trim();


        return (
            <Modal isOpen={!!modal} onClose={handleCloseModal} title={titleMap[modal]}>
                <div className="space-y-4">
                    {/* Common Fields */}
                    <div>
                        <label className={commonLabelClasses}>Product</label>
                        <select value={productId} onChange={e => setProductId(e.target.value)} className={commonSelectClasses}>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>

                    {/* Modal Specific Fields */}
                    {modal === 'receive' && (
                        <>
                            <div>
                                <label className={commonLabelClasses}>Location</label>
                                <select value={locationId} onChange={e => setLocationId(e.target.value)} className={commonSelectClasses} disabled={!!assignedLocationId}>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={commonLabelClasses}>Quantity Received</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className={commonInputClasses} />
                            </div>
                        </>
                    )}

                    {modal === 'transfer' && (
                         <>
                            <div>
                                <label className={commonLabelClasses}>From Location</label>
                                <select value={fromLocationId} onChange={e => setFromLocationId(e.target.value)} className={commonSelectClasses} disabled={!!assignedLocationId}>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={commonLabelClasses}>To Location</label>
                                <select value={toLocationId} onChange={e => setToLocationId(e.target.value)} className={commonSelectClasses}>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={commonLabelClasses}>Quantity to Transfer</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className={commonInputClasses} />
                            </div>
                        </>
                    )}
                    
                    {modal === 'adjust' && (
                        <>
                             <div>
                                <label className={commonLabelClasses}>Location</label>
                                <select value={locationId} onChange={e => setLocationId(e.target.value)} className={commonSelectClasses} disabled={!!assignedLocationId}>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={commonLabelClasses}>New Full Qty</label>
                                    <input type="number" value={newFullQty} onChange={e => setNewFullQty(Math.max(0, parseInt(e.target.value)) || 0)} className={commonInputClasses} />
                                </div>
                                <div>
                                    <label className={commonLabelClasses}>New Empty Qty</label>
                                    <input type="number" value={newEmptyQty} onChange={e => setNewEmptyQty(Math.max(0, parseInt(e.target.value)) || 0)} className={commonInputClasses} />
                                </div>
                            </div>
                            <div>
                                <label className={commonLabelClasses}>Reason for Adjustment</label>
                                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className={commonInputClasses} placeholder="Required: e.g., Cycle count correction, damaged goods"></textarea>
                            </div>
                        </>
                    )}

                    {/* Submit Button */}
                    <button 
                        onClick={handleSubmit} 
                        disabled={isAdjustConfirmDisabled}
                        className={`w-full py-3 bg-blue-600 text-white font-bold rounded-lg transition mt-4 ${isAdjustConfirmDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    >
                        Confirm
                    </button>
                </div>
            </Modal>
        )
    };
    
    const ThSortable: React.FC<{ sortKey: SortKey, children: React.ReactNode, className?: string }> = ({ sortKey, children, className }) => (
        <div className={`px-6 py-3 cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
            {children} <span className="text-xs">{getSortIndicator(sortKey)}</span>
        </div>
    );

    return (
        <>
        <GlassCard className="p-4 md:p-6 h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="hidden md:block text-2xl font-bold text-gray-800 dark:text-gray-100">Inventory Status</h2>
                <div className="flex w-full md:w-auto gap-2">
                    <button onClick={() => handleOpenModal('receive')} className="flex-1 md:flex-initial text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold">Receive Stock</button>
                    <button onClick={() => handleOpenModal('transfer')} className="flex-1 md:flex-initial text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">Transfer Stock</button>
                    <button onClick={() => handleOpenModal('adjust')} className="flex-1 md:flex-initial text-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-semibold">Adjust Stock</button>
                </div>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-4 gap-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl text-xs text-gray-500 dark:text-gray-400 uppercase rounded-t-lg border-b border-black/10 dark:border-white/15">
                <ThSortable sortKey="productName" className="rounded-l-lg">Product</ThSortable>
                <ThSortable sortKey="locationName">Location</ThSortable>
                <ThSortable sortKey="fullQty" className="text-center">Full Qty</ThSortable>
                <ThSortable sortKey="emptyQty" className="text-center rounded-r-lg">Empty Qty</ThSortable>
            </div>
            
            {/* Mobile Cards / Desktop Rows */}
            <div className="space-y-4 md:space-y-0">
                {sortedStock.map((item) => {
                    const product = getProduct(item.productId);
                    const qty = item.fullQty;
                    let qtyColor = 'text-green-600 dark:text-green-400';
                    if (qty <= 0) {
                        qtyColor = 'text-red-600 dark:text-red-400';
                    } else if (product && qty <= product.lowStockThreshold) {
                        qtyColor = 'text-orange-600 dark:text-orange-400';
                    }

                    return (
                        <div key={item.id} className="block p-4 rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10 md:grid md:grid-cols-4 md:gap-4 md:p-0 md:bg-transparent md:backdrop-blur-none md:border-0 md:rounded-none md:border-b border-black/10 dark:border-white/10 text-sm">
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-base text-gray-900 dark:text-gray-100">{product?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{getLocationName(item.locationId)}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <div className={`font-bold text-base ${qtyColor}`}>
                                            {item.fullQty} <span className="text-xs text-gray-500 dark:text-gray-400">Full</span>
                                        </div>
                                        <div className="font-semibold text-sm text-orange-600 dark:text-orange-400">
                                            {item.emptyQty} <span className="text-xs text-gray-500 dark:text-gray-400">Empty</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Desktop Table Row View */}
                            <div className="hidden md:flex items-center px-6 py-4 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                {product?.name || 'Unknown'}
                            </div>
                            <div className="hidden md:flex items-center px-6 py-4 text-gray-700 dark:text-gray-300">
                                {getLocationName(item.locationId)}
                            </div>
                            <td className={`hidden md:flex items-center justify-center px-6 py-4 text-center font-bold ${qtyColor}`}>
                                {item.fullQty}
                            </td>
                            <td className="hidden md:flex items-center justify-center px-6 py-4 text-center text-orange-600 dark:text-orange-400">
                                {item.emptyQty}
                            </td>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
        {renderModalContent()}
        </>
    );
};

export default InventoryScreen;
