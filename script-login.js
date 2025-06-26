async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById("error-msg").innerText = "E-mail ou senha inválidos.";
  } else {
    window.location.href = "chat.html";
  }
}