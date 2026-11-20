const userService = require('../services/user.service');

function sendError(res, error) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error('Erro inesperado:', error);
    return res.status(statusCode).json({ error: 'Erro interno do servidor.' });
  }

  return res.status(statusCode).json({ error: error.message });
}

/**
 * Camada de Controller (Controller Pattern)
 * Responsável por receber a requisição HTTP, acionar o serviço e devolver a resposta.
 */
class UserController {
  // GET /users - Lista todos os usuários
  async listAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return sendError(res, error);
    }
  }

  // GET /users/:id - Detalha um usuário específico
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return res.status(200).json(user);
    } catch (error) {
      return sendError(res, error);
    }
  }

  // POST /users - Cria um novo usuário
  async create(req, res) {
    try {
      const createdUser = await userService.createUser(req.body);
      return res.status(201).json(createdUser);
    } catch (error) {
      return sendError(res, error);
    }
  }

  // PUT /users/:id substitui os dados; PATCH /users/:id altera somente campos enviados
  async update(req, res, isPartial = false) {
    try {
      const { id } = req.params;
      const updatedUser = await userService.updateUser(id, req.body, { partial: isPartial });
      return res.status(200).json(updatedUser);
    } catch (error) {
      return sendError(res, error);
    }
  }

  // DELETE /users/:id - Exclui um usuário
  async delete(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return res.status(200).json({ message: `Usuário ${id} excluído com sucesso.` });
    } catch (error) {
      return sendError(res, error);
    }
  }
}

module.exports = new UserController();
