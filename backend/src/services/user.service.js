const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');

/**
 * Camada de Serviço (Service Pattern)
 * Responsável pelas regras de negócio, validações de dados e hash de segurança.
 */
class UserService {
  // Regex simples e robusto para validação de formato de e-mail
  static EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Formata o usuário retornado do banco (converte active para booleano e garante que senha não exista)
  formatUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      active: user.active === 1 || user.active === true
    };
  }

  // Lista todos os usuários
  async getAllUsers() {
    const users = await userRepository.findAll();
    return users.map(user => this.formatUser(user));
  }

  // Busca detalhes de um usuário por ID
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error(`Usuário com ID ${id} não foi encontrado.`);
      error.statusCode = 404;
      throw error;
    }
    return this.formatUser(user);
  }

  // Criação de um novo usuário com validações estritas
  async createUser(data) {
    const { name, email, login, password, active } = data || {};

    // 1. Validação de Nome
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      const error = new Error('O campo "name" é obrigatório e deve conter no mínimo 3 caracteres válidos.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validação de E-mail (formato)
    if (!email || typeof email !== 'string' || !UserService.EMAIL_REGEX.test(email.trim())) {
      const error = new Error('O campo "email" é obrigatório e deve possuir um formato válido (ex: usuario@dominio.com).');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validação de Unicidade de E-mail
    const emailNormalized = email.trim().toLowerCase();
    const existingEmail = await userRepository.findByEmail(emailNormalized);
    if (existingEmail) {
      const error = new Error('O e-mail informado já está cadastrado no sistema.');
      error.statusCode = 400;
      throw error;
    }

    // 4. Validação de Login
    if (!login || typeof login !== 'string' || login.trim().length < 3) {
      const error = new Error('O campo "login" é obrigatório e deve conter no mínimo 3 caracteres.');
      error.statusCode = 400;
      throw error;
    }

    // 5. Validação de Unicidade de Login
    const loginNormalized = login.trim().toLowerCase();
    const existingLogin = await userRepository.findByLogin(loginNormalized);
    if (existingLogin) {
      const error = new Error('O login informado já está cadastrado no sistema.');
      error.statusCode = 400;
      throw error;
    }

    // 6. Validação e Criptografia da Senha
    if (!password || typeof password !== 'string' || password.length < 8) {
      const error = new Error('O campo "password" é obrigatório e deve conter no mínimo 8 caracteres.');
      error.statusCode = 400;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Status do Usuário (padrão true se omitido; aceita apenas booleano)
    if (active !== undefined && typeof active !== 'boolean') {
      const error = new Error('O campo "active" deve ser um valor booleano (true ou false).');
      error.statusCode = 400;
      throw error;
    }
    const userActive = active !== undefined ? active : true;

    // 8. Inserção no banco
    const createdId = await userRepository.create({
      name: name.trim(),
      email: emailNormalized,
      login: loginNormalized,
      password: hashedPassword,
      active: userActive
    });

    // Retorna o usuário criado sem expor a senha
    return await this.getUserById(createdId);
  }

  // Atualização de usuário
  async updateUser(id, data) {
    const existingUser = await userRepository.findByIdWithPassword(id);
    if (!existingUser) {
      const error = new Error(`Usuário com ID ${id} não foi encontrado.`);
      error.statusCode = 404;
      throw error;
    }

    const { name, email, login, password, active } = data || {};

    // 1. Validação de Nome
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      const error = new Error('O campo "name" é obrigatório e deve conter no mínimo 3 caracteres válidos.');
      error.statusCode = 400;
      throw error;
    }

    // 2. Validação de E-mail
    if (!email || typeof email !== 'string' || !UserService.EMAIL_REGEX.test(email.trim())) {
      const error = new Error('O campo "email" é obrigatório e deve possuir um formato válido.');
      error.statusCode = 400;
      throw error;
    }
    const emailNormalized = email.trim().toLowerCase();
    const userWithSameEmail = await userRepository.findByEmail(emailNormalized);
    if (userWithSameEmail && Number(userWithSameEmail.id) !== Number(id)) {
      const error = new Error('O e-mail informado já está em uso por outro usuário.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Validação de Login
    if (!login || typeof login !== 'string' || login.trim().length < 3) {
      const error = new Error('O campo "login" é obrigatório e deve conter no mínimo 3 caracteres.');
      error.statusCode = 400;
      throw error;
    }
    const loginNormalized = login.trim().toLowerCase();
    const userWithSameLogin = await userRepository.findByLogin(loginNormalized);
    if (userWithSameLogin && Number(userWithSameLogin.id) !== Number(id)) {
      const error = new Error('O login informado já está em uso por outro usuário.');
      error.statusCode = 400;
      throw error;
    }

    // 4. Tratamento de Senha (se enviada, valida e faz hash; se vazia, mantém a atual)
    let finalPassword = existingUser.password;
    if (password !== undefined && password !== null && password !== '') {
      if (typeof password !== 'string' || password.length < 8) {
        const error = new Error('Se informada, a nova senha deve conter no mínimo 8 caracteres.');
        error.statusCode = 400;
        throw error;
      }
      finalPassword = await bcrypt.hash(password, 10);
    }

    // 5. Status (aceita apenas booleano; se omitido, mantém o valor atual)
    if (active !== undefined && typeof active !== 'boolean') {
      const error = new Error('O campo "active" deve ser um valor booleano (true ou false).');
      error.statusCode = 400;
      throw error;
    }
    const userActive = active !== undefined ? active : Boolean(existingUser.active);

    // 6. Atualização no banco
    await userRepository.update(id, {
      name: name.trim(),
      email: emailNormalized,
      login: loginNormalized,
      password: finalPassword,
      active: userActive
    });

    return await this.getUserById(id);
  }

  // Exclusão de usuário
  async deleteUser(id) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      const error = new Error(`Usuário com ID ${id} não foi encontrado.`);
      error.statusCode = 404;
      throw error;
    }

    await userRepository.delete(id);
    return true;
  }
}

module.exports = new UserService();
