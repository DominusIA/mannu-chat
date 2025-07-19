const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { message, type, base64 } = body;

    let resposta = "Desculpe, não entendi.";

    if (type === "imagem" && base64) {
      const completion = await openai.images.generate({
        model: "dall-e-3",
        prompt: message,
        n: 1,
        size: "1024x1024",
      });

      resposta = completion.data[0].url;
    } else {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      });

      resposta = completion.choices[0].message.content;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ resposta }),
    };
  } catch (err) {
    console.error("Erro no webhook:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ resposta: "Erro ao gerar resposta." }),
    };
  }
};
