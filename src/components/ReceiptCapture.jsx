import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Modal, ModalFooter } from './ui/Modal';
import { Input, Select } from './ui/Input';
import { Badge } from './ui/Badge';
import { Spinner } from './ui/Spinner';
import { extractReceiptData, blobToDataURL } from '../utils/ocr';
import { addTransaction, getCategories } from '../utils/storage';
import { suggestCategory } from '../utils/aiCategorizer';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

/**
 * Receipt Capture and OCR Component
 * Allows users to capture/upload receipt images and extract transaction data
 */
export default function ReceiptCapture({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState('capture'); // capture, processing, confirm
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [extractedData, setExtractedData] = useState(null);

    // Form state for confirmation
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: '',
        category: '',
        type: 'expense',
    });
    const [formErrors, setFormErrors] = useState({});

    const fileInputRef = useRef(null);
    const categories = getCategories().filter(c =>
        !['salary', 'freelance', 'investments'].includes(c.id)
    );

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        setError(null);
        setImage(file);

        // Create preview
        const preview = await blobToDataURL(file);
        setImagePreview(preview);
    };

    const handleCapture = () => {
        fileInputRef.current?.click();
    };

    const handleProcess = async () => {
        if (!image) return;

        setStep('processing');
        setProgress(0);
        setError(null);

        try {
            const data = await extractReceiptData(image, setProgress);

            setExtractedData(data);

            // Pre-fill form with extracted data
            const description = data.merchant || '';
            const suggestion = description.length > 3
                ? suggestCategory(description, data.amount || 0, 'expense')
                : null;

            setFormData({
                description,
                amount: data.amount?.toString() || '',
                date: data.date || new Date().toISOString().split('T')[0],
                category: suggestion?.category || 'other',
                type: 'expense',
            });

            setStep('confirm');
        } catch (err) {
            console.error('OCR Error:', err);
            setError(err.message || 'Failed to process receipt');
            setStep('capture');
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.description?.trim()) {
            errors.description = 'Description is required';
        }

        const amount = parseFloat(formData.amount);
        if (!formData.amount || isNaN(amount) || amount <= 0) {
            errors.amount = 'Valid amount is required';
        }

        if (!formData.date) {
            errors.date = 'Date is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        const transaction = {
            type: formData.type,
            amount: parseFloat(formData.amount),
            description: formData.description.trim(),
            category: formData.category || 'other',
            date: formData.date,
            hasReceipt: true,
            receiptImage: imagePreview, // Store base64 image
        };

        addTransaction(transaction);
        onSuccess?.();
        handleClose();
    };

    const handleClose = () => {
        setStep('capture');
        setImage(null);
        setImagePreview(null);
        setProgress(0);
        setError(null);
        setExtractedData(null);
        setFormData({
            description: '',
            amount: '',
            date: '',
            category: '',
            type: 'expense',
        });
        setFormErrors({});
        onClose();
    };

    const handleRetry = () => {
        setStep('capture');
        setImage(null);
        setImagePreview(null);
        setError(null);
    };

    const getConfidenceBadge = (confidence) => {
        if (confidence >= 0.7) return <Badge variant="success" size="sm">High</Badge>;
        if (confidence >= 0.4) return <Badge variant="warning" size="sm">Medium</Badge>;
        return <Badge variant="danger" size="sm">Low</Badge>;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={
                step === 'capture' ? 'Scan Receipt' :
                    step === 'processing' ? 'Processing...' :
                        'Confirm Details'
            }
            size="md"
        >
            {/* Step 1: Capture/Upload */}
            {step === 'capture' && (
                <div className="receipt-capture">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {error && (
                        <div className="form-error mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {!imagePreview ? (
                        <div className="receipt-upload-area">
                            <div className="receipt-upload-icon">📸</div>
                            <p className="receipt-upload-text">
                                Take a photo or upload an image of your receipt
                            </p>
                            <div className="flex gap-4 justify-center mt-6">
                                <Button
                                    variant="primary"
                                    icon={<Camera size={18} />}
                                    onClick={handleCapture}
                                >
                                    Take Photo
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<Upload size={18} />}
                                    onClick={handleCapture}
                                >
                                    Upload
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="receipt-preview">
                            <img
                                src={imagePreview}
                                alt="Receipt preview"
                                className="receipt-image"
                            />
                            <div className="receipt-preview-actions">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRetry}
                                >
                                    Change Image
                                </Button>
                            </div>
                        </div>
                    )}

                    <ModalFooter>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleProcess}
                            disabled={!image}
                        >
                            Process Receipt
                        </Button>
                    </ModalFooter>
                </div>
            )}

            {/* Step 2: Processing */}
            {step === 'processing' && (
                <div className="receipt-processing">
                    <div className="receipt-processing-content">
                        <Spinner size="xl" />
                        <p className="receipt-processing-text">
                            Analyzing receipt...
                        </p>
                        <div className="progress-bar" style={{ width: '200px', margin: '1rem auto' }}>
                            <div
                                className="progress-fill success"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                            {progress}% complete
                        </p>
                    </div>
                </div>
            )}

            {/* Step 3: Confirm Details */}
            {step === 'confirm' && (
                <div className="receipt-confirm">
                    {/* Mini preview */}
                    {imagePreview && (
                        <div className="receipt-mini-preview mb-4">
                            <img
                                src={imagePreview}
                                alt="Receipt"
                                className="receipt-thumbnail"
                            />
                            <div className="receipt-confidence-info">
                                <p className="text-sm font-medium mb-2">Extraction Confidence</p>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="text-xs text-secondary">
                                        Amount: {getConfidenceBadge(extractedData?.confidence?.amount || 0)}
                                    </span>
                                    <span className="text-xs text-secondary">
                                        Date: {getConfidenceBadge(extractedData?.confidence?.date || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <Input
                            label="Description / Merchant"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            error={formErrors.description}
                            required
                            placeholder="e.g., Walmart, Starbucks"
                        />

                        <div className="flex gap-4">
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                    error={formErrors.amount}
                                    required
                                    prefix={getCurrencySymbol()}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Input
                                    label="Date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    error={formErrors.date}
                                    required
                                />
                            </div>
                        </div>

                        <Select
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            options={categories.map(c => ({
                                value: c.id,
                                label: `${c.emoji} ${c.name}`
                            }))}
                            placeholder="Select category"
                        />
                    </form>

                    <ModalFooter>
                        <Button variant="secondary" onClick={handleRetry}>
                            Retry
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            icon={<Check size={18} />}
                        >
                            Save Transaction
                        </Button>
                    </ModalFooter>
                </div>
            )}

            <style>{`
                .receipt-upload-area {
                    text-align: center;
                    padding: var(--space-8) var(--space-4);
                    background: var(--bg-tertiary);
                    border: 2px dashed var(--border-primary);
                    border-radius: var(--radius-xl);
                }

                .receipt-upload-icon {
                    font-size: 3rem;
                    margin-bottom: var(--space-4);
                }

                .receipt-upload-text {
                    color: var(--text-secondary);
                    margin-bottom: 0;
                }

                .receipt-preview {
                    text-align: center;
                }

                .receipt-image {
                    max-width: 100%;
                    max-height: 300px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                }

                .receipt-preview-actions {
                    margin-top: var(--space-3);
                }

                .receipt-processing {
                    text-align: center;
                    padding: var(--space-8) var(--space-4);
                }

                .receipt-processing-text {
                    margin-top: var(--space-4);
                    color: var(--text-primary);
                    font-weight: var(--font-medium);
                }

                .receipt-mini-preview {
                    display: flex;
                    gap: var(--space-4);
                    padding: var(--space-3);
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-lg);
                }

                .receipt-thumbnail {
                    width: 60px;
                    height: 80px;
                    object-fit: cover;
                    border-radius: var(--radius-md);
                }

                .receipt-confidence-info {
                    flex: 1;
                }
            `}</style>
        </Modal>
    );
}
