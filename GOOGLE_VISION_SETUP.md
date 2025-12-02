# Google Vision API Setup Guide for Handwritten OCR

This guide will help you set up Google Vision API for improved handwritten note recognition in Student Buddy.

## Why Google Vision API?

- **Better Handwriting Recognition**: Specifically designed for handwritten text
- **Higher Accuracy**: 80-90% accuracy for clear handwriting vs 30-50% with Tesseract alone
- **Free Tier**: 1,000 requests/month free (sufficient for testing and demos)
- **Automatic Fallback**: System automatically falls back to Tesseract if Vision API is unavailable

## Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `student-buddy-ocr`
4. Click "Create"

### Step 2: Enable Vision API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Cloud Vision API"
3. Click on it and press "Enable"
4. Wait for the API to be enabled (takes a few seconds)

### Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in details:
   - Service account name: `student-buddy-vision`
   - Service account ID: (auto-generated)
   - Description: `OCR service for Student Buddy`
4. Click "Create and Continue"
5. Grant role: "Cloud Vision AI Service Agent"
6. Click "Continue" → "Done"

### Step 4: Generate API Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" format
6. Click "Create"
7. A JSON file will be downloaded automatically

### Step 5: Configure Your Application

#### Option A: Using Service Account Key File (Recommended)

1. Rename the downloaded JSON file to `google-vision-key.json`
2. Move it to your backend directory: `backend/google-vision-key.json`
3. Add to your `.env` file:
   ```
   GOOGLE_VISION_KEY_PATH=./google-vision-key.json
   ```
4. **IMPORTANT**: Add to `.gitignore`:
   ```
   google-vision-key.json
   ```

#### Option B: Using Environment Variables

1. Open the downloaded JSON file
2. Copy the `client_email` and `private_key` values
3. Add to your `.env` file:
   ```
   GOOGLE_VISION_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_VISION_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

### Step 6: Install Required Package

```bash
cd backend
npm install @google-cloud/vision
```

### Step 7: Test the Setup

1. Start your backend server:
   ```bash
   npm run dev
   ```

2. Look for this message in the console:
   ```
   ✓ Google Vision API initialized for handwriting OCR
   ```

3. Upload a handwritten note through the app and select "Handwritten Notes" option

## Pricing Information

### Free Tier (First 1,000 requests/month)
- **Document Text Detection**: FREE for first 1,000 pages
- Perfect for development, testing, and small-scale use

### Paid Tier (After 1,000 requests/month)
- **1,001 - 5,000,000 pages**: $1.50 per 1,000 pages
- **5,000,001+ pages**: $0.60 per 1,000 pages

### Cost Examples
- **10 students, 10 uploads each/month**: 100 pages = FREE
- **100 students, 5 uploads each/month**: 500 pages = FREE
- **1,000 students, 2 uploads each/month**: 2,000 pages = $1.50/month

## Troubleshooting

### Error: "Google Vision API not configured"
- Check that your `.env` file has the correct path or credentials
- Verify the JSON key file exists in the specified location
- Restart your backend server after adding credentials

### Error: "Permission denied"
- Ensure the service account has "Cloud Vision AI Service Agent" role
- Check that the Vision API is enabled in your project

### Error: "Quota exceeded"
- You've used more than 1,000 requests this month
- Either wait for next month or enable billing in Google Cloud Console

### Handwriting still not recognized well
- Ensure handwriting is clear and legible
- Try scanning at higher resolution (300 DPI recommended)
- Use good lighting and contrast
- Consider using the manual typing option for very messy handwriting

## System Behavior

### With Google Vision API Configured:
- **Printed Documents**: Uses Tesseract (fast, free)
- **Handwritten Notes**: Uses Google Vision API (better accuracy)
- **Fallback**: If Vision API fails, automatically uses Tesseract

### Without Google Vision API:
- **All Documents**: Uses Tesseract OCR
- **Handwritten Notes**: Lower accuracy but still functional
- **No Errors**: System works normally with reduced handwriting accuracy

## Security Best Practices

1. **Never commit API keys to Git**:
   ```bash
   # Add to .gitignore
   google-vision-key.json
   .env
   ```

2. **Restrict API Key Usage**:
   - In Google Cloud Console, go to "Credentials"
   - Edit your service account key
   - Add API restrictions to only allow Vision API

3. **Monitor Usage**:
   - Check Google Cloud Console regularly
   - Set up billing alerts
   - Monitor for unusual activity

## For Your Project Documentation

### Chapter 1 - Limitations Section:
"The system uses hybrid OCR technology for document processing. Printed documents are processed using Tesseract OCR with high accuracy. Handwritten notes are processed using Google Cloud Vision API when available, providing 80-90% accuracy for clear, legible handwriting. Accuracy may vary based on handwriting style, clarity, and document quality. Users can also manually type notes for 100% accuracy."

### Chapter 4 - Implementation Section:
"The document upload feature implements a hybrid OCR approach. Users select whether their document is printed or handwritten. Printed documents use Tesseract OCR for fast, offline processing. Handwritten documents use Google Cloud Vision API for improved recognition accuracy. The system includes automatic fallback mechanisms to ensure functionality even when external APIs are unavailable."

## Alternative: Skip Google Vision Setup

If you don't want to set up Google Vision API:

1. The system will work fine with Tesseract only
2. Handwritten notes will have lower accuracy (30-50%)
3. No additional setup required
4. No API costs
5. Fully offline operation

The choice is yours based on your project needs and budget!
