const jwt = require('jsonwebtoken');

const ZAINCASH_CONFIG = {
  merchantId: process.env.ZAINCASH_MERCHANT_ID || 'your_merchant_id',
  secret: process.env.ZAINCASH_SECRET || 'your_zaincash_secret',
  apiBaseUrl: 'https://api.zaincash.iq',
  redirectUrl: process.env.ZAINCASH_REDIRECT_URL || 'http://localhost:3000/payment/callback',
};

function initZainCash({ amount, msisdn, description }) {
  const payload = {
    amount: Math.round(amount * 1000),
    msisdn: msisdn,
    merchantId: ZAINCASH_CONFIG.merchantId,
    timestamp: Math.floor(Date.now() / 1000),
    expiresIn: 600,
    redirectUrl: ZAINCASH_CONFIG.redirectUrl,
  };
  try {
    const token = jwt.sign(payload, ZAINCASH_CONFIG.secret, { algorithm: 'HS256', expiresIn: '10m' });
    return { success: true, token, paymentUrl: ZAINCASH_CONFIG.apiBaseUrl + '/payment?token=' + token };
  } catch (error) {
    return { success: false, message: 'Payment failed: ' + error.message };
  }
}

function verifyZainCash(token) {
  try {
    const decoded = jwt.verify(token, ZAINCASH_CONFIG.secret, { algorithms: ['HS256'] });
    return { success: true, transactionId: decoded.id, status: decoded.status || 'completed' };
  } catch (error) {
    return { success: false, message: 'Verification failed: ' + error.message };
  }
}

module.exports = { initZainCash, verifyZainCash, ZAINCASH_CONFIG };
