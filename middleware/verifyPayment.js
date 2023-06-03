const https = require('https');

const PAYSTACK_KEY = process.env.PAYSTACK_KEY;

const verifyTransaction = (reference) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_KEY}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const responseData = JSON.parse(data);

        if (responseData.status) {
          const transactionData = responseData.data;
          // Extract relevant data from the transactionData object as needed

          console.log(transactionData);
          
          // For example:
          const { id, amount, currency, paid_at, customer } = transactionData;

          // Perform necessary operations with the transaction data

          resolve(transactionData); // Resolve with the transaction data for further processing
        } else {
          reject(new Error('Transaction verification failed'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error verifying transaction:', error);
      reject(error);
    });

    req.end();
  });
};

module.exports = verifyTransaction;
