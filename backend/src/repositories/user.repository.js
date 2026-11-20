const { query } = require('../database/connection');

/**
 * Camada de Repositório (Repository Pattern)
 * Responsável estritamente pela comunicação com o Banco de Dados (SQLite).
 */
class UserRepository {
  // Lista todos os usuários (sem expor a senha)
  async findAll() {
    return await query.all(
      'SELECT id, name, email, login, active, created_at, updated_at FROM users ORDER BY id DESC'
    );
  }

  // Busca um usuário pelo ID (sem expor a senha)
  async findById(id) {
    return await query.get(
      'SELECT id, name, email, login, active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
  }

  // Busca usuário por ID trazendo também a senha (uso interno para updates parciais de senha)
  async findByIdWithPassword(id) {
    return await query.get(
      'SELECT id, name, email, login, password, active, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
  }

  // Busca por e-mail (para validar unicidade)
  async findByEmail(email) {
    return await query.get('SELECT id FROM users WHERE email = ?', [email]);
  }

  // Busca por login (para validar unicidade)
  async findByLogin(login) {
    return await query.get('SELECT id FROM users WHERE login = ?', [login]);
  }

  // Insere um novo usuário e retorna o ID gerado
  async create({ name, email, login, password, active }) {
    const result = await query.run(
      'INSERT INTO users (name, email, login, password, active) VALUES (?, ?, ?, ?, ?)',
      [name, email, login, password, active ? 1 : 0]
    );
    return result.lastID;
  }

  // Atualiza os dados de um usuário
  async update(id, { name, email, login, password, active }) {
    await query.run(
      `UPDATE users 
       SET name = ?, email = ?, login = ?, password = ?, active = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, email, login, password, active ? 1 : 0, id]
    );
  }

  // Exclui fisicamente o usuário do banco
  async delete(id) {
    const result = await query.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = new UserRepository();
