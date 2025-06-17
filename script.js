let models = {};
const canvases = {
  pascal: document.getElementById("canvas-pascal"),
  cityscapes: document.getElementById("canvas-cityscapes"),
  ade20k: document.getElementById("canvas-ade20k"),
};
const legends = {
  pascal: document.getElementById("legend-pascal"),
  cityscapes: document.getElementById("legend-cityscapes"),
  ade20k: document.getElementById("legend-ade20k"),
};
const containers = {
  pascal: document.getElementById("pascalContainer"),
  cityscapes: document.getElementById("cityscapesContainer"),
  ade20k: document.getElementById("ade20kContainer"),
};

const video = document.getElementById("video");
const buttons = document.querySelectorAll(".model-btn");


navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;
});
 
async function loadModel(name) {
  if (!models[name]) {
    legends[name].innerHTML = "<em>Cargando modelo...</em>";
    models[name] = await deeplab.load({ base: name, quantizationBytes: 2 });
    console.log(`Modelo ${name} cargado.`);
  }
  return models[name];
}


function hideAllResults() {
  Object.values(containers).forEach((container) => {
    container.style.display = "none";
  });
}


function renderPrediction(prediction, modelName) {
  const { legend, height, width, segmentationMap } = prediction;
  const imageData = new ImageData(segmentationMap, width, height);

  const canvas = canvases[modelName];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);

  displayLegend(legend, modelName);
  containers[modelName].style.display = "block"; 
}


function displayLegend(legendObj, modelName) {
  const container = legends[modelName];
  container.innerHTML = "";

  Object.keys(legendObj).forEach((label) => {
    const [r, g, b] = legendObj[label];
    const span = document.createElement("span");
    span.textContent = label;
    span.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    container.appendChild(span);
  });
}


buttons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const modelName = btn.getAttribute("data-model");

  
    hideAllResults();

   
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const img = new Image();
    img.src = tempCanvas.toDataURL();
    await img.decode();

    legends[modelName].innerHTML = "<em>Procesando...</em>";
    const model = await loadModel(modelName);
    const prediction = await model.segment(img);
    renderPrediction(prediction, modelName);
  });
});