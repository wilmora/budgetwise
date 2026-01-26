import React from 'react';

/**
 * Badge component for status indicators
 */
export function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = '',
}) {
    const variants = {
        default: 'badge-default',
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
    };

    const sizes = {
        sm: 'badge-sm',
        md: 'badge-md',
        lg: 'badge-lg',
    };

    return (
        <span className={`badge ${variants[variant]} ${sizes[size]} ${className}`}>
            {dot && <span className="badge-dot" />}
            {children}
        </span>
    );
}

/**
 * Category badge with emoji and color
 */
export function CategoryBadge({ emoji, name, color, className = '' }) {
    return (
        <span
            className={`category-badge ${className}`}
            style={{ '--category-color': color }}
        >
            {emoji && <span className="category-emoji">{emoji}</span>}
            <span className="category-name">{name}</span>
        </span>
    );
}

export default Badge;
