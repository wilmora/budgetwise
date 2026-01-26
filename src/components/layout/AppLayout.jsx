import React from 'react';
import {
    LayoutDashboard,
    Receipt,
    Target,
    Lightbulb,
    Settings,
    Plus,
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budget', label: 'Budget', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
];

/**
 * Desktop Sidebar Navigation
 */
export function Sidebar({ activeTab, onTabChange }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">💰</span>
                    <span className="logo-text">BudgetWise</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <p className="sidebar-version">v1.1.0</p>
            </div>
        </aside>
    );
}

/**
 * Mobile Bottom Navigation  
 */
export function BottomNav({ activeTab, onTabChange, onAddClick }) {
    return (
        <>
            {/* FAB for adding transactions */}
            <button className="fab" onClick={onAddClick} aria-label="Add transaction">
                <Plus size={24} />
            </button>

            {/* Bottom navigation */}
            <nav className="bottom-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => onTabChange(item.id)}
                        >
                            <Icon size={22} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
}

/**
 * Responsive App Layout
 * Shows sidebar on desktop, bottom nav on mobile
 */
export function AppLayout({
    children,
    activeTab,
    onTabChange,
    onAddClick
}) {
    return (
        <div className="app-layout">
            {/* Sidebar for desktop */}
            <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

            {/* Main content area */}
            <main className="main-content">
                {children}
            </main>

            {/* Bottom nav for mobile */}
            <BottomNav
                activeTab={activeTab}
                onTabChange={onTabChange}
                onAddClick={onAddClick}
            />
        </div>
    );
}

export default AppLayout;
