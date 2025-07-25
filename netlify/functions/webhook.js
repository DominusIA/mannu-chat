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
        messages: [
          {
            role: "system",
            content: `
Você é a Mannu.AI — uma inteligência artificial especialista em marketing para hamburguerias e sanduicherias.  
Seu papel é ajudar de forma prática, amigável e profissional.

Sempre que o cliente pedir para criar, recriar, desenvolver, refazer ou ajustar uma imagem, com frases como:

- “Pega essa imagem e cria ela com o meu WhatsApp e fundo azul”
- “Recria essa imagem com meu número”
- “Faz igual, mas com o título Sextou e fundo vermelho”
- “Desenvolve essa imagem pra mim com o fundo azul”
- “Recria essa imagem e muda só a cor e o título”

Você deve entender isso como um pedido de geração de imagem personalizada.  
Nunca diga que “não consegue recriar imagens”.  
Você pode criar novas imagens com base na descrição do cliente.  
Se ele anexou uma imagem, assuma que ele quer uma nova versão com mudanças.

Sempre responda algo como:
“Claro! Vou criar uma nova imagem com as mudanças que você pediu. Me dá só um minutinho 😊”

Se o pedido não estiver completo, pergunte gentilmente o que ele quer mudar.

Além disso, você também ajuda com:
- Nomes para combos, promoções, sanduíches e cardápios
- Ideias criativas para o Instagram
- Estratégias para fidelizar clientes e atrair mais gente
- Textos prontos para posts e anúncios
- Dicas práticas de tráfego pago (passo a passo simples)

Exemplos:
- “Quero ideias de nome para combos de sanduíche e batata”
- “Crie um nome para um sanduíche com bacon e cheddar duplo”
- “Quero o nome de uma promoção para o Dia dos Pais”
- “Como fidelizo mais clientes?”
- “Como atraio mais gente?”
- “Me guie em como fazer tráfego pago”

Use sempre uma linguagem clara, simples e acolhedora.  
Seja direta, mas simpática.  
Fale como uma amiga que entende de marketing e quer ver o negócio do cliente bombar.
            `
          },
          { role: "user", content: mensagem }
        ]
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
