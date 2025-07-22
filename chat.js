// chat.js

const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chat = document.getElementById("chat");
const uploadButton = document.getElementById("upload-button");

let primeiraMensagemDoDia = true;

// Função para adicionar mensagem na tela
function adicionarMensagem(texto, classe) {
  const div = document.createElement("div");
  div.className = classe;
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Envia a mensagem para a API da Mannu.AI
async function enviarMensagem() {
  const texto = userInput.value.trim();
  if (texto === "") return;

  adicionarMensagem(texto, "mensagem-usuario");
  userInput.value = "";

  try {
    const resposta = await fetch("https://mannu-backend.netlify.app/.netlify/functions/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mensagem: texto,
        plataforma: "web",
      }),
    });

    const data = await resposta.json();

    if (resposta.ok && data.resposta) {
      if (primeiraMensagemDoDia && data.saldo) {
        adicionarMensagem(
          `Você ainda pode usar ${data.saldo.mensagensRestantesHoje} mensagens hoje e ${data.saldo.imagensRestantesMes} imagens este mês.`,
          "mensagem-mannu"
        );
        primeiraMensagemDoDia = false;
      }
      adicionarMensagem(data.resposta, "mensagem-mannu");
    } else {
      adicionarMensagem("Erro ao se comunicar com a Mannu.AI.", "mensagem-mannu");
    }
  } catch (erro) {
    console.error("Erro:", erro);
    adicionarMensagem("Erro ao se comunicar com a Mannu.AI.", "mensagem-mannu");
  }
}

// Eventos
sendButton.addEventListener("click", enviarMensagem);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    enviarMensagem();
  }
});

uploadButton.addEventListener("click", () => {
  alert("Envio de imagens ainda não está disponível nesta versão.");
});
