// chat.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const userInput = document.getElementById("user-input");
const imageInput = document.getElementById("image-upload");
const chatBox = document.getElementById("chat-messages");

let user;

// Limites
const MAX_MESSAGES_PER_DAY = 25;
const MAX_IMAGES_PER_MONTH = 20;

async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    alert("Você precisa estar logado.");
    window.location.href = "index.html";
  } else {
    user = data.user;
    await checkOrCreateUserData();
  }
}

// Verifica e inicializa contador de mensagens/imagens
async function checkOrCreateUserData() {
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!data) {
    await supabase.from("usuarios").insert({
      id: user.id,
      email: user.email,
      mensagens_hoje: 0,
      imagens_mes: 0,
      ultimo_uso: new Date().toISOString().slice(0, 10),
    });
  } else {
    const hoje = new Date().toISOString().slice(0, 10);
    if (data.ultimo_uso !== hoje) {
      await supabase
        .from("usuarios")
        .update({ mensagens_hoje: 0, ultimo_uso: hoje })
        .eq("id", user.id);
    }
  }
}

async function enviarParaMannu(mensagem, imagemBase64 = null) {
  const tipo = imagemBase64 || mensagem.toLowerCase().includes("gerar imagem") ? "imagem" : "texto";

  const tabela = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  const dados = tabela.data;

  if (tipo === "texto" && dados.mensagens_hoje >= MAX_MESSAGES_PER_DAY) {
    adicionarMensagem("Mannu.AI", "Você atingiu o limite de 25 mensagens hoje.");
    return;
  }

  if (tipo === "imagem" && dados.imagens_mes >= MAX_IMAGES_PER_MONTH) {
    adicionarMensagem("Mannu.AI", "Você atingiu o limite de 20 imagens este mês.");
    return;
  }

  adicionarMensagem("Você", mensagem || "[Imagem enviada]");

  const resposta = await fetch("https://mannu-backend.vercel.app/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: mensagem,
      type: tipo,
      base64: imagemBase64,
    }),
  });

  const { resposta: respostaMannu } = await resposta.json();
  adicionarMensagem("Mannu.AI", respostaMannu);

  const update = tipo === "texto"
    ? { mensagens_hoje: dados.mensagens_hoje + 1 }
    : { imagens_mes: dados.imagens_mes + 1 };

  await supabase.from("usuarios").update(update).eq("id", user.id);
}

function adicionarMensagem(remetente, texto) {
  const msg = document.createElement("div");
  msg.style.margin = "10px 0";
  msg.style.color = "#fff";
  msg.innerHTML = `<strong>${remetente}:</strong> ${texto}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

window.sendMessage = async function () {
  const mensagem = userInput.value.trim();
  const file = imageInput.files[0];

  if (!mensagem && !file) return;

  if (file) {
    const reader = new FileReader();
    reader.onload = async function () {
      const base64 = reader.result.split(",")[1];
      await enviarParaMannu(mensagem || "gerar imagem", base64);
    };
    reader.readAsDataURL(file);
  } else {
    await enviarParaMannu(mensagem);
  }

  userInput.value = "";
  imageInput.value = "";
};

getUser();
