import { supabase } from './supabase.js';

const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');

const LIMITE_MENSAGENS_POR_DIA = 25;
const LIMITE_IMAGENS_POR_MES = 20;

let usuario = null;

// Formata a data para YYYY-MM-DD
function formatarDataHoje() {
  const hoje = new Date();
  return hoje.toISOString().split('T')[0];
}

// Mostra mensagem no chat
function appendMessage(text, sender) {
  const message = document.createElement('div');
  message.classList.add('message', sender);
  message.innerText = text;
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Animação de digitando...
function showTyping() {
  const typing = document.createElement('div');
  typing.classList.add('message', 'mannu');
  typing.id = 'typing';
  typing.innerText = 'digitando...';
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById('typing');
  if (typing) typing.remove();
}

// Busca dados do usuário logado
async function buscarUsuario() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    appendMessage('Usuário não logado.', 'mannu');
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('usuarios_mannauai')
    .select('*')
    .eq('email', user.email)
    .single();

  if (error || !data) {
    appendMessage('Erro ao carregar dados do usuário.', 'mannu');
    throw new Error('Erro ao buscar usuário no Supabase');
  }

  usuario = data;
}

// Verifica e reseta contadores se o dia mudou
async function verificarEAtualizarMensagens() {
  const hoje = formatarDataHoje();

  // Reset diário
  if (usuario.ultima_data_mensagem !== hoje) {
    usuario.mensagens_hoje = 0;
    usuario.ultima_data_mensagem = hoje;
    usuario.avisou_mannu = false;

    await supabase
      .from('usuarios_mannauai')
      .update({
        mensagens_hoje: 0,
        ultima_data_mensagem: hoje,
        avisou_mannu: false
      })
      .eq('email', usuario.email);
  }

  if (usuario.mensagens_hoje >= LIMITE_MENSAGENS_POR_DIA) {
    appendMessage(`Você já usou suas ${LIMITE_MENSAGENS_POR_DIA} mensagens hoje. Volte amanhã.`, 'mannu');
    return false;
  }

  return true;
}

// Envia mensagem para API da Mannu
async function sendMessage() {
  const mensagem = userInput.value.trim();
  if (!mensagem) return;

  const permitido = await verificarEAtualizarMensagens();
  if (!permitido) return;

  appendMessage(mensagem, 'user');
  userInput.value = '';
  userInput.style.height = 'auto';
  showTyping();

  try {
    const response
