window.addEventListener("wheel", (event) => {
  const mask = document.querySelector(".mask");
  const spotList = document.getElementById("spotList");
  if (
    event.target === spotList ||
    spotList.contains(event.target) ||
    event.target === mask ||
    mask.contains(event.target)
  )
    return;

  // small increments for smoother zooming
  const delta = event.wheelDelta / 120 / 10;
  var mycam = document.getElementById("camera").getAttribute("camera");
  var finalZoom =
    document.getElementById("camera").getAttribute("camera").zoom + delta;

  // limiting the zoom
  if (finalZoom < 1) finalZoom = 1;
  if (finalZoom > 2) finalZoom = 2;
  mycam.zoom = finalZoom;

  document.getElementById("camera").setAttribute("camera", mycam);
});
