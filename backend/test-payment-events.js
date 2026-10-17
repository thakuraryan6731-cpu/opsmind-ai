const API_URL = 'http://localhost:3000';

const TOKEN = process.env.OPSMIND_TOKEN;

if (!TOKEN) {
  throw new Error(
    'Missing OPSMIND_TOKEN environment variable.',
  );
}
async function generatePaymentEvents() {
  for (let i = 1; i <= 20; i++) {
    // Simulate 4 failed payments and 16 successful payments.
    const failed = i <= 4;

    const event = {
      type: failed ? 'payment.failed' : 'payment.success',
      source: 'payment-service',
      severity: failed ? 'HIGH' : 'INFO',
      message: failed
        ? 'Payment gateway timeout'
        : 'Payment completed successfully',
      metadata: {
        transactionId: `txn_demo_${String(i).padStart(3, '0')}`,
        errorCode: failed ? 'PAYMENT_GATEWAY_TIMEOUT' : null,
        testRun: 'payment-anomaly-demo',
      },
    };

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`Event ${i} failed:`, response.status, result);
        return;
      }

      console.log(
        `Event ${i}/20 created: ${result.type} (${result.id})`,
      );
    } catch (error) {
      console.error('Could not connect to OpsMind API:', error.message);
      return;
    }
  }

  console.log('\nFinished creating 20 payment events.');
}

generatePaymentEvents();
