(function () {
  // The client doesn't need to modify this part
  const userId = "USER_ID"; // Replace with actual user ID
  const agentId = "AGENT_ID"; // Replace with actual agent ID

  // Create the container for the widget
  const container = document.createElement("div");
  container.id = "chatbot-widget-container";
  document.body.appendChild(container);

  // Load the widget script
  const script = document.createElement("script");
  script.src = "https://ainspire-tech.vercel.app/widget.bundle.js"; // Replace with your actual widget URL
  script.onload = function () {
    // Initialize the widget once the script is loaded
    if (window.Widget) {
      window.Widget.init({
        userId: userId,
        agentId: agentId,
        containerId: "chatbot-widget-container",
      });
    }
  };

  // Append the script to the document's head
  document.head.appendChild(script);
})();
