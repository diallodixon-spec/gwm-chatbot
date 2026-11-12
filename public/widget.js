(function () {
  const script = document.currentScript;
  const chatbotUrl = new URL("/widget", script.src).href;
  const chatbotOrigin = new URL(chatbotUrl).origin;

  // Create the chatbot iframe.
  const iframe = document.createElement("iframe");

  iframe.src = chatbotUrl;
  iframe.title = "GWM Jamaica Chatbot";
  iframe.setAttribute("allow", "clipboard-write");

  // Initial size: just large enough for the chat button.
  Object.assign(iframe.style, {
    position: "fixed",
    bottom: "0",
    right: "0",
    width: "100px",
    height: "100px",
    border: "none",
    background: "transparent",
    zIndex: "999999",
    transition: "width 0.2s ease, height 0.2s ease",
  });

  document.body.appendChild(iframe);

  // Listen for open/close messages from the chatbot.
  window.addEventListener("message", function (event) {

    // Only accept messages from our chatbot iframe.
    if (event.source !== iframe.contentWindow) return;
    if (event.origin !== chatbotOrigin) return;

    if (event.data?.type === "gwm-chatbot-resize") {

    if (event.data.open) {
      iframe.style.width = Math.min(420, window.innerWidth) + "px";
      iframe.style.height = Math.min(650, window.innerHeight) + "px";
    } else {
      iframe.style.width = "100px";
      iframe.style.height = "100px";
    }

    }
  });

})();
