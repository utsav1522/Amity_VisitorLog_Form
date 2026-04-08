import domtoimage from "dom-to-image-more";

const createDownloadClone = (cardElement) => {
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-10000px";
  wrapper.style.top = "0";
  wrapper.style.pointerEvents = "none";
  wrapper.style.opacity = "0";
  wrapper.style.background = "#ffffff";

  const clone = cardElement.cloneNode(true);
  clone.classList.add("download-pass-clone");
  clone.style.width = `${cardElement.offsetWidth}px`;

  const sourceCanvases = cardElement.querySelectorAll("canvas");
  const clonedCanvases = clone.querySelectorAll("canvas");

  clonedCanvases.forEach((canvas, index) => {
    const sourceCanvas = sourceCanvases[index];
    if (!sourceCanvas) return;

    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    canvas.style.width = sourceCanvas.style.width || `${sourceCanvas.width}px`;
    canvas.style.height = sourceCanvas.style.height || `${sourceCanvas.height}px`;

    const context = canvas.getContext("2d");
    context?.drawImage(sourceCanvas, 0, 0);
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return { wrapper, clone };
};

const cleanupDownloadClone = (wrapper) => {
  if (wrapper.parentNode) {
    wrapper.parentNode.removeChild(wrapper);
  }
};

/**
 * Downloads the visitor pass card as a PNG image
 * @param {string} passId - The visitor's pass ID
 * @param {HTMLElement} cardElement - Reference to the card element to capture
 */
export const downloadPassAsImage = async (passId, cardElement) => {
  let downloadWrapper = null;

  try {
    if (!cardElement) {
      console.error("Card element not found");
      return;
    }

    const { wrapper, clone } = createDownloadClone(cardElement);
    downloadWrapper = wrapper;

    const output = await domtoimage.toBlob(clone, {
      bgcolor: "#ffffff",
      quality: 1,
      cacheBust: true,
      style: {
        transform: "scale(2)",
        transformOrigin: "top left",
        width: `${clone.offsetWidth}px`,
        height: `${clone.offsetHeight}px`,
      },
      width: clone.offsetWidth * 2,
      height: clone.offsetHeight * 2,
    });

    cleanupDownloadClone(downloadWrapper);
    downloadWrapper = null;

    const url = window.URL.createObjectURL(output);
    const link = document.createElement("a");
    link.href = url;
    link.download = `visitor-pass-${passId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading pass:", error);
    alert("Failed to download pass. Please try again.");
  } finally {
    if (downloadWrapper) {
      cleanupDownloadClone(downloadWrapper);
    }
  }
};
