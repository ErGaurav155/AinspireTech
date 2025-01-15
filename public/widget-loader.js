(async function () {
  const scriptSrc = document.currentScript.src;
  console.log(scriptSrc);
  // Create a URLSearchParams object from the script src query string
  const params = new URLSearchParams(scriptSrc.split("?")[1]);
  console.log(params);
  // Extract userId and agentId from the URL parameters
  const userId = params.get("userId");
  const agentId = params.get("agentId");

  if (!userId || !agentId) {
    console.error("Missing agentId or userId in the URL.");
    return;
  }

  // const isValid = await fetch(
  //   "https://ainspire-tech.vercel.app/api/validate-widget",
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       "X-Secret-Key": "your-secret-key", // Include your secret key here
  //     },
  //     body: JSON.stringify({ agentId, userId }),
  //   }
  // )
  //   .then((res) => res.json())
  //   .then((data) => {
  //     // Check if the response is valid
  //     return data.isValid === "true"; // Check if isValid is 'true'
  //   })
  //   .catch((error) => {
  //     console.error("Error validating the subscription:", error);
  //     return false; // If there's an error, return false
  //   });
  // if (!isValid) {
  //   console.error("Invalid agentId or userId. Widget will not load.");
  //   return;
  // }

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
