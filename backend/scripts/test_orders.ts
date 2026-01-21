const API_URL = 'http://localhost:3000/api';

async function testOrderFlow() {
  try {
    // 1. Signup/Login
    console.log('1. Authenticating...');
    const email = `test.user.${Date.now()}@example.com`;
    const authRes = await fetch(`${API_URL}/customer/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
        name: 'Test User',
        address: '123 Test St, Cairo'
      })
    });
    const authData = await authRes.json();
    if (!authRes.ok) throw new Error(JSON.stringify(authData));
    
    const { token } = authData;
    console.log('✅ Authenticated');

    // 2. Get Listing
    console.log('\n2. Fetching Listings...');
    const listingsRes = await fetch(`${API_URL}/customer/listings/nearby?lat=30.0459&lng=31.2243&radius=10`);
    const listingsData = await listingsRes.json();
    if (!listingsRes.ok) throw new Error(JSON.stringify(listingsData));
    
    const listingId = listingsData.data[0].id;
    console.log(`✅ Found Listing ID: ${listingId}`);

    // 3. Create Order
    console.log('\n3. Creating Order...');
    const orderRes = await fetch(`${API_URL}/customer/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        surpriseBoxId: listingId,
        deliveryMethod: 'PICKUP'
      })
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(JSON.stringify(orderData));
    
    const order = orderData.data;
    console.log('Order Response:', JSON.stringify(order, null, 2));
    console.log(`✅ Order Created! Code: ${order.orderCode}`);

    if (!order.orderCode) throw new Error('Order code missing!');

    // 4. Get My Orders
    console.log('\n4. Fetching My Orders...');
    const myOrdersRes = await fetch(`${API_URL}/customer/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const myOrdersData = await myOrdersRes.json();
    if (!myOrdersRes.ok) throw new Error(JSON.stringify(myOrdersData));

    const myOrders = myOrdersData.data;
    console.log(`✅ Found ${myOrders.length} orders`);
    if (myOrders.length === 0) throw new Error('No orders found!');

    // 5. Get Order By ID
    console.log('\n5. Fetching Order Details...');
    const detailRes = await fetch(`${API_URL}/customer/orders/${order.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const detailData = await detailRes.json();
    if (!detailRes.ok) throw new Error(JSON.stringify(detailData));

    const detail = detailData.data;
    console.log(`✅ Order Details Retrieved. Status: ${detail.pickupStatus}`);
    
    if (detail.orderCode !== order.orderCode) throw new Error('Order code mismatch!');

    console.log('\n🎉 ALL TESTS PASSED!');
  } catch (error: any) {
    console.error('❌ Test Failed:', error);
    process.exit(1);
  }
}

testOrderFlow();
