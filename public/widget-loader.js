(async function () {
  // Replace these with actual values
  const userId = "678382af7dcf8cebae580bec";
  const agentId = "ai-agent-e-commerce";

  // Create the container for the widget
  const container = document.createElement("div");
  container.id = "chatbot-widget-container";
  document.body.appendChild(container);

  // Load the widget script
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
      // Initialize the widget
      window.Widget.init({
        userId: userId,
        agentId: agentId,
        containerId: "chatbot-widget-container",
      });
    } else {
      console.error("Widget.init is not available on window.Widget");
    }
  } catch (error) {
    console.error("Failed to load the widget script:", error);
  }
})();
