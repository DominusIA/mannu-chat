import promptMannu from './prompt-mannu.js';

export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://mannuai.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  try {
    const { mensagem } = await req.json();
    console.log("📥 Corpo recebido:", mensagem);

    if (!mensagem || typeof mensagem !== "string") {
      console.error("⚠️ Mensagem inválida:", mensagem);
      return new Response(JSON.stringify({ resposta: "Mensagem inválida." }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const promptImagem = mensagem.toLowerCase();
    const contemLinkImagem = /(https?:\/\/.*\.(?:png|jpg|jpeg|webp|gif))/i.test(mensagem);
    const palavrasChave = [
      "recriar", "refazer", "imagem", "cria uma arte", "fazer uma arte",
      "arte com fundo", "fundo vermelho", "fundo azul", "faça essa imagem",
      "desenhe", "crie essa imagem", "referência"
    ];
    const contemPedidoImagem = palavrasChave.some(p => promptImagem.includes(p));

    // 📷 Caso contenha um link de imagem, mas não detalhes do que fazer
    if (contemLinkImagem && !contemPedidoImagem) {
      return new Response(JSON.stringify({
        resposta: "🖼️ Recebi sua imagem de referência!\nQuer que eu crie igual ou deseja mudar algo como cor, texto ou adicionar seu número?"
      }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // 🧠 Se for pedido para gerar imagem diretamente
    if (contemPedidoImagem) {
      const resposta = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: mensagem,
          n: 1,
          size: "1024x1024"
        })
      });

      const data = await resposta.json();
      const imageUrl = data.data?.[0]?.url;

      if (imageUrl) {
        return new Response(JSON.stringify({
          resposta: `<img src="${imageUrl}" alt="Imagem gerada" style="max-width: 100%; border-radius: 10px;" />`
        }), {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" }
        });
      } else {
        return new Response(JSON.stringify({
          resposta: "❌ Não consegui gerar a imagem. Tente reformular o pedido."
        }), {
          status: 200,
          headers: { ...headers, "Content-Type": "application/json" }
        });
      }
    }

    // ✏️ Resposta de texto normal via GPT-3.5
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
    const resposta = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    return new Response(JSON.stringify({ resposta }), {
      status: 200,
      headers: { ...headers, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("❌ Erro ao processar requisição:", error);
    return new Response(JSON.stringify({ resposta: "Erro interno ao processar." }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
};
