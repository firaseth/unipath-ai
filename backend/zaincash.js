const jwt = require('jsonwebtoken');
// ZainCash JWT Initiation[cite: 1]
function initZainCash(amount, secret) {
    return jwt.sign({ amount, msisdn: "9647800000000" }, secret);
}
