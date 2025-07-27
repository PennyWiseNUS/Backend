const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.user = { user: { id: 'mockUserId' } };
    next();
  });

app.use('/api/auth', require('./routes/auth'));

app.use('/api/emergency-funds', require('./routes/emergencyFund'));

app.use('/api/entries', require('./routes/entries'));

app.use('/api/expense', require('./routes/expense'));

app.use('/api/goals', require('./routes/goals'));


module.exports = app;
