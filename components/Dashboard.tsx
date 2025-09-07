

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Screen, UserRole, Product, Location, StockBalance, Expense, Sale, StockReceive, StockTransfer, StockAdjustment, User, SettingsData } from '../types';
import Sidebar from './Sidebar';
import Header from './Header';
import POSScreen from './screens/POSScreen';
import InventoryScreen from './screens/InventoryScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';

interface DashboardProps {
    currentUser: User;
    onLogout: () => void;
    onChangePassword: (userId: string, oldPass: string, newPass: string) => boolean;
    allUsers: User[];
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
    onAddUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (id: string) => void;
    stockBalances: StockBalance[];
    onReceiveStock: (data: Omit<StockReceive, 'id' | 'date'>) => void;
    onTransferStock: (data: Omit<StockTransfer, 'id' | 'date'>) => void;
    onAdjustStock: (data: Omit<StockAdjustment, 'id' | 'date' | 'oldFullQty' | 'oldEmptyQty'>) => void;
    expenses: Expense[];
    onAddExpense: (newExpense: Omit<Expense, 'id' | 'date'>) => void;
    onUpdateExpense: (updatedExpense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    sales: Sale[];
    onAddSale: (newSale: Omit<Sale, 'id' | 'date'>) => void;
    theme: string;
    setTheme: (theme: string) => void;
}

const Dashboard: React.FC<DashboardProps> = (props) => {
    const { currentUser, onLogout, onChangePassword, allUsers: users, settings, products, locations, stockBalances, expenses, sales, theme, setTheme } = props;

    const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.POS);
    const [activeLocationId, setActiveLocationId] = useState<string>('all');
    
    useEffect(() => {
        if (currentUser.role === UserRole.Staff || currentUser.role === UserRole.Admin) {
            if (currentUser.locationId) setActiveLocationId(currentUser.locationId);
        } else if (currentUser.role === UserRole.Superadmin) {
            setActiveLocationId('all');
        }
    }, [currentUser]);
    
    // --- Filtered Data for Screens ---
    const visibleStock = useMemo(() => {
        if (currentUser.role === UserRole.Superadmin && activeLocationId === 'all') return stockBalances;
        return stockBalances.filter(s => s.locationId === activeLocationId);
    }, [stockBalances, activeLocationId, currentUser]);

    const posStock = useMemo(() => {
        let locationForPos = activeLocationId;
        if (currentUser.role === UserRole.Superadmin && activeLocationId === 'all') {
            const mainStore = locations.find(l => l.type === 'Main');
            locationForPos = mainStore ? mainStore.id : locations[0]?.id;
        }
        return stockBalances.filter(s => s.locationId === locationForPos);
    }, [stockBalances, activeLocationId, currentUser, locations]);
    
    const posLocationId = useMemo(() => {
        if (currentUser.role === UserRole.Staff || currentUser.role === UserRole.Admin) return currentUser.locationId!;
        if (activeLocationId !== 'all') return activeLocationId;
        const mainStore = locations.find(l => l.type === 'Main');
        return mainStore ? mainStore.id : locations[0]?.id;
    }, [currentUser, activeLocationId, locations]);

    const visibleExpenses = useMemo(() => {
        if (currentUser.role === UserRole.Superadmin && activeLocationId === 'all') return expenses;
        return expenses.filter(e => e.locationId === activeLocationId);
    }, [expenses, activeLocationId, currentUser]);

    const visibleSales = useMemo(() => {
        if (currentUser.role === UserRole.Superadmin && activeLocationId === 'all') return sales;
        return sales.filter(s => s.locationId === activeLocationId);
    }, [sales, activeLocationId, currentUser]);

    const handleAddSaleWithUser = (sale: Omit<Sale, 'id' | 'date' | 'userId'>) => {
        props.onAddSale({ ...sale, userId: currentUser.id });
    };

    const handleAddExpenseWithUser = (expense: Omit<Expense, 'id' | 'date' | 'userId'>) => {
        props.onAddExpense({ ...expense, userId: currentUser.id });
    };

    const handleReceiveStockWithUser = (data: Omit<StockReceive, 'id' | 'date' | 'userId'>) => {
        props.onReceiveStock({ ...data, userId: currentUser.id });
    };
    
    const handleTransferStockWithUser = (data: Omit<StockTransfer, 'id' | 'date' | 'userId'>) => {
        props.onTransferStock({ ...data, userId: currentUser.id });
    };

    const handleAdjustStockWithUser = (data: Omit<StockAdjustment, 'id' | 'date' | 'userId' | 'oldFullQty' | 'oldEmptyQty'>) => {
        props.onAdjustStock({ ...data, userId: currentUser.id });
    };
    
    const renderScreen = () => {
        switch (currentScreen) {
            case Screen.POS:
                return <POSScreen products={products} stock={posStock} settings={settings} onAddSale={handleAddSaleWithUser} activeLocationId={posLocationId} currentUser={currentUser} />;
            case Screen.Inventory:
                return <InventoryScreen 
                    stock={visibleStock} 
                    products={products} 
                    locations={locations} 
                    onReceiveStock={handleReceiveStockWithUser}
                    onTransferStock={handleTransferStockWithUser}
                    onAdjustStock={handleAdjustStockWithUser}
                    currentUser={currentUser}
                />;
            case Screen.Expenses:
                return <ExpensesScreen 
                            expenses={visibleExpenses} 
                            onAddExpense={handleAddExpenseWithUser}
                            onUpdateExpense={props.onUpdateExpense}
                            onDeleteExpense={props.onDeleteExpense}
                            currentUser={currentUser}
                            locations={locations}
                            users={users}
                       />;
            case Screen.Reports:
                return <ReportsScreen sales={visibleSales} expenses={visibleExpenses} stock={visibleStock} products={products} locations={locations} currentUser={currentUser} settings={settings} />;
            case Screen.Settings:
                return <SettingsScreen 
                    settings={settings}
                    onUpdateSettings={props.onUpdateSettings}
                    products={products}
                    onAddProduct={props.onAddProduct}
                    onUpdateProduct={props.onUpdateProduct}
                    onDeleteProduct={props.onDeleteProduct}
                    locations={locations}
                    onAddLocation={props.onAddLocation}
                    onUpdateLocation={props.onUpdateLocation}
                    onDeleteLocation={props.onDeleteLocation}
                    users={users}
                    onAddUser={props.onAddUser}
                    onUpdateUser={props.onUpdateUser}
                    onDeleteUser={props.onDeleteUser}
                    currentUser={currentUser}
                    onChangePassword={onChangePassword}
                />;
            default:
                return null;
        }
    };

    return (
         <div className="min-h-screen flex app-container relative">
            <Sidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} userRole={currentUser.role} theme={theme} setTheme={setTheme} />
            <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 pb-24 md:pb-6 md:ml-64 overflow-x-hidden">
                <Header 
                    currentScreen={currentScreen} 
                    currentUser={currentUser}
                    onLogout={onLogout}
                    locations={locations}
                    activeLocationId={activeLocationId}
                    onSetActiveLocationId={setActiveLocationId}
                />
                <main className="flex-1 overflow-y-auto">
                    {renderScreen()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;