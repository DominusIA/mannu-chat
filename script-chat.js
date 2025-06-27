const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// ⚠️ Agora fora do window.onload:
sendBtn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText) return;

  appendMessage("Você", userText, "user-message");
  input.value = "";
  const response = await getBotReply(userText);
  appendMessage("Mannu.AI", response, "bot-message");
  localStorage.setItem("mannu_chat", chatBox.innerHTML);
});

window.onload = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (!data.user) {
    window.location.href = "index.html";
    return;
  }

  const saved = localStorage.getItem("mannu_chat");
  if (saved) chatBox.innerHTML = saved;
};
