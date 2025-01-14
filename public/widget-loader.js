(async function () {
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  try {
    await loadScript("https://ainspire-tech.vercel.app/widget.bundle.js");

    if (window.Widget && typeof window.Widget.init === "function") {
      window.Widget.init({
        userId: "678382af7dcf8cebae580bec",
        agentId: "ai-agent-e-commerce",
        containerId: "chatbot-widget-container",
      });
    } else {
      console.error("Widget.init is not defined.");
    }
  } catch (error) {
    console.error("Error loading the widget script:", error);
  }
})();
