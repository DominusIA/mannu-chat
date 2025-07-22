import { supabase } from './supabase.js';

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

// 🔧 Esta linha é essencial para funcionar com onclick no HTML
window.signIn = signIn;
