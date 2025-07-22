import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const { userId, message, image } = JSON.parse(event.body);

    if (!userId || (!message && !image)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados incompletos' })
      };
    }

    // Busca o cliente no Supabase
    let { data: user, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Usuário não encontrado' })
      };
    }

    // Atualizações de uso
    const hoje = new Date().toISOString().split('T')[0];
    const agora = new Date();
    const primeiroDiaDoMes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-01`;

    const updates = {};
    if (user.data_ultimo_uso !== hoje) {
      updates.mensagens_restantes = 25;
      updates.data_ultimo_uso = hoje;
    }
    if (user.data_reset_imagens !== primeiroDiaDoMes) {
      updates.imagens_restantes = 20;
      updates.data_reset_imagens = primeiroDiaDoMes;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('clientes')
        .update(updates)
        .eq('id', userId);
      user = { ...user, ...updates };
    }

    // Geração de imagem
    if (image || message.toLowerCase().includes('gerar imagem')) {
      if (user.imagens_restantes <= 0) {
        return {
          statusCode: 200,
          body: JSON.stringify({ response: 'Limite de imagens atingido. Tente novamente no próximo mês.' })
        };
      }

      const prompt = message.replace(/gerar imagem/i, '').trim() || 'Imagem criativa solicitada';
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        n: 1
      });

      await supabase
        .from('clientes')
        .update({ imagens_restantes: user.imagens_restantes - 1 })
        .eq('id', userId);

      return {
        statusCode: 200,
        body: JSON.stringify({ response: imageResponse.data[0].url })
      };
    }

    // Geração de texto
    if (user.mensagens_restantes <= 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ response: 'Você atingiu o limite diário de mensagens. Tente novamente amanhã.' })
      };
    }

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    });

    await supabase
      .from('clientes')
      .update({ mensagens_restantes: user.mensagens_restantes - 1 })
      .eq('id', userId);

    return {
      statusCode: 200,
      body: JSON.stringify({ response: chatCompletion.choices[0].message.content })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno no servidor' })
    };
  }
}
