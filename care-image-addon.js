(() => {
  "use strict";

  const symptomImages = {
    "葉片變軟": {
      src: "images/care/soft-leaf.webp",
      alt: "葉片變軟與皺褶參考圖片"
    }
  };

  const result = document.querySelector("#diagnosis-result");
  const symptomList = document.querySelector("#symptom-list");

  if (!result || !symptomList) return;

  function getActiveSymptom() {
    return symptomList.querySelector("button.active")?.dataset.symptom || "";
  }

  function updateDiagnosisImage() {
    result.querySelector(".diagnosis-image")?.remove();

    const symptom = getActiveSymptom();
    const image = symptomImages[symptom];

    if (!image) return;

    const figure = document.createElement("figure");
    figure.className = "diagnosis-image";

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;
    img.loading = "lazy";
    img.decoding = "async";

    figure.appendChild(img);
    result.prepend(figure);
  }

  symptomList.addEventListener("click", (event) => {
    if (!event.target.closest("button[data-symptom]")) return;
    window.setTimeout(updateDiagnosisImage, 0);
  });

  const observer = new MutationObserver(() => {
    window.setTimeout(updateDiagnosisImage, 0);
  });

  observer.observe(result, {
    childList: true
  });
})();
