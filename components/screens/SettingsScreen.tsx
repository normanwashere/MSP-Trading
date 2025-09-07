

import React, { useState, useEffect, useMemo } from 'react';
import { SettingsData, Product, Location, User, ProductType, LocationType, UserRole } from '../../types';
import GlassCard from '../GlassCard';
import Modal from '../Modal';
import { formatCurrency } from '../../constants';

interface SettingsScreenProps {
    settings: SettingsData;
    onUpdateSettings: (settings: SettingsData) => void;
    products: Product[];
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (id: string) => void;
    locations: Location[];
    onAddLocation: (location: Omit<Location, 'id'>) => void;
    onUpdateLocation: (location: Location) => void;
    onDeleteLocation: (id: string) => void;
    users: User[];
    onAddUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (id: string) => void;
    currentUser: User;
    onChangePassword: (userId: string, oldPass: string, newPass: string) => boolean;
}

type ModalType = 'products' | 'locations' | 'users' | null;

const ChangePasswordForm: React.FC<{
    currentUser: User;
    onChangePassword: (userId: string, oldPass: string, newPass: string) => boolean;
}> = ({ currentUser, onChangePassword }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
            return;
        }
        const success = onChangePassword(currentUser.id, oldPassword, newPassword);
        if (success) {
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setMessage({ type: 'error', text: 'Incorrect current password.' });
        }
    };

    return (
        <GlassCard className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Change Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Current Password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                <InputField label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                <InputField label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                
                {message && (
                    <div className={`text-sm p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'}`}>
                        {message.text}
                    </div>
                )}
                
                <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                    Update Password
                </button>
            </form>
        </GlassCard>
    );
};


const SettingsScreen: React.FC<SettingsScreenProps> = (props) => {
    const { currentUser, onChangePassword } = props;

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [isFormVisible, setFormVisible] = useState(false);
    const [currentSettings, setCurrentSettings] = useState<SettingsData>(props.settings);
    const [currentItem, setCurrentItem] = useState<Product | Location | User | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [formData, setFormData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setCurrentSettings(props.settings);
    }, [props.settings]);
    
    useEffect(() => {
        if (isFormVisible) {
            setFormData(currentItem || {});
        } else {
            setFormData(null);
        }
    }, [currentItem, isFormVisible]);

    const sortedModalData = useMemo(() => {
        let data: (Product | Location | User)[] = [];
        switch(activeModal) {
            case 'products': data = props.products; break;
            case 'locations': data = props.locations; break;
            case 'users': data = props.users; break;
            default: return [];
        }

        if (searchQuery.trim() !== '') {
            const lowercasedQuery = searchQuery.trim().toLowerCase();
            if (activeModal === 'products') {
                 data = data.filter(p => (p as Product).name.toLowerCase().includes(lowercasedQuery));
            } else if (activeModal === 'locations') {
                 data = data.filter(l => (l as Location).name.toLowerCase().includes(lowercasedQuery));
            } else if (activeModal === 'users') {
                 data = data.filter(u => (u as User).name.toLowerCase().includes(lowercasedQuery));
            }
        }
        
        const sortableItems = [...data];
        if (sortConfig) {
            sortableItems.sort((a, b) => {
                let aValue: any, bValue: any;

                if (activeModal === 'users' && sortConfig.key === 'locationId') {
                    const findLocName = (id: string | undefined) => props.locations.find(l => l.id === id)?.name || '';
                    aValue = findLocName((a as User).locationId);
                    bValue = findLocName((b as User).locationId);
                } else {
                    aValue = a[sortConfig.key as keyof typeof a];
                    bValue = b[sortConfig.key as keyof typeof b];
                }
                
                const directionMultiplier = sortConfig.direction === 'asc' ? 1 : -1;

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return aValue.localeCompare(bValue) * directionMultiplier;
                }

                if (aValue < bValue) return -1 * directionMultiplier;
                if (aValue > bValue) return 1 * directionMultiplier;
                return 0;
            });
        }
        return sortableItems;
    }, [activeModal, props.products, props.locations, props.users, sortConfig, searchQuery]);


    const handleSettingsChange = (field: keyof SettingsData, value: string | number) => {
        setCurrentSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveSettings = () => {
        props.onUpdateSettings(currentSettings);
    };

    const handleOpenModal = (type: ModalType) => {
        setActiveModal(type);
        setFormVisible(false);
        setCurrentItem(null);
        setSortConfig(null);
        setSearchQuery('');
    };

    const handleCloseModal = () => {
        setActiveModal(null);
    };

    const handleEditItem = (item: Product | Location | User) => {
        setCurrentItem(item);
        setFormVisible(true);
    };

    const handleAddNew = () => {
        setCurrentItem(null);
        setFormVisible(true);
    };

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? '▲' : '▼';
    };

    const handleFormChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleBundleItemsChange = (newBundleItems: any) => {
        const totalDeposit = newBundleItems.reduce((acc: number, item: { productId: string, quantity: number }) => {
            const product = props.products.find(p => p.id === item.productId);
            return acc + (product ? product.depositAmt * item.quantity : 0);
        }, 0);

        setFormData((prev: any) => ({
            ...prev,
            bundleItems: newBundleItems,
            depositAmt: totalDeposit
        }));
    };
    
    const handleFormSave = () => {
        if (currentItem) { // Update
             if (activeModal === 'products') props.onUpdateProduct(formData as Product);
             else if (activeModal === 'locations') props.onUpdateLocation(formData as Location);
             else if (activeModal === 'users') props.onUpdateUser(formData as User);
        } else { // Add
             if (activeModal === 'products') props.onAddProduct(formData as Omit<Product, 'id'>);
             else if (activeModal === 'locations') props.onAddLocation(formData as Omit<Location, 'id'>);
             else if (activeModal === 'users') props.onAddUser(formData as Omit<User, 'id'>);
        }
        setFormVisible(false);
        setCurrentItem(null);
    };

    const handleFormDelete = () => {
        if (currentItem && window.confirm("Are you sure you want to delete this item?")) {
             if (activeModal === 'products') props.onDeleteProduct(currentItem.id);
             if (activeModal === 'locations') props.onDeleteLocation(currentItem.id);
             if (activeModal === 'users') props.onDeleteUser(currentItem.id);
             setFormVisible(false);
             setCurrentItem(null);
        }
    };

    const renderForm = () => {
        if (!activeModal || !formData) return null;

        const renderProductForm = () => (
            <>
                <InputField label="Name" value={formData.name || ''} onChange={e => handleFormChange('name', e.target.value)} />
                
                <div className="flex items-center justify-between py-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Is this a bundle?</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={!!formData.isBundle} onChange={e => handleFormChange('isBundle', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {formData.isBundle ? (
                    <>
                        <InputField label="Bundle Price" type="number" value={formData.price || ''} onChange={e => handleFormChange('price', parseFloat(e.target.value) || 0)} />
                        <InputField label="Wholesale Price" type="number" value={formData.wholesalePrice || ''} onChange={e => handleFormChange('wholesalePrice', parseFloat(e.target.value) || 0)} />
                        <InputField label="Deposit (auto-calculated)" type="number" value={formData.depositAmt || 0} disabled />
                        <InputField label="Low Stock Threshold" type="number" value={formData.lowStockThreshold || ''} onChange={e => handleFormChange('lowStockThreshold', parseInt(e.target.value, 10) || 0)} />
                         
                         <div className="mt-4">
                             <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Bundle Items</label>
                             <div className="space-y-2">
                                {(formData.bundleItems || []).map((item: {productId: string, quantity: number}, index: number) => {
                                    const productName = props.products.find(p => p.id === item.productId)?.name || 'Unknown Product';
                                    return (
                                        <div key={index} className="flex items-center justify-between p-2 bg-black/5 dark:bg-white/5 rounded-md">
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={item.quantity} onChange={(e) => {
                                                    const newQty = parseInt(e.target.value) || 1;
                                                    const newItems = [...(formData.bundleItems || [])];
                                                    newItems[index].quantity = newQty;
                                                    handleBundleItemsChange(newItems);
                                                }} className="w-16 bg-white dark:bg-gray-800 rounded p-1 text-center" />
                                                <span>x {productName}</span>
                                            </div>
                                            <button onClick={() => {
                                                const newItems = [...(formData.bundleItems || [])];
                                                newItems.splice(index, 1);
                                                handleBundleItemsChange(newItems);
                                            }} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                                        </div>
                                    )
                                })}
                             </div>
                             <select 
                                 className="w-full mt-2 bg-gray-200 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 pl-3 pr-10 py-2"
                                 onChange={e => {
                                    if(e.target.value) {
                                        const newItems = [...(formData.bundleItems || []), { productId: e.target.value, quantity: 1 }];
                                        handleBundleItemsChange(newItems);
                                    }
                                 }}
                                 value=""
                             >
                                <option value="" disabled>-- Add an item to the bundle --</option>
                                {props.products.filter(p => !p.isBundle).map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                             </select>
                         </div>
                    </>
                ) : (
                    <>
                        <SelectField label="Type" value={formData.type || ProductType.LPG} onChange={e => handleFormChange('type', e.target.value)} options={Object.values(ProductType)} />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Retail Price" type="number" value={formData.price || ''} onChange={e => handleFormChange('price', parseFloat(e.target.value) || 0)} />
                            <InputField label="Wholesale Price" type="number" value={formData.wholesalePrice || ''} onChange={e => handleFormChange('wholesalePrice', parseFloat(e.target.value) || 0)} />
                        </div>
                        <InputField label="Deposit Amount" type="number" value={formData.depositAmt || ''} onChange={e => handleFormChange('depositAmt', parseFloat(e.target.value) || 0)} />
                        <InputField label="Size (kg)" type="number" value={formData.sizeKg || ''} onChange={e => handleFormChange('sizeKg', e.target.value ? parseFloat(e.target.value) : null)} />
                        <InputField label="Low Stock Threshold" type="number" value={formData.lowStockThreshold || ''} onChange={e => handleFormChange('lowStockThreshold', parseInt(e.target.value, 10) || 0)} />
                    </>
                )}
            </>
        );

        const renderLocationForm = () => (
            <>
                <InputField label="Name" value={formData.name || ''} onChange={e => handleFormChange('name', e.target.value)} />
                <SelectField label="Type" value={formData.type || LocationType.Main} onChange={e => handleFormChange('type', e.target.value)} options={Object.values(LocationType)} />
                <InputField label="Address" value={formData.address || ''} onChange={e => handleFormChange('address', e.target.value)} />
                <InputField label="Contact Number (Optional)" value={formData.contactNumber || ''} onChange={e => handleFormChange('contactNumber', e.target.value)} />
            </>
        );

        const renderUserForm = () => (
            <>
                <InputField label="Name" value={formData.name || ''} onChange={e => handleFormChange('name', e.target.value)} />
                <InputField label="Email" type="email" value={formData.email || ''} onChange={e => handleFormChange('email', e.target.value)} required />
                
                {currentItem && (
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Password</label>
                        <button
                            type="button"
                            onClick={() => alert(`A password reset link has been sent to ${formData.email}.`)}
                            className="w-full text-center px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500 transition text-sm font-semibold"
                        >
                            Send Password Reset
                        </button>
                    </div>
                )}
                
                <SelectField label="Role" value={formData.role || UserRole.Staff} onChange={e => handleFormChange('role', e.target.value)} options={Object.values(UserRole)} />
                {(formData.role === UserRole.Admin || formData.role === UserRole.Staff) && (
                    <SelectField
                        label="Assigned Location"
                        value={formData.locationId || ''}
                        onChange={e => handleFormChange('locationId', e.target.value)}
                        options={props.locations.map(l => l.id)}
                        optionLabels={props.locations.map(l => l.name)}
                    />
                )}
            </>
        );
        const titleMap = { products: 'Product', locations: 'Location', users: 'User' };

        return (
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{currentItem ? 'Edit' : 'Add'} {activeModal && titleMap[activeModal]}</h3>
                {activeModal === 'products' && renderProductForm()}
                {activeModal === 'locations' && renderLocationForm()}
                {activeModal === 'users' && renderUserForm()}
                <div className="flex justify-between items-center pt-4">
                    {currentItem && (
                        <button onClick={handleFormDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold">Delete</button>
                    )}
                    <div className="flex-grow" />
                    <button onClick={handleFormSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">Save Changes</button>
                </div>
            </div>
        );
    };

    const renderModalContent = () => {
        if (!activeModal) return null;

        const renderProductList = () => (
             <div className="flex flex-col h-full">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20 placeholder:text-gray-500"
                    />
                </div>
                <div className="overflow-auto space-y-3 max-h-[55vh] pr-2 -mr-2">
                    {sortedModalData.map((item) => {
                        const p = item as Product;
                        return (
                            <div key={p.id} className="p-3 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-lg text-sm">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 pr-4">{p.name}</h4>
                                    <button onClick={() => handleEditItem(p)} className="flex-shrink-0 text-xs font-semibold px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-full">Edit</button>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2 pt-2 border-t border-black/5 dark:border-white/10">
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Retail</div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">₱{formatCurrency(p.price)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Wholesale</div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">₱{formatCurrency(p.wholesalePrice)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Deposit</div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200">₱{formatCurrency(p.depositAmt)}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );

         const renderLocationList = () => (
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20 placeholder:text-gray-500"
                    />
                </div>
                <div className="overflow-auto space-y-3 max-h-[55vh] pr-2 -mr-2">
                    {sortedModalData.map((item) => {
                        const l = item as Location;
                        return (
                             <div key={l.id} className="p-3 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-lg text-sm">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 pr-4">{l.name}</h4>
                                    <button onClick={() => handleEditItem(l)} className="flex-shrink-0 text-xs font-semibold px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-full">Edit</button>
                                </div>
                                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10 space-y-1.5 text-xs text-gray-800 dark:text-gray-200">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Type: </span>
                                        <span className="font-medium">{l.type}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Address: </span>
                                        <span className="font-medium">{l.address}</span>
                                    </div>
                                    {l.contactNumber && (
                                         <div>
                                            <span className="text-gray-500 dark:text-gray-400">Contact: </span>
                                            <span className="font-medium">{l.contactNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        );

        const renderUserList = () => (
             <div className="flex flex-col h-full">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-200 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20 placeholder:text-gray-500"
                    />
                </div>
                <div className="overflow-auto space-y-3 max-h-[55vh] pr-2 -mr-2">
                    {sortedModalData.map((item) => {
                        const u = item as User;
                        const locationName = u.locationId ? props.locations.find(l => l.id === u.locationId)?.name : '-';
                        return (
                            <div key={u.id} className="p-3 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-lg text-sm">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-blue-600 dark:text-blue-400 pr-4">{u.name}</h4>
                                    <button onClick={() => handleEditItem(u)} className="flex-shrink-0 text-xs font-semibold px-3 py-1 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-full">Edit</button>
                                </div>
                                <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10 space-y-1.5 text-xs text-gray-800 dark:text-gray-200">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Email: </span>
                                        <span className="font-medium">{u.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Role: </span>
                                        <span className="font-medium">{u.role}</span>
                                    </div>
                                     <div>
                                        <span className="text-gray-500 dark:text-gray-400">Location: </span>
                                        <span className="font-medium">{locationName}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );

        const renderContent = () => {
            if (isFormVisible) return renderForm();
            switch(activeModal) {
                case 'products': return renderProductList();
                case 'locations': return renderLocationList();
                case 'users': return renderUserList();
                default: return null;
            }
        };

        const titleMap = { products: 'Products', locations: 'Locations', users: 'Users' };

        return (
            <>
                {renderContent()}
                <div className="flex justify-between items-center mt-6">
                    <button onClick={() => setFormVisible(false)} className={`px-4 py-2 bg-gray-500 text-gray-100 rounded-lg hover:bg-gray-600 transition text-sm font-semibold ${!isFormVisible && 'invisible'}`}>
                        Back to List
                    </button>
                    {!isFormVisible && (
                        <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                            Add New {titleMap[activeModal]}
                        </button>
                    )}
                </div>
            </>
        )
    };
    
    const titleMap = { products: 'Manage Products', locations: 'Manage Locations', users: 'Manage Users' };

    // Main component render
    if (currentUser.role === UserRole.Admin || currentUser.role === UserRole.Staff) {
        return <ChangePasswordForm currentUser={currentUser} onChangePassword={onChangePassword} />;
    }

    return (
        <>
            <GlassCard className="p-6">
                <h2 className="hidden md:block text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>
                <div className="space-y-8">
                    {/* Business Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-2">Business Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Shop Name</label>
                                <input type="text" value={currentSettings.shopName} onChange={e => handleSettingsChange('shopName', e.target.value)} onBlur={handleSaveSettings} className="w-full mt-1 bg-black/5 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20"/>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Tax Rate (%)</label>
                                <input type="number" value={currentSettings.taxRate} onChange={e => handleSettingsChange('taxRate', parseFloat(e.target.value) || 0)} onBlur={handleSaveSettings} className="w-full mt-1 bg-black/5 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20"/>
                            </div>
                        </div>
                    </div>
                    {/* Management Sections */}
                    <SettingsSection title="Products & Pricing" description="Manage products, retail/wholesale prices, and deposit amounts." onManageClick={() => handleOpenModal('products')} />
                    <SettingsSection title="Locations" description="Add or edit stores, warehouses, or trucks." onManageClick={() => handleOpenModal('locations')} />
                    <SettingsSection title="Users" description="Manage staff and owner accounts." onManageClick={() => handleOpenModal('users')} />
                    <ChangePasswordForm currentUser={currentUser} onChangePassword={onChangePassword} />
                </div>
            </GlassCard>
            <Modal isOpen={!!activeModal} onClose={handleCloseModal} title={activeModal ? titleMap[activeModal] : ''}>
                {renderModalContent()}
            </Modal>
        </>
    );
};

// Helper Components for Settings Screen
const SettingsSection: React.FC<{title: string; description: string; onManageClick: () => void;}> = ({title, description, onManageClick}) => (
    <div>
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-1">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
        <button onClick={onManageClick} className="mt-3 px-4 py-2 bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition text-sm font-semibold border border-black/10 dark:border-white/20">
            Manage {title.split('&')[0].trim()}
        </button>
    </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <input {...props} className="w-full bg-gray-200 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20" />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[]; optionLabels?: string[] }> = ({ label, options, optionLabels, ...props }) => (
     <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
        <select {...props} className="w-full bg-gray-200 dark:bg-black/20 text-gray-800 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 pl-3 pr-10 py-2">
            {options.map((o, i) => <option key={o} value={o}>{optionLabels ? optionLabels[i] : o}</option>)}
        </select>
    </div>
);


export default SettingsScreen;