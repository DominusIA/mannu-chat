import { supabase } from './supabase.js';

const user = JSON.parse(localStorage.getItem("mannu_user"));
if (!user) window.location.href = "/";

const messageInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");

let isSending = false;

function addMessage(text, isBot = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message " + (isBot ? "bot" : "user");
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || isSending) return;

  addMessage(text, false);
  messageInput.value = "";
  isSending = true;

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
    const reply = data.reply || "...pensando...";
    addMessage(reply, true);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    addMessage("Desculpe, ocorreu um erro ao enviar a mensagem 😔", true);
  } finally {
    isSending = false;
  }
}

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Focar no input ao carregar
window.onload = () => {
  messageInput.focus();
};
