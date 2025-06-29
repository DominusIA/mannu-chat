async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Erro no login:", error.message);
    document.getElementById("error-msg").innerText = "E-mail ou senha inválidos.";
  } else {
    window.location.href = "chat.html";
  }
}
