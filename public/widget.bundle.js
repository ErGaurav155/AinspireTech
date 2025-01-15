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
      iframe.style.width = "100%";
      iframe.style.height = "500px";
      iframe.style.border = "none";
      iframe.style.position = "fixed";
      iframe.style.bottom = "16px"; // Adjust this value for the bottom position
      iframe.style.right = "16px"; // Adjust this value for the right position
      iframe.style.zIndex = "-1"; // Ensure the iframe is above other content
      container.appendChild(iframe);
    },
  };

  return Widget;
});
