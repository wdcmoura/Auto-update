let refreshIntervalId = null; // ID do intervalo de refresh
let isActive = false; // Flag que indica se o refresh está ativo

// Função para iniciar o refresh com base nas configurações salvas
function startAutoRefresh() {
  chrome.storage.local.get(['isActive', 'interval', 'updateAllTabs'], (result) => {
    if (result.isActive && result.interval > 0) {
      console.log("Iniciando o refresh automático com o último valor salvo.");

      // Salva o estado como ativo
      isActive = true;

      // Começa o intervalo de atualização
      refreshIntervalId = setInterval(() => {
        console.log("Atualizando a página...");

        if (result.updateAllTabs) {
          // Atualiza todas as abas
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              // Recarrega cada aba
              chrome.tabs.reload(tab.id, { bypassCache: true });
            });
          });
        } else {
          // Atualiza apenas a aba ativa
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.reload(tabs[0].id, { bypassCache: true });
            }
          });
        }
      }, result.interval * 1000); // Intervalo em milissegundos
    }
  });
}

// Verifica as configurações ao iniciar o Chrome
chrome.runtime.onStartup.addListener(() => {
  // Inicia o refresh automaticamente se configurado anteriormente
  startAutoRefresh();
});

// Gerenciamento das mensagens de iniciar e pausar o refresh
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    const interval = message.interval;
    const updateAllTabs = message.updateAllTabs;

    if (interval == null || interval <= 0) {
      console.error("Intervalo inválido");
      return;
    }

    // Se já houver um intervalo ativo, não iniciar outro
    if (isActive) {
      sendResponse({ status: "already_started" });
      return;
    }

    // Salva as configurações no armazenamento local
    chrome.storage.local.set({ isActive: true, interval: interval, updateAllTabs: updateAllTabs }, () => {
      if (chrome.runtime.lastError) {
        console.error("Erro ao salvar no storage:", chrome.runtime.lastError);
        return;
      }

      // Começa o intervalo de atualização
      refreshIntervalId = setInterval(() => {
        console.log("Atualizando a página...");

        if (updateAllTabs) {
          // Atualiza todas as abas
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
              // Recarrega cada aba
              chrome.tabs.reload(tab.id, { bypassCache: true });
            });
          });
        } else {
          // Atualiza apenas a aba ativa
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.reload(tabs[0].id, { bypassCache: true });
            }
          });
        }
      }, interval * 1000); // Intervalo em milissegundos
    });

    isActive = true; // Marca o estado como ativo
    sendResponse({ status: "started" });
  }

  if (message.action === "pause") {
    if (refreshIntervalId !== null) {
      // Limpa o intervalo e marca o estado como inativo
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
      isActive = false;
      chrome.storage.local.set({ isActive: false });

      sendResponse({ status: "paused" });
    } else {
      sendResponse({ status: "not_active" }); // Não havia nenhum intervalo ativo
    }
  }

  return true; // Permite resposta assíncrona
});
