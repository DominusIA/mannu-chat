// script-login.js

async function signIn() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  errorMsg.textContent = "";

  if (!email || !password) {
    errorMsg.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      errorMsg.textContent = "E-mail ou senha incorretos.";
    } else {
      const userId = data.user.id;
      localStorage.setItem('userId', userId); // Salva o ID do usuário no navegador

      window.location.href = "chat.html";
    }
  } catch (err) {
    console.error("Erro de login:", err);
    errorMsg.textContent = "Erro ao conectar. Tente novamente.";
  }
}
