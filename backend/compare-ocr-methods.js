/**
 * Compare OCR Methods Script
 * Tests different OCR approaches to find the best one for your documents
 * 
 * Usage: node compare-ocr-methods.js <image-path>
 */

const Tesseract = require('tesseract.js');
const { preprocessImage, postProcessText } = require('./services/ocrService');
const fs = require('fs');

async function compareOCRMethods(imagePath) {
  if (!imagePath || !fs.existsSync(imagePath)) {
    console.error('❌ Please provide a valid image path');
    console.log('Usage: node compare-ocr-methods.js <image-path>');
    process.exit(1);
  }

  console.log('🔬 Comparing OCR Methods\n');
  console.log(`📄 Testing: ${imagePath}\n`);

  const results = [];

  // Method 1: Basic Tesseract (no preprocessing)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Method 1: Basic Tesseract (Original)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const start1 = Date.now();
    const { data: { text: text1, confidence: conf1 } } = await Tesseract.recognize(imagePath, 'eng');
    const duration1 = Date.now() - start1;
    
    results.push({
      method: 'Basic Tesseract',
      text: text1,
      confidence: conf1,
      duration: duration1,
      length: text1.length
    });
    
    console.log(`✅ Confidence: ${conf1?.toFixed(2)}%`);
    console.log(`⏱️  Time: ${(duration1 / 1000).toFixed(2)}s`);
    console.log(`📝 Length: ${text1.length} chars`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }

  // Method 2: Tesseract with preprocessing
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Method 2: Tesseract + Preprocessing (NEW)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const start2 = Date.now();
    const preprocessed = await preprocessImage(imagePath);
    const { data: { text: text2, confidence: conf2 } } = await Tesseract.recognize(
      preprocessed,
      'eng',
      {
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      }
    );
    const duration2 = Date.now() - start2;
    
    results.push({
      method: 'Tesseract + Preprocessing',
      text: text2,
      confidence: conf2,
      duration: duration2,
      length: text2.length
    });
    
    console.log(`✅ Confidence: ${conf2?.toFixed(2)}%`);
    console.log(`⏱️  Time: ${(duration2 / 1000).toFixed(2)}s`);
    console.log(`📝 Length: ${text2.length} chars`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }

  // Method 3: Tesseract with preprocessing + post-processing
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Method 3: Full Pipeline (NEW)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const start3 = Date.now();
    const preprocessed = await preprocessImage(imagePath);
    const { data: { text: text3, confidence: conf3 } } = await Tesseract.recognize(
      preprocessed,
      'eng',
      {
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      }
    );
    const cleanedText = postProcessText(text3);
    const duration3 = Date.now() - start3;
    
    results.push({
      method: 'Full Pipeline',
      text: cleanedText,
      confidence: conf3,
      duration: duration3,
      length: cleanedText.length
    });
    
    console.log(`✅ Confidence: ${conf3?.toFixed(2)}%`);
    console.log(`⏱️  Time: ${(duration3 / 1000).toFixed(2)}s`);
    console.log(`📝 Length: ${cleanedText.length} chars`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }

  // Method 4: Alternative PSM mode
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Method 4: Single Block Mode (NEW)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  try {
    const start4 = Date.now();
    const preprocessed = await preprocessImage(imagePath);
    const { data: { text: text4, confidence: conf4 } } = await Tesseract.recognize(
      preprocessed,
      'eng',
      {
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
      }
    );
    const cleanedText = postProcessText(text4);
    const duration4 = Date.now() - start4;
    
    results.push({
      method: 'Single Block Mode',
      text: cleanedText,
      confidence: conf4,
      duration: duration4,
      length: cleanedText.length
    });
    
    console.log(`✅ Confidence: ${conf4?.toFixed(2)}%`);
    console.log(`⏱️  Time: ${(duration4 / 1000).toFixed(2)}s`);
    console.log(`📝 Length: ${cleanedText.length} chars`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }

  // Summary
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 COMPARISON SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Sort by confidence
  results.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

  console.log('Ranking by Confidence:');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.method}`);
    console.log(`   Confidence: ${result.confidence?.toFixed(2)}%`);
    console.log(`   Time: ${(result.duration / 1000).toFixed(2)}s`);
    console.log(`   Length: ${result.length} chars\n`);
  });

  // Show best result
  const best = results[0];
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🏆 BEST METHOD: ${best.method}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\nExtracted Text (first 500 chars):\n${'-'.repeat(50)}`);
  console.log(best.text.substring(0, 500));
  if (best.text.length > 500) {
    console.log(`\n... (${best.text.length - 500} more characters)`);
  }

  // Recommendations
  console.log('\n\n💡 RECOMMENDATIONS:');
  if (best.confidence > 90) {
    console.log('✅ Excellent accuracy! Current settings are optimal.');
  } else if (best.confidence > 75) {
    console.log('✅ Good accuracy. Consider improving image quality for better results.');
  } else if (best.confidence > 60) {
    console.log('⚠️  Moderate accuracy. Try:');
    console.log('   • Higher resolution images');
    console.log('   • Better lighting');
    console.log('   • Clearer text');
  } else {
    console.log('❌ Low accuracy. Issues may include:');
    console.log('   • Poor image quality');
    console.log('   • Handwritten text (use Google Vision API)');
    console.log('   • Non-English text');
    console.log('   • Complex layouts');
  }
}

// Run comparison
compareOCRMethods(process.argv[2]).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
