const http = require('http');
const assert = require('assert');
const app = require('./src/app');

let server;
let passed = 0;
let failed = 0;

/**
 * Helper: faz uma requisição HTTP ao servidor de testes.
 * Retorna { status, headers, body }.
 */
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const dataString = body !== null ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {}),
      ...headers
    };
    const req = http.request(
      { hostname: 'localhost', port: 3001, path, method, headers: reqHeaders },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          let parsed = responseBody;
          try { parsed = JSON.parse(responseBody); } catch (_) {}
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

/**
 * Runner de teste individual com assert.
 * Em caso de falha, registra o erro e continua os próximos testes.
 */
async function test(description, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${description}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${description}`);
    console.log(`     → ${err.message}`);
  }
}

async function runTests() {
  server = app.listen(3001, async () => {
    console.log('═══════════════════════════════════════════════');
    console.log('  TESTES DE INTEGRAÇÃO — API de Usuários');
    console.log('═══════════════════════════════════════════════\n');

    const ts = Date.now();
    const testEmail = `teste_${ts}@exemplo.com`;
    const testLogin = `user_${ts}`;
    let userId;

    // ─── CRIAÇÃO ───────────────────────────────────────────
    console.log('▸ Criação de Usuário (POST /users)\n');

    await test('1. Cria usuário válido (201)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Carlos Oliveira',
        email: testEmail,
        login: testLogin,
        password: 'senhaSegura123',
        active: true
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.body.id, 'Deve retornar o ID do usuário criado');
      assert.strictEqual(res.body.name, 'Carlos Oliveira');
      userId = res.body.id;
    });

    await test('2. Senha NÃO é exposta no retorno', async () => {
      const res = await makeRequest('GET', `/users/${userId}`);
      assert.strictEqual(res.body.password, undefined, 'O campo password não deve existir no retorno');
    });

    await test('3. active padrão é true quando omitido', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Sem Active',
        email: `default_active_${ts}@teste.com`,
        login: `default_active_${ts}`,
        password: 'senhaSegura123'
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.active, true, 'active deve ser true por padrão');
      // Limpa o usuário criado
      await makeRequest('DELETE', `/users/${res.body.id}`);
    });

    // ─── VALIDAÇÕES DE CAMPO ──────────────────────────────
    console.log('\n▸ Validações de Campos (400)\n');

    await test('4. Rejeita nome com menos de 3 caracteres (400)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Ab',
        email: `name_${ts}@teste.com`,
        login: `name_${ts}`,
        password: 'senhaSegura123'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error, 'Deve retornar mensagem de erro');
    });

    await test('5. Rejeita e-mail com formato inválido (400)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Nome Válido',
        email: 'email-invalido',
        login: `email_${ts}`,
        password: 'senhaSegura123'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    await test('6. Rejeita senha com menos de 8 caracteres (400)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Nome Válido',
        email: `short_${ts}@teste.com`,
        login: `short_${ts}`,
        password: '123'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    await test('7. Rejeita login com menos de 3 caracteres (400)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Nome Válido',
        email: `login_${ts}@teste.com`,
        login: 'ab',
        password: 'senhaSegura123'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    await test('8. Rejeita active não-booleano (400)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Nome Válido',
        email: `bool_${ts}@teste.com`,
        login: `bool_${ts}`,
        password: 'senhaSegura123',
        active: 'false'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    // ─── UNICIDADE ─────────────────────────────────────────
    console.log('\n▸ Unicidade de E-mail e Login (400)\n');

    await test('9. Rejeita e-mail duplicado (400)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Outro Nome',
        email: testEmail,
        login: `dup_email_${ts}`,
        password: 'senhaSegura123'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    await test('10. Rejeita login duplicado (400)', async () => {
      const res = await makeRequest('POST', '/users', {
        name: 'Outro Nome',
        email: `dup_login_${ts}@teste.com`,
        login: testLogin,
        password: 'senhaSegura123'
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.body.error);
    });

    // ─── LEITURA ───────────────────────────────────────────
    console.log('\n▸ Leitura (GET /users)\n');

    await test('11. Lista todos os usuários (200, array)', async () => {
      const res = await makeRequest('GET', '/users');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body), 'O retorno deve ser um array');
      assert.ok(res.body.length >= 1, 'Deve haver pelo menos 1 usuário');
    });

    await test('12. Busca usuário por ID existente (200)', async () => {
      const res = await makeRequest('GET', `/users/${userId}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.id, userId);
    });

    await test('13. Retorna 404 para ID inexistente', async () => {
      const res = await makeRequest('GET', '/users/999999');
      assert.strictEqual(res.status, 404);
      assert.ok(res.body.error);
    });

    // ─── ATUALIZAÇÃO ───────────────────────────────────────
    console.log('\n▸ Atualização (PUT /users/:id)\n');

    await test('14. Atualiza usuário com sucesso (200)', async () => {
      const res = await makeRequest('PUT', `/users/${userId}`, {
        name: 'Carlos Oliveira Atualizado',
        email: testEmail,
        login: testLogin,
        active: false
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.body.name.includes('Atualizado'));
      assert.strictEqual(res.body.active, false);
    });

    await test('15. Atualização sem senha mantém acesso (200)', async () => {
      const res = await makeRequest('PUT', `/users/${userId}`, {
        name: 'Carlos Sem Senha',
        email: testEmail,
        login: testLogin,
        active: true
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.name, 'Carlos Sem Senha');
    });

    await test('16. Retorna 404 ao atualizar ID inexistente', async () => {
      const res = await makeRequest('PUT', '/users/999999', {
        name: 'Inexistente',
        email: 'inexistente@teste.com',
        login: 'inexistente'
      });
      assert.strictEqual(res.status, 404);
    });

    // ─── EXCLUSÃO ──────────────────────────────────────────
    console.log('\n▸ Exclusão (DELETE /users/:id)\n');

    await test('17. Exclui usuário com sucesso (200)', async () => {
      const res = await makeRequest('DELETE', `/users/${userId}`);
      assert.strictEqual(res.status, 200);
    });

    await test('18. Buscar usuário excluído retorna 404', async () => {
      const res = await makeRequest('GET', `/users/${userId}`);
      assert.strictEqual(res.status, 404);
    });

    await test('19. Excluir usuário inexistente retorna 404', async () => {
      const res = await makeRequest('DELETE', `/users/${userId}`);
      assert.strictEqual(res.status, 404);
    });

    // ─── JSON MALFORMADO ───────────────────────────────────
    console.log('\n▸ Tratamento de Erros Gerais\n');

    await test('20. JSON malformado retorna 400 com JSON explicativo', async () => {
      const res = await makeRequest('POST', '/users', '{invalido}');
      assert.strictEqual(res.status, 400);
      assert.ok(typeof res.body === 'object', 'Resposta deve ser JSON');
      assert.ok(res.body.error, 'Deve conter campo error');
    });

    await test('21. Rota inexistente retorna 404 com JSON', async () => {
      const res = await makeRequest('GET', '/rota-inexistente');
      assert.strictEqual(res.status, 404);
      assert.ok(typeof res.body === 'object');
      assert.ok(res.body.error);
    });

    // ─── CORS ──────────────────────────────────────────────
    console.log('\n▸ CORS\n');

    await test('22. Resposta inclui header Access-Control-Allow-Origin', async () => {
      const res = await makeRequest('GET', '/users');
      const acaoHeader = res.headers['access-control-allow-origin'];
      assert.ok(acaoHeader, 'Header Access-Control-Allow-Origin deve estar presente');
    });

    // ─── RESUMO ────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════');
    console.log(`  RESULTADO: ${passed} passou, ${failed} falhou (total: ${passed + failed})`);
    console.log('═══════════════════════════════════════════════\n');

    if (failed > 0) {
      console.log('⚠️  Alguns testes falharam. Revise os erros acima.');
    } else {
      console.log('✅ Todos os testes passaram com sucesso!');
    }

    server.close();
    process.exitCode = failed > 0 ? 1 : 0;
  });
}

runTests();
