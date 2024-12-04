chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
 if (request.action === 'search') {
      const selection = window.getSelection().toString();
      if (selection) {
        // chrome.runtime.sendMessage({ action: 'notify', text: selection });
        chrome.runtime.sendMessage({ action: 'store', text: selection });
        // chrome.runtime.sendMessage({ action: 'openTab', url: `https://www.google.com/search?q=${encodeURIComponent(selection)}` });
      }
    }
});