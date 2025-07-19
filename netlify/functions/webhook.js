import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ resposta: 'Método não permitido.' }),
      };
    }

    const headers = event.headers;
    const authHeader = headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ resposta: 'Token não fornecido.' }),
      };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ resposta: 'Usuário não autenticado.' }),
      };
    }

    const email = user.email;
    const id = user.id;

    const body = JSON.parse(event.body);
    const { mensagem, tipo } = body;

    if (!mensagem || !tipo) {
      return {
        statusCode: 400,
        body: JSON.stringify({ resposta: 'Mensagem ou tipo ausente.' }),
      };
    }

    // Verifica ou cria o usuário
    const { data: existente } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    const hoje = new Date().toISOString().split('T')[0];

    if (!existente) {
      await supabase.from('usuarios').insert({
        id,
        email,
        mensagens_hoje: 0,
        imagens_mes: 0,
        ultimo_uso: hoje
      });
    } else {
      const ultimoUso = existente.ultimo_uso?.toISOString().split('T')[0];
      if (ultimoUso !== hoje) {
        await supabase
          .from('usuarios')
          .update({ mensagens_hoje: 0, ultimo_uso: hoje })
          .eq('id', id);
      }
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (tipo === 'texto' && usuario.mensagens_hoje >= 25) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          resposta: 'Você atingiu o limite diário de 25 mensagens. Tente novamente amanhã.'
        }),
      };
    }

    if (tipo === 'imagem' && usuario.imagens_mes >= 20) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          resposta: 'Você atingiu o limite mensal de 20 imagens. Tente novamente no próximo mês.'
        }),
      };
    }

    let respostaFinal = '';

    if (tipo === 'texto') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: mensagem }]
      });
      respostaFinal = completion.choices[0].message.content;

      await supabase
        .from('usuarios')
        .update({ mensagens_hoje: usuario.mensagens_hoje + 1 })
        .eq('id', id);
    }

    if (tipo === 'imagem') {
      const image = await openai.images.generate({
        model: 'dall-e-3',
        prompt: mensagem,
        n: 1,
        size: '1024x1024'
      });

      respostaFinal = image.data[0].url;

      await supabase
        .from('usuarios')
        .update({ imagens_mes: usuario.imagens_mes + 1 })
        .eq('id', id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ resposta: respostaFinal }),
    };
  } catch (error) {
    console.error('Erro no webhook:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ resposta: 'Erro ao gerar resposta.', erro: error.message }),
    };
  }
}
