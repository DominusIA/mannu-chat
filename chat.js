import { supabase } from './supabase.js';

const user = JSON.parse(localStorage.getItem("mannu_user"));
if (!user) window.location.href = "/";

// Elementos do DOM
const messageInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");
const attachButton = document.getElementById("attach-button");

// Função para adicionar mensagem ao chat
function addMessage(sender, text, isBot = false) {
  const div = document.createElement("div");
  div.className = "message " + (isBot ? "bot" : "user");
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enviar mensagem de texto
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  addMessage("Você", text);
  messageInput.value = "";

  try {
    const response = await fetch("/api/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: user.phone,
        pushname: user.name,
        message: text,
      }),
    });

    const data = await response.json();
    addMessage("Mannu.AI", data.reply || "...pensando...", true);
  } catch (error) {
    addMessage("Mannu.AI", "Erro ao enviar mensagem.", true);
    console.error(error);
  }
}

// Enviar imagem (simulação)
function attachImage() {
  alert("Função de anexar imagem ainda não implementada.");
}

// Listeners
document.addEventListener("DOMContentLoaded", () => {
  sendButton?.addEventListener("click", sendMessage);
  messageInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
  attachButton?.addEventListener("click", attachImage);
});
