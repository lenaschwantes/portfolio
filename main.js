// Rive mascot.
// `expression` and `hover` are Node Script inputs. The web runtime cannot set
// script inputs directly, so they must be bound (in the Rive editor) to a
// View Model with a number "expression" and a boolean "hover". Here we write
// to that View Model instance.

const canvas = document.getElementById("robot");
let vm = null; // auto-bound view model instance

const robot = new rive.Rive({
  src: "assets/robocat.riv",
  canvas,
  artboard: "Catbot",
  stateMachine: "State Machine",
  autoplay: true,
  autoBind: true,
  onLoad: () => {
    robot.resizeDrawingSurfaceToCanvas();
    vm = robot.viewModelInstance;
    if (!vm) {
      console.warn("Rive: no View Model bound. Bind the script inputs to a View Model in the editor.");
    }
  },
});

window.addEventListener("resize", () => robot.resizeDrawingSurfaceToCanvas());

function setExpression(value) {
  const prop = vm && vm.number("expression");
  if (prop) prop.value = value;
}

function setHover(value) {
  const prop = vm && vm.boolean("hover");
  if (prop) prop.value = value;
}

canvas.addEventListener("mouseenter", () => setHover(true));
canvas.addEventListener("mouseleave", () => setHover(false));

// Cards: fade in on scroll
const cards = document.querySelectorAll(".card");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

cards.forEach((card) => revealObserver.observe(card));

// Cards: click/tap toggles details (hover opens them via CSS on desktop).
// Hovering or opening a card also sets the robot's expression.
cards.forEach((card) => {
  const head = card.querySelector(".card-head");
  const expression = Number(card.dataset.expression);

  head.addEventListener("click", () => {
    const open = card.classList.toggle("open");
    head.setAttribute("aria-expanded", open);
    if (open) setExpression(expression);
  });

  card.addEventListener("mouseenter", () => setExpression(expression));
});

// The card crossing the middle of the screen sets the robot's expression.
// Back in the hero, the robot goes neutral.
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    cards.forEach((c) => c.classList.remove("active"));
    entry.target.classList.add("active");
    setExpression(Number(entry.target.dataset.expression));
  });
}, { rootMargin: "-45% 0px -45% 0px" });

cards.forEach((card) => activeObserver.observe(card));

new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    cards.forEach((c) => c.classList.remove("active"));
    setExpression(0);
  }
}, { rootMargin: "-45% 0px -45% 0px" }).observe(document.querySelector(".hero"));
