// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Prefixo da API
app.use('/api', routes);

// Middleware de erro (sempre por último)
app.use(errorMiddleware);

module.exports = app;
