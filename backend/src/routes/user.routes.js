const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

/**
 * Definição dos endpoints REST da aplicação
 */

// Listagem completa
router.get('/users', (req, res) => userController.listAll(req, res));

// Detalhes por ID
router.get('/users/:id', (req, res) => userController.getById(req, res));

// Cadastro de novo usuário
router.post('/users', (req, res) => userController.create(req, res));

// Alteração completa (PUT) ou parcial (PATCH)
router.put('/users/:id', (req, res) => userController.update(req, res));
router.patch('/users/:id', (req, res) => userController.update(req, res, true));

// Exclusão por ID
router.delete('/users/:id', (req, res) => userController.delete(req, res));

module.exports = router;
