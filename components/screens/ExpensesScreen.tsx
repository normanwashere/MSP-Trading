
import React, { useState, useEffect, useMemo } from 'react';
import { Expense, User, UserRole, Location } from '../../types';
import GlassCard from '../GlassCard';
import Modal from '../Modal';
import { formatCurrency } from '../../constants';

interface ExpensesScreenProps {
    expenses: Expense[];
    onAddExpense: (newExpense: Omit<Expense, 'id' | 'date' | 'userId'>) => void;
    onUpdateExpense: (updatedExpense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    currentUser: User;
    locations: Location[];
    users: User[];
}

type SortKey = keyof Expense | 'userName';

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense, currentUser, locations, users }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
    const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

    const assignedLocationId = (currentUser.role === UserRole.Staff || currentUser.role === UserRole.Admin) ? currentUser.locationId : null;
    
    // Permission checks
    const canDelete = currentUser.role === UserRole.Superadmin || currentUser.role === UserRole.Admin;
    const canEdit = currentUser.role === UserRole.Superadmin || currentUser.role === UserRole.Admin;


    // Form state
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Fuel');
    const [note, setNote] = useState('');
    const [locationId, setLocationId] = useState(assignedLocationId || locations[0]?.id || '');
    const [photo, setPhoto] = useState<string | null>(null);
    
    const userMap = useMemo(() => new Map(users.map(user => [user.id, user.name])), [users]);
    const getUserName = (userId: string) => userMap.get(userId) || userId;

    const sortedExpenses = useMemo(() => {
        let sortableItems = [...expenses];
        sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'userName') {
                aValue = getUserName(a.userId);
                bValue = getUserName(b.userId);
            } else {
                const key = sortConfig.key as keyof Expense;
                aValue = a[key];
                bValue = b[key];
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
    }, [expenses, sortConfig, users]);

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

    useEffect(() => {
        if (editingExpense) {
            setAmount(editingExpense.amount.toString());
            setCategory(editingExpense.category);
            setNote(editingExpense.note || '');
            setLocationId(editingExpense.locationId);
            setPhoto(editingExpense.photoDataUrl || null);
        }
    }, [editingExpense]);

    const handleOpenAddModal = () => {
        setEditingExpense(null);
        setAmount('');
        setCategory('Fuel');
        setNote('');
        setLocationId(assignedLocationId || locations[0]?.id || '');
        setPhoto(null);
        setModalOpen(true);
    };
    
    const handleOpenEditModal = (expense: Expense) => {
        setEditingExpense(expense);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingExpense(null); // Clear editing state on close
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPhoto(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!amount || !category) return;
        const expenseData = {
            amount: parseFloat(amount),
            category,
            note,
            locationId,
            photoDataUrl: photo,
        };

        if (editingExpense) {
            onUpdateExpense({ ...editingExpense, ...expenseData });
        } else {
            onAddExpense(expenseData);
        }
        handleCloseModal();
    };

    const handleDelete = () => {
        if (editingExpense && window.confirm('Are you sure you want to delete this expense?')) {
            onDeleteExpense(editingExpense.id);
            handleCloseModal();
        }
    };

    const commonSelectClasses = "w-full bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-md border border-gray-900/10 dark:border-white/20 pl-3 pr-10 py-2 disabled:opacity-70";
    const commonInputClasses = "w-full bg-gray-200 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-900/10 dark:border-white/20 placeholder:text-gray-500";
    const commonLabelClasses = "block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1";

    const ThSortable: React.FC<{ sortKey: SortKey, children: React.ReactNode, className?: string }> = ({ sortKey, children, className }) => (
        <div className={`px-6 py-3 cursor-pointer ${className}`} onClick={() => requestSort(sortKey)}>
            {children} <span className="text-xs">{getSortIndicator(sortKey)}</span>
        </div>
    );

    return (
        <>
            <GlassCard className="p-4 md:p-6 h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex justify-end md:justify-between items-center mb-6">
                    <h2 className="hidden md:block text-2xl font-bold text-gray-800 dark:text-gray-100">Expense Log</h2>
                    <button onClick={handleOpenAddModal} className="hidden md:inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                        Add Expense
                    </button>
                </div>
                
                {/* Desktop Header */}
                <div className="hidden md:grid grid-cols-6 gap-4 bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl text-xs text-gray-500 dark:text-gray-400 uppercase rounded-t-lg border-b border-black/10 dark:border-white/15">
                    <ThSortable sortKey="date" className="rounded-l-lg">Date</ThSortable>
                    <ThSortable sortKey="category">Category</ThSortable>
                    <ThSortable sortKey="amount" className="text-right">Amount</ThSortable>
                    <ThSortable sortKey="userName">User</ThSortable>
                    <div className="px-6 py-3">Receipt</div>
                    <div className="px-6 py-3 rounded-r-lg">Actions</div>
                </div>
                
                {/* Mobile Cards / Desktop Rows */}
                <div className="space-y-4 md:space-y-0">
                    {sortedExpenses.map((expense) => (
                        <React.Fragment key={expense.id}>
                             <div 
                                onClick={() => {
                                    if (expense.note) {
                                        setExpandedExpenseId(prevId => prevId === expense.id ? null : expense.id);
                                    }
                                }}
                                className={`
                                    block p-4 rounded-xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-black/5 dark:border-white/10
                                    md:grid md:grid-cols-6 md:gap-4 md:p-0 md:bg-transparent md:backdrop-blur-none md:border-0 md:rounded-none 
                                    md:border-b border-black/10 dark:border-white/10
                                    text-sm text-gray-700 dark:text-gray-300
                                    ${expense.note ? 'cursor-pointer' : ''}
                                `}
                            >
                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-base text-gray-900 dark:text-gray-100">{expense.category}</span>
                                        <span className="font-bold text-base text-orange-600 dark:text-orange-400">₱{formatCurrency(expense.amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>{expense.date.toLocaleDateString()}</span>
                                        <span>by {getUserName(expense.userId)}</span>
                                    </div>
                                    <div className="flex items-center justify-end space-x-4 pt-2">
                                        {expense.photoDataUrl && (
                                            <button onClick={(e) => { e.stopPropagation(); setViewingPhoto(expense.photoDataUrl!); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">View Receipt</button>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(expense); }} className="px-4 py-1.5 bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">Edit</button>
                                    </div>
                                </div>

                                {/* Desktop Table Row View */}
                                <div className="hidden md:flex items-center px-6 py-4 whitespace-nowrap">{expense.date.toLocaleDateString()}</div>
                                <div className="hidden md:flex items-center px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{expense.category}</div>
                                <div className="hidden md:flex items-center justify-end px-6 py-4 text-right font-semibold text-orange-600 dark:text-orange-400">₱{formatCurrency(expense.amount)}</div>
                                <div className="hidden md:flex items-center px-6 py-4">{getUserName(expense.userId)}</div>
                                <div className="hidden md:flex items-center px-6 py-4">
                                    {expense.photoDataUrl && (
                                        <button onClick={(e) => { e.stopPropagation(); setViewingPhoto(expense.photoDataUrl!); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">View</button>
                                    )}
                                </div>
                                <div className="hidden md:flex items-center px-6 py-4">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenEditModal(expense); }} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                                </div>
                            </div>
                             {expandedExpenseId === expense.id && (
                                 <div className="md:border-b border-black/10 dark:border-white/10">
                                    <div className="p-4 text-sm text-gray-600 dark:text-gray-400 bg-white/5 dark:bg-gray-900/5 backdrop-blur-2xl">
                                        <div className="pl-3 border-l-2 border-blue-500">
                                            <strong>Note:</strong> {expense.note}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </GlassCard>

            <button
                onClick={handleOpenAddModal}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent dark:focus:ring-blue-500 dark:focus:ring-offset-gray-800 z-20"
                aria-label="Add new expense"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingExpense ? "Edit Expense" : "Add New Expense"}>
                <div className="space-y-4">
                    <div>
                        <label className={commonLabelClasses}>Amount</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={commonInputClasses} />
                    </div>
                    <div>
                        <label className={commonLabelClasses}>Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className={commonSelectClasses}>
                            {['Fuel', 'Freight', 'Refilling', 'Rent', 'Utilities', 'Salaries', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={commonLabelClasses}>Location</label>
                         <select value={locationId} onChange={e => setLocationId(e.target.value)} className={commonSelectClasses} disabled={!!assignedLocationId}>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={commonLabelClasses}>Note (Optional)</label>
                        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className={commonInputClasses}></textarea>
                    </div>
                     <div>
                        <label className={commonLabelClasses}>Receipt Photo</label>
                         {photo ? (
                            <div className="mt-2 flex items-center space-x-4">
                                <img src={photo} alt="Receipt preview" className="h-20 w-20 object-cover rounded-md border border-gray-900/10 dark:border-white/20" />
                                <button onClick={() => setPhoto(null)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs">Remove</button>
                            </div>
                        ) : (
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-200 dark:hover:file:bg-blue-800/50 cursor-pointer"/>
                        )}
                    </div>
                    <div className="flex justify-between items-center pt-4">
                         {editingExpense && canDelete && (
                            <button onClick={handleDelete} className="px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition">
                                Delete
                            </button>
                        )}
                        <button onClick={handleSubmit} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition ml-auto" style={{maxWidth: editingExpense && canDelete ? 'calc(100% - 100px)' : '100%'}}>
                            {editingExpense ? 'Save Changes' : 'Save Expense'}
                        </button>
                    </div>
                </div>
            </Modal>
             <Modal isOpen={!!viewingPhoto} onClose={() => setViewingPhoto(null)} title="Receipt Image">
                {viewingPhoto && <img src={viewingPhoto} alt="Receipt" className="w-full h-auto rounded-lg" />}
            </Modal>
        </>
    );
};

export default ExpensesScreen;
