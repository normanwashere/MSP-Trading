

import React, { useState, useCallback, useEffect } from 'react';
import { User, Product, Location, StockBalance, Expense, Sale, StockReceive, StockTransfer, StockAdjustment, SettingsData, UserRole } from './types';
import { INITIAL_PRODUCTS, INITIAL_LOCATIONS, INITIAL_STOCK, INITIAL_EXPENSES, INITIAL_SALES, INITIAL_USERS, INITIAL_SETTINGS } from './constants';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
    // --- Global State ---
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

    // --- Mock Database State ---
    const [settings, setSettings] = useState<SettingsData>(INITIAL_SETTINGS);
    const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
    const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [stockBalances, setStockBalances] = useState<StockBalance[]>(INITIAL_STOCK);
    const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
    const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
    const [receives, setReceives] = useState<StockReceive[]>([]);
    const [transfers, setTransfers] = useState<StockTransfer[]>([]);
    const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    // --- Authentication Handlers ---
    const handleLogin = useCallback((email: string, pass: string): boolean => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (user) {
            setLoggedInUser(user);
            return true;
        }
        return false;
    }, [users]);

    const handleLogout = useCallback(() => {
        setLoggedInUser(null);
    }, []);

    const handleChangePassword = useCallback((userId: string, oldPass: string, newPass: string): boolean => {
        const userIndex = users.findIndex(u => u.id === userId && u.password === oldPass);
        if (userIndex !== -1) {
            setUsers(prevUsers => {
                const newUsers = [...prevUsers];
                newUsers[userIndex] = { ...newUsers[userIndex], password: newPass };
                return newUsers;
            });
            // Also update loggedInUser state if it's the current user
            if (loggedInUser?.id === userId) {
                setLoggedInUser(prev => prev ? { ...prev, password: newPass } : null);
            }
            return true;
        }
        return false;
    }, [users, loggedInUser]);

    // --- Data Handling Callbacks ---
    const handleAddSale = useCallback((newSale: Omit<Sale, 'id' | 'date'>) => {
        const saleToAdd: Sale = {
            ...newSale,
            id: `sale-${Date.now()}`,
            date: new Date(),
        };
        setSales(prevSales => [...prevSales, saleToAdd]);
        
        const stockUpdates = new Map<string, number>();

        newSale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product?.isBundle && product.bundleItems) {
                product.bundleItems.forEach(bundleItem => {
                    const currentDeduction = stockUpdates.get(bundleItem.productId) || 0;
                    stockUpdates.set(bundleItem.productId, currentDeduction + (bundleItem.quantity * item.qty));
                });
            } else {
                 const currentDeduction = stockUpdates.get(item.productId) || 0;
                 stockUpdates.set(item.productId, currentDeduction + item.qty);
            }
        });

        setStockBalances(prevStock => {
            const newStock = [...prevStock];
            stockUpdates.forEach((qtyToDeduct, productId) => {
                const stockIndex = newStock.findIndex(sb => sb.productId === productId && sb.locationId === newSale.locationId);
                if (stockIndex !== -1) {
                    newStock[stockIndex].fullQty -= qtyToDeduct;
                }
            });
            return newStock;
        });

    }, [products]);
    
    // ... Other data handlers remain largely the same, but may need currentUser passed in
     const handleAddExpense = useCallback((newExpense: Omit<Expense, 'id' | 'date' >) => {
        setExpenses(prev => [...prev, {
            ...newExpense,
            id: `exp${Date.now()}`,
            date: new Date(),
        }]);
    }, []);
    // Assume other handlers (update/delete expense, stock management, settings updates) are passed down correctly
    const handleUpdateExpense = useCallback((updatedExpense: Expense) => {
        setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
    }, []);

    const handleDeleteExpense = useCallback((expenseId: string) => {
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    }, []);

    const handleReceiveStock = useCallback((data: Omit<StockReceive, 'id' | 'date' >) => {
        const newReceive: StockReceive = { ...data, id: `rec-${Date.now()}`, date: new Date() };
        setReceives(prev => [...prev, newReceive]);

        setStockBalances(prevStock => {
            const newStock = [...prevStock];
            const stockIndex = newStock.findIndex(sb => sb.productId === data.productId && sb.locationId === data.locationId);
            if (stockIndex !== -1) {
                newStock[stockIndex].fullQty += data.qty;
            } else {
                newStock.push({ id: `sb-${Date.now()}`, productId: data.productId, locationId: data.locationId, fullQty: data.qty, emptyQty: 0 });
            }
            return newStock;
        });
    }, []);

    const handleTransferStock = useCallback((data: Omit<StockTransfer, 'id' | 'date' >) => {
        const newTransfer: StockTransfer = { ...data, id: `trn-${Date.now()}`, date: new Date() };
        setTransfers(prev => [...prev, newTransfer]);

        setStockBalances(prevStock => {
            const newStock = [...prevStock];
            const fromIndex = newStock.findIndex(sb => sb.productId === data.productId && sb.locationId === data.fromLocationId);
            if (fromIndex !== -1) newStock[fromIndex].fullQty -= data.qty;

            const toIndex = newStock.findIndex(sb => sb.productId === data.productId && sb.locationId === data.toLocationId);
            if (toIndex !== -1) newStock[toIndex].fullQty += data.qty;
            else newStock.push({ id: `sb-${Date.now()}`, productId: data.productId, locationId: data.toLocationId, fullQty: data.qty, emptyQty: 0 });
            
            return newStock;
        });
    }, []);

    const handleAdjustStock = useCallback((data: Omit<StockAdjustment, 'id' | 'date' | 'oldFullQty' | 'oldEmptyQty'>) => {
        setStockBalances(prevStock => {
            const newStock = [...prevStock];
            const stockIndex = newStock.findIndex(sb => sb.productId === data.productId && sb.locationId === data.locationId);
            
            if (stockIndex !== -1) {
                const oldStock = newStock[stockIndex];
                const newAdjustment: StockAdjustment = {
                    ...data,
                    id: `adj-${Date.now()}`,
                    date: new Date(),
                    oldFullQty: oldStock.fullQty,
                    newFullQty: data.newFullQty,
                    oldEmptyQty: oldStock.emptyQty,
                    newEmptyQty: data.newEmptyQty,
                };
                setAdjustments(prev => [...prev, newAdjustment]);

                newStock[stockIndex].fullQty = data.newFullQty;
                newStock[stockIndex].emptyQty = data.newEmptyQty;
            }
            return newStock;
        });
    }, []);

    // --- Settings Handlers ---
    const handleUpdateSettings = useCallback((newSettings: SettingsData) => setSettings(newSettings), []);
    const handleAddProduct = useCallback((product: Omit<Product, 'id'>) => setProducts(p => [...p, { ...product, id: `p-${Date.now()}` }]), []);
    const handleUpdateProduct = useCallback((updated: Product) => setProducts(p => p.map(prod => prod.id === updated.id ? updated : prod)), []);
    const handleDeleteProduct = useCallback((id: string) => setProducts(p => p.filter(prod => prod.id !== id)), []);
    const handleAddLocation = useCallback((location: Omit<Location, 'id'>) => setLocations(l => [...l, { ...location, id: `l-${Date.now()}` }]), []);
    const handleUpdateLocation = useCallback((updated: Location) => setLocations(l => l.map(loc => loc.id === updated.id ? updated : loc)), []);
    const handleDeleteLocation = useCallback((id: string) => setLocations(l => l.filter(loc => loc.id !== id)), []);
    const handleAddUser = useCallback((user: Omit<User, 'id'>) => setUsers(u => [...u, { ...user, id: `u-${Date.now()}` }]), []);
    const handleUpdateUser = useCallback((updated: User) => {
        setUsers(u => u.map(usr => usr.id === updated.id ? updated : usr));
    }, []);
    const handleDeleteUser = useCallback((id: string) => setUsers(u => u.filter(usr => usr.id !== id)), []);


    if (!loggedInUser) {
        return <LoginPage onLogin={handleLogin} allUsers={users} theme={theme} setTheme={setTheme} />;
    }

    return (
        <Dashboard
            currentUser={loggedInUser}
            onLogout={handleLogout}
            onChangePassword={handleChangePassword}
            allUsers={users}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            locations={locations}
            onAddLocation={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            stockBalances={stockBalances}
            onReceiveStock={handleReceiveStock}
            onTransferStock={handleTransferStock}
            onAdjustStock={handleAdjustStock}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            sales={sales}
            onAddSale={handleAddSale}
            theme={theme}
            setTheme={setTheme}
        />
    );
};

export default App;
