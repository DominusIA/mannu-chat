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
      console.error("⚠️ Prompt inválido ou vazio:", mensagem);
      return new Response(JSON.stringify({ resposta: "Mensagem inválida." }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: mensagem }]
      })
    });

    const data = await response.json();
    console.log("🔸 Resposta da OpenAI:", data);

    const resposta = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    return new Response(JSON.stringify({ resposta }), {
      status: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ Erro ao processar a requisição:", error);
    return new Response(JSON.stringify({ resposta: "Erro interno ao processar." }), {
      status: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    });
  }
};
