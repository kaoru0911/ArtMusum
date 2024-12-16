function controlMenu() {
  let isOpen = true;
  const menuBody = document.getElementById("spotMenu");
  const button = menuBody.querySelector("#spotMenuToggleButton");
  const arrow = button.querySelector("i");

  function closeSpotMenu() {
    isOpen = false;
    menuBody.style = "transform: translateY(100%);";
    arrow.style = "transform: translateY(4px) rotate(-135deg);";
  }

  function toggleSpotMenu() {
    if (isOpen) {
      closeSpotMenu();
    } else {
      isOpen = true;
      menuBody.style = "transform: translateY(0);";
      arrow.style = "transform: rotate(45deg);";
    }
  }

  button.addEventListener("click", toggleSpotMenu);

  const spotButtons = menuBody
    .querySelector("#spotList")
    .querySelectorAll("button");

  spotButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const position = button.getAttribute("data-position").split(" ");
      const rotation = button.getAttribute("data-rotation").split(" ");
      const cameraEl = document.getElementById("camera");

      cameraEl.setAttribute("position", {
        x: parseFloat(position[0]),
        y: parseFloat(position[1]),
        z: parseFloat(position[2]),
      });

      cameraEl.components["look-controls"].pitchObject.rotation.set(
        window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[0])),
        0,
        0
      );
      cameraEl.components["look-controls"].yawObject.rotation.set(
        0,
        window.AFRAME.THREE.MathUtils.degToRad(parseFloat(rotation[1])),
        0
      );
    });
  });

  return { closeSpotMenu, toggleSpotMenu };
}

const { closeSpotMenu, toggleSpotMenu } = controlMenu();
window.closeSpotMenu = closeSpotMenu;
window.toggleSpotMenu = toggleSpotMenu;

function getPostionAndRotation() {
  const cameraEl = document.getElementById("camera");
  const position = cameraEl.getAttribute("position");
  const rotation = cameraEl.getAttribute("rotation");

  console.log(`
    data-position="${position.x} ${position.y} ${position.z}"
    data-rotation="${rotation.x} ${rotation.y}"
  `);
}
