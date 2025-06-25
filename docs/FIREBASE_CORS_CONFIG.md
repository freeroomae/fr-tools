# Firebase Storage CORS Configuration

## Issue: Cross-Origin Requests

If images still don't load after deploying the storage rules, you may need to configure CORS (Cross-Origin Resource Sharing) for Firebase Storage.

## Solution: Configure CORS

### Step 1: Create CORS Configuration File

Create a file named `cors.json` in the project root:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

For production, replace `"*"` with your specific domain:

```json
[
  {
    "origin": ["https://yourdomain.com", "http://localhost:3000", "http://localhost:9002"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"]
  }
]
```

### Step 2: Apply CORS Configuration

Install Google Cloud SDK if not already installed, then run:

```bash
# Set your Firebase project ID
export PROJECT_ID=propscrapeai

# Apply CORS configuration
gsutil cors set cors.json gs://propscrapeai.firebasestorage.app

# Verify CORS configuration
gsutil cors get gs://propscrapeai.firebasestorage.app
```

### Alternative: Using Firebase CLI with Google Cloud Shell

If you don't have gsutil installed locally, you can use Google Cloud Shell:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Open Cloud Shell
3. Upload your `cors.json` file
4. Run the gsutil commands above

## Testing CORS

After applying CORS configuration, test it:

```bash
# Test CORS preflight
curl -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://firebasestorage.googleapis.com/v0/b/propscrapeai.firebasestorage.app/o/property-images%2Ftest.jpg

# Should return CORS headers
```

## Troubleshooting

### Issue: Images still not loading
1. Check browser developer tools console for CORS errors
2. Verify storage rules are deployed: `firebase deploy --only storage`
3. Check CORS configuration: `gsutil cors get gs://your-bucket-name`
4. Clear browser cache and try again

### Issue: Permission denied errors
1. Ensure Firebase Storage rules allow public read access to `property-images/`
2. Check that the image URLs are using the correct format
3. Verify Firebase project configuration in `.env`

### Issue: Images load slowly
1. Consider enabling image optimization in Next.js config
2. Use Firebase Storage's built-in image resizing (requires Firebase Extensions)
3. Implement image caching strategies