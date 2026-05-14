function updateClock() {
  var timeTarget = document.getElementById("current-time");
  var dateTarget = document.getElementById("current-date");

  if (!timeTarget || !dateTarget) {
    return;
  }

  var now = new Date();
  var time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  var date = now.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });

  timeTarget.textContent = time;
  dateTarget.textContent = date;
}

window.addEventListener("load", function () {
  if (document.querySelector(".curtain-loader")) {
    requestAnimationFrame(function () {
      document.body.classList.add("curtain-ready");
    });
  }
});

function setupScrollReveal() {
  var revealItems = document.querySelectorAll(".features-heading, .feature-card");

  if (!revealItems.length) {
    return;
  }

  document.body.classList.add("scroll-reveal-enabled");

  revealItems.forEach(function (item, index) {
    item.classList.add("reveal-on-scroll");
    item.style.animationDelay = Math.min(index * 90, 540) + "ms";
  });

  var ticking = false;

  function revealVisibleItems() {
    revealItems.forEach(function (item) {
      if (item.classList.contains("is-visible")) {
        return;
      }

      var rect = item.getBoundingClientRect();
      var triggerPoint = window.innerHeight * 0.82;

      if (rect.top < triggerPoint) {
        item.classList.add("is-visible");
      }
    });

    ticking = false;
  }

  function requestRevealCheck() {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(revealVisibleItems);
  }

  window.addEventListener("scroll", requestRevealCheck, { passive: true });
  window.addEventListener("resize", requestRevealCheck);
}

setupScrollReveal();

function setupSupportModal() {
  var modal = document.getElementById("support-modal");
  var openButton = document.querySelector("[data-support-open]");

  if (!modal || !openButton) {
    return;
  }

  var closeButtons = modal.querySelectorAll("[data-support-close]");
  var tabs = modal.querySelectorAll("[data-support-tab]");
  var panels = modal.querySelectorAll("[data-support-panel]");
  var commentForm = modal.querySelector(".support-comment-form");
  var formStatus = modal.querySelector(".support-form-status");

  function openModal() {
    modal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
  }

  openButton.addEventListener("click", openModal);

  closeButtons.forEach(function (button) {
    button.addEventListener("click", closeModal);
  });

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-support-tab");

      tabs.forEach(function (item) {
        item.classList.toggle("is-active", item === tab);
      });

      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-support-panel") !== target;
        panel.classList.toggle("is-active", !panel.hidden);
      });
    });
  });

  if (commentForm) {
    commentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (formStatus) {
        formStatus.textContent = "Sending...";
        formStatus.classList.remove("is-error", "is-success");
      }

      fetch("send_support.php", {
        method: "POST",
        body: new FormData(commentForm)
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok || !data.ok) {
              throw new Error(data.message || "Message could not be sent.");
            }

            return data;
          });
        })
        .then(function (data) {
          commentForm.reset();

          if (formStatus) {
            formStatus.textContent = data.message || "Thanks! Your comment was sent.";
            formStatus.classList.add("is-success");
          }
        })
        .catch(function (error) {
          if (formStatus) {
            formStatus.textContent = error.message;
            formStatus.classList.add("is-error");
          }
        });
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });
}

setupSupportModal();

updateClock();
setInterval(updateClock, 1000);

var allowCameraButton = document.getElementById("allow-camera");
var cameraStatusTitle = document.getElementById("camera-status-title");
var cameraStatusText = document.getElementById("camera-status-text");
var cameraStatus = document.querySelector(".camera-status");
var readyStatus = document.getElementById("ready-status");
var startBoothButton = document.getElementById("start-booth");
var layoutNote = document.getElementById("layout-note");
var setupFrame = document.getElementById("setup-frame");
var boothSetup = document.getElementById("booth-setup");
var boothCapture = document.getElementById("booth-capture");
var capturePreview = document.getElementById("capture-preview");
var captureMeta = document.getElementById("capture-meta");
var captureCount = document.getElementById("capture-count");
var countdownOverlay = document.getElementById("countdown-overlay");
var shotSlots = document.getElementById("shot-slots");
var mirrorCameraButton = document.getElementById("mirror-camera");
var cancelCaptureButton = document.getElementById("cancel-capture");
var snapButton = document.getElementById("snap-button");
var selectedLayout = "1x3";
var selectedTimer = "3s";
var capturedPhotos = 0;
var capturedPhotoUrls = [];
var isCapturingSequence = false;
var captureSound = new Audio("assets/capture.mp3");
var finalStrip = document.getElementById("final-strip");
var backgroundCode = document.getElementById("background-code");
var customColorInput = document.getElementById("custom-color");
var captionInput = document.querySelector(".caption-input");
var captionCount = document.querySelector(".caption-count");
var captionStandard = document.querySelector(".caption-standard");
var captionSingle = document.querySelector(".caption-single");
var captionInputTop = document.querySelector(".caption-input-top");
var captionInputBottom = document.querySelector(".caption-input-bottom");
var captionCountTop = document.querySelector(".caption-count-top");
var captionCountBottom = document.querySelector(".caption-count-bottom");
var captionPositionButtons = document.querySelectorAll("[data-caption-position]");
var toolTabs = document.querySelectorAll(".tool-tab");
var toolPanels = document.querySelectorAll("[data-tool-panel]");
var stickerButtons = document.querySelectorAll("[data-sticker]");
var stickerSizeInput = document.getElementById("sticker-size");
var stickerRotationInput = document.getElementById("sticker-rotation");
var removeStickerButton = document.getElementById("remove-sticker");
var clearStickersButton = document.getElementById("clear-stickers");
var saveStripButton = document.getElementById("save-strip");
var readyStrip = document.getElementById("ready-strip");
var downloadStripButton = document.getElementById("download-strip");
var selectedSticker = "";
var selectedPlacedSticker = null;
var stripCaption = null;
var stripCaptionTop = null;
var stripCaptionBottom = null;
var editStripLayout = "";

function getLayoutCount(layout) {
  if (layout === "2x3") {
    return 6;
  }

  if (layout === "2x2") {
    return 4;
  }

  if (layout === "1x2") {
    return 2;
  }

  if (layout === "1x1") {
    return 1;
  }

  return 3;
}

function renderShotSlots(count) {
  if (!shotSlots) {
    return;
  }

  shotSlots.innerHTML = "";
  shotSlots.className = "shot-slots layout-" + selectedLayout;
  capturedPhotos = 0;
  capturedPhotoUrls = [];

  for (var index = 1; index <= count; index += 1) {
    var slot = document.createElement("span");
    slot.className = "shot-slot";
    slot.textContent = index;
    shotSlots.appendChild(slot);
  }
}

function captureVideoFrame() {
  if (!capturePreview || !capturePreview.videoWidth || !capturePreview.videoHeight) {
    return "";
  }

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var maxWidth = 960;
  var scale = Math.min(1, maxWidth / capturePreview.videoWidth);
  canvas.width = Math.round(capturePreview.videoWidth * scale);
  canvas.height = Math.round(capturePreview.videoHeight * scale);

  if (capturePreview.classList.contains("is-mirrored")) {
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
  }

  context.drawImage(capturePreview, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

function animatePhotoToSlot(imageUrl, slot) {
  if (!capturePreview || !slot) {
    return;
  }

  var sourceRect = capturePreview.getBoundingClientRect();
  var targetRect = slot.getBoundingClientRect();
  var flyer = document.createElement("img");
  flyer.src = imageUrl;
  flyer.className = "photo-flyer";
  flyer.style.left = sourceRect.left + "px";
  flyer.style.top = sourceRect.top + "px";
  flyer.style.width = sourceRect.width + "px";
  flyer.style.height = sourceRect.height + "px";
  document.body.appendChild(flyer);

  var deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
  var deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
  var scaleX = targetRect.width / sourceRect.width;
  var scaleY = targetRect.height / sourceRect.height;

  requestAnimationFrame(function () {
    flyer.style.transform = "translate(" + deltaX + "px, " + deltaY + "px) scale(" + scaleX + ", " + scaleY + ")";
    flyer.style.opacity = "0.35";
  });

  flyer.addEventListener("transitionend", function () {
    slot.innerHTML = "";
    var image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "";
    slot.appendChild(image);
    flyer.remove();
  }, { once: true });
}

function wait(milliseconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

function getTimerSeconds() {
  var seconds = parseInt(selectedTimer, 10);
  return Number.isNaN(seconds) ? 3 : seconds;
}

function getReadableTextColor(hexColor) {
  var normalized = hexColor.replace("#", "");

  if (normalized.length === 3) {
    normalized = normalized.split("").map(function (character) {
      return character + character;
    }).join("");
  }

  var red = parseInt(normalized.slice(0, 2), 16);
  var green = parseInt(normalized.slice(2, 4), 16);
  var blue = parseInt(normalized.slice(4, 6), 16);
  var brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? "#111111" : "#ffffff";
}

function applyStripBackground(color) {
  if (finalStrip) {
    finalStrip.style.background = color;
  }

  if (stripCaption) {
    stripCaption.style.color = getReadableTextColor(color);
  }

  if (stripCaptionTop) {
    stripCaptionTop.style.color = getReadableTextColor(color);
  }

  if (stripCaptionBottom) {
    stripCaptionBottom.style.color = getReadableTextColor(color);
  }

  if (backgroundCode) {
    backgroundCode.textContent = color.toUpperCase();
  }
}

async function runCountdown(seconds) {
  if (!countdownOverlay) {
    await wait(seconds * 1000);
    return;
  }

  countdownOverlay.hidden = false;

  for (var value = seconds; value > 0; value -= 1) {
    countdownOverlay.textContent = value;
    await wait(1000);
  }

  countdownOverlay.textContent = "Snap";
  await wait(250);
  countdownOverlay.hidden = true;
}

function captureNextPhoto() {
  var slots = shotSlots ? shotSlots.querySelectorAll(".shot-slot") : [];

  if (capturedPhotos >= slots.length) {
    return false;
  }

  var imageUrl = captureVideoFrame();

  if (!imageUrl) {
    return false;
  }

  var slot = slots[capturedPhotos];
  capturedPhotos += 1;
  capturedPhotoUrls.push(imageUrl);

  captureSound.currentTime = 0;
  captureSound.play().catch(function () {});

  if (captureCount) {
    captureCount.textContent = capturedPhotos + "/" + slots.length;
  }

  animatePhotoToSlot(imageUrl, slot);
  return true;
}

function openCustomizationPage() {
  var payload = {
    layout: selectedLayout,
    photos: capturedPhotoUrls
  };

  try {
    sessionStorage.setItem("onlineBoothStrip", JSON.stringify(payload));
    window.location.href = "edit.html";
  } catch (error) {
    alert("The captured photos are too large to open the editor. Please retake with fewer photos or refresh and try again.");
  }
}

async function startCaptureSequence() {
  var slots = shotSlots ? shotSlots.querySelectorAll(".shot-slot") : [];

  if (!slots.length || isCapturingSequence) {
    return;
  }

  isCapturingSequence = true;

  if (snapButton) {
    snapButton.disabled = true;
  }

  while (isCapturingSequence && capturedPhotos < slots.length) {
    await runCountdown(getTimerSeconds());
    if (!isCapturingSequence) {
      break;
    }
    captureNextPhoto();
    await wait(450);
  }

  isCapturingSequence = false;

  if (snapButton) {
    snapButton.disabled = false;
  }

  if (capturedPhotos >= slots.length) {
    await wait(500);
    openCustomizationPage();
  }
}

if (allowCameraButton) {
  allowCameraButton.addEventListener("click", function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraStatusTitle.textContent = "Camera not supported";
      cameraStatusText.textContent = "Use a browser with camera access";
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
      window.onlineBoothCameraStream = stream;
      cameraStatusTitle.textContent = "Camera connected";
      cameraStatusText.textContent = "Your webcam is ready to use";
      allowCameraButton.hidden = true;

      if (cameraStatus) {
        cameraStatus.classList.add("is-ready");
      }

      if (readyStatus) {
        readyStatus.hidden = false;
      }

      if (startBoothButton) {
        startBoothButton.disabled = false;
        startBoothButton.textContent = "Start booth ->";
      }
    }).catch(function () {
      cameraStatusTitle.textContent = "Camera blocked";
      cameraStatusText.textContent = "Allow camera permission to continue";
    });
  });
}

document.querySelectorAll(".layout-option").forEach(function (button) {
  button.addEventListener("click", function () {
    document.querySelectorAll(".layout-option").forEach(function (option) {
      option.classList.remove("is-active");
    });
    button.classList.add("is-active");

    if (layoutNote) {
      var layout = button.getAttribute("data-layout");
      var count = getLayoutCount(layout);
      selectedLayout = layout;
      layoutNote.textContent = count + " photos will be taken - " + layout + " grid";
    }
  });
});

document.querySelectorAll(".timer-option").forEach(function (button) {
  button.addEventListener("click", function () {
    document.querySelectorAll(".timer-option").forEach(function (option) {
      option.classList.remove("is-active");
    });
    button.classList.add("is-active");
    selectedTimer = button.textContent.trim();
  });
});

if (startBoothButton && boothCapture) {
  startBoothButton.addEventListener("click", function () {
    var count = getLayoutCount(selectedLayout);

    if (captureMeta) {
      captureMeta.textContent = "Layout: " + selectedLayout + " - Timer: " + selectedTimer;
    }

    if (captureCount) {
      captureCount.textContent = "0/" + count;
    }

    renderShotSlots(count);

    if (capturePreview && window.onlineBoothCameraStream) {
      capturePreview.srcObject = window.onlineBoothCameraStream;
    }

    if (setupFrame) {
      setupFrame.hidden = true;
    } else if (boothSetup) {
      boothSetup.hidden = true;
    }

    boothCapture.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

if (mirrorCameraButton && capturePreview) {
  mirrorCameraButton.addEventListener("click", function () {
    capturePreview.classList.toggle("is-mirrored");
  });
}

if (cancelCaptureButton && boothSetup && boothCapture) {
  cancelCaptureButton.addEventListener("click", function () {
    isCapturingSequence = false;

    if (countdownOverlay) {
      countdownOverlay.hidden = true;
    }

    if (snapButton) {
      snapButton.disabled = false;
    }

    boothCapture.hidden = true;

    if (setupFrame) {
      setupFrame.hidden = false;
    } else {
      boothSetup.hidden = false;
    }
  });
}

if (snapButton && shotSlots) {
  snapButton.addEventListener("click", function () {
    startCaptureSequence();
  });
}

if (finalStrip) {
  var shouldRestoreFinal = new URLSearchParams(window.location.search).get("restore") === "final";
  var storedStrip = sessionStorage.getItem("onlineBoothStrip");
  var stripData = null;
  var savedFinalForEdit = sessionStorage.getItem("onlineBoothFinalStrip");
  var savedEditData = null;

  try {
    stripData = storedStrip ? JSON.parse(storedStrip) : null;
  } catch (error) {
    stripData = null;
  }

  try {
    savedEditData = savedFinalForEdit ? JSON.parse(savedFinalForEdit) : null;
  } catch (error) {
    savedEditData = null;
  }

  if (shouldRestoreFinal && savedEditData) {
    finalStrip.className = savedEditData.className.replace(" ready-strip", "");
    finalStrip.innerHTML = savedEditData.html;
    finalStrip.style.background = savedEditData.background;
    stripCaption = finalStrip.querySelector(".strip-caption");
    stripCaptionTop = finalStrip.querySelector(".strip-caption-top");
    stripCaptionBottom = finalStrip.querySelector(".strip-caption-bottom");
    editStripLayout = getStripLayoutFromClass(finalStrip);

    finalStrip.querySelectorAll(".placed-sticker").forEach(function (sticker) {
      if (sticker.dataset.rotation) {
        sticker.style.setProperty("--rotation", sticker.dataset.rotation + "deg");
      }
      makeStickerDraggable(sticker);
    });

    if (captionStandard && captionSingle && editStripLayout === "1x1") {
      captionStandard.hidden = true;
      captionSingle.hidden = false;
    }
  } else if (!stripData || !stripData.photos || !stripData.photos.length) {
    window.location.href = "photobooth.html";
  } else {
    editStripLayout = stripData.layout;
    finalStrip.className = "final-strip layout-" + stripData.layout;

    stripData.photos.forEach(function (photoUrl) {
      var image = document.createElement("img");
      image.src = photoUrl;
      image.alt = "";
      finalStrip.appendChild(image);
    });

    stripCaption = document.createElement("div");
    stripCaption.className = "strip-caption";
    finalStrip.appendChild(stripCaption);
    finalStrip.classList.add("caption-bottom");

    stripCaptionTop = document.createElement("div");
    stripCaptionTop.className = "strip-caption-top";
    finalStrip.appendChild(stripCaptionTop);

    stripCaptionBottom = document.createElement("div");
    stripCaptionBottom.className = "strip-caption-bottom";
    finalStrip.appendChild(stripCaptionBottom);

    if (captionStandard && captionSingle && editStripLayout === "1x1") {
      captionStandard.hidden = true;
      captionSingle.hidden = false;
    }

    applyStripBackground("#e7e7e7");
  }
}

document.querySelectorAll(".swatch").forEach(function (button) {
  button.addEventListener("click", function () {
    var color = button.getAttribute("data-color");

    document.querySelectorAll(".swatch").forEach(function (swatch) {
      swatch.classList.remove("is-active");
    });
    button.classList.add("is-active");

    applyStripBackground(color);
  });
});

if (customColorInput) {
  customColorInput.addEventListener("input", function () {
    applyStripBackground(customColorInput.value);
  });
}

if (captionInput && captionCount) {
  captionInput.addEventListener("input", function () {
    var text = captionInput.value.slice(0, 20);

    if (captionInput.value !== text) {
      captionInput.value = text;
    }

    captionCount.textContent = text.length + "/20";

    if (!finalStrip || !stripCaption) {
      return;
    }

    stripCaption.textContent = text;
    finalStrip.classList.toggle("has-caption", text.length > 0);
  });
}

function updateSingleCaption(input, counter, captionElement, className) {
  var text = input.value.slice(0, 20);

  if (input.value !== text) {
    input.value = text;
  }

  counter.textContent = text.length + "/20";

  if (!finalStrip || !captionElement) {
    return;
  }

  captionElement.textContent = text;
  finalStrip.classList.toggle(className, text.length > 0);
}

if (captionInputTop && captionCountTop) {
  captionInputTop.addEventListener("input", function () {
    updateSingleCaption(captionInputTop, captionCountTop, stripCaptionTop, "has-top-caption");
  });
}

if (captionInputBottom && captionCountBottom) {
  captionInputBottom.addEventListener("input", function () {
    updateSingleCaption(captionInputBottom, captionCountBottom, stripCaptionBottom, "has-bottom-caption");
  });
}

captionPositionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    var position = button.getAttribute("data-caption-position");

    captionPositionButtons.forEach(function (item) {
      item.classList.remove("is-active");
    });
    button.classList.add("is-active");

    if (!finalStrip) {
      return;
    }

    finalStrip.classList.toggle("caption-top", position === "top");
    finalStrip.classList.toggle("caption-bottom", position === "bottom");
  });
});

function selectPlacedSticker(stickerElement) {
  document.querySelectorAll(".placed-sticker").forEach(function (item) {
    item.classList.remove("is-selected");
  });

  selectedPlacedSticker = stickerElement;

  if (selectedPlacedSticker) {
    selectedPlacedSticker.classList.add("is-selected");

    if (stickerSizeInput) {
      stickerSizeInput.value = parseInt(selectedPlacedSticker.style.height, 10) || 38;
    }

    if (stickerRotationInput) {
      stickerRotationInput.value = selectedPlacedSticker.dataset.rotation || "0";
    }
  }
}

function positionSticker(stickerElement, event) {
  if (!finalStrip) {
    return;
  }

  var rect = finalStrip.getBoundingClientRect();
  var x = ((event.clientX - rect.left) / rect.width) * 100;
  var y = ((event.clientY - rect.top) / rect.height) * 100;

  stickerElement.style.left = Math.max(0, Math.min(100, x)) + "%";
  stickerElement.style.top = Math.max(0, Math.min(100, y)) + "%";
}

function makeStickerDraggable(stickerElement) {
  stickerElement.addEventListener("pointerdown", function (event) {
    event.preventDefault();
    event.stopPropagation();
    selectPlacedSticker(stickerElement);
    stickerElement.setPointerCapture(event.pointerId);

    function moveSticker(moveEvent) {
      positionSticker(stickerElement, moveEvent);
    }

    function stopMove() {
      stickerElement.removeEventListener("pointermove", moveSticker);
      stickerElement.removeEventListener("pointerup", stopMove);
      stickerElement.removeEventListener("pointercancel", stopMove);
    }

    stickerElement.addEventListener("pointermove", moveSticker);
    stickerElement.addEventListener("pointerup", stopMove);
    stickerElement.addEventListener("pointercancel", stopMove);
  });
}

stickerButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedSticker = button.getAttribute("data-sticker");

    stickerButtons.forEach(function (stickerButton) {
      stickerButton.classList.remove("is-active");
    });
    button.classList.add("is-active");
  });
});

if (finalStrip) {
  finalStrip.addEventListener("click", function (event) {
    if (event.target.closest(".placed-sticker")) {
      return;
    }

    if (!selectedSticker) {
      selectPlacedSticker(null);
      return;
    }

    var sticker = document.createElement("span");
    var height = stickerSizeInput ? stickerSizeInput.value : 38;
    var rotation = stickerRotationInput ? stickerRotationInput.value : 0;
    sticker.className = "placed-sticker";
    sticker.textContent = selectedSticker;
    sticker.style.height = height + "px";
    sticker.style.fontSize = height + "px";
    sticker.dataset.rotation = rotation;
    sticker.style.setProperty("--rotation", rotation + "deg");
    positionSticker(sticker, event);
    finalStrip.appendChild(sticker);
    makeStickerDraggable(sticker);
    selectPlacedSticker(sticker);
  });
}

if (stickerSizeInput) {
  stickerSizeInput.addEventListener("input", function () {
    if (!selectedPlacedSticker) {
      return;
    }

    selectedPlacedSticker.style.height = stickerSizeInput.value + "px";
    selectedPlacedSticker.style.fontSize = stickerSizeInput.value + "px";
  });
}

if (stickerRotationInput) {
  stickerRotationInput.addEventListener("input", function () {
    if (!selectedPlacedSticker) {
      return;
    }

    selectedPlacedSticker.dataset.rotation = stickerRotationInput.value;
    selectedPlacedSticker.style.setProperty("--rotation", stickerRotationInput.value + "deg");
  });
}

if (removeStickerButton) {
  removeStickerButton.addEventListener("click", function () {
    if (!selectedPlacedSticker) {
      return;
    }

    selectedPlacedSticker.remove();
    selectedPlacedSticker = null;
  });
}

if (clearStickersButton) {
  clearStickersButton.addEventListener("click", function () {
    document.querySelectorAll(".placed-sticker").forEach(function (sticker) {
      sticker.remove();
    });
    selectedPlacedSticker = null;
  });
}

if (saveStripButton && finalStrip) {
  saveStripButton.addEventListener("click", function () {
    selectPlacedSticker(null);

    var savedStrip = {
      className: finalStrip.className,
      html: finalStrip.innerHTML,
      background: finalStrip.style.background || "#e7e7e7"
    };

    sessionStorage.setItem("onlineBoothFinalStrip", JSON.stringify(savedStrip));
    window.location.href = "ready.html";
  });
}

if (readyStrip) {
  var savedFinalStrip = sessionStorage.getItem("onlineBoothFinalStrip");
  var finalStripData = null;

  try {
    finalStripData = savedFinalStrip ? JSON.parse(savedFinalStrip) : null;
  } catch (error) {
    finalStripData = null;
  }

  if (!finalStripData) {
    window.location.href = "edit.html";
  } else {
    readyStrip.className = finalStripData.className + " ready-strip";
    readyStrip.innerHTML = finalStripData.html;
    readyStrip.style.background = finalStripData.background;
  }
}

if (downloadStripButton && readyStrip) {
  downloadStripButton.addEventListener("click", function () {
    downloadReadyStrip();
  });
}

function getStripLayoutFromClass(element) {
  var match = element.className.match(/layout-(\dx\d)/);
  return match ? match[1] : "strip";
}

function getCanvasFilter(element) {
  if (element.classList.contains("filter-bw")) {
    return "grayscale(1)";
  }

  if (element.classList.contains("filter-warm")) {
    return "sepia(0.28) saturate(1.28) brightness(1.04)";
  }

  if (element.classList.contains("filter-cool")) {
    return "brightness(1.03) contrast(0.98) saturate(0.95)";
  }

  if (element.classList.contains("filter-vintage")) {
    return "sepia(0.42) contrast(0.9) saturate(0.82)";
  }

  if (element.classList.contains("filter-fade")) {
    return "contrast(0.82) saturate(0.72) brightness(1.12)";
  }

  return "none";
}

function drawWrappedText(context, text, x, y, width, lineHeight) {
  var words = text.split(" ");
  var line = "";
  var lines = [];

  words.forEach(function (word) {
    var testLine = line ? line + " " + word : word;

    if (context.measureText(testLine).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) {
    lines.push(line);
  }

  var startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach(function (textLine, index) {
    context.fillText(textLine, x, startY + index * lineHeight);
  });
}

function drawImageCover(context, image, x, y, width, height) {
  var imageRatio = image.naturalWidth / image.naturalHeight;
  var targetRatio = width / height;
  var sourceWidth = image.naturalWidth;
  var sourceHeight = image.naturalHeight;
  var sourceX = 0;
  var sourceY = 0;

  if (imageRatio > targetRatio) {
    sourceWidth = image.naturalHeight * targetRatio;
    sourceX = (image.naturalWidth - sourceWidth) / 2;
  } else {
    sourceHeight = image.naturalWidth / targetRatio;
    sourceY = (image.naturalHeight - sourceHeight) / 2;
  }

  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function waitForImage(image) {
  if (image.complete && image.naturalWidth) {
    return Promise.resolve();
  }

  return new Promise(function (resolve) {
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", resolve, { once: true });
  });
}

async function downloadReadyStrip() {
  var scale = 3;
  var stripRect = readyStrip.getBoundingClientRect();
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  canvas.width = Math.round(stripRect.width * scale);
  canvas.height = Math.round(stripRect.height * scale);
  context.scale(scale, scale);

  context.fillStyle = getComputedStyle(readyStrip).backgroundColor;
  context.fillRect(0, 0, stripRect.width, stripRect.height);

  var imageFilter = getCanvasFilter(readyStrip);
  var stripImages = Array.from(readyStrip.querySelectorAll(":scope > img"));

  for (var imageIndex = 0; imageIndex < stripImages.length; imageIndex += 1) {
    var image = stripImages[imageIndex];
    await waitForImage(image);
    var imageRect = image.getBoundingClientRect();
    context.save();
    context.filter = imageFilter;
    drawImageCover(
      context,
      image,
      imageRect.left - stripRect.left,
      imageRect.top - stripRect.top,
      imageRect.width,
      imageRect.height
    );
    context.restore();
  }

  Array.from(readyStrip.querySelectorAll(".strip-caption, .strip-caption-top, .strip-caption-bottom")).forEach(function (caption) {
    if (!caption.textContent.trim() || getComputedStyle(caption).display === "none") {
      return;
    }

    var captionRect = caption.getBoundingClientRect();
    var style = getComputedStyle(caption);
    var fontSize = parseFloat(style.fontSize);
    context.fillStyle = style.color;
    context.font = style.fontWeight + " " + fontSize + "px " + style.fontFamily;
    context.textAlign = "center";
    context.textBaseline = "middle";
    drawWrappedText(
      context,
      caption.textContent,
      captionRect.left - stripRect.left + captionRect.width / 2,
      captionRect.top - stripRect.top + captionRect.height / 2,
      captionRect.width - 12,
      fontSize * 1.25
    );
  });

  Array.from(readyStrip.querySelectorAll(".placed-sticker")).forEach(function (sticker) {
    var stickerRect = sticker.getBoundingClientRect();
    var style = getComputedStyle(sticker);
    var fontSize = parseFloat(style.fontSize);
    context.font = fontSize + "px " + style.fontFamily;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      sticker.textContent,
      stickerRect.left - stripRect.left + stickerRect.width / 2,
      stickerRect.top - stripRect.top + stickerRect.height / 2
    );
  });

  var link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "Photo-Booth" + getStripLayoutFromClass(readyStrip) + ".png";
  link.click();
}

toolTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    var tool = tab.getAttribute("data-tool");

    toolTabs.forEach(function (item) {
      item.classList.remove("is-active");
    });
    tab.classList.add("is-active");

    toolPanels.forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-tool-panel") !== tool;
      panel.classList.toggle("is-active", !panel.hidden);
    });
  });
});

document.querySelectorAll(".tool-button[data-filter]").forEach(function (button) {
  button.addEventListener("click", function () {
    var filter = button.getAttribute("data-filter");

    document.querySelectorAll(".tool-button[data-filter]").forEach(function (filterButton) {
      filterButton.classList.remove("is-active");
    });
    button.classList.add("is-active");

    if (!finalStrip) {
      return;
    }

    finalStrip.classList.remove("filter-bw", "filter-warm", "filter-cool", "filter-vintage", "filter-fade");

    if (filter !== "none") {
      finalStrip.classList.add("filter-" + filter);
    }
  });
});
