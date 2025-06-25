#!/usr/bin/env node

/**
 * Test script to validate the image upload pipeline
 * This will test Firebase connectivity and image upload functionality
 */

const { config } = require('dotenv');
config();

async function testImagePipeline() {
    console.log('🧪 [Test] Starting image pipeline validation...\n');

    // Test 1: Check Firebase configuration
    console.log('1. 🔧 Testing Firebase Configuration...');
    const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
    };

    const missingConfig = Object.entries(firebaseConfig)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

    if (missingConfig.length > 0) {
        console.error('❌ Missing Firebase configuration:', missingConfig);
        return false;
    }
    console.log('✅ Firebase configuration is complete');
    console.log(`   Storage bucket: ${firebaseConfig.storageBucket}\n`);

    // Test 2: Test Firebase connection and upload
    console.log('2. 🔗 Testing Firebase connection...');
    try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

        // Initialize Firebase
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const storage = getStorage(app);
        console.log('✅ Firebase initialized successfully');

        // Test 3: Upload a test image
        console.log('\n3. 📤 Testing image upload...');
        
        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x6B, 0x8C, 0x8A, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
            0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        const testFileName = `test-${Date.now()}.png`;
        const storageRef = ref(storage, `property-images/${testFileName}`);

        console.log(`   Uploading test image: ${testFileName}`);
        await uploadBytes(storageRef, testImageBuffer, { contentType: 'image/png' });
        console.log('✅ Test image uploaded successfully');

        // Test 4: Get download URL
        console.log('\n4. 🔗 Testing download URL generation...');
        const downloadUrl = await getDownloadURL(storageRef);
        console.log('✅ Download URL generated successfully');
        console.log(`   URL: ${downloadUrl}`);

        // Test 5: Validate public access
        console.log('\n5. 🌐 Testing public access...');
        try {
            const response = await fetch(downloadUrl);
            console.log(`   Response status: ${response.status} ${response.statusText}`);
            console.log(`   Content-Type: ${response.headers.get('content-type')}`);
            
            if (response.ok) {
                console.log('✅ Image is publicly accessible');
                
                // Test with HEAD request too
                const headResponse = await fetch(downloadUrl, { method: 'HEAD' });
                if (headResponse.ok) {
                    console.log('✅ HEAD request successful (Next.js Image optimization compatible)');
                } else {
                    console.log('⚠️  HEAD request failed, might affect Next.js Image optimization');
                }
            } else {
                console.error('❌ Image is not publicly accessible');
                return false;
            }
        } catch (error) {
            console.error('❌ Error accessing public URL:', error.message);
            return false;
        }

        console.log('\n🎉 All tests passed! Image pipeline is working correctly.');
        return true;

    } catch (error) {
        console.error('❌ Firebase connection failed:', error.message);
        if (error.code === 'auth/invalid-api-key') {
            console.error('   Check your FIREBASE_API_KEY');
        } else if (error.code === 'storage/invalid-checksum') {
            console.error('   Check your Firebase Storage configuration');
        }
        return false;
    }
}

// Run the test
testImagePipeline().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('🚨 Test script failed:', error);
    process.exit(1);
});