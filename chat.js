import { supabase } from "./supabase.js";

const chatContainer = document.getElementById("chat");
const inputMensagem = document.getElementById("user-input");
const botaoEnviar = document.getElementById("send-button");
const fileInput = document.getElementById("file-input");
const previewImagem = document.getElementById("preview-imagem");

let imagemSelecionada = null;
const sessionId = crypto.randomUUID();

// Mostra imagem antes de enviar
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file && ["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
    const reader = new FileReader();
    reader.onload = () => {
      previewImagem.innerHTML = `<img src="${reader.result}" class="preview-img" style="max-width: 100px; border-radius: 10px;" />`;
      imagemSelecionada = file;
    };
    reader.readAsDataURL(file);
  } else {
    previewImagem.innerHTML = "<p style='color: red;'>❌ Formato não suportado. Envie JPG, JPEG ou PNG.</p>";
    imagemSelecionada = null;
  }
});

// Envia mensagem
botaoEnviar.addEventListener("click", async () => {
  const texto = inputMensagem.value.trim();
  if (!texto && !imagemSelecionada) return;

  adicionarMensagem("usuário", texto);
  inputMensagem.value = "";
  previewImagem.innerHTML = "";

  if (imagemSelecionada) {
    const { data, error } = await supabase.storage
      .from("imagens")
      .upload(`upload-${Date.now()}`, imagemSelecionada, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      adicionarMensagem("mannu", "Erro ao enviar imagem.");
      imagemSelecionada = null;
      return;
    }

    const url = supabase.storage.from("imagens").getPublicUrl(data.path).data.publicUrl;

    adicionarMensagem(
      "mannu",
      "Recebi sua imagem. Você quer que eu faça semelhante ou deseja mudar algo? (ex: cor, texto, número ou endereço?)"
    );
    imagemSelecionada = null;

    sessionStorage.setItem("imagem-pendente", url);
    return;
  }

  const imagemPendente = sessionStorage.getItem("imagem-pendente");
  const payload = imagemPendente
    ? { mensagem: `${imagemPendente}\n${texto}`, sessionId }
    : { mensagem: texto, sessionId };

  sessionStorage.removeItem("imagem-pendente");

  adicionarMensagem("mannu", "Digitando...");
  const resposta = await fetch("https://mannu-backend.netlify.app/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const dados = await resposta.json();

  if (dados.gerandoImagem && dados.promptImagem) {
    atualizarUltimaMensagem("mannu", "🖼️ Gerando imagem...");

    const gerar = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${YOUR_OPENAI_API_KEY}` // Substituir via backend seguro
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: dados.promptImagem,
        n: 1,
        size: "1024x1024"
      })
    });

    const resultado = await gerar.json();
    const imageUrl = resultado.data?.[0]?.url;

    atualizarUltimaMensagem("mannu", imageUrl || "Não consegui gerar a imagem. Tente reformular o pedido.");
    return;
  }

  atualizarUltimaMensagem("mannu", dados.resposta);
});

// Renderiza mensagem
function adicionarMensagem(remetente, texto) {
  const msg = document.createElement("div");
  msg.className = `mensagem ${remetente}`;

  if (texto.includes(".png") || texto.includes(".jpg") || texto.includes(".jpeg")) {
    msg.innerHTML = `
      <img src="${texto}" class="imagem-gerada" />
      <button onclick="window.open('${texto}', '_blank')">Baixar</button>
    `;
  } else {
    msg.textContent = texto;
  }

  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Atualiza última resposta da Mannu
function atualizarUltimaMensagem(remetente, novoTexto) {
  const mensagens = document.querySelectorAll(`.mensagem.${remetente}`);
  const ultima = mensagens[mensagens.length - 1];
  if (!ultima) return;

  if (novoTexto.includes(".png") || novoTexto.includes(".jpg") || novoTexto.includes(".jpeg")) {
    ultima.innerHTML = `
      <img src="${novoTexto}" class="imagem-gerada" />
      <button onclick="window.open('${novoTexto}', '_blank')">Baixar</button>
    `;
  } else {
    ultima.textContent = novoTexto;
  }
}
