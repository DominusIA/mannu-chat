import { supabase } from './supabase.js';

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error-msg");

async function login() {
  const email = emailInput.value;
  const password = passwordInput.value;

  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .eq("senha", password)
    .single();

  if (error || !data) {
    errorMsg.textContent = "E-mail ou senha incorretos.";
  } else {
    localStorage.setItem("mannu_user", JSON.stringify(data));
    window.location.href = "/chat";
  }
}

window.login = login;