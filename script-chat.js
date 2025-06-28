document.addEventListener("DOMContentLoaded", async () => {
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  const { data, error } = await supabase.auth.getUser();
  if (!data.user) {
    window.location.href = "index.html";
    return;
  }

  const saved = localStorage.getItem("mannu_chat");
  if (saved) chatBox.innerHTML = saved;

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
      const res = await fetch("https://mannu-backend.vercel.app/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      return data.reply || "Desculpe, algo deu errado 😕";
    } catch (err) {
      return "Desculpe, algo deu errado 😕";
    }
  }

  window.logout = async function () {
    await supabase.auth.signOut();
    window.location.href = "index.html";
  };
});
