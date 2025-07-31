import promptMannu from './prompt-mannu.js';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://mannuai.netlify.app', // Em produção, melhor que seja fixo
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    const { mensagem, sessionId } = JSON.parse(event.body);

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

    if (!resposta.ok) {
      console.error("Erro da API OpenAI:", await resposta.text());
      throw new Error("Falha na chamada da OpenAI");
    }

    const data = await resposta.json();

    const respostaTexto = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    // Log para debug
    console.log("🔹 Resposta da Mannu:", respostaTexto);

    // Detectar se o usuário está pedindo uma imagem
    const padroesImagem = [
      "recria essa imagem", "refaça essa imagem", "faz igual essa imagem",
      "crie essa imagem", "use essa imagem de referência", "recrie com meu número",
      "muda só o fundo", "muda só o texto", "refaz com meu whatsapp",
      "desenvolve essa imagem", "recria com outra cor"
    ];

    const mensagemMinuscula = mensagem.toLowerCase();
    const gerandoImagem = padroesImagem.some(p => mensagemMinuscula.includes(p));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        resposta: respostaTexto,
        gerandoImagem,
        promptImagem: gerandoImagem ? mensagem : null
      })
    };

  } catch (err) {
    console.error("Erro no webhook:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ erro: "Erro interno no servidor." })
    };
  }
};
