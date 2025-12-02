const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { convert } = require('pdf-poppler');
const sharp = require('sharp');

/**
 * OCR Service - Hybrid approach for printed and handwritten text extraction
 * 
 * Supports:
 * - Tesseract OCR for printed documents (fast, free, works offline)
 * - Google Vision API for handwritten notes (better accuracy for handwriting)
 * - Fallback mechanisms for reliability
 */

// Initialize Google Vision client (optional - only if API key is configured)
let visionClient = null;
try {
  const vision = require('@google-cloud/vision');
  const visionKeyPath = process.env.GOOGLE_VISION_KEY_PATH;
  
  if (visionKeyPath && fs.existsSync(visionKeyPath)) {
    visionClient = new vision.ImageAnnotatorClient({
      keyFilename: visionKeyPath
    });
    console.log('✓ Google Vision API initialized for handwriting OCR');
  } else if (process.env.GOOGLE_VISION_API_KEY) {
    // Alternative: Use API key directly
    visionClient = new vision.ImageAnnotatorClient({
      credentials: {
        client_email: process.env.GOOGLE_VISION_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_VISION_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }
    });
    console.log('✓ Google Vision API initialized with API key');
  } else {
    console.log('ℹ Google Vision API not configured - handwritten OCR will use Tesseract fallback');
  }
} catch (error) {
  console.log('ℹ Google Vision API not available:', error.message);
}

/**
 * Preprocess image for better OCR accuracy
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Buffer>} Preprocessed image buffer
 */
async function preprocessImage(imagePath) {
  try {
    // Apply image enhancements for better OCR
    const processedImage = await sharp(imagePath)
      .resize(null, 2000, { // Upscale to at least 2000px height for better recognition
        fit: 'inside',
        withoutEnlargement: false
      })
      .grayscale() // Convert to grayscale
      .normalize() // Normalize contrast
      .sharpen() // Sharpen edges
      .threshold(128) // Apply binary threshold (black/white)
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    // Return original image if preprocessing fails
    return fs.readFileSync(imagePath);
  }
}

/**
 * Post-process OCR text to improve quality
 * @param {string} text - Raw OCR text
 * @returns {string} Cleaned text
 */
function postProcessText(text) {
  if (!text) return '';

  return text
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Fix common OCR mistakes
    .replace(/\bl\b/g, 'I') // Lowercase L to uppercase I when standalone
    .replace(/\b0\b/g, 'O') // Zero to O when standalone
    .replace(/[|]/g, 'I') // Pipe to I
    .replace(/[`´'']/g, "'") // Normalize quotes
    .replace(/[""]/g, '"') // Normalize double quotes
    // Remove multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Extract text from a single image using Tesseract OCR (for printed text)
 * @param {string} imagePath - Path to the image file
 * @param {object} options - OCR options
 * @returns {Promise<string>} Extracted text
 */
async function extractTextWithTesseract(imagePath, options = {}) {
  const {
    language = 'eng',
    onProgress = null,
    usePreprocessing = true
  } = options;

  try {
    // Preprocess image for better accuracy
    const imageInput = usePreprocessing 
      ? await preprocessImage(imagePath)
      : imagePath;

    // Configure Tesseract with optimal settings
    const { data: { text, confidence } } = await Tesseract.recognize(
      imageInput,
      language,
      {
        logger: m => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
        // Tesseract configuration for better accuracy
        tessedit_pageseg_mode: Tesseract.PSM.AUTO, // Auto page segmentation
        tessedit_char_whitelist: null, // Allow all characters
        preserve_interword_spaces: '1', // Preserve spacing
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // Use LSTM neural network
      }
    );

    console.log(`Tesseract confidence: ${confidence?.toFixed(2)}%`);

    // Post-process text for better quality
    const cleanedText = postProcessText(text);

    // If confidence is very low, try alternative PSM modes
    if (confidence < 60 && usePreprocessing) {
      console.log('Low confidence detected, retrying with different settings...');
      
      const { data: { text: retryText, confidence: retryConfidence } } = await Tesseract.recognize(
        imageInput,
        language,
        {
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // Try single block mode
          tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
        }
      );

      if (retryConfidence > confidence) {
        console.log(`Improved confidence: ${retryConfidence?.toFixed(2)}%`);
        return postProcessText(retryText);
      }
    }

    return cleanedText;
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    throw new Error(`Tesseract OCR failed: ${error.message}`);
  }
}

/**
 * Extract text from a single image using Google Vision API (for handwritten text)
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} Extracted text
 */
async function extractTextWithGoogleVision(imagePath) {
  if (!visionClient) {
    throw new Error('Google Vision API not configured');
  }

  try {
    const [result] = await visionClient.documentTextDetection(imagePath);
    const fullTextAnnotation = result.fullTextAnnotation;
    
    if (!fullTextAnnotation || !fullTextAnnotation.text) {
      return '';
    }

    return fullTextAnnotation.text;
  } catch (error) {
    console.error('Google Vision API error:', error);
    throw new Error(`Google Vision API failed: ${error.message}`);
  }
}

/**
 * Extract text from an image with automatic fallback
 * @param {string} imagePath - Path to the image file
 * @param {string} documentType - 'printed' or 'handwritten'
 * @param {object} options - Additional options
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromImage(imagePath, documentType = 'printed', options = {}) {
  const { pageNumber = null, onProgress = null } = options;

  try {
    if (documentType === 'handwritten' && visionClient) {
      // Use Google Vision for handwritten text
      console.log(`Using Google Vision API for handwritten text (page ${pageNumber || 'unknown'})...`);
      const text = await extractTextWithGoogleVision(imagePath);
      return postProcessText(text);
    } else {
      // Use Tesseract for printed text or as fallback
      if (documentType === 'handwritten' && !visionClient) {
        console.log(`Google Vision not available, using Tesseract fallback for handwritten text (page ${pageNumber || 'unknown'})...`);
      } else {
        console.log(`Using Tesseract for printed text (page ${pageNumber || 'unknown'})...`);
      }
      return await extractTextWithTesseract(imagePath, { onProgress, usePreprocessing: true });
    }
  } catch (error) {
    // If primary method fails, try fallback
    if (documentType === 'handwritten' && visionClient) {
      console.log('Google Vision failed, falling back to Tesseract...');
      return await extractTextWithTesseract(imagePath, { onProgress, usePreprocessing: true });
    }
    throw error;
  }
}

/**
 * Convert PDF to images and extract text using OCR
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} documentType - 'printed' or 'handwritten'
 * @param {object} options - Additional options
 * @returns {Promise<string>} Extracted text from all pages
 */
async function extractTextFromImagePDF(pdfPath, documentType = 'printed', options = {}) {
  const { maxPages = 50, onProgress = null } = options;
  const tempDir = path.join(__dirname, '../uploads/temp-images');

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Convert PDF pages to PNG images
    const opts = {
      format: 'png',
      out_dir: tempDir,
      out_prefix: `pdf-${Date.now()}`,
      page: null // Convert all pages
    };

    console.log(`Converting PDF to images for ${documentType} OCR...`);
    await convert(pdfPath, opts);

    // Get all generated image files
    const imageFiles = fs.readdirSync(tempDir)
      .filter(file => file.startsWith(opts.out_prefix))
      .sort();

    if (imageFiles.length === 0) {
      throw new Error('Failed to convert PDF to images. The PDF may be corrupted or password-protected.');
    }

    let fullText = '';
    const pagesToProcess = Math.min(imageFiles.length, maxPages);

    console.log(`Processing ${pagesToProcess} pages with ${documentType} OCR...`);

    // Process each page
    for (let i = 0; i < pagesToProcess; i++) {
      const imagePath = path.join(tempDir, imageFiles[i]);

      try {
        const text = await extractTextFromImage(imagePath, documentType, {
          pageNumber: i + 1,
          onProgress: (progress) => {
            if (onProgress) {
              const overallProgress = ((i / pagesToProcess) * 100) + (progress / pagesToProcess);
              onProgress(Math.round(overallProgress));
            }
          }
        });

        fullText += `\n--- Page ${i + 1} ---\n${text}\n`;
      } catch (pageError) {
        console.error(`OCR failed on page ${i + 1}:`, pageError);
        fullText += `\n--- Page ${i + 1} (OCR failed) ---\n`;
      }

      // Delete processed image
      try {
        fs.unlinkSync(imagePath);
      } catch (deleteError) {
        console.error(`Failed to delete temp image ${imagePath}:`, deleteError);
      }
    }

    // Add note if pages were limited
    if (imageFiles.length > maxPages) {
      fullText += `\n\n[OCR limited to first ${maxPages} pages for performance. Consider splitting large PDFs into smaller chunks.]`;
    }

    return fullText.trim();

  } catch (error) {
    console.error('Error in OCR extraction:', error);
    throw new Error(`Failed to extract text using OCR: ${error.message}`);
  } finally {
    // Cleanup temp directory
    try {
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          try {
            fs.unlinkSync(path.join(tempDir, file));
          } catch (fileError) {
            console.error(`Error deleting temp file ${file}:`, fileError);
          }
        });
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }
  }
}

/**
 * Check if Google Vision API is available
 * @returns {boolean} True if Google Vision is configured and available
 */
function isGoogleVisionAvailable() {
  return visionClient !== null;
}

module.exports = {
  extractTextFromImage,
  extractTextFromImagePDF,
  extractTextWithTesseract,
  extractTextWithGoogleVision,
  isGoogleVisionAvailable,
  preprocessImage,
  postProcessText
};
