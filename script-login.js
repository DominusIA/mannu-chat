import { supabase } from './supabase.js';

const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", login);

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("error-msg");

  if (!email || !password) {
    errorMsg.textContent = "Preencha todos os campos.";
    return;
  }

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("email", email)
    .eq("senha", password)
    .single();

  if (error || !data) {
    errorMsg.textContent = "E-mail ou senha incorretos.";
  } else {
    localStorage.setItem("mannu_user", JSON.stringify(data));
    window.location.href = "/chat.html";
  }
}
