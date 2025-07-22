import { supabase } from './supabase.js';

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatContainer = document.querySelector('.chat-container');
const fileInput = document.getElementById('file-input');
const attachButton = document.getElementById('attach-button');

const API_URL = 'https://mannu-backend.netlify.app/.netlify/functions/webhook'; // 🔁 Ajuste se necessário

let currentUser = null;

// 🔐 Busca usuário logado
async function checkUserSession() {
  const { data, error } = await supabase.auth.getUser();
  if (data?.user) {
    currentUser = data.user;
  } else {
    window.location.href = 'index.html';
  }
}

// 📥 Envia mensagem de texto
async function sendMessage(messageText) {
  if (!messageText.trim()) return;

  addMessageToChat(messageText, 'user');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        numero: currentUser.email,
        nome: currentUser.user_metadata?.name || currentUser.email,
        mensagem: messageText
      })
    });

    const data = await response.json();
    addMessageToChat(data.resposta || 'Erro ao se comunicar com a Mannu.AI.', 'bot');
  } catch (err) {
    console.error('Erro:', err);
    addMessageToChat('Erro ao se comunicar com a Mannu.AI.', 'bot');
  }

  messageInput.value = '';
}

// 🖼️ Envia imagem
async function sendImage(file) {
  const formData = new FormData();
  formData.append('imagem', file);
  formData.append('numero', currentUser.email);
  formData.append('nome', currentUser.user_metadata?.name || currentUser.email);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    addMessageToChat(data.resposta || 'Erro ao se comunicar com a Mannu.AI.', 'bot');
  } catch (err) {
    console.error('Erro:', err);
    addMessageToChat('Erro ao se comunicar com a Mannu.AI.', 'bot');
  }
}

// 🖊️ Adiciona mensagem no chat
function addMessageToChat(text, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
  messageDiv.textContent = text;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ⬆️ Enviar com botão
sendButton.addEventListener('click', () => {
  sendMessage(messageInput.value);
});

// ⬆️ Enviar com Enter
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage(messageInput.value);
  }
});

// 📎 Clique em “Anexar Imagens”
attachButton.addEventListener('click', () => {
  fileInput.click();
});

// 📤 Quando imagem for escolhida
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    sendImage(file);
  }
});

// ▶️ Inicia
checkUserSession();
