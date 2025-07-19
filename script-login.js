// script-login.js

async function signIn() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Preencha todos os campos.");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("E-mail ou senha incorretos.");
    return;
  }

  // Redireciona para o chat após login bem-sucedido
  window.location.href = "chat.html";
}
