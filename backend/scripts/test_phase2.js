"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function runTests() {
    return __awaiter(this, void 0, void 0, function* () {
        const BASE_URL = 'http://localhost:3000/api';
        let authToken = '';
        console.log('--- Starting Verification ---');
        try {
            // 1. Login User
            const timestamp = Date.now();
            const userEmail = `testuser${timestamp}@example.com`;
            const userPassword = 'password123';
            console.log(`1. Signing up user: ${userEmail}`);
            const signupRes = yield fetch(`${BASE_URL}/auth/user/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: userEmail,
                    password: userPassword,
                    name: 'Test User',
                    latitude: 40.7128,
                    longitude: -74.0060,
                    address: '123 Test St'
                })
            });
            const signupData = yield signupRes.json();
            if (!signupRes.ok)
                throw new Error(JSON.stringify(signupData));
            authToken = signupData.token;
            console.log('User signed up, token received.');
            // 2. Fetch Nearby Listings
            console.log('2. Fetching nearby listings...');
            const listingsRes = yield fetch(`${BASE_URL}/listings/nearby?lat=40.7128&lng=-74.0060&radius=100`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const listingsData = yield listingsRes.json();
            if (!listingsRes.ok)
                throw new Error(JSON.stringify(listingsData));
            const listings = listingsData.data;
            console.log(`Found ${listings.length} listings.`);
            if (listings.length === 0) {
                console.warn('No listings found. Cannot proceed with Order test without a listing.');
                return;
            }
            const targetListing = listings[0];
            console.log(`Targeting Listing ID: ${targetListing.id}`);
            // 3. Get Listing Details
            console.log('3. Fetching listing details...');
            const detailRes = yield fetch(`${BASE_URL}/listings/${targetListing.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const detailData = yield detailRes.json();
            if (!detailRes.ok)
                throw new Error(JSON.stringify(detailData));
            console.log('Listing details fetched:', detailData.data.name);
            // 4. Create Order
            console.log('4. Creating Order...');
            const orderRes = yield fetch(`${BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    surpriseBoxId: targetListing.id,
                    deliveryMethod: 'PICKUP'
                })
            });
            const orderData = yield orderRes.json();
            if (!orderRes.ok)
                throw new Error(JSON.stringify(orderData));
            console.log('Order created successfully:', orderData.data.id);
            console.log('Status:', orderData.data.status);
            console.log('--- Verification Complete ---');
        }
        catch (error) {
            console.error('Test Failed:', error.message);
            process.exit(1);
        }
    });
}
runTests();
