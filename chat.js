// chat.js

// 1) Fonte Montserrat
const style = document.createElement('style');
style.innerHTML = `
  @font-face {
    font-family: 'Montserrat';
    src: url('Montserrat-Medium.ttf') format('truetype');
  }
  body, input, button {
    font-family: 'Montserrat', sans-serif;
  }
`;
document.head.appendChild(style);

// 2) Importa o cliente Supabase
import { supabase } from './supabase.js';

window.sendMessage = async function () {
  const input   = document.getElementById("user-input");
  const message = input.value.trim();
  const chatBox = document.getElementById("chat-messages");

  if (!message) return;

  // Mostra no chat a sua mensagem
  const userMsg = document.createElement("div");
  userMsg.className   = "user-message";
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;
  input.value       = "";

  try {
    // 3) Obtém a sessão do Supabase
    const { data: { session }, error: sessError } = await supabase.auth.getSession();
    if (sessError || !session) {
      throw new Error("Token não encontrado — faça login novamente.");
    }
    const token = session.access_token;

    // 4) Chama o webhook enviando o JWT
    const res = await fetch("/.netlify/functions/webhook", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        mensagem: message,
        tipo:     "texto"
      })
    });

    const json = await res.json();
    const aiMsg = document.createElement("div");
    aiMsg.className   = "ai-message";
    aiMsg.textContent = json.resposta || "Erro ao responder.";
    chatBox.appendChild(aiMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    const errMsg = document.createElement("div");
    errMsg.className   = "ai-message";
    errMsg.textContent = err.message.includes("Token") 
      ? "Token não fornecido. Por favor, faça login." 
      : "Erro na conexão com a Mannu.AI.";
    chatBox.appendChild(errMsg);
  }
};
