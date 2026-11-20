const userService = require('../services/user.service');

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
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  // GET /users/:id - Detalha um usuário específico
  async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return res.status(200).json(user);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  // POST /users - Cria um novo usuário
  async create(req, res) {
    try {
      const createdUser = await userService.createUser(req.body);
      return res.status(201).json(createdUser);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  // PUT ou PATCH /users/:id - Atualiza os dados de um usuário
  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedUser = await userService.updateUser(id, req.body);
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  // DELETE /users/:id - Exclui um usuário
  async delete(req, res) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return res.status(200).json({ message: `Usuário ${id} excluído com sucesso.` });
    } catch (error) {
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
