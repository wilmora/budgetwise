import React from 'react';

/**
 * Card component with header and body sections
 */
export function Card({
    children,
    className = '',
    padding = 'md',
    ...props
}) {
    const paddingSizes = {
        none: 'card-p-none',
        sm: 'card-p-sm',
        md: 'card-p-md',
        lg: 'card-p-lg',
    };

    return (
        <div className={`card ${paddingSizes[padding]} ${className}`} {...props}>
            {children}
        </div>
    );
}

/**
 * Card header with title and optional action
 */
export function CardHeader({ title, subtitle, action, className = '' }) {
    return (
        <div className={`card-header ${className}`}>
            <div className="card-header-text">
                <h3 className="card-title">{title}</h3>
                {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
            {action && <div className="card-action">{action}</div>}
        </div>
    );
}

/**
 * Card body for main content
 */
export function CardBody({ children, className = '' }) {
    return (
        <div className={`card-body ${className}`}>
            {children}
        </div>
    );
}

/**
 * Card footer for actions
 */
export function CardFooter({ children, className = '' }) {
    return (
        <div className={`card-footer ${className}`}>
            {children}
        </div>
    );
}

export default Card;
