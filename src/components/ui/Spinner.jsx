import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Spinner component for loading states
 */
export function Spinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 16,
        md: 24,
        lg: 32,
        xl: 48,
    };

    return (
        <Loader2
            className={`spinner ${className}`}
            size={sizes[size]}
        />
    );
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({ message = 'Loading...' }) {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <Spinner size="xl" />
                {message && <p className="loading-message">{message}</p>}
            </div>
        </div>
    );
}

/**
 * Skeleton component for content placeholders
 */
export function Skeleton({
    width,
    height,
    variant = 'rect',
    className = ''
}) {
    const variants = {
        rect: 'skeleton-rect',
        circle: 'skeleton-circle',
        text: 'skeleton-text',
    };

    const style = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1em' : undefined),
    };

    return (
        <div
            className={`skeleton ${variants[variant]} ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

/**
 * Skeleton group for multiple lines
 */
export function SkeletonText({ lines = 3, className = '' }) {
    return (
        <div className={`skeleton-group ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    width={i === lines - 1 ? '60%' : '100%'}
                />
            ))}
        </div>
    );
}

/**
 * Card skeleton for loading cards
 */
export function CardSkeleton() {
    return (
        <div className="card skeleton-card">
            <div className="card-header">
                <Skeleton width={120} height={20} />
            </div>
            <div className="card-body">
                <SkeletonText lines={2} />
            </div>
        </div>
    );
}

/**
 * Transaction item skeleton
 */
export function TransactionSkeleton() {
    return (
        <div className="transaction-skeleton">
            <Skeleton variant="circle" width={44} height={44} />
            <div className="transaction-skeleton-text">
                <Skeleton width={140} height={16} />
                <Skeleton width={80} height={12} />
            </div>
            <div className="transaction-skeleton-amount">
                <Skeleton width={60} height={16} />
            </div>
        </div>
    );
}

export default Spinner;
