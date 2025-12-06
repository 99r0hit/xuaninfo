// STARFIELD — lightweight & optimized
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let W, H, STARS = [];

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;

  const count = Math.max(80, Math.floor((W * H) / 28000));
  STARS = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    z: Math.random() * 0.8 + 0.2,
  }));
}
resize();
addEventListener("resize", resize);

(function animate() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff";

  for (let s of STARS) {
    s.y += s.z * 0.35;
    if (s.y > H) s.y = 0;

    ctx.globalAlpha = 0.2 + s.z * 0.6;
    ctx.fillRect(s.x, s.y, 1, 1);
  }

  requestAnimationFrame(animate);
})();

// PARALLAX NEBULA
document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / innerWidth - 0.5) * 20;
  const y = (e.clientY / innerHeight - 0.5) * 20;

  document.querySelectorAll(".nebula").forEach((el) => {
    const speed = parseFloat(el.dataset.speed || 0.2);
    el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
});

// SCROLL REVEAL
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.13 }
);

document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// MOBILE NAV
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");

toggle?.addEventListener("click", () => {
  links.classList.toggle("open");
});

// YEAR
document.getElementById("year").textContent = new Date().getFullYear();
