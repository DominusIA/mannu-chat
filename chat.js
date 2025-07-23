// chat.js
import { supabase } from './supabase.js';

const chat = document.getElementById("chat");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const uploadInput = document.getElementById("upload");

// 🔄 Atualizado para o domínio correto:
const API_URL = "https://mannuai.netlify.app/.netlify/functions/webhook";

function addMensagem(texto, tipo) {
  const msg = document.createElement("div");
  msg.className = `mensagem ${tipo}`;
  const content = document.createElement("div");
  content.className = "texto";

  // Aplica classe de estilo específica para cliente (bloco) ou IA (apenas texto)
  if (tipo === "usuario") {
    content.classList.add("usuario-bolha");
  }

  content.textContent = texto;
  msg.appendChild(content);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function addDigitando() {
  const msg = document.createElement("div");
  msg.className = "mensagem ia";
  msg.id = "digitando";
  const content = document.createElement("div");
  content.className = "texto";
  content.textContent = "Mannu.AI está digitando...";
  msg.appendChild(content);
  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function removerDigitando() {
  const digitando = document.getElementById("digitando");
  if (digitando) digitando.remove();
}

async function enviarMensagem() {
  const texto = input.value.trim();
  if (!texto) return;

  addMensagem(texto, "usuario");
  input.value = "";

  addDigitando();

  const user = await supabase.auth.getUser();
  const numero = user.data.user.email;

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero,
        mensagem: texto,
      }),
    });

    const data = await resposta.json();
    removerDigitando();
    addMensagem(data.resposta || "Erro ao responder.", "ia");
  } catch (error) {
    removerDigitando();
    addMensagem("Erro ao se comunicar com a Mannu.AI.", "ia");
    console.error(error);
  }
}

sendButton.addEventListener("click", enviarMensagem);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    enviarMensagem();
  }
});
