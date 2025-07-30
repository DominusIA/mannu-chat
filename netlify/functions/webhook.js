import promptMannu from './prompt-mannu.js';

const TEMP_IMAGE_STATE = new Map(); // memória temporária por sessão

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://mannuai.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  try {
    const { mensagem, sessionId } = await req.json();
    console.log("📥 Mensagem recebida:", mensagem);

    if (!mensagem || typeof mensagem !== "string") {
      return new Response(JSON.stringify({ resposta: "Mensagem inválida." }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const lower = mensagem.toLowerCase();
    const isImageURL = /(https?:\/\/.*\.(?:png|jpg|jpeg))/.test(mensagem);

    // Caso 1: link de imagem → interrompe e pergunta
    if (isImageURL) {
      TEMP_IMAGE_STATE.set(sessionId, mensagem.trim());
      return new Response(JSON.stringify({
        resposta: "Recebi sua imagem. Você quer que eu faça semelhante ou deseja mudar algo? (ex: cor, texto, número ou endereço?)"
      }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // Caso 2: o cliente respondeu depois de enviar a imagem
    if (TEMP_IMAGE_STATE.has(sessionId)) {
      const img = TEMP_IMAGE_STATE.get(sessionId);
      TEMP_IMAGE_STATE.delete(sessionId); // limpa estado

      return new Response(JSON.stringify({
        resposta: "🖼️ Gerando imagem...",
        gerandoImagem: true,
        promptImagem: `${img}\n${mensagem}`
      }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // Caso 3: pedido claro de imagem por texto
    const palavrasChave = [
      "recriar", "refazer", "imagem", "cria uma arte", "fazer uma arte", "arte com fundo",
      "fundo vermelho", "fundo azul", "faça essa imagem", "desenhe", "crie essa imagem", "referência"
    ];
    const gerarImagem = palavrasChave.some(p => lower.includes(p));

    if (gerarImagem) {
      const respostaTemp = {
        resposta: "🖼️ Gerando imagem...",
        gerandoImagem: true,
        promptImagem: mensagem
      };
      return new Response(JSON.stringify(respostaTemp), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // Caso 4: geração de texto normal
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: promptMannu },
          { role: "user", content: mensagem }
        ]
      })
    });

    const data = await response.json();
    const resposta = data.choices?.[0]?.message?.content || "❌ Ocorreu um erro ao gerar a resposta.";

    return new Response(JSON.stringify({ resposta }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(JSON.stringify({ resposta: "❌ Erro interno ao processar sua mensagem." }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
};
