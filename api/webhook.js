let dadosClientes = {};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body;
  const numero = body.phone;
  const nome = body.pushname || "cliente";
  const mensagemCliente = body.message?.toLowerCase() || "";

  const hoje = new Date().toISOString().split("T")[0];
  const mesAtual = hoje.slice(0, 7);

  if (!dadosClientes[numero]) {
    dadosClientes[numero] = {
      mensagensHoje: 0,
      imagensMes: 0,
      ultimoUsoMensagens: hoje,
      ultimoUsoImagens: mesAtual,
      jaMostrouManualHoje: false,
      primeiraMensagem: true
    };
  }

  const cliente = dadosClientes[numero];

  if (cliente.ultimoUsoMensagens !== hoje) {
    cliente.mensagensHoje = 0;
    cliente.ultimoUsoMensagens = hoje;
    cliente.jaMostrouManualHoje = false;
  }

  if (cliente.ultimoUsoImagens !== mesAtual) {
    cliente.imagensMes = 0;
    cliente.ultimoUsoImagens = mesAtual;
  }

  // Primeira mensagem de contato
  if (cliente.primeiraMensagem) {
    cliente.primeiraMensagem = false;
    const apresentacao = `Oi, eu sou a Mannuela — mas pode me chamar de *Mannu* 💙\nSou a inteligência artificial especialista em marketing para hamburguerias, criada pela *Dominus*.\n\nTô aqui pra te ajudar a crescer, vender mais e destacar sua marca. Vamos juntos? 😄`;
    await responder(numero, apresentacao);
  }

  // Enviar mini manual na primeira mensagem do dia
  if (!cliente.jaMostrouManualHoje) {
    cliente.jaMostrouManualHoje = true;
    const manual = `📖 Bem-vindo(a) à Mannu.AI, ${nome}!

Você pode usar a inteligência da Mannu de duas formas:

🧠 *Mensagens*: Peça o que quiser, como textos, ideias, legendas, dicas, etc.
📸 *Imagens*: Ao final da frase, escreva "quero uma imagem" para gerar uma arte exclusiva para você.

💬 Limite diário: 25 mensagens
🖼️ Limite mensal: 20 imagens (renova no dia 1)

Agora me diga: como posso te ajudar hoje? 😄`;
    await responder(numero, manual);
  }

  // Solicitação de imagem (mensagem contém "quero uma imagem")
  const querImagem = mensagemCliente.includes("quero uma imagem");

  if (querImagem) {
    if (cliente.imagensMes >= 20) {
      await responder(numero, "⚠️ Você já usou as 20 imagens deste mês. Seu saldo será renovado no dia 1 do próximo mês. 😊");
      return res.status(200).end();
    }

    cliente.imagensMes++;

    const prompt = body.message.replace(/quero uma imagem/gi, "").trim();

    try {
      const openaiRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024"
        })
      });

      const imageData = await openaiRes.json();
      const imageUrl = imageData.data?.[0]?.url;

      if (!imageUrl) throw new Error("Falha ao gerar imagem");

      await enviarImagem(numero, imageUrl);
      await responder(numero, `🖼️ Aqui está sua imagem personalizada!\nVocê usou ${cliente.imagensMes} de 20 imagens neste mês.`);
    } catch (err) {
      await responder(numero, "❌ Ocorreu um erro ao gerar a imagem. Tente novamente mais tarde.");
    }

    return res.status(200).end();
  }

  // Solicitação de texto normal
  if (cliente.mensagensHoje >= 25) {
    await responder(numero, "⚠️ Você já usou as 25 mensagens de hoje. Volte amanhã! 😊");
    return res.status(200).end();
  }

  cliente.mensagensHoje++;

  const mensagem = `📢 Olá ${nome}!
Aqui está seu saldo de hoje:

💬 Mensagens restantes: ${25 - cliente.mensagensHoje} de 25
🖼️ Imagens restantes no mês: ${20 - cliente.imagensMes} de 20

Me diga como posso te ajudar! 😄`;

  await responder(numero, mensagem);

  return res.status(200).end();
}

// Função para enviar texto via Z-API
async function responder(numero, texto) {
  const instancia = "3E375F9225C3F0362571FA9674CC44CF";
  const token = "2919EFEFC1529F0F6DC02C99";
  const url = `https://api.z-api.io/instances/${instancia}/token/${token}/send-messages`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: numero,
      message: texto
    })
  });
}

// Função para enviar imagem via Z-API
async function enviarImagem(numero, urlImagem) {
  const instancia = "3E375F9225C3F0362571FA9674CC44CF";
  const token = "2919EFEFC1529F0F6DC02C99";
  const url = `https://api.z-api.io/instances/${instancia}/token/${token}/send-image`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: numero,
      image: urlImagem,
      caption: "🖼️ Sua imagem está pronta!"
    })
  });
}
