// script-login.js
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  loginBtn?.addEventListener("click", login);
});

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  if (!email || !password) {
    errorMsg.textContent = "Preencha todos os campos!";
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      errorMsg.textContent = "E-mail ou senha inválidos.";
      return;
    }

    // Salva os dados essenciais do usuário
    localStorage.setItem("mannu_user", JSON.stringify({
      phone: data.user.phone || "", // se disponível
      name: data.user.user_metadata?.name || data.user.email,
    }));

    window.location.href = "chat.html";
  } catch (err) {
    errorMsg.textContent = "Erro ao fazer login.";
    console.error(err);
  }
}
