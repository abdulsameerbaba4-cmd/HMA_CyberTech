// ============ matrix / scanline background ============
(function(){
  const canvas = document.getElementById('matrix-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, cols, drops;
  const chars = '01ABCDEFHMA{}<>/#$%*';
  const fontSize = 15;

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    cols = Math.floor(w / fontSize);
    drops = new Array(cols).fill(0).map(()=> Math.random() * -100);
  }
  window.addEventListener('resize', resize);
  resize();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw(){
    ctx.fillStyle = 'rgba(5,7,10,0.10)';
    ctx.fillRect(0,0,w,h);
    ctx.font = fontSize + 'px IBM Plex Mono, monospace';
    for(let i=0;i<cols;i++){
      const text = chars[Math.floor(Math.random()*chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      const isLead = Math.random() > 0.93;
      ctx.fillStyle = isLead ? 'rgba(255,59,69,0.9)' : 'rgba(47,107,255,0.55)';
      ctx.fillText(text, x, y);
      if(y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    if(!reduceMotion) requestAnimationFrame(draw);
  }
  if(!reduceMotion){ requestAnimationFrame(draw); }
})();

// ============ hero terminal type-in ============
(function(){
  const el = document.querySelector('[data-typeline]');
  if(!el) return;
  const lines = JSON.parse(el.getAttribute('data-typeline'));
  let li = 0, ci = 0, deleting = false;
  const textNode = el.querySelector('.type-text');

  function tick(){
    const current = lines[li];
    if(!deleting){
      ci++;
      textNode.textContent = current.slice(0, ci);
      if(ci === current.length){
        deleting = true;
        setTimeout(tick, 1600);
        return;
      }
    } else {
      ci--;
      textNode.textContent = current.slice(0, ci);
      if(ci === 0){
        deleting = false;
        li = (li+1) % lines.length;
      }
    }
    setTimeout(tick, deleting ? 28 : 45);
  }
  tick();
})();

// ============ mobile nav ============
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', ()=>{
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.cssText += open ? '' : 'position:absolute; top:72px; left:0; right:0; background:#05070a; flex-direction:column; padding:16px 32px; border-bottom:1px solid #1c2530;';
  });
})();

// ============ simple contact form feedback (no backend) ============
(function(){
  const form = document.querySelector('[data-contact-form]');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const original = btn.textContent;
    btn.textContent = 'MESSAGE SENT';
    btn.disabled = true;
    setTimeout(()=>{ btn.textContent = original; btn.disabled = false; form.reset(); }, 2400);
  });
})();

// ============ tools demo (client-side only, no backend) ============
function hmaHashDemo(){
  const input = document.getElementById('hash-input');
  const output = document.getElementById('hash-output');
  const algo = document.getElementById('hash-algo').value;
  const text = input.value || '';
  crypto.subtle.digest(algo, new TextEncoder().encode(text)).then(buf=>{
    const arr = Array.from(new Uint8Array(buf));
    output.textContent = arr.map(b=>b.toString(16).padStart(2,'0')).join('');
  });
}

function hmaPasswordDemo(){
  const len = parseInt(document.getElementById('pw-length').value, 10) || 16;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  const rnd = new Uint32Array(len);
  crypto.getRandomValues(rnd);
  for(let i=0;i<len;i++){ out += chars[rnd[i] % chars.length]; }
  document.getElementById('pw-output').textContent = out;
}

// ============ slideshow / carousel ============
(function(){
  const slideshows = document.querySelectorAll('[data-slideshow]');
  slideshows.forEach(function(el){
    const track = el.querySelector('.ss-track');
    const slides = Array.from(el.querySelectorAll('.ss-slide'));
    const dotsWrap = el.querySelector('.ss-dots');
    const prevBtn = el.querySelector('.ss-prev');
    const nextBtn = el.querySelector('.ss-next');
    const autoplay = el.getAttribute('data-autoplay') !== 'false';
    let index = 0;
    let timer = null;

    if(dotsWrap){
      slides.forEach((_, i)=>{
        const dot = document.createElement('button');
        dot.className = 'ss-dot';
        dot.setAttribute('aria-label', 'Go to slide ' + (i+1));
        dot.addEventListener('click', ()=> goTo(i));
        dotsWrap.appendChild(dot);
      });
    }
    const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

    function render(){
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach((d,i)=> d.classList.toggle('active', i === index));
    }
    function goTo(i){
      index = (i + slides.length) % slides.length;
      render();
      resetTimer();
    }
    function next(){ goTo(index + 1); }
    function prev(){ goTo(index - 1); }
    function resetTimer(){
      if(!autoplay) return;
      if(timer) clearInterval(timer);
      timer = setInterval(next, 4500);
    }

    if(nextBtn) nextBtn.addEventListener('click', next);
    if(prevBtn) prevBtn.addEventListener('click', prev);

    // touch swipe
    let touchX = null;
    track.addEventListener('touchstart', e=>{ touchX = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend', e=>{
      if(touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if(Math.abs(dx) > 40){ dx > 0 ? prev() : next(); }
      touchX = null;
    }, {passive:true});

    render();
    resetTimer();
    el.addEventListener('mouseenter', ()=>{ if(timer) clearInterval(timer); });
    el.addEventListener('mouseleave', resetTimer);
  });
})();
