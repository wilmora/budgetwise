/**
 * Receipt OCR Utility
 * Uses Tesseract.js for on-device text extraction from receipt images
 */

import { createWorker } from 'tesseract.js';
import { getUserCurrency } from './currency';

// Regex patterns for common receipt formats
const AMOUNT_PATTERNS = [
    // Total with label (most reliable)
    /(?:total|grand total|amount due|balance due|subtotal|net|sum)[\s:]*[$€£¥₹]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,
    // Currency symbol followed by amount
    /[$€£¥₹]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    // Standalone decimal numbers (likely prices)
    /\b(\d{1,3}(?:,\d{3})*\.\d{2})\b/g,
];

const DATE_PATTERNS = [
    // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    // YYYY-MM-DD (ISO format)
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
    // Month DD, YYYY
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/gi,
];

const MERCHANT_PATTERNS = [
    // Lines in ALL CAPS (common for store names)
    /^([A-Z][A-Z\s&'\-]{3,}[A-Z])$/gm,
    // Lines ending with store-related words
    /^(.+(?:store|shop|mart|market|cafe|restaurant|deli|pizza|burger|mall|pharmacy|gas|fuel))/gim,
];

/**
 * Compress image for faster OCR processing
 * @param {Blob|File} imageBlob - The image to compress
 * @param {number} maxWidth - Maximum width in pixels
 * @returns {Promise<Blob>} Compressed image blob
 */
export async function compressImage(imageBlob, maxWidth = 1200) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(imageBlob);

        img.onload = () => {
            URL.revokeObjectURL(url);

            // Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob (JPEG for smaller size)
            canvas.toBlob(
                (blob) => resolve(blob),
                'image/jpeg',
                0.8
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Extract text from receipt image using Tesseract.js OCR
 * @param {Blob|File} imageBlob - The receipt image
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Extracted data
 */
export async function extractReceiptData(imageBlob, onProgress = () => { }) {
    let worker = null;

    try {
        // Compress image first
        onProgress(5);
        const compressedImage = await compressImage(imageBlob);

        // Initialize Tesseract worker
        onProgress(10);
        worker = await createWorker('eng', 1, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    // Map progress from 10% to 90%
                    const progress = 10 + (m.progress * 80);
                    onProgress(Math.round(progress));
                }
            },
        });

        // Run OCR
        const { data } = await worker.recognize(compressedImage);
        onProgress(95);

        // Parse the extracted text
        const result = parseReceiptText(data.text);

        onProgress(100);
        return result;

    } catch (error) {
        console.error('OCR Error:', error);
        throw new Error('Failed to read receipt. Please try again or enter details manually.');
    } finally {
        if (worker) {
            await worker.terminate();
        }
    }
}

/**
 * Parse extracted text to find receipt fields
 * @param {string} text - Raw OCR text
 * @returns {Object} Parsed receipt data
 */
export function parseReceiptText(text) {
    const result = {
        merchant: null,
        date: null,
        amount: null,
        currency: getUserCurrency(),
        rawText: text,
        confidence: {
            merchant: 0,
            date: 0,
            amount: 0,
        },
    };

    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Extract amount (look for "total" first, then largest amount)
    const amounts = [];
    for (const pattern of AMOUNT_PATTERNS) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
            const amountStr = match[1] || match[0];
            const amount = parseFloat(amountStr.replace(/[$€£¥₹,]/g, ''));
            if (!isNaN(amount) && amount > 0 && amount < 100000) {
                // Higher confidence for amounts with "total" nearby
                const confidence = match[0].toLowerCase().includes('total') ? 0.9 : 0.6;
                amounts.push({ value: amount, confidence });
            }
        }
    }

    // Take the largest amount with highest confidence (likely the total)
    if (amounts.length > 0) {
        // Sort by confidence first, then by amount
        amounts.sort((a, b) => {
            if (b.confidence !== a.confidence) return b.confidence - a.confidence;
            return b.value - a.value;
        });
        result.amount = amounts[0].value;
        result.confidence.amount = amounts[0].confidence;
    }

    // Extract date
    for (const pattern of DATE_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            const dateStr = match[1];
            // Try to parse the date
            const parsed = new Date(dateStr);
            if (!isNaN(parsed.getTime())) {
                result.date = parsed.toISOString().split('T')[0];
                result.confidence.date = 0.8;
                break;
            } else {
                // Try alternative parsing
                const parts = dateStr.replace(/[\/\-]/g, '/').split('/');
                if (parts.length === 3) {
                    let year = parseInt(parts[2]);
                    let month = parseInt(parts[0]) - 1;
                    let day = parseInt(parts[1]);

                    // Handle YY vs YYYY
                    if (year < 100) year += 2000;

                    const date = new Date(year, month, day);
                    if (!isNaN(date.getTime())) {
                        result.date = date.toISOString().split('T')[0];
                        result.confidence.date = 0.7;
                        break;
                    }
                }
            }
        }
    }

    // Default to today if no date found
    if (!result.date) {
        result.date = new Date().toISOString().split('T')[0];
        result.confidence.date = 0.3;
    }

    // Extract merchant name (usually first line or line in all caps)
    for (const pattern of MERCHANT_PATTERNS) {
        const match = text.match(pattern);
        if (match) {
            result.merchant = match[1].trim();
            result.confidence.merchant = 0.7;
            break;
        }
    }

    // Fallback: use first non-empty line as merchant
    if (!result.merchant && lines.length > 0) {
        // Skip very short lines or lines that look like addresses/dates
        for (const line of lines.slice(0, 5)) {
            if (line.length >= 3 &&
                !line.match(/^\d/) &&
                !line.match(/^(tel|fax|phone|www|http)/i)) {
                result.merchant = line.substring(0, 50);
                result.confidence.merchant = 0.4;
                break;
            }
        }
    }

    return result;
}

/**
 * Create a data URL from a blob for preview
 * @param {Blob} blob - Image blob
 * @returns {Promise<string>} Data URL
 */
export function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Convert data URL back to blob
 * @param {string} dataURL - Data URL string
 * @returns {Blob} Image blob
 */
export function dataURLToBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

export default extractReceiptData;
