const jwt = require('jsonwebtoken');

const user = { name: 'testuser' }; // Sample payload

const token = jwt.sign(user, 'Test', { expiresIn: '1h' });
console.log('Temporary Token:', token);
