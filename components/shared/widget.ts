window.initAiBotWidget = function ({
  userId,
  agentId,
}: {
  userId: string;
  agentId: string;
}) {
  const container = document.getElementById("ai-bot-widget");
  if (!container) return;

  const iframe = document.createElement("iframe");
  iframe.src = `https://your-domain.com/ai-bot?userId=${userId}&agentId=${agentId}`;
  iframe.style.width = "100%";
  iframe.style.height = "500px";
  iframe.style.border = "none";

  container.appendChild(iframe);
};

(function () {
  const widgetScript = document.createElement("script");
  widgetScript.src = "https://your-domain.com/widget.js"; // Path to your widget.js
  widgetScript.async = true;
  widgetScript.onload = function () {
    // Now pass an object with userId and agentId
    window.initAiBotWidget({
      userId: "USER_ID_FROM_EMBED",
      agentId: "AGENT_ID_FROM_EMBED",
    });
  };
  document.body.appendChild(widgetScript);
})();
