import { supabase } from "./supabase.js";

const chatContainer = document.getElementById("chat-container");
const inputMensagem = document.getElementById("mensagem");
const botaoEnviar = document.getElementById("enviar");
const fileInput = document.getElementById("file-input");
const previewImagem = document.getElementById("preview-imagem");

let imagemSelecionada = null;
const sessionId = crypto.randomUUID();

// Preview da imagem selecionada
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
    const reader = new FileReader();
    reader.onload = () => {
      previewImagem.innerHTML = `<img src="${reader.result}" class="preview-img" />`;
      imagemSelecionada = file;
    };
    reader.readAsDataURL(file);
  } else {
    previewImagem.innerHTML = "<p style='color: red;'>Formato não suportado.</p>";
    imagemSelecionada = null;
  }
});

// Envio da mensagem
botaoEnviar.addEventListener("click", async () => {
  const texto = inputMensagem.value.trim();
  if (!texto && !imagemSelecionada) return;

  adicionarMensagem("usuario", texto);
  inputMensagem.value = "";
  previewImagem.innerHTML = "";

  // Caso imagem esteja presente
  if (imagemSelecionada) {
    const { data, error } = await supabase.storage
      .from("imagens")
      .upload(`upload-${Date.now()}`, imagemSelecionada, {
        cacheControl: "3600",
        upsert: false,
      });

    imagemSelecionada = null;

    if (error) {
      adicionarMensagem("mannu", "Erro ao enviar imagem.");
      return;
    }

    const url = supabase.storage.from("imagens").getPublicUrl(data.path).data.publicUrl;

    adicionarMensagem("mannu", "Recebi sua imagem. Você quer que eu faça semelhante ou deseja mudar algo? (ex: cor, texto, número ou endereço?)");
    sessionStorage.setItem("imagem-pendente", url);
    return;
  }

  // Caso seja apenas texto ou imagem pendente
  const imagemPendente = sessionStorage.getItem("imagem-pendente");
  const payload = imagemPendente
    ? { mensagem: `${imagemPendente}\n${texto}`, sessionId }
    : { mensagem: texto, sessionId };

  sessionStorage.removeItem("imagem-pendente");

  adicionarMensagem("mannu", "Digitando...");

  try {
    const resposta = await fetch("/.netlify/functions/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resposta.ok) {
      atualizarUltimaMensagem("mannu", "Erro ao se comunicar com o servidor.");
      return;
    }

    const dados = await resposta.json();

    if (dados.gerandoImagem && dados.promptImagem) {
      atualizarUltimaMensagem("mannu", "🖼️ Gerando imagem...");

      const gerar = await fetch("/.netlify/functions/gerar-imagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: dados.promptImagem }),
      });

      if (!gerar.ok) {
        atualizarUltimaMensagem("mannu", "Erro ao gerar a imagem.");
        return;
      }

      const resultado = await gerar.json();
      const imageUrl = resultado.url;

      atualizarUltimaMensagem("mannu", imageUrl || "Não consegui gerar a imagem. Tente reformular o pedido.");
    } else {
      atualizarUltimaMensagem("mannu", dados.resposta);
    }

  } catch (error) {
    console.error("Erro na comunicação:", error);
    atualizarUltimaMensagem("mannu", "Erro ao processar a resposta. Tente novamente.");
  }
});

// Adiciona mensagens no chat
function adicionarMensagem(remetente, texto) {
  const msg = document.createElement("div");
  msg.className = `mensagem ${remetente}`;

  if (/\.(png|jpg|jpeg)$/.test(texto)) {
    msg.innerHTML = `
      <img src="${texto}" class="imagem-gerada" />
      <button class="btn-baixar" onclick="window.open('${texto}', '_blank')">Baixar</button>
    `;
  } else {
    msg.textContent = texto;
  }

  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Atualiza a última resposta da Mannu
function atualizarUltimaMensagem(remetente, novoTexto) {
  const mensagens = document.querySelectorAll(`.mensagem.${remetente}`);
  const ultima = mensagens[mensagens.length - 1];
  if (!ultima) return;

  if (/\.(png|jpg|jpeg)$/.test(novoTexto)) {
    ultima.innerHTML = `
      <img src="${novoTexto}" class="imagem-gerada" />
      <button class="btn-baixar" onclick="window.open('${novoTexto}', '_blank')">Baixar</button>
    `;
  } else {
    ultima.textContent = novoTexto;
  }
}
