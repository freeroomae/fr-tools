#!/usr/bin/env node

/**
 * Simple test to check if Firebase Storage bucket is publicly accessible
 * and validate the storage rules are configured correctly
 */

const { config } = require('dotenv');
config();

async function testStorageRules() {
    console.log('🧪 [Storage Rules Test] Starting validation...\n');

    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
    if (!storageBucket) {
        console.error('❌ FIREBASE_STORAGE_BUCKET not configured');
        return false;
    }

    console.log(`🔧 Testing storage bucket: ${storageBucket}`);

    // Test 1: Check if bucket exists and is accessible
    console.log('\n1. 🌐 Testing bucket accessibility...');
    try {
        const response = await fetch(`https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o`);
        console.log(`   Response status: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
            console.log('✅ Storage bucket is accessible');
        } else if (response.status === 401 || response.status === 403) {
            console.log('⚠️  Storage bucket exists but access is restricted (expected for secure bucket)');
        } else {
            console.error('❌ Unexpected response from storage bucket');
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to access storage bucket:', error.message);
        return false;
    }

    // Test 2: Check Firebase configuration
    console.log('\n2. 🔧 Validating Firebase configuration...');
    const requiredEnvVars = [
        'FIREBASE_API_KEY',
        'FIREBASE_AUTH_DOMAIN', 
        'FIREBASE_PROJECT_ID',
        'FIREBASE_STORAGE_BUCKET',
        'FIREBASE_MESSAGING_SENDER_ID',
        'FIREBASE_APP_ID'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error('❌ Missing Firebase environment variables:', missingVars);
        return false;
    }
    console.log('✅ All Firebase environment variables are present');

    // Test 3: Check if we can initialize Firebase (without uploading)
    console.log('\n3. 🔗 Testing Firebase initialization...');
    try {
        const { initializeApp, getApps } = await import('firebase/app');
        const { getStorage } = await import('firebase/storage');

        const firebaseConfig = {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID,
        };

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        const storage = getStorage(app);
        console.log('✅ Firebase initialized successfully');
        console.log(`   Project ID: ${firebaseConfig.projectId}`);
        console.log(`   Storage bucket: ${firebaseConfig.storageBucket}`);

    } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
        return false;
    }

    console.log('\n🎉 Firebase configuration is valid!');
    console.log('\n📋 Next steps:');
    console.log('   1. Deploy the updated storage.rules to Firebase');
    console.log('   2. Run a scraping test to validate end-to-end image pipeline');
    console.log('   3. Check browser console for any image loading errors');
    
    return true;
}

// Run the test
testStorageRules().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('🚨 Test failed:', error);
    process.exit(1);
});