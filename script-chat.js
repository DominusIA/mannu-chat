const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

window.onload = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (!data.user) {
    window.location.href = "index.html";
    return;
  }

  const saved = localStorage.getItem("mannu_chat");
  if (saved) chatBox.innerHTML = saved;
};

sendBtn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage("Você", userText, "user-message");
  input.value = "";
  const response = await getBotReply(userText);
  appendMessage("Mannu.AI", response, "bot-message");
  localStorage.setItem("mannu_chat", chatBox.innerHTML);
});

function appendMessage(sender, text, className) {
  const msg = document.createElement("div");
  msg.className = `message ${className}`;
  msg.innerText = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getBotReply(message) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer SUA_API_KEY"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Você é a Mannu.AI, uma especialista em marketing criada pela Dominus. Use uma linguagem simpática, direta e didática." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await res.json();
    return data.choices[0].message.content.trim();
  } catch (err) {
    return "Desculpe, algo deu errado 😕";
  }
}

function logout() {
  supabase.auth.signOut();
  window.location.href = "index.html";
}