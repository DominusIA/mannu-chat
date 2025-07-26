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

// 📸 NOVO: tratamento com preview da imagem no chat
uploadInput.addEventListener("change", async (event) => {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const msg = document.createElement("div");
    msg.className = "mensagem usuario";

    const texto = document.createElement("div");
    texto.className = "texto usuario-bolha";
    texto.textContent = "[Imagem enviada] Quero recriar essa imagem com algumas mudanças.";

    const img = document.createElement("img");
    img.src = e.target.result;
    img.alt = "Imagem enviada";
    img.style.maxWidth = "200px";
    img.style.borderRadius = "10px";
    img.style.marginTop = "5px";

    msg.appendChild(texto);
    msg.appendChild(img);
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
  };
  reader.readAsDataURL(arquivo);

  addDigitando();

  const user = await supabase.auth.getUser();
  const numero = user.data.user.email;

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero,
        mensagem: "O cliente enviou uma imagem e deseja que você crie uma nova versão dela com base nas instruções. Pergunte o que ele quer mudar, se necessário.",
      }),
    });

    const data = await resposta.json();
    removerDigitando();
    addMensagem(data.resposta || "Erro ao responder.", "ia");
  } catch (error) {
    removerDigitando();
    addMensagem("Erro ao processar a imagem.", "ia");
    console.error(error);
  }

  uploadInput.value = "";
});
