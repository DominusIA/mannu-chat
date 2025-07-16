import { supabase } from './supabase.js';

const user = JSON.parse(localStorage.getItem("mannu_user"));
if (!user) window.location.href = "/";

const messageInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const attachButton = document.getElementById("attach-btn");
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

// Executa quando a página estiver pronta
document.addEventListener("DOMContentLoaded", () => {
  sendButton?.addEventListener("click", sendMessage);
  messageInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  attachButton?.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (!file) return;

      addMessage("Você", "[Imagem enviada]");

      // Aqui você pode futuramente integrar o envio real do arquivo
    };
    fileInput.click();
  });
});
