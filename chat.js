import { supabase } from './supabase.js';

const user = JSON.parse(localStorage.getItem("mannu_user"));
if (!user) window.location.href = "/";

const messageInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chat = document.getElementById("chat-box");

function addMessage(sender, text, isBot = false) {
  const div = document.createElement("div");
  div.className = "message " + (isBot ? "bot" : "user");
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

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
    addMessage("Mannu.AI", "Erro ao enviar mensagem. Tente novamente.", true);
    console.error(error);
  }
}

// Garante que o DOM esteja pronto
document.addEventListener("DOMContentLoaded", () => {
  sendButton?.addEventListener("click", sendMessage);
  messageInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
});
