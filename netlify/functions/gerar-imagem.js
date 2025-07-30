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
    const { prompt } = await req.json();

    console.log("🎨 Prompt para imagem recebido:", prompt);

    const resposta = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    const dados = await resposta.json();
    const url = dados?.data?.[0]?.url || null;

    return new Response(JSON.stringify({ url }), {
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });

  } catch (err) {
    console.error("Erro ao gerar imagem:", err);
    return new Response(JSON.stringify({ erro: "Erro ao gerar imagem." }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });
  }
};
