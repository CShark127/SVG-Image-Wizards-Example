const getScaledValue = (value, sourceRangeMin, sourceRangeMax, targetRangeMin, targetRangeMax) => {
  const targetRange = targetRangeMax - targetRangeMin;
  const sourceRange = sourceRangeMax - sourceRangeMin;
  return ((value - sourceRangeMin) * targetRange) / sourceRange + targetRangeMin;
};

const getBackgroundElmId = (id) => `${id}_Background`;
const getStageElmId = (id) => `${id}_Stage`;

const insertSvg = (svg) => {
  document.getElementById("svg-container").innerHTML = svg;
};
