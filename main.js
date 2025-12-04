// ===== Starfield
const c = document.getElementById('stars');
const ctx = c.getContext('2d');
let w, h, stars;

function resize(){
  w = c.width = innerWidth;
  h = c.height = innerHeight;
  // star density scales with viewport area
  stars = new Array(Math.floor(w * h / 18000)).fill().map(() => ({
    x: Math.random() * w,
    y: Math.random() * h,
    z: Math.random() * 1 + 0.2
  }));
}
addEventListener('resize', resize);
resize();

(function draw(){
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    s.y += s.z;
    if (s.y > h) s.y = 0;
    ctx.globalAlpha = 0.3 + s.z * 0.7;
    ctx.fillRect(s.x, s.y, 1, 1);
  });
  requestAnimationFrame(draw);
})();

// ===== Typewriter swap
const phrases = ['XuanLabs','AI experiments','web builds','hardware hacks','poetry & pixels'];
let idx = 0;
const el = document.getElementById('typeTarget');

function type(p, i = 0){
  el.textContent = p.slice(0, i);
  if (i <= p.length) setTimeout(() => type(p, i + 1), 45);
  else setTimeout(() => erase(p), 1200);
}
function erase(p, i = p.length){
  el.textContent = p.slice(0, i);
  if (i > 0) setTimeout(() => erase(p, i - 1), 30);
  else { idx = (idx + 1) % phrases.length; setTimeout(() => type(phrases[idx]), 200); }
}
setTimeout(() => type(phrases[idx]), 600);

// ===== Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
  });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Nav active state on scroll
const sections = [...document.querySelectorAll('section')];
const links = [...document.querySelectorAll('.nav-link')];
addEventListener('scroll', () => {
  const y = scrollY + 120; // navbar height
  let current = sections.findLast(s => s.offsetTop <= y);
  links.forEach(l => l.classList.remove('active'));
  if (current) {
    const a = links.find(l => l.getAttribute('href') === '#' + current.id);
    if (a) a.classList.add('active');
  }
});

// ===== Year
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Gallery loader
// Put your images inside /assets/gallery and list them below.
// (Static hosting can’t auto-list folders without a backend.)
const galleryFiles = [
  // EXAMPLES — replace with your actual filenames
  'assets/gallery/china1.jpg',
  'assets/gallery/china2.jpg',
  'assets/gallery/china3.jpg'
];

const grid = document.getElementById('galleryGrid');
galleryFiles.forEach(src => {
  const col = document.createElement('div');
  col.className = 'col-6 col-md-4 col-lg-3';
  col.innerHTML = `
    <div class="glass overflow-hidden" style="border-radius:14px">
      <img src="${src}" alt="gallery" style="width:100%;height:220px;object-fit:cover"/>
    </div>`;
  grid.appendChild(col);
});
