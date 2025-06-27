document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("chat-toggle-btn");
  const closeBtn  = document.getElementById("chat-close-btn");
  const widget    = document.getElementById("chat-widget");

  // 開く・閉じるをトグル
  function openWidget() {
    widget.classList.remove("hidden");
    widget.classList.add("visible");
  }
  function closeWidget() {
    widget.classList.remove("visible");
    widget.classList.add("hidden");
  }

  toggleBtn.addEventListener("click", () => {
    if (widget.classList.contains("visible")) {
      closeWidget();
    } else {
      openWidget();
    }
  });

  closeBtn.addEventListener("click", closeWidget);
});



