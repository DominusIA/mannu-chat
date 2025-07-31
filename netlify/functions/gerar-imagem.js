export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*', // ou defina seu domínio
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
    const { prompt, referencia } = JSON.parse(event.body);

    if (!prompt || prompt.trim() === "") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ erro: "Prompt inválido para geração de imagem." })
      };
    }

    console.log("🎨 Prompt recebido:", prompt);
    if (referencia) {
      console.log("🖼️ Imagem de referência recebida:", referencia);
    }

    // Monta o payload
    const payload = {
      prompt,
      n: 1,
      size: "1024x1024"
    };

    // Se tiver imagem de referência, adiciona como campo 'image'
    if (referencia) {
      payload.prompt = `Baseado nesta imagem: ${referencia}\n${prompt}`;
    }

    const resposta = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) {
      const erroDetalhado = await resposta.text();
      console.error("🔴 Erro da OpenAI:", erroDetalhado);
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ erro: "Falha na geração da imagem." })
      };
    }

    const dados = await resposta.json();
    const url = dados?.data?.[0]?.url || null;

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url })
    };

  } catch (err) {
    console.error("🔴 Erro inesperado ao gerar imagem:", err);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ erro: "Erro interno ao gerar imagem." })
    };
  }
};
