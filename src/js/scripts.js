(() => {
const menus = document.querySelectorAll("[data-navigation-menu]");

if (menus.length === 0) {
return;
}

menus.forEach((menu) => {
const closeButton = menu.querySelector("[data-navigation-menu-close]");
const dialog = menu.querySelector("[data-navigation-menu-dialog]");
const firstLink = menu.querySelector("[data-navigation-menu-first-link]");
const toggle = menu.querySelector("[data-navigation-menu-toggle]");

if (!closeButton || !dialog || !toggle) {
return;
}

function setExpanded(isExpanded) {
toggle.setAttribute("aria-expanded", String(isExpanded));
}

function focusToggle() {
window.requestAnimationFrame(() => {
toggle.focus();
});
}

function openMenu() {
if (dialog.open) {
return;
}

if (typeof dialog.showModal === "function") {
dialog.showModal();
} else {
dialog.setAttribute("open", "");
}

setExpanded(true);
window.requestAnimationFrame(() => {
(firstLink || closeButton).focus();
});
}

function closeMenu() {
if (!dialog.open) {
return;
}

if (typeof dialog.close === "function") {
dialog.close();
} else {
dialog.removeAttribute("open");
}

setExpanded(false);
focusToggle();
}

toggle.addEventListener("click", () => {
if (dialog.open) {
closeMenu();
return;
}

openMenu();
});

closeButton.addEventListener("click", closeMenu);

dialog.addEventListener("cancel", () => {
setExpanded(false);
focusToggle();
});

dialog.addEventListener("close", () => {
setExpanded(false);
});

dialog.addEventListener("click", (event) => {
const { bottom, left, right, top } = dialog.getBoundingClientRect();
const clickedBackdrop = event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;

if (!clickedBackdrop) {
return;
}

closeMenu();
});
});
})();

(() => {
const tabSets = document.querySelectorAll("[data-services-tabs]");

if (tabSets.length === 0) {
return;
}

tabSets.forEach((tabSet) => {
const tabs = Array.from(tabSet.querySelectorAll('[role="tab"]'));
const panels = Array.from(tabSet.querySelectorAll('[role="tabpanel"]'));
const mediaPanels = Array.from(tabSet.querySelectorAll(".services-tabs-media-panel"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (tabs.length === 0 || panels.length === 0) {
return;
}

function showPanel(panel) {
panel.hidden = false;
panel.classList.remove("is-entering");

if (reduceMotion) {
return;
}

panel.classList.add("is-entering");

window.requestAnimationFrame(() => {
window.requestAnimationFrame(() => {
panel.classList.remove("is-entering");
});
});
}

function activateTab(nextTab, shouldFocus = true) {
const nextIndex = tabs.indexOf(nextTab);

if (nextIndex === -1) {
return;
}

tabs.forEach((tab, index) => {
const isSelected = index === nextIndex;

tab.setAttribute("aria-selected", String(isSelected));
tab.setAttribute("tabindex", isSelected ? "0" : "-1");

if (shouldFocus && isSelected) {
tab.focus();
}
});

panels.forEach((panel, index) => {
if (index === nextIndex) {
showPanel(panel);
return;
}

panel.hidden = true;
panel.classList.remove("is-entering");
});

mediaPanels.forEach((panel, index) => {
if (index === nextIndex) {
showPanel(panel);
return;
}

panel.hidden = true;
panel.classList.remove("is-entering");
});
}

tabs.forEach((tab) => {
tab.addEventListener("click", () => {
activateTab(tab, false);
});

tab.addEventListener("keydown", (event) => {
const currentIndex = tabs.indexOf(tab);
let nextIndex = currentIndex;

if (event.key === "ArrowRight") {
nextIndex = (currentIndex + 1) % tabs.length;
} else if (event.key === "ArrowLeft") {
nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
} else if (event.key === "Home") {
nextIndex = 0;
} else if (event.key === "End") {
nextIndex = tabs.length - 1;
} else {
return;
}

event.preventDefault();
activateTab(tabs[nextIndex]);
});
});
});
})();

(() => {
const aboutBlades = document.querySelectorAll("#animation-about .animation-about-blades");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (aboutBlades.length === 0 || reduceMotion) {
return;
}

function easeInCubic(progress) {
return progress * progress * progress;
}

function easeOutCubic(progress) {
return 1 - Math.pow(1 - progress, 3);
}

aboutBlades.forEach((blade) => {
let animationFrameId = null;

function getBladeAnimations() {
return blade.getAnimations().filter((animation) => animation.effect && animation.effect.target === blade);
}

function stopPlaybackRateAnimation() {
if (animationFrameId === null) {
return;
}

window.cancelAnimationFrame(animationFrameId);
animationFrameId = null;
}

function animatePlaybackRate(targetRate, duration, easing, shouldPauseAtEnd = false) {
const animations = getBladeAnimations();

stopPlaybackRateAnimation();

if (animations.length === 0) {
return;
}

if (targetRate > 0) {
animations.forEach((animation) => {
animation.play();

if (animation.playbackRate === 0) {
animation.playbackRate = 0.001;
}
});
}

const startRates = animations.map((animation) => animation.playbackRate);
const startedAt = window.performance.now();

function tick(now) {
const progress = Math.min((now - startedAt) / duration, 1);
const easedProgress = easing(progress);

animations.forEach((animation, index) => {
const startRate = startRates[index];
animation.playbackRate = startRate + ((targetRate - startRate) * easedProgress);
});

if (progress < 1) {
animationFrameId = window.requestAnimationFrame(tick);
return;
}

animationFrameId = null;

if (!shouldPauseAtEnd) {
return;
}

animations.forEach((animation) => {
animation.pause();
animation.playbackRate = 1;
});
}

animationFrameId = window.requestAnimationFrame(tick);
}

blade.addEventListener("pointerenter", () => {
animatePlaybackRate(0, 1200, easeOutCubic, true);
});

blade.addEventListener("pointerleave", () => {
const animations = getBladeAnimations();

if (animations.length === 0) {
return;
}

animations.forEach((animation) => {
animation.play();
animation.playbackRate = 0.001;
});

animatePlaybackRate(1, 900, easeInCubic);
});
});
})();

(() => {
const contactGlowItems = Array.from(document.querySelectorAll("#animation-contact .animation-contact-glow"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (contactGlowItems.length === 0 || reduceMotion) {
return;
}

const timeoutIds = [];

function randomBetween(min, max) {
return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

function randomDuration(min, max, curve = 1) {
const progress = Math.pow(Math.random(), curve);
return Math.round(min + ((max - min) * progress));
}

function scheduleGlow(item, isActive = false) {
item.classList.toggle("is-active", isActive);

if (isActive) {
item.setAttribute("filter", "url(#animation-contact-glow-filter)");
} else {
item.removeAttribute("filter");
}

let nextDelay;
let nextState = isActive;

if (isActive) {
nextDelay = randomDuration(2600, 7200, .65);
nextState = false;
} else {
const shouldLight = Math.random() > .35;

if (shouldLight) {
nextDelay = randomDuration(900, 5200, 1.8);
nextState = true;
} else {
nextDelay = randomDuration(2600, 7600, .85);
nextState = false;
}
}

const timeoutId = window.setTimeout(() => {
scheduleGlow(item, nextState);
}, nextDelay);

timeoutIds.push(timeoutId);
}

contactGlowItems.forEach((item, index) => {
const startsActive = index % 4 === 0 || Math.random() > .7;
const startDelay = startsActive ? randomDuration(0, 1600, 1.4) : randomDuration(0, 4200, .9);

const timeoutId = window.setTimeout(() => {
scheduleGlow(item, startsActive);
}, startDelay);

timeoutIds.push(timeoutId);
});

window.addEventListener("pagehide", () => {
timeoutIds.forEach((timeoutId) => {
window.clearTimeout(timeoutId);
});
}, { once: true });
})();
