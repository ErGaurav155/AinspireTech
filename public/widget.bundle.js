(function (global, factory) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    exports.Widget = factory();
  } else {
    global.Widget = factory();
  }
})(this, function () {
  // Define the Widget object
  const Widget = {
    init: function ({ userId, agentId, containerId }) {
      if (!userId || !agentId || !containerId) {
        console.error(
          "Missing required parameters: userId, agentId, containerId"
        );
        return;
      }

      // Find the container element
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
        return;
      }

      // Create and append the iframe
      const iframe = document.createElement("iframe");
      iframe.src = `https://ainspire-tech.vercel.app/ChatBots?userId=${userId}&agentId=${agentId}`;
      iframe.className =
        "h-auto w-auto flex flex-col fixed bottom-4 right-4 z-999 ";

      container.appendChild(iframe);
    },
  };

  return Widget;
});
