// chat.js

// Aplica a fonte Montserrat
const style = document.createElement('style');
style.innerHTML = `
  @font-face {
    font-family: 'Montserrat';
    src: url('Montserrat-Medium.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }

  body, input, button {
    font-family: 'Montserrat', sans-serif;
  }
`;
document.head.appendChild(style);

window.sendMessage = async function () {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  const chatBox = document.getElementById("chat-messages");

  if (!message) return;

  // Mostra a mensagem do usuário
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.textContent = message;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  input.value = "";

  try {
    const response = await fetch("/.netlify/functions/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    const aiMsg = document.createElement("div");
    aiMsg.className = "ai-message";
    aiMsg.textContent = data.reply || "Erro ao responder.";
    chatBox.appendChild(aiMsg);
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    const errorMsg = document.createElement("div");
    errorMsg.className = "ai-message";
    errorMsg.textContent = "Erro na conexão com a Mannu.AI.";
    chatBox.appendChild(errorMsg);
  }
};
