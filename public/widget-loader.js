(async function () {
  const scriptSrc = document.currentScript.src;
  console.log(scriptSrc);
  // Create a URLSearchParams object from the script src query string
  const params = new URLSearchParams(scriptSrc.split("?")[1]);
  console.log(params);
  // Extract userId and agentId from the URL parameters
  const userId = params.get("userId");
  const agentId = params.get("agentId");
  console.log(userId, agentId);
  if (!userId || !agentId) {
    console.error("Missing agentId or userId in the URL.");
    return;
  }

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
    await loadScript("https://ainspiretech.com/widget.bundle.js");

    if (window.Widget && typeof window.Widget.init === "function") {
      window.Widget.init({
        userId: userId,
        agentId: agentId,
        containerId: "chatbot-widget-container",
      });
    } else {
      console.error("Widget.init is not defined.");
    }
  } catch (error) {
    console.error("Error loading the widget script:", error);
  }
})();
