/**
 * Text Formatter Utility
 * Cleans and formats OCR-extracted text for better readability
 */

/**
 * Basic OCR text cleaning
 * @param {string} rawText - Raw OCR output
 * @returns {string} Cleaned text
 */
function formatOCRText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Remove excessive spaces (multiple spaces to single space)
    .replace(/[ \t]+/g, ' ')
    // Limit consecutive newlines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove lines with only whitespace
    .replace(/\n\s*\n/g, '\n\n')
    // Final trim
    .trim();
}

/**
 * Detect and format document structure (headings, lists, paragraphs)
 * @param {string} text - Cleaned text
 * @returns {string} Formatted text with structure
 */
function detectAndFormatStructure(text) {
  if (!text || typeof text !== 'string') return '';

  const lines = text.split('\n');
  const formatted = [];
  let previousLineWasHeading = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      formatted.push('');
      previousLineWasHeading = false;
      continue;
    }

    // Detect headings (short lines, capitalized, no ending period)
    const isHeading = (
      line.length < 60 && // Short line
      line.length > 2 && // Not too short
      /^[A-Z]/.test(line) && // Starts with capital
      !/[.!?]$/.test(line) && // No ending punctuation
      (
        line === line.toUpperCase() || // ALL CAPS
        /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(line) // Title Case
      ) &&
      !/^\d+\./.test(line) && // Not a numbered list
      !/^[•\-*]/.test(line) // Not a bullet point
    );

    // Detect list items
    const isListItem = (
      /^\d+\.\s/.test(line) || // Numbered: 1. 2. 3.
      /^[a-z]\.\s/.test(line) || // Lettered: a. b. c.
      /^[•\-*]\s/.test(line) || // Bullet: • - *
      /^[ivxIVX]+\.\s/.test(line) // Roman numerals: i. ii. iii.
    );

    if (isHeading) {
      // Add spacing before heading (unless it's the first line)
      if (formatted.length > 0 && formatted[formatted.length - 1] !== '') {
        formatted.push('');
      }
      // Format as bold markdown heading
      formatted.push(`**${line}**`);
      formatted.push(''); // Add space after heading
      previousLineWasHeading = true;
    } else if (isListItem) {
      // Preserve list items as-is
      formatted.push(line);
      previousLineWasHeading = false;
    } else {
      // Regular paragraph text
      // Add spacing between paragraphs (but not after headings)
      if (formatted.length > 0 && 
          formatted[formatted.length - 1] !== '' && 
          !previousLineWasHeading &&
          !isListItem) {
        // Check if previous line was also a paragraph (add paragraph break)
        const prevLine = formatted[formatted.length - 1];
        if (prevLine && !prevLine.startsWith('**') && !/^[\d•\-*]/.test(prevLine)) {
          formatted.push('');
        }
      }
      formatted.push(line);
      previousLineWasHeading = false;
    }
  }

  return formatted.join('\n').trim();
}

/**
 * Complete text formatting pipeline
 * @param {string} rawText - Raw OCR output
 * @returns {string} Fully formatted text
 */
function formatExtractedText(rawText) {
  if (!rawText) return '';
  
  // Step 1: Basic cleaning
  let text = formatOCRText(rawText);
  
  // Step 2: Structure detection and formatting
  text = detectAndFormatStructure(text);
  
  return text;
}

module.exports = {
  formatOCRText,
  detectAndFormatStructure,
  formatExtractedText
};
