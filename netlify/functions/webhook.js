import promptMannu from './prompt-mannu.js';

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://mannuai.netlify.app',
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
    const imagemRegex = /(https:\/\/[^\s]+\.(png|jpg|jpeg))/i;
    const matchImagem = mensagem.match(imagemRegex);

    let imagemReferencia = null;
    let textoCliente = mensagem;

    if (matchImagem) {
      imagemReferencia = matchImagem[0];
      textoCliente = mensagem.replace(imagemReferencia, "").trim();
    }

    let promptImagem = null;
    let respostaTexto = "";
    let gerandoImagem = false;

    // Se há imagem e texto, preparar prompt para geração de imagem
    if (imagemReferencia && textoCliente) {
      promptImagem = `Crie uma imagem inspirada nesta referência: ${imagemReferencia}. Detalhes: ${textoCliente}`;
      gerandoImagem = true;
    }

    // Se há apenas imagem e nenhum texto, responder solicitando instruções
    if (imagemReferencia && !textoCliente) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          resposta: "Recebi sua imagem. Você quer que eu faça semelhante ou deseja mudar algo? (ex: cor, texto, número ou endereço?)",
          gerandoImagem: false,
          promptImagem: null
        })
      };
    }

    // Se não for geração de imagem, segue o fluxo normal da IA
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
    respostaTexto = data.choices?.[0]?.message?.content || "Erro ao gerar resposta.";

    // Verifica se o texto contém pedido direto de imagem
    const padroesImagem = [
      "recria essa imagem", "refaça essa imagem", "faz igual essa imagem",
      "crie essa imagem", "use essa imagem de referência", "recrie com meu número",
      "muda só o fundo", "muda só o texto", "refaz com meu whatsapp",
      "desenvolve essa imagem", "recria com outra cor"
    ];

    const mensagemMinuscula = mensagem.toLowerCase();
    const contemPalavraImagem = padroesImagem.some(p => mensagemMinuscula.includes(p));

    // Se cliente descreveu mas não anexou imagem
    if (!imagemReferencia && contemPalavraImagem) {
      promptImagem = mensagem;
      gerandoImagem = true;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        resposta: respostaTexto,
        gerandoImagem,
        promptImagem
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
