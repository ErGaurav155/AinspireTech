!(function (e, t) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
    ? define([], t)
    : "object" == typeof exports
    ? (exports.Widget = t())
    : (e.Widget = t());
})(self, () => {
  return (
    (window.initAiBotWidget = function (e) {
      var t = e.userId,
        o = e.agentId,
        n = document.getElementById("ai-bot-widget");
      if (n) {
        var d = document.createElement("iframe");
        (d.src = "https://ainspire-tech.vercel.app/ChatBots?userId="
          .concat(t, "&agentId=")
          .concat(o)),
          (d.style.width = "100%"),
          (d.style.height = "500px"),
          (d.style.border = "none"),
          n.appendChild(d);
      }
    }),
    ((e = document.createElement("script")).src =
      "https://ainspire-tech.vercel.app/widget.js"),
    (e.async = !0),
    (e.onload = function () {
      window.initAiBotWidget({
        userId: "USER_ID_FROM_EMBED",
        agentId: "AGENT_ID_FROM_EMBED",
      });
    }),
    document.body.appendChild(e),
    {}
  );
  var e;
});
