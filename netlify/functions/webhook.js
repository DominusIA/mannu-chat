export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://mannuai.netlify.app', // Libera acesso ao seu frontend
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  try {
    const { mensagem } = await req.json();

    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: mensagem }]
      })
    });

    const data = await resposta.json();
    const reply = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    return new Response(JSON.stringify({ resposta: reply }), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return new Response(JSON.stringify({ erro: "Erro interno ao processar." }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });
  }
};
