const jwt = require('jsonwebtoken');
function initZainCash(amount, secret) {
    return jwt.sign({ amount, msisdn: "9647800000000" }, secret);
}
