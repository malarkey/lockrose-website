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
