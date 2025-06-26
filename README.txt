PASSO A PASSO:

1. Vá em https://supabase.com/ e crie sua conta gratuita
2. Crie um novo projeto
3. Vá em 'Authentication' > 'Users' e clique em 'Add User'
   - Preencha com e-mail e senha do seu cliente
4. Vá em 'Settings' > 'API' e copie:
   - Supabase URL
   - Supabase Anon Public Key
5. Abra o arquivo 'supabase.js' e substitua:
   - SUA_SUPABASE_URL pela URL
   - SUA_SUPABASE_PUBLIC_KEY pela chave pública
6. Abra o arquivo 'script-chat.js' e substitua SUA_API_KEY pela sua chave GPT-4o da OpenAI
7. Suba os arquivos no Vercel: https://vercel.com/

Pronto! Sua Mannu.AI estará com login + chat protegido.