let isRefreshing = false; // Flag para saber se está atualizando

document.getElementById("startBtn").addEventListener("click", () => {
  const interval = parseInt(document.getElementById("intervalInput").value);
  const updateAllTabs = document.getElementById("updateAllTabs").checked; // Verifica se o checkbox está marcado

  if (isNaN(interval) || interval <= 0) {
    alert("Por favor, insira um intervalo válido em segundos.");
    return;
  }

  if (!isRefreshing) {
    // Envia a mensagem para iniciar a atualização automática
    chrome.runtime.sendMessage({ action: "start", interval: interval, updateAllTabs: updateAllTabs }, (response) => {
      if (response.status === "started") {
        console.log("Atualização automática iniciada.");
        isRefreshing = true;
        document.getElementById("startBtn").style.display = "none";  // Esconde o botão de iniciar
        document.getElementById("pauseBtn").style.display = "block"; // Mostra o botão de pausar
      } else if (response.status === "already_started") {
        alert("A atualização já está em andamento.");
      }
    });
  }

  // Armazena as preferências de intervalo e se atualizar todas as abas
  chrome.storage.local.set({ interval: interval, updateAllTabs: updateAllTabs });
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  // Envia mensagem para pausar a atualização
  chrome.runtime.sendMessage({ action: "pause" }, (response) => {
    if (response.status === "paused") {
      console.log("Atualização automática pausada.");
      isRefreshing = false;
      document.getElementById("pauseBtn").style.display = "none";  // Esconde o botão de pausar
      document.getElementById("startBtn").style.display = "block"; // Mostra o botão de iniciar
    } else if (response.status === "not_active") {
      alert("Não há atualização em andamento.");
    }
  });
});
