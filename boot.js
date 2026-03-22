(function () {
  var status = document.createElement("div");
  var hidden = false;

  status.style.position = "fixed";
  status.style.left = "16px";
  status.style.top = "16px";
  status.style.zIndex = "99999";
  status.style.maxWidth = "320px";
  status.style.padding = "12px 14px";
  status.style.borderRadius = "14px";
  status.style.background = "rgba(6, 18, 23, 0.92)";
  status.style.border = "1px solid rgba(139, 214, 209, 0.22)";
  status.style.color = "#f3f6ec";
  status.style.fontFamily = "Trebuchet MS, Gill Sans, sans-serif";
  status.style.fontSize = "14px";
  status.style.boxShadow = "0 12px 30px rgba(0,0,0,0.24)";
  status.textContent = "Loading AWESOMECRAFT...";

  function show(message) {
    status.textContent = message;
    if (!status.parentNode) {
      document.body.appendChild(status);
    }
  }

  function hide() {
    hidden = true;
    if (status.parentNode) {
      status.parentNode.removeChild(status);
    }
  }

  function loadScript(src) {
    var script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onerror = function () {
      show("AWESOMECRAFT could not load its main game script. Reload this page, and if it still fails try Safari or Chrome on a newer device.");
    };
    document.body.appendChild(script);
  }

  window.__awesomeBooted = false;

  window.addEventListener("error", function () {
    if (!window.__awesomeBooted) {
      show("AWESOMECRAFT hit a startup error. Reload the page. If you are on an older iPad, update the browser and try again.");
    }
  });

  window.addEventListener("load", function () {
    show("Loading AWESOMECRAFT...");
    loadScript("./app.js");
    setTimeout(function () {
      if (window.__awesomeBooted) {
        hide();
      } else if (!hidden) {
        show("AWESOMECRAFT is still starting. If the screen stays stuck, reload the page once.");
      }
    }, 2500);
  });
}());
