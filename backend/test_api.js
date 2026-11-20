const request = require('http');
const app = require('./src/app');

let server;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = request.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {})
        }
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed = responseBody;
          try {
            parsed = JSON.parse(responseBody);
          } catch (e) {}
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  server = app.listen(3001, async () => {
    console.log('--- INICIANDO TESTES AUTOMATIZADOS ---');

    try {
      // 1. Criar usuário com sucesso
      const testEmail = `teste_${Date.now()}@exemplo.com`;
      const testLogin = `user_${Date.now()}`;
      
      const resCreate = await makeRequest('POST', '/users', {
        name: 'Carlos Oliveira',
        email: testEmail,
        login: testLogin,
        password: 'senhaSegura123',
        active: true
      });
      console.log('1. POST /users (válido):', resCreate.status === 201 ? 'PASSOU (201)' : 'FALHOU', resCreate.status);
      console.log('   Senha exposta no retorno?:', resCreate.body.password ? 'SIM (ERRO)' : 'NÃO (CORRETO)');
      const userId = resCreate.body.id;

      // 2. Erro: e-mail duplicado
      const resDuplicateEmail = await makeRequest('POST', '/users', {
        name: 'Outro Nome',
        email: testEmail,
        login: `novo_${Date.now()}`,
        password: 'senhaSegura123'
      });
      console.log('2. POST /users (e-mail duplicado):', resDuplicateEmail.status === 400 ? 'PASSOU (400)' : 'FALHOU', resDuplicateEmail.status);

      // 3. Erro: senha curta (< 8 chars)
      const resShortPass = await makeRequest('POST', '/users', {
        name: 'Outro Nome',
        email: `email_${Date.now()}@teste.com`,
        login: `novo_${Date.now()}`,
        password: '123'
      });
      console.log('3. POST /users (senha < 8 chars):', resShortPass.status === 400 ? 'PASSOU (400)' : 'FALHOU', resShortPass.status);

      // 4. Erro: nome curto (< 3 chars)
      const resShortName = await makeRequest('POST', '/users', {
        name: '  Ab  ',
        email: `email_${Date.now()}@teste.com`,
        login: `novo_${Date.now()}`,
        password: 'senhaSegura123'
      });
      console.log('4. POST /users (nome < 3 chars):', resShortName.status === 400 ? 'PASSOU (400)' : 'FALHOU', resShortName.status);

      // 5. Listar usuários
      const resList = await makeRequest('GET', '/users');
      console.log('5. GET /users:', resList.status === 200 && Array.isArray(resList.body) ? 'PASSOU (200)' : 'FALHOU', resList.status);

      // 6. Buscar por ID existente
      const resGetById = await makeRequest('GET', `/users/${userId}`);
      console.log('6. GET /users/:id (existente):', resGetById.status === 200 ? 'PASSOU (200)' : 'FALHOU', resGetById.status);

      // 7. Buscar por ID inexistente (404)
      const resGetNotFound = await makeRequest('GET', '/users/999999');
      console.log('7. GET /users/999999 (não existente):', resGetNotFound.status === 404 ? 'PASSOU (404)' : 'FALHOU', resGetNotFound.status);

      // 8. Atualizar usuário
      const resUpdate = await makeRequest('PUT', `/users/${userId}`, {
        name: 'Carlos Oliveira Atualizado',
        email: testEmail,
        login: testLogin,
        active: false
      });
      console.log('8. PUT /users/:id:', resUpdate.status === 200 && resUpdate.body.name.includes('Atualizado') ? 'PASSOU (200)' : 'FALHOU', resUpdate.status);

      // 9. Excluir usuário
      const resDelete = await makeRequest('DELETE', `/users/${userId}`);
      console.log('9. DELETE /users/:id:', resDelete.status === 200 ? 'PASSOU (200)' : 'FALHOU', resDelete.status);

      // 10. Tentar buscar usuário deletado (deve ser 404)
      const resGetDeleted = await makeRequest('GET', `/users/${userId}`);
      console.log('10. GET /users/:id após delete:', resGetDeleted.status === 404 ? 'PASSOU (404)' : 'FALHOU', resGetDeleted.status);

      console.log('--- TODOS OS TESTES FORAM CONCLUÍDOS COM SUCESSO! ---');
    } catch (err) {
      console.error('Erro nos testes:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();
