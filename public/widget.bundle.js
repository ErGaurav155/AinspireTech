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
      // if (!container) {
      //   container = document.createElement("div");
      //   container.id = "chatbot-widget-container";
      //   document.body.appendChild(container);
      // }
      // container.style.position = "fixed";
      // container.style.bottom = "16px";
      // container.style.right = "16px";
      // container.style.width = "90vw";
      // container.style.maxWidth = "400px";
      // container.style.height = "93vh";
      // container.style.maxHeight = "94vh";
      // container.style.border = "1px solid #ccc";
      // container.style.borderRadius = "10px";
      // container.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
      // container.style.backgroundColor = "#fff";
      // container.style.overflow = "hidden";
      // container.style.zIndex = "9999"; // Ensures it appears above other elements
      // // Create and append the iframe
      const iframe = document.createElement("iframe");
      const validSrc = `https://ainspiretech.com/ChatBots?userId=${userId}&agentId=${agentId}`;
      iframe.src = validSrc;
      iframe.className = "h-full w-full min-h-max bg-transparent";
      container.appendChild(iframe);

      // Monitor iframe.src for changes
      const observer = new MutationObserver(() => {
        if (iframe.src !== validSrc) {
          console.error("Unauthorized iframe src modification detected!");
          container.remove(); // Remove the entire container (and iframe)
        }
      });

      observer.observe(iframe, { attributes: true, attributeFilter: ["src"] });
    },
  };

  return Widget;
});
