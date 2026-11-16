import "./styles.css";
import "./pixel.css";

// Video slots: the brag video sits beside the page as video.mp4. Until it exists the
// placeholder stays; a missing file (or the SPA fallback answering with HTML) is ignored.
for (const slot of document.querySelectorAll<HTMLElement>(".video-slot[data-src]")) {
  const src = slot.dataset.src!;
  fetch(src, { method: "HEAD" })
    .then((r) => {
      const type = r.headers.get("content-type") || "";
      if (!r.ok || !type.startsWith("video/")) return;
      const video = slot.querySelector("video")!;
      video.addEventListener("loadeddata", () => slot.classList.add("has-video"), { once: true });
      video.src = src;
    })
    .catch(() => {});
}
