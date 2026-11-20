const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/user.routes');

const app = express();

// 1. Suporte a CORS (permitindo acesso de qualquer origem, inclusive frontend local)
app.use(cors());

// 2. Parser para JSON no corpo das requisições
app.use(express.json());

// 3. Servir os arquivos estáticos do Frontend (permite acessar http://localhost:3000 direto no navegador)
app.use(express.static(path.resolve(__dirname, '../../frontend')));

// 4. Registro das rotas da API
app.use(userRoutes);

// 5. Rota de verificação de status da API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API online', timestamp: new Date().toISOString() });
});

// 6. Tratamento de rotas inexistentes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado.' });
});

module.exports = app;
