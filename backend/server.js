const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('========================================================');
  console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`👉 Acesse a aplicação web em: http://localhost:${PORT}`);
  console.log(`👉 Endpoint da API de Usuários: http://localhost:${PORT}/users`);
  console.log('========================================================');
});
