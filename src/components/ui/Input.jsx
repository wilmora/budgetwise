import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Input component with label, error state, and validation
 */
export const Input = forwardRef(({
    label,
    error,
    hint,
    type = 'text',
    required = false,
    className = '',
    prefix,
    suffix,
    ...props
}, ref) => {
    const inputId = props.id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`form-field ${error ? 'form-field-error' : ''} ${className}`}>
            {label && (
                <label htmlFor={inputId} className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                </label>
            )}
            <div className="input-wrapper">
                {prefix && <span className="input-prefix">{prefix}</span>}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={`input ${prefix ? 'input-has-prefix' : ''} ${suffix ? 'input-has-suffix' : ''}`}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
                {suffix && <span className="input-suffix">{suffix}</span>}
            </div>
            {error && (
                <p id={`${inputId}-error`} className="form-error">
                    <AlertCircle size={14} />
                    {error}
                </p>
            )}
            {hint && !error && (
                <p id={`${inputId}-hint`} className="form-hint">{hint}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

/**
 * Select component with label and error state
 */
export const Select = forwardRef(({
    label,
    error,
    hint,
    options = [],
    placeholder = 'Select...',
    required = false,
    className = '',
    ...props
}, ref) => {
    const selectId = props.id || props.name || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`form-field ${error ? 'form-field-error' : ''} ${className}`}>
            {label && (
                <label htmlFor={selectId} className="form-label">
                    {label}
                    {required && <span className="form-required">*</span>}
                </label>
            )}
            <select
                ref={ref}
                id={selectId}
                className="select"
                aria-invalid={error ? 'true' : 'false'}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p id={`${selectId}-error`} className="form-error">
                    <AlertCircle size={14} />
                    {error}
                </p>
            )}
            {hint && !error && (
                <p id={`${selectId}-hint`} className="form-hint">{hint}</p>
            )}
        </div>
    );
});

Select.displayName = 'Select';

export default Input;
