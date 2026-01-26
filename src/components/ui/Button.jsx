import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button component with multiple variants
 * @param {Object} props
 * @param {'primary'|'secondary'|'danger'|'ghost'} props.variant
 * @param {'sm'|'md'|'lg'} props.size
 * @param {boolean} props.loading
 * @param {boolean} props.disabled
 * @param {boolean} props.fullWidth
 * @param {React.ReactNode} props.icon
 */
export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    className = '',
    ...props
}) {
    const baseStyles = `
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg transition-all
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'btn-danger',
        ghost: 'btn-ghost',
    };

    const sizes = {
        sm: 'btn-sm',
        md: 'btn-md',
        lg: 'btn-lg',
    };

    return (
        <button
            className={`btn ${variants[variant]} ${sizes[size]} ${fullWidth ? 'btn-full' : ''} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="btn-spinner" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            ) : icon ? (
                <span className="btn-icon">{icon}</span>
            ) : null}
            {children}
        </button>
    );
}

/**
 * Icon-only button
 */
export function IconButton({
    icon,
    variant = 'ghost',
    size = 'md',
    label,
    ...props
}) {
    const sizes = {
        sm: 'icon-btn-sm',
        md: 'icon-btn-md',
        lg: 'icon-btn-lg',
    };

    return (
        <button
            className={`icon-btn ${sizes[size]} btn-${variant}`}
            aria-label={label}
            title={label}
            {...props}
        >
            {icon}
        </button>
    );
}

export default Button;
