// ---------- Rive mascot ----------
// `expression` and `hover` are Node Script inputs. The web runtime cannot set
// script inputs directly, so they must be bound (in the Rive editor) to a
// View Model with a number "expression" and a boolean "hover".

const canvas = document.getElementById("robot");
let vm = null;

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
      // The current .riv has no View Model and does not draw the face: hide it until it is re-exported
      canvas.style.visibility = "hidden";
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

// ---------- Work cards: click/tap toggles, hover handled in CSS ----------
const cards = document.querySelectorAll(".card");

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

// ---------- Hero prompt: cycles through what the pipeline does ----------
const steps = [
  ["EMBEDDING", "documents"],
  ["RETRIEVING", "context"],
  ["AUDITING", "invoices"],
  ["SHIPPING", "agents"],
];
const verb = document.querySelector(".prompt .verb");
const object = document.querySelector(".prompt .object");
let step = 0;

setInterval(() => {
  step = (step + 1) % steps.length;
  gsap.to([verb, object], {
    opacity: 0, y: -6, duration: 0.2,
    onComplete: () => {
      [verb.textContent, object.textContent] = steps[step];
      gsap.fromTo([verb, object], { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.25 });
    },
  });
}, 2400);

// ---------- Scroll animations ----------
gsap.registerPlugin(ScrollTrigger, SplitText);

const mm = gsap.matchMedia();

// Things that run regardless of motion preference
const progress = document.querySelector(".progress");
ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => gsap.set(progress, { scaleX: self.progress }),
});

// The card crossing the middle of the screen sets the robot's expression
cards.forEach((card) => {
  ScrollTrigger.create({
    trigger: card,
    start: "top 55%",
    end: "bottom 45%",
    onToggle: (self) => {
      card.classList.toggle("active", self.isActive);
      if (self.isActive) setExpression(Number(card.dataset.expression));
    },
  });
});

ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom 50%",
  onEnterBack: () => setExpression(0),
});

mm.add("(prefers-reduced-motion: no-preference)", () => {
  // Smooth scroll, driven by GSAP's ticker so ScrollTrigger stays in sync
  const lenis = new Lenis({ anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  const raf = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  // Headings: lines slide up from a mask
  document.querySelectorAll(".split").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.08,
        scrollTrigger: el.closest(".hero") ? undefined : { trigger: el, start: "top 85%" },
      }),
    });
  });

  gsap.from(".hero .lead, .hero-actions, .prompt", { opacity: 0, y: 20, duration: 0.8, delay: 0.4, stagger: 0.1 });

  // Simple fade/slide reveals
  gsap.utils.toArray(".card, .reveal").forEach((el) => {
    gsap.from(el, { opacity: 0, y: 40, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // Numbers count up when they enter the screen
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const counter = { value: 0 };
    gsap.to(counter, {
      value: target,
      duration: 1.6,
      ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate: () => { el.textContent = Math.round(counter.value) + suffix; },
    });
  });

  // Marquee speeds up while scrolling
  const marquee = document.querySelector(".marquee-track");
  ScrollTrigger.create({
    trigger: ".marquee",
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 4);
      marquee.style.animationDuration = 30 / boost + "s";
    },
  });

  return () => {
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
});

// Mascot flight: big in the hero, shrinks into the corner as the hero scrolls away
mm.add({
  desktop: "(min-width: 900px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 899px) and (prefers-reduced-motion: no-preference)",
}, (ctx) => {
  const { desktop } = ctx.conditions;
  const mascot = document.querySelector(".mascot");

  // Offset from the corner spot to the hero spot, measured on every refresh
  const heroSpot = () => {
    const r = mascot.getBoundingClientRect();
    const cx = desktop ? innerWidth * 0.76 : innerWidth / 2;
    const cy = desktop ? innerHeight * 0.52 : 150;
    return { x: cx - (r.left + r.width / 2), y: cy - (r.top + r.height / 2) };
  };

  gsap.fromTo(mascot,
    { x: () => heroSpot().x, y: () => heroSpot().y, scale: desktop ? 3 : 1.6 },
    {
      x: 0, y: 0, scale: 1, ease: "none",
      immediateRender: true,
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 40%", scrub: 0.6, invalidateOnRefresh: true },
    });
});

// Pinned pillars on desktop: the section stays put while the three steps swap
mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
  const section = document.querySelector(".pillars");
  const pillars = gsap.utils.toArray(".pillar");
  const dots = gsap.utils.toArray(".pillar-dots span");
  section.classList.add("is-pinned");

  gsap.set(pillars, { opacity: 0, y: 60 });
  gsap.set(pillars[0], { opacity: 1, y: 0 });
  dots[0].classList.add("on");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: "+=" + innerHeight * 2,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const i = Math.min(2, Math.floor(self.progress * 3));
        dots.forEach((d, j) => d.classList.toggle("on", j === i));
      },
    },
  });

  pillars.slice(1).forEach((p, i) => {
    tl.to(pillars[i], { opacity: 0, y: -60, duration: 0.5 })
      .to(p, { opacity: 1, y: 0, duration: 0.5 })
      .to({}, { duration: 1 }); // hold
  });

  return () => section.classList.remove("is-pinned");
});
