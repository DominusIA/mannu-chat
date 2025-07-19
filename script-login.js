// script-login.js

// Aplica a fonte Montserrat
const style = document.createElement('style');
style.innerHTML = `
  @font-face {
    font-family: 'Montserrat';
    src: url('Montserrat-Medium.ttf') format('truetype');
  }
  body, input, button {
    font-family: 'Montserrat', sans-serif;
  }
`;
document.head.appendChild(style);

window.onload = () => {
  const button = document.querySelector("button");
  button.onclick = async () => {
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    if (!email || !password) {
      errorMsg.textContent = "Preencha todos os campos.";
      return;
    }

    const { data, error } = await window.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      errorMsg.textContent = "E-mail ou senha incorretos.";
    } else {
      window.location.href = "chat.html";
    }
  };
};
