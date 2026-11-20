/**
 * Aplicação Frontend - Gestão de Usuários
 * JavaScript Puro (Vanilla JS) para máxima clareza e facilidade de explicação.
 */

// 1. Configuração da URL Base da API REST
// Se executado pelo Express (localhost:3000) usa a mesma origem; se aberto via arquivo local usa http://localhost:3000
const API_URL = (window.location.protocol === 'file:' || !window.location.port) 
  ? 'http://localhost:3000' 
  : window.location.origin;

// 2. Estado Global da Aplicação
let usersState = [];
let editingUserId = null;
let deletingUserId = null;

// 3. Mapeamento de Elementos do DOM
const elements = {
  // Estatísticas
  statTotal: document.getElementById('stat-total'),
  statActive: document.getElementById('stat-active'),
  statInactive: document.getElementById('stat-inactive'),

  // Busca e Ações
  searchInput: document.getElementById('search-input'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  btnRefresh: document.getElementById('btn-refresh'),
  refreshIcon: document.getElementById('refresh-icon'),
  btnOpenCreateModal: document.getElementById('btn-open-create-modal'),

  // Tabela
  tableBody: document.getElementById('users-table-body'),
  tableLoading: document.getElementById('table-loading'),
  tableEmpty: document.getElementById('table-empty'),

  // Modal de Criação / Edição
  userModal: document.getElementById('user-modal'),
  userForm: document.getElementById('user-form'),
  modalTitle: document.getElementById('modal-title'),
  userIdInput: document.getElementById('user-id'),
  nameInput: document.getElementById('input-name'),
  emailInput: document.getElementById('input-email'),
  loginInput: document.getElementById('input-login'),
  passwordInput: document.getElementById('input-password'),
  activeInput: document.getElementById('input-active'),
  passwordRequiredMark: document.getElementById('password-required-mark'),
  passwordHint: document.getElementById('password-hint'),
  btnTogglePassword: document.getElementById('btn-toggle-password'),
  togglePasswordIcon: document.getElementById('toggle-password-icon'),
  formErrorAlert: document.getElementById('form-error-alert'),
  formErrorText: document.getElementById('form-error-text'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  btnSubmitForm: document.getElementById('btn-submit-form'),
  submitSpinner: document.getElementById('submit-spinner'),

  // Modal de Exclusão
  deleteModal: document.getElementById('delete-modal'),
  deleteUserName: document.getElementById('delete-user-name'),
  btnCloseDeleteModal: document.getElementById('btn-close-delete-modal'),
  btnCancelDelete: document.getElementById('btn-cancel-delete'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),
  deleteSpinner: document.getElementById('delete-spinner'),

  // Toasts
  toastContainer: document.getElementById('toast-container')
};

// ========================================================
// INICIALIZAÇÃO DA PÁGINA
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  fetchUsers();
});

// ========================================================
// REGISTRO DE EVENTOS (LISTENERS)
// ========================================================
function setupEventListeners() {
  // Abertura do modal de criação
  elements.btnOpenCreateModal.addEventListener('click', openCreateModal);

  // Fechamento de modal de usuário
  elements.btnCloseModal.addEventListener('click', closeUserModal);
  elements.btnCancelModal.addEventListener('click', closeUserModal);

  // Submissão do formulário (Criar ou Editar)
  elements.userForm.addEventListener('submit', handleFormSubmit);

  // Fechamento de modal de exclusão
  elements.btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
  elements.btnCancelDelete.addEventListener('click', closeDeleteModal);

  // Confirmação de exclusão
  elements.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

  // Busca em tempo real
  elements.searchInput.addEventListener('input', handleSearch);
  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    renderUsers(usersState);
  });

  // Botão de atualizar lista
  elements.btnRefresh.addEventListener('click', () => {
    elements.refreshIcon.classList.add('ph-spin');
    fetchUsers().finally(() => {
      setTimeout(() => elements.refreshIcon.classList.remove('ph-spin'), 600);
    });
  });

  // Mostrar / Ocultar Senha
  elements.btnTogglePassword.addEventListener('click', togglePasswordVisibility);

  // Delegação de eventos para ações da tabela (Editar / Excluir) de forma segura contra XSS
  elements.tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button.btn-action');
    if (!btn) return;

    const id = Number(btn.dataset.id);
    if (!id) return;

    if (btn.dataset.action === 'edit' || btn.classList.contains('edit')) {
      openEditModal(id);
    } else if (btn.dataset.action === 'delete' || btn.classList.contains('delete')) {
      openDeleteModal(id);
    }
  });

  // Fechar modais ao clicar no fundo escuro
  window.addEventListener('click', (e) => {
    if (e.target === elements.userModal) closeUserModal();
    if (e.target === elements.deleteModal) closeDeleteModal();
  });
}

// ========================================================
// COMUNICAÇÃO COM A API REST
// ========================================================

/**
 * Busca a lista completa de usuários (GET /users)
 */
async function fetchUsers() {
  showTableLoading(true);
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) {
      throw new Error('Falha ao buscar usuários da API.');
    }
    const data = await response.json();
    usersState = data;
    renderUsers(usersState);
    updateStats(usersState);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    showToast(error.message || 'Erro de comunicação com o servidor.', 'error');
    elements.tableBody.innerHTML = '';
    elements.tableEmpty.classList.remove('hidden');
  } finally {
    showTableLoading(false);
  }
}

/**
 * Busca os dados de um usuário pelo ID (GET /users/:id)
 */
async function fetchUserById(id) {
  const response = await fetch(`${API_URL}/users/${id}`);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Erro ao carregar dados do usuário.');
  }
  return await response.json();
}

/**
 * Envia criação ou alteração de usuário (POST ou PUT /users)
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  hideFormError();

  const name = elements.nameInput.value.trim();
  const email = elements.emailInput.value.trim();
  const login = elements.loginInput.value.trim();
  const password = elements.passwordInput.value;
  const active = elements.activeInput.checked;

  // Validações básicas no Frontend antes do envio (coleta múltiplos erros)
  const errors = [];
  if (name.length < 3) {
    errors.push('O nome deve conter pelo menos 3 caracteres.');
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Informe um e-mail válido.');
  }
  if (login.length < 3) {
    errors.push('O login deve conter pelo menos 3 caracteres.');
  }
  // Se estiver criando, a senha é obrigatória
  if (!editingUserId && (!password || password.length < 8)) {
    errors.push('A senha é obrigatória e deve ter pelo menos 8 caracteres.');
  }
  // Se estiver editando e digitou senha, deve ter min 8 chars
  if (editingUserId && password && password.length < 8) {
    errors.push('A nova senha deve ter no mínimo 8 caracteres.');
  }
  if (errors.length) {
    const msg = errors.join('\n');
    showFormError(msg);
    showToast(msg, 'error');
    return;
  }

  const payload = { name, email, login, active };
  // Apenas envia a senha se preenchida
  if (password) {
    payload.password = password;
  }

  setFormLoading(true);

  try {
    const url = editingUserId ? `${API_URL}/users/${editingUserId}` : `${API_URL}/users`;
    const method = editingUserId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao salvar o usuário.');
    }

    showToast(
      editingUserId ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!', 
      'success'
    );
    closeUserModal();
    await fetchUsers();
  } catch (error) {
    showFormError(error.message);
    showToast(error.message, 'error');
  } finally {
    setFormLoading(false);
  }
}

/**
 * Confirmação e execução da exclusão (DELETE /users/:id)
 */
async function handleConfirmDelete() {
  if (!deletingUserId) return;

  setDeleteLoading(true);
  try {
    const response = await fetch(`${API_URL}/users/${deletingUserId}`, {
      method: 'DELETE'
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao excluir usuário.');
    }

    showToast('Usuário excluído com sucesso!', 'success');
    closeDeleteModal();
    await fetchUsers();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setDeleteLoading(false);
  }
}

// ========================================================
// RENDERIZAÇÃO E INTERFACE VISUAL
// ========================================================

/**
 * Renderiza as linhas da tabela de usuários
 */
function renderUsers(usersList) {
  elements.tableBody.innerHTML = '';

  if (!usersList || usersList.length === 0) {
    elements.tableEmpty.classList.remove('hidden');
    return;
  }

  elements.tableEmpty.classList.add('hidden');

  usersList.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="user-id-badge">#${user.id}</span></td>
      <td><strong>${escapeHtml(user.name)}</strong></td>
      <td>${escapeHtml(user.email)}</td>
      <td><code>${escapeHtml(user.login)}</code></td>
      <td>
        <span class="badge-status ${user.active ? 'active' : 'inactive'}">
          <span class="status-dot"></span>
          ${user.active ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td>
        <div class="actions-cell">
          <button class="btn-action edit" data-action="edit" data-id="${user.id}" title="Editar usuário">
            <i class="ph ph-pencil-simple"></i>
            <span>Editar</span>
          </button>
          <button class="btn-action delete" data-action="delete" data-id="${user.id}" title="Excluir usuário">
            <i class="ph ph-trash"></i>
            <span>Excluir</span>
          </button>
        </div>
      </td>
    `;
    elements.tableBody.appendChild(tr);
  });
}

/**
 * Atualiza os contadores no topo da tela
 */
function updateStats(usersList) {
  const total = usersList.length;
  const activeCount = usersList.filter(u => u.active).length;
  const inactiveCount = total - activeCount;

  elements.statTotal.textContent = total;
  elements.statActive.textContent = activeCount;
  elements.statInactive.textContent = inactiveCount;
}

/**
 * Filtro em tempo real no campo de busca
 */
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();

  if (query.length > 0) {
    elements.clearSearchBtn.classList.remove('hidden');
  } else {
    elements.clearSearchBtn.classList.add('hidden');
  }

  const filtered = usersState.filter(user => {
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.login.toLowerCase().includes(query)
    );
  });

  renderUsers(filtered);
}

// ========================================================
// CONTROLE DOS MODAIS
// ========================================================

/**
 * Abre o modal no modo Cadastro
 */
function openCreateModal() {
  editingUserId = null;
  elements.userForm.reset();
  elements.userIdInput.value = '';
  elements.modalTitle.textContent = 'Novo Usuário';
  elements.activeInput.checked = true;

  // No cadastro a senha é obrigatória
  elements.passwordRequiredMark.classList.remove('hidden');
  elements.passwordInput.required = true;
  elements.passwordInput.placeholder = 'No mínimo 8 caracteres';
  elements.passwordHint.textContent = 'Mínimo de 8 caracteres. Será criptografada com algoritmo BCrypt.';

  hideFormError();
  elements.userModal.classList.remove('hidden');
  elements.nameInput.focus();
}

/**
 * Abre o modal no modo Edição (busca dados via GET /users/:id)
 */
async function openEditModal(id) {
  editingUserId = id;
  hideFormError();

  try {
    const user = await fetchUserById(id);

    elements.userIdInput.value = user.id;
    elements.nameInput.value = user.name;
    elements.emailInput.value = user.email;
    elements.loginInput.value = user.login;
    elements.passwordInput.value = '';
    elements.activeInput.checked = Boolean(user.active);

    elements.modalTitle.textContent = `Editar Usuário #${user.id}`;

    // Na edição a senha é opcional
    elements.passwordRequiredMark.classList.add('hidden');
    elements.passwordInput.required = false;
    elements.passwordInput.placeholder = 'Deixe em branco para manter a senha atual';
    elements.passwordHint.textContent = 'Preencha apenas se desejar redefinir a senha atual.';

    elements.userModal.classList.remove('hidden');
    elements.nameInput.focus();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

function closeUserModal() {
  elements.userModal.classList.add('hidden');
  elements.userForm.reset();
  hideFormError();
  editingUserId = null;
}

/**
 * Abre o modal de confirmação de exclusão
 * O nome é obtido a partir de usersState pelo ID, evitando interpolação insegura no HTML
 */
function openDeleteModal(id, name) {
  deletingUserId = Number(id);
  const user = usersState.find(u => u.id === deletingUserId);
  elements.deleteUserName.textContent = (user && user.name) || name || '';
  elements.deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
  elements.deleteModal.classList.add('hidden');
  deletingUserId = null;
}

// ========================================================
// FEEDBACK VISUAL: ESTADOS, ALERTAS E TOASTS
// ========================================================

function showTableLoading(isLoading) {
  if (isLoading) {
    elements.tableLoading.classList.remove('hidden');
    elements.tableEmpty.classList.add('hidden');
  } else {
    elements.tableLoading.classList.add('hidden');
  }
}

function setFormLoading(isLoading) {
  elements.btnSubmitForm.disabled = isLoading;
  if (isLoading) {
    elements.submitSpinner.classList.remove('hidden');
    elements.btnSubmitForm.querySelector('.btn-text').textContent = 'Salvando...';
  } else {
    elements.submitSpinner.classList.add('hidden');
    elements.btnSubmitForm.querySelector('.btn-text').textContent = 'Salvar Usuário';
  }
}

function setDeleteLoading(isLoading) {
  elements.btnConfirmDelete.disabled = isLoading;
  if (isLoading) {
    elements.deleteSpinner.classList.remove('hidden');
    elements.btnConfirmDelete.querySelector('.btn-text').textContent = 'Excluindo...';
  } else {
    elements.deleteSpinner.classList.add('hidden');
    elements.btnConfirmDelete.querySelector('.btn-text').textContent = 'Sim, Excluir';
  }
}

function showFormError(message) {
  elements.formErrorText.textContent = message;
  elements.formErrorAlert.classList.remove('hidden');
}

function hideFormError() {
  elements.formErrorAlert.classList.add('hidden');
  elements.formErrorText.textContent = '';
}

function togglePasswordVisibility() {
  const isPassword = elements.passwordInput.type === 'password';
  elements.passwordInput.type = isPassword ? 'text' : 'password';
  elements.togglePasswordIcon.className = isPassword ? 'ph ph-eye-slash' : 'ph ph-eye';
}

/**
 * Sistema de Toasts (Avisos de Sucesso / Erro amigáveis)
 */
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconName = 'ph-info';
  if (type === 'success') iconName = 'ph-check-circle';
  if (type === 'error') iconName = 'ph-warning-circle';

  toast.innerHTML = `
    <i class="ph ${iconName}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  elements.toastContainer.appendChild(toast);

  // Remove suavemente após 4 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

// ========================================================
// UTILITÁRIOS DE SEGURANÇA CONTRA XSS
// ========================================================
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeQuotes(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

// Exporta para escopo global para compatibilidade e testes
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
