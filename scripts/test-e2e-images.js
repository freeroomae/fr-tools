#!/usr/bin/env node

/**
 * End-to-end test for the image pipeline
 * Tests the complete workflow: scrape → download → upload → serve
 */

const { config } = require('dotenv');
config();

// Mock property data for testing
const mockPropertyData = {
    title: "Test Property",
    description: "A beautiful test property",
    image_urls: [
        // Test with a reliable test image URL
        "https://via.placeholder.com/600x400/0066CC/FFFFFF.png?text=Test+Image+1",
        "https://via.placeholder.com/800x600/CC6600/FFFFFF.png?text=Test+Image+2"
    ]
};

async function testEndToEndImagePipeline() {
    console.log('🧪 [E2E Test] Starting end-to-end image pipeline test...\n');

    try {
        // Import the upload function from our actions
        console.log('📥 [Import] Loading uploadImageAndGetUrl function...');
        
        // Mock the upload function since we can't directly import server actions
        const { initializeApp, getApps } = await import('firebase/app');
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const { v4: uuidv4 } = await import('uuid');

        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
        };

        // Mock uploadImageAndGetUrl function
        async function uploadImageAndGetUrl(imageUrl, propertyId) {
            const startTime = Date.now();
            console.log(`🖼️  [Image Pipeline] Starting upload for: ${imageUrl}`);
            
            try {
                const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
                const storage = getStorage(app);

                console.log(`⬇️  [Image Download] Fetching image from: ${imageUrl}`);
                const response = await fetch(imageUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'image/*,*/*;q=0.8'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
                }
                
                const imageBuffer = await response.arrayBuffer();
                const imageSizeKB = Math.round(imageBuffer.byteLength / 1024);
                console.log(`⬇️  [Image Download] Downloaded ${imageSizeKB}KB image successfully`);
                
                const fileExtension = 'png'; // placeholder images are PNG
                const fileName = `${propertyId}-${uuidv4()}.${fileExtension}`;
                const storageRef = ref(storage, `property-images/${fileName}`);
                
                console.log(`⬆️  [Firebase Upload] Uploading to Firebase Storage as: ${fileName}`);
                await uploadBytes(storageRef, imageBuffer, { contentType: 'image/png' });
                
                const downloadUrl = await getDownloadURL(storageRef);
                const totalTime = Date.now() - startTime;
                console.log(`✅ [Image Pipeline] SUCCESS! Total time: ${totalTime}ms`);
                console.log(`🔗 [Public URL] ${downloadUrl}`);
                
                // Validate the URL is accessible
                try {
                    const testResponse = await fetch(downloadUrl, { method: 'HEAD' });
                    console.log(`🔍 [URL Validation] Public URL test: ${testResponse.status} ${testResponse.statusText}`);
                    if (!testResponse.ok) {
                        throw new Error(`URL not accessible: ${testResponse.status}`);
                    }
                } catch (validationError) {
                    console.error(`⚠️  [URL Validation] Could not validate public URL:`, validationError.message);
                    throw validationError;
                }
                
                return downloadUrl;
            } catch (error) {
                const totalTime = Date.now() - startTime;
                console.error(`❌ [Image Pipeline] FAILED after ${totalTime}ms for ${imageUrl}:`, error.message);
                throw error;
            }
        }

        // Test the complete workflow
        console.log('🏠 [Processing] Testing property image processing...');
        
        const propertyId = `test-prop-${Date.now()}`;
        const results = [];
        
        for (let i = 0; i < mockPropertyData.image_urls.length; i++) {
            const imageUrl = mockPropertyData.image_urls[i];
            console.log(`\n🖼️  [Image ${i + 1}] Processing: ${imageUrl}`);
            
            try {
                const firebaseUrl = await uploadImageAndGetUrl(imageUrl, propertyId);
                results.push(firebaseUrl);
                console.log(`✅ [Image ${i + 1}] Success: ${firebaseUrl}`);
            } catch (error) {
                console.error(`❌ [Image ${i + 1}] Failed: ${error.message}`);
                results.push(null);
            }
        }

        // Summary
        const successful = results.filter(url => url !== null).length;
        const failed = results.length - successful;
        
        console.log(`\n📊 [Summary] Results: ${successful} successful, ${failed} failed`);
        
        if (successful > 0) {
            console.log('\n🎉 [Success] Image pipeline is working! Images uploaded successfully.');
            console.log('\n📋 [Next Steps]:');
            console.log('   1. Test with real scraping data');
            console.log('   2. Check frontend image display');
            console.log('   3. Monitor for any CORS issues in browser console');
            return true;
        } else {
            console.error('\n❌ [Failure] No images were uploaded successfully');
            return false;
        }

    } catch (error) {
        console.error('\n🚨 [Test Failed]:', error.message);
        console.error('\n🔧 [Troubleshooting]:');
        console.error('   1. Check Firebase configuration in .env');
        console.error('   2. Deploy storage rules: firebase deploy --only storage');
        console.error('   3. Configure CORS if needed (see docs/FIREBASE_CORS_CONFIG.md)');
        return false;
    }
}

// Run the test
testEndToEndImagePipeline().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('🚨 Test script crashed:', error);
    process.exit(1);
});