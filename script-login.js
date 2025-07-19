// script-login.js

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  errorMsg.textContent = "";

  if (!email || !password) {
    errorMsg.textContent = "Preencha todos os campos.";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    errorMsg.textContent = "E-mail ou senha incorretos.";
    return;
  }

  // Redireciona para a próxima página após login bem-sucedido
  window.location.href = "chat.html"; // Altere se o destino for outro
}
