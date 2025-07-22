import { supabase } from './supabase.js';

export async function signIn() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("error-msg");

  const email = emailInput?.value.trim();
  const password = passwordInput?.value.trim();

  errorMsg.textContent = "";

  if (!email || !password) {
    errorMsg.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      errorMsg.textContent = "E-mail ou senha incorretos.";
    } else {
      window.location.href = "chat.html";
    }
  } catch (err) {
    console.error("Erro de login:", err);
    errorMsg.textContent = "Erro ao conectar. Tente novamente.";
  }
}
