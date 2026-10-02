// test.js
require('dotenv').config({ path: '../.env' });

console.log('Mongo URI:', process.env.MONGODB_URI);  // Should log Mongo URI
console.log('Port:', process.env.PORT);              // Should log Port
console.log('JWT Secret:', process.env.JWT_SECRET);  // Should log JWT Secret
