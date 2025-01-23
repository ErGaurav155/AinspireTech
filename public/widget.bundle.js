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
      container.className =
        "z-50 fixed bottom-4 right-4 w-[90vw] sm:w-96 h-[93vh] max-h-[94vh]";
      // Create and append the iframe
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
