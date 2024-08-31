export const copySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" color="#ffffff" fill="none">
    <path d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16L9 15Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

export const copiedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-check">
    <path d="m12 15 2 2 4-4"/>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>`;

export function cartaCodeCopy() {
  return setTimeout(() => {
    const codeBlocks = document.querySelectorAll("pre");

    codeBlocks.forEach((codeBlock) => {
      if (codeBlock.querySelector(".copy-button")) return;

      const copyButton = document.createElement("button");
      copyButton.className = "copy-button";
      copyButton.innerHTML = `<span style="margin-right: 3px;">Copy</span>${copySvg}`;
      copyButton.style.position = "absolute";
      copyButton.style.top = "5px";
      copyButton.style.right = "5px";
      copyButton.style.padding = "8px";
      copyButton.style.paddingTop = "3px";
      copyButton.style.paddingBottom = "3px";
      copyButton.style.backgroundColor = "#4a4a4a";
      copyButton.style.color = "white";
      copyButton.style.border = "none";
      copyButton.style.borderRadius = "6px";
      copyButton.style.cursor = "pointer";
      copyButton.style.display = "none";
      copyButton.style.alignItems = "center";
      copyButton.style.justifyContent = "center";
      copyButton.style.gap = "4px";

      copyButton.addEventListener("click", () => {
        const code = codeBlock.querySelector("code");
        if (code) {
          navigator.clipboard.writeText(code.textContent || "").then(() => {
            copyButton.innerHTML = `<span style="margin-right: 3px;">Copied!</span>${copiedSvg}`;
            setTimeout(() => {
              copyButton.innerHTML = `<span style="margin-right: 3px;">Copy</span>${copySvg}`;
            }, 2000);
          });
        }
      });

      codeBlock.style.position = "relative";
      codeBlock.appendChild(copyButton);

      codeBlock.addEventListener("mouseenter", () => {
        copyButton.style.display = "flex";
      });

      codeBlock.addEventListener("mouseleave", () => {
        copyButton.style.display = "none";
      });
    });
  }, 0);
}
