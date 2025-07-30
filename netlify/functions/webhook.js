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
    const { mensagem, sessionId } = await req.json();

    const promptFinal = [
      { role: "system", content: promptMannu },
      { role: "user", content: mensagem }
    ];

    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: promptFinal,
        temperature: 0.6
      })
    });

    const data = await resposta.json();
    const respostaTexto = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    // DETECÇÃO DE PEDIDO DE IMAGEM
    const padroesImagem = [
      "recria essa imagem", "refaça essa imagem", "faz igual essa imagem",
      "crie essa imagem", "use essa imagem de referência", "recrie com meu número",
      "muda só o fundo", "muda só o texto", "refaz com meu whatsapp",
      "desenvolve essa imagem", "recria com outra cor"
    ];

    const mensagemMinuscula = mensagem.toLowerCase();
    const gerandoImagem = padroesImagem.some(padrao => mensagemMinuscula.includes(padrao));

    return new Response(JSON.stringify({
      resposta: respostaTexto,
      gerandoImagem,
      promptImagem: gerandoImagem ? mensagem : null
    }), {
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });

  } catch (err) {
    console.error("Erro no webhook:", err);
    return new Response(JSON.stringify({ erro: "Erro interno no servidor." }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });
  }
};
