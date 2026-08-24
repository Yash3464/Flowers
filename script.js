/* ═══════════════════════════════════════════════════
   BIRTHDAY WEBSITE — MAIN SCRIPT v2
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ──────────────────────────────────
     CONFIGURATION
     ────────────────────────────────── */
  const PASSWORD = '123456'; // PLACEHOLDER: Change the password

  // Flower images for the shower
  const FLOWER_IMAGES = [
    'flowers/rose.jpg',
    'flowers/peony.jpg',
    'flowers/blossom.jpg',
    'flowers/anemone.jpg',
    'flowers/ranunculus.jpg',
    'flowers/blue.jpg',
    'flowers/red.jpg',
    'flowers/teal.jpg',
  ];

  /* ──────────────────────────────────
     DOM REFS
     ────────────────────────────────── */
  const html = document.documentElement;
  const lockScreen = document.getElementById('lockScreen');
  const lockIcon = document.getElementById('lockIcon');
  const pwdDisplay = document.getElementById('passwordDisplay');
  const numpad = document.getElementById('numpad');
  const flowerShower = document.getElementById('flowerShower');
  const muteBtn = document.getElementById('muteBtn');
  const bgMusic = document.getElementById('bgMusic');
  const cursorCanvas = document.getElementById('cursorCanvas');
  const scrollFill = document.getElementById('scrollFill');
  const scrollInd = document.getElementById('scrollIndicator');
  const scrollProg = document.getElementById('scrollProgress');
  const replayBtn = document.getElementById('replayBtn');
  const heartsCanvas = document.getElementById('heartsCanvas');

  let enteredPwd = '';
  let isUnlocked = false;
  let isMuted = false;

  /* ═══════════════════════════════════════
     1. LOCK SCREEN
     ═══════════════════════════════════════ */
  document.addEventListener('keydown', (e) => {
    if (isUnlocked) return;
    if (e.key >= '0' && e.key <= '9') handleKey(e.key);
    else if (e.key === 'Backspace' || e.key === 'Delete') handleKey('clear');
    else if (e.key === 'Enter') handleKey('enter');
  });

  numpad.addEventListener('click', (e) => {
    const btn = e.target.closest('.numpad-btn');
    if (!btn) return;
    handleKey(btn.dataset.key);
  });

  function handleKey(key) {
    if (isUnlocked) return;
    if (key === 'clear') { enteredPwd = ''; updateDots(); return; }
    if (key === 'enter') { checkPassword(); return; }
    if (enteredPwd.length < PASSWORD.length) {
      enteredPwd += key;
      updateDots();
      if (enteredPwd.length === PASSWORD.length) setTimeout(checkPassword, 250);
    }
  }

  function updateDots() {
    pwdDisplay.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('filled', i < enteredPwd.length));
  }

  function checkPassword() {
    if (enteredPwd === PASSWORD) {
      onCorrectPassword();
    } else {
      pwdDisplay.classList.add('shake');
      setTimeout(() => { pwdDisplay.classList.remove('shake'); enteredPwd = ''; updateDots(); }, 550);
    }
  }

  function onCorrectPassword() {
    isUnlocked = true;
    lockIcon.classList.add('unlocked');
    const shackle = document.getElementById('lockShackle');
    if (shackle) shackle.setAttribute('d', 'M22 28V18a10 10 0 0 1 19.5-3');
    startMusic();
    setTimeout(() => {
      lockScreen.classList.add('dismissed');
      setTimeout(() => { lockScreen.style.display = 'none'; startFlowerShower(); }, 600);
    }, 500);
  }

  /* ═══════════════════════════════════════
     2. LOCK SCREEN BACKGROUND — Floating bokeh
     ═══════════════════════════════════════ */
  const lockBgCanvas = document.getElementById('lockBgCanvas');
  const lockBgCtx = lockBgCanvas.getContext('2d');
  let lockBubbles = [];

  function initLockBg() {
    resizeCanvas(lockBgCanvas, lockScreen);
    for (let i = 0; i < 25; i++) {
      lockBubbles.push({
        x: Math.random() * lockBgCanvas.width,
        y: Math.random() * lockBgCanvas.height,
        r: 20 + Math.random() * 80,
        opacity: 0.03 + Math.random() * 0.08,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        color: ['rgba(255,255,255,', 'rgba(200,220,240,', 'rgba(180,210,240,', 'rgba(220,200,230,'][Math.floor(Math.random() * 4)],
      });
    }
    animateLockBg();
  }

  function animateLockBg() {
    lockBgCtx.clearRect(0, 0, lockBgCanvas.width, lockBgCanvas.height);
    lockBubbles.forEach(b => {
      b.x += b.vx; b.y += b.vy;
      if (b.x < -b.r) b.x = lockBgCanvas.width + b.r;
      if (b.x > lockBgCanvas.width + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = lockBgCanvas.height + b.r;
      if (b.y > lockBgCanvas.height + b.r) b.y = -b.r;
      const grad = lockBgCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      grad.addColorStop(0, b.color + (b.opacity + 0.05) + ')');
      grad.addColorStop(1, b.color + '0)');
      lockBgCtx.fillStyle = grad;
      lockBgCtx.beginPath();
      lockBgCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      lockBgCtx.fill();
    });
    requestAnimationFrame(animateLockBg);
  }

  /* ═══════════════════════════════════════
     3. FLOWER SHOWER — Dense continuous rain
     ═══════════════════════════════════════ */
  function startFlowerShower() {
    flowerShower.classList.add('active');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Preload images
    FLOWER_IMAGES.forEach(src => { const img = new Image(); img.src = src; });

    let spawned = 0;
    const maxFlowers = 350;
    const showerDuration = 6000;
    const spawnInterval = 15;

    function spawnFlower() {
      if (spawned >= maxFlowers) return;
      spawned++;

      const size = 100 + Math.random() * 150;
      const x = Math.random() * (vw + 80) - 40;
      const rotation = (Math.random() - 0.5) * 50;
      const fallDuration = 2.2 + Math.random() * 1.8;
      const drift = (Math.random() - 0.5) * 60;

      const el = document.createElement('div');
      el.className = 'shower-flower';
      el.style.cssText = `left:${x}px;top:${-size - 20}px;width:${size}px;height:${size}px;transform:rotate(${rotation}deg);`;
      const img = document.createElement('img');
      img.src = FLOWER_IMAGES[Math.floor(Math.random() * FLOWER_IMAGES.length)];
      img.alt = '';
      el.appendChild(img);
      flowerShower.appendChild(el);

      gsap.to(el, {
        y: vh + size + 50,
        x: drift,
        rotation: '+=' + ((Math.random() - 0.5) * 80),
        duration: fallDuration,
        ease: 'none',
        onComplete: () => el.remove(),
      });

      setTimeout(spawnFlower, spawnInterval + Math.random() * 10);
    }

    spawnFlower();

    setTimeout(() => {
      gsap.to(flowerShower, {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => {
          flowerShower.classList.remove('active');
          flowerShower.innerHTML = '';
          flowerShower.style.opacity = '';
          unlockScrolling();
        },
      });
    }, showerDuration);
  }

  function unlockScrolling() {
    html.classList.add('unlocked');
    muteBtn.classList.remove('hidden');
    scrollProg.classList.remove('hidden');
    initScrollAnimations();
    initScrollProgress();
    initGreetingBg();
    initLetterBg();
    initSongsBg();
  }

  /* ═══════════════════════════════════════
     4. BACKGROUND VISUALS
     ═══════════════════════════════════════ */

  // Helper
  function resizeCanvas(canvas, parent) {
    const rect = parent.getBoundingClientRect ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
    canvas.width = parent.offsetWidth || rect.width;
    canvas.height = parent.offsetHeight || rect.height;
  }

  // ── Greeting section: subtle sparkles/twinkles ──
  const greetingBgCanvas = document.getElementById('greetingBgCanvas');
  let greetingCtx, greetingSparkles = [];

  function initGreetingBg() {
    greetingCtx = greetingBgCanvas.getContext('2d');
    const section = document.getElementById('greetingSection');
    resizeCanvas(greetingBgCanvas, section);
    window.addEventListener('resize', () => resizeCanvas(greetingBgCanvas, section));
    for (let i = 0; i < 50; i++) {
      greetingSparkles.push({
        x: Math.random() * greetingBgCanvas.width,
        y: Math.random() * greetingBgCanvas.height,
        size: 1 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.01 + Math.random() * 0.03,
        maxOpacity: 0.2 + Math.random() * 0.5,
      });
    }
    animateGreetingBg();
  }

  function animateGreetingBg() {
    greetingCtx.clearRect(0, 0, greetingBgCanvas.width, greetingBgCanvas.height);
    greetingSparkles.forEach(s => {
      s.phase += s.speed;
      const opacity = Math.max(0, Math.sin(s.phase) * s.maxOpacity);
      greetingCtx.globalAlpha = opacity;
      greetingCtx.fillStyle = '#f0d08c';
      greetingCtx.beginPath();
      // Draw a 4-point star
      const cx = s.x, cy = s.y, sz = s.size;
      greetingCtx.moveTo(cx, cy - sz * 2);
      greetingCtx.lineTo(cx + sz * 0.5, cy - sz * 0.5);
      greetingCtx.lineTo(cx + sz * 2, cy);
      greetingCtx.lineTo(cx + sz * 0.5, cy + sz * 0.5);
      greetingCtx.lineTo(cx, cy + sz * 2);
      greetingCtx.lineTo(cx - sz * 0.5, cy + sz * 0.5);
      greetingCtx.lineTo(cx - sz * 2, cy);
      greetingCtx.lineTo(cx - sz * 0.5, cy - sz * 0.5);
      greetingCtx.closePath();
      greetingCtx.fill();
    });
    requestAnimationFrame(animateGreetingBg);
  }

  // ── Letter section: soft floating particles ──
  const letterBgCanvas = document.getElementById('letterBgCanvas');
  let letterCtx, letterParticles = [];

  function initLetterBg() {
    letterCtx = letterBgCanvas.getContext('2d');
    const section = document.getElementById('letterSection');
    resizeCanvas(letterBgCanvas, section);
    window.addEventListener('resize', () => resizeCanvas(letterBgCanvas, section));
    for (let i = 0; i < 30; i++) {
      letterParticles.push({
        x: Math.random() * letterBgCanvas.width,
        y: Math.random() * letterBgCanvas.height,
        r: 4 + Math.random() * 12,
        opacity: 0.02 + Math.random() * 0.06,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.3,
        color: ['rgba(200,160,120,', 'rgba(180,140,100,', 'rgba(220,180,140,'][Math.floor(Math.random() * 3)],
      });
    }
    animateLetterBg();
  }

  function animateLetterBg() {
    letterCtx.clearRect(0, 0, letterBgCanvas.width, letterBgCanvas.height);
    letterParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.y < -p.r) { p.y = letterBgCanvas.height + p.r; p.x = Math.random() * letterBgCanvas.width; }
      if (p.x < -p.r) p.x = letterBgCanvas.width + p.r;
      if (p.x > letterBgCanvas.width + p.r) p.x = -p.r;
      letterCtx.globalAlpha = p.opacity;
      letterCtx.fillStyle = p.color + '1)';
      letterCtx.beginPath();
      letterCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      letterCtx.fill();
    });
    requestAnimationFrame(animateLetterBg);
  }

  // ── Songs sections: soft floating orbs (two canvases) ──
  function initSongsBg() {
    initSongsBgForSection('songsBgCanvas1', 'songsSection1', 160); // teal
    initSongsBgForSection('songsBgCanvas2', 'songsSection2', 270); // purple
  }

  function initSongsBgForSection(canvasId, sectionId, baseHue) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const section = document.getElementById(sectionId);
    if (!section) return;
    resizeCanvas(canvas, section);
    window.addEventListener('resize', () => resizeCanvas(canvas, section));
    const orbs = [];
    for (let i = 0; i < 20; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 30 + Math.random() * 80,
        opacity: 0.02 + Math.random() * 0.05,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        hue: baseHue + Math.random() * 40,
      });
    }
    (function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = canvas.width + o.r;
        if (o.x > canvas.width + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = canvas.height + o.r;
        if (o.y > canvas.height + o.r) o.y = -o.r;
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        grad.addColorStop(0, `hsla(${o.hue},60%,60%,${o.opacity + 0.04})`);
        grad.addColorStop(1, `hsla(${o.hue},60%,60%,0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    })();
  }

  /* ═══════════════════════════════════════
     5. CURSOR TRAIL (Hearts)
     ═══════════════════════════════════════ */
  const cursorCtx = cursorCanvas.getContext('2d');
  let cursorParticles = [];

  function resizeCursorCanvas() { cursorCanvas.width = window.innerWidth; cursorCanvas.height = window.innerHeight; }
  resizeCursorCanvas();
  window.addEventListener('resize', resizeCursorCanvas);

  document.addEventListener('mousemove', (e) => {
    if (!isUnlocked) return;
    const colors = ['#f4a0b0', '#e87090', '#f0c0c8', '#d06080', '#f5d0d8'];
    cursorParticles.push({
      x: e.clientX, y: e.clientY,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.0, vx: (Math.random() - 0.5) * 1.5,
      vy: -0.5 - Math.random() * 1.5,
      rotation: (Math.random() - 0.5) * 0.4,
    });
    if (cursorParticles.length > 35) cursorParticles.shift();
  });

  function drawHeart(ctx, x, y, size, rotation) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation);
    ctx.beginPath();
    const s = size / 15;
    ctx.moveTo(0, -2 * s);
    ctx.bezierCurveTo(0, -5 * s, -9 * s, -8 * s, -9 * s, -2 * s);
    ctx.bezierCurveTo(-9 * s, 4 * s, 0, 8 * s, 0, 12 * s);
    ctx.bezierCurveTo(0, 8 * s, 9 * s, 4 * s, 9 * s, -2 * s);
    ctx.bezierCurveTo(9 * s, -8 * s, 0, -5 * s, 0, -2 * s);
    ctx.fill(); ctx.restore();
  }

  function animateCursorTrail() {
    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    for (let i = cursorParticles.length - 1; i >= 0; i--) {
      const p = cursorParticles[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.018; p.rotation += 0.02;
      if (p.life <= 0) { cursorParticles.splice(i, 1); continue; }
      cursorCtx.globalAlpha = p.life * 0.7;
      cursorCtx.fillStyle = p.color;
      drawHeart(cursorCtx, p.x, p.y, p.size * p.life, p.rotation);
    }
    requestAnimationFrame(animateCursorTrail);
  }
  animateCursorTrail();

  /* ═══════════════════════════════════════
     6. SCROLL PROGRESS
     ═══════════════════════════════════════ */
  function initScrollProgress() {
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  function updateScrollProgress() {
    const pct = Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight), 1) || 0;
    scrollFill.style.height = (pct * 100) + '%';
    scrollInd.style.bottom = (pct * 100) + '%';
  }

  /* ═══════════════════════════════════════
     7. SECTION REVEAL ANIMATIONS
     ═══════════════════════════════════════ */
  function initScrollAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // ── Section 3: Birthday title typewriter + polaroids ──
    const titleEl = document.getElementById('birthdayTitle');
    const titleText = titleEl.textContent;
    titleEl.textContent = '';
    titleEl.classList.add('visible');

    let charIdx = 0;
    function typeTitle() {
      if (charIdx < titleText.length) {
        titleEl.textContent += titleText[charIdx];
        charIdx++;
        setTimeout(typeTitle, 60 + Math.random() * 40);
      }
    }
    // Fire immediately (first visible section)
    setTimeout(typeTitle, 300);

    // Polaroids
    gsap.to('.polaroid', {
      opacity: 1, y: 0,
      rotation: (i) => [-3, 2, -1.5, 4, -2.5, 1, -4, 3, -0.5, 2.5][i] || 0,
      scale: 1, duration: 0.7, ease: 'back.out(1.2)',
      stagger: 0.1, delay: 0.5,
    });

    // ── Section 4: Envelope letters ──
    const letterHeading = document.querySelector('.letter-heading');
    const envelopes = document.querySelectorAll('.envelope');

    gsap.to(letterHeading, {
      scrollTrigger: { trigger: '#letterSection', start: 'top 70%' },
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
    });

    const letterModal = document.getElementById('letterModal');
    const letterModalPaper = document.getElementById('letterModalPaper');
    const closeLetterBtn = document.getElementById('closeLetterBtn');

    if (closeLetterBtn) {
      closeLetterBtn.addEventListener('click', () => {
        letterModal.classList.remove('active');
        document.documentElement.style.overflow = '';
        const sourceIdx = letterModal.dataset.sourceEnv;
        if (sourceIdx !== undefined) {
          const sourceEnv = envelopes[sourceIdx];
          if (sourceEnv) {
            sourceEnv.querySelector('.letter-paper').innerHTML = letterModalPaper.innerHTML;
            sourceEnv.classList.remove('open');
          }
        }
      });
    }

    envelopes.forEach((env, i) => {
      gsap.to(env, {
        scrollTrigger: { trigger: '#letterSection', start: 'top 60%' },
        opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.1)',
        delay: 0.2 + i * 0.15,
      });

      env.addEventListener('click', () => {
        if (letterModal && letterModal.classList.contains('active')) return;
        env.classList.add('open');
        setTimeout(() => {
          if (!letterModal) return;
          const sourceLetter = env.querySelector('.letter-paper');
          letterModalPaper.innerHTML = sourceLetter.innerHTML;
          letterModal.dataset.sourceEnv = i;
          letterModal.classList.add('active');
          document.documentElement.style.overflow = 'hidden';
        }, 500);
      });
    });

    // ── Section 5 & 6: Two Song Sections ──
    document.querySelectorAll('.songs-section').forEach(section => {
      const heading = section.querySelector('.songs-heading');
      gsap.to(heading, {
        scrollTrigger: { trigger: section, start: 'top 70%' },
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      });
      section.querySelectorAll('.song-tile').forEach((tile, i) => {
        gsap.to(tile, {
          scrollTrigger: { trigger: section, start: 'top 60%' },
          opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.1)',
          delay: 0.15 + i * 0.1,
        });
      });
    });

    // ── Section 6: Final ──
    const finalTl = gsap.timeline({
      scrollTrigger: { trigger: '#finalSection', start: 'top 60%' },
    });
    finalTl.to('#finalTitle', {
      opacity: 1, scale: 1, duration: 1.2, ease: 'elastic.out(1,0.5)',
      onComplete: () => document.getElementById('finalTitle').classList.add('visible'),
    })
      .to('.final-sub', { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to('.replay-btn', { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.2');

    // ── Section 7: Like Slider ──
    initLikeSlider();

    ScrollTrigger.refresh();
  }

  /* ═══════════════════════════════════════
     7b. LIKE SLIDER (Horizontal Swipe)
     ═══════════════════════════════════════ */
  function initLikeSlider() {
    const slider = document.getElementById('likeSlider');
    const dots = document.querySelectorAll('.like-dot');
    const hint = document.getElementById('likeSwipeHint');
    if (!slider || !dots.length) return;

    let currentSlide = 0;
    const totalSlides = 4;
    let startX = 0;
    let isDraggingSlider = false;
    let reasonsAnimated = false;

    function goToSlide(idx) {
      currentSlide = Math.max(0, Math.min(idx, totalSlides - 1));
      slider.style.transform = `translateX(-${currentSlide * 25}%)`;

      // Update dots
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
      });

      // Hide swipe hint after first swipe
      if (currentSlide > 0 && hint) {
        hint.style.opacity = '0';
        hint.style.pointerEvents = 'none';
      }

      // Animate reason tags on slide 4
      if (currentSlide === 3 && !reasonsAnimated) {
        reasonsAnimated = true;
        animateReasonTags();
      }
    }

    function animateReasonTags() {
      const tags = document.querySelectorAll('.reason-tag');
      tags.forEach((tag, i) => {
        setTimeout(() => {
          tag.classList.add('visible');
        }, 30 * i);
      });
    }

    // Touch events
    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDraggingSlider = true;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      if (!isDraggingSlider) return;
      isDraggingSlider = false;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide - 1);
      }
    }, { passive: true });

    // Mouse drag events
    slider.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      isDraggingSlider = true;
      e.preventDefault();
    });

    document.addEventListener('mouseup', (e) => {
      if (!isDraggingSlider) return;
      isDraggingSlider = false;
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goToSlide(currentSlide + 1);
        else goToSlide(currentSlide - 1);
      }
    });

    // Dot click navigation
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goToSlide(parseInt(dot.dataset.slide));
      });
    });

    // Keyboard navigation when section is in view
    document.addEventListener('keydown', (e) => {
      if (!isUnlocked) return;
      const section = document.getElementById('likeSection');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
      if (!inView) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      }
    });

    // Wheel event to capture scroll and convert to slide navigation
    const likeSection = document.getElementById('likeSection');
    let wheelLocked = false;

    likeSection.addEventListener('wheel', (e) => {
      const rect = likeSection.getBoundingClientRect();
      const inView = rect.top < 10 && rect.bottom > window.innerHeight - 10;
      if (!inView) return;

      // Only intercept if not at edges
      if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
        e.preventDefault();
        if (!wheelLocked) {
          wheelLocked = true;
          goToSlide(currentSlide + 1);
          setTimeout(() => { wheelLocked = false; }, 700);
        }
      } else if (e.deltaY < 0 && currentSlide > 0) {
        e.preventDefault();
        if (!wheelLocked) {
          wheelLocked = true;
          goToSlide(currentSlide - 1);
          setTimeout(() => { wheelLocked = false; }, 700);
        }
      }
    }, { passive: false });
  }

  /* ═══════════════════════════════════════
     8. FLOATING HEARTS (Final Section)
     ═══════════════════════════════════════ */
  const heartsCtx = heartsCanvas.getContext('2d');
  let floatingHearts = [];

  function resizeHeartsCanvas() {
    const s = document.getElementById('finalSection');
    if (!s) return;
    heartsCanvas.width = s.offsetWidth;
    heartsCanvas.height = s.offsetHeight;
  }

  function initFloatingHearts() {
    resizeHeartsCanvas();
    window.addEventListener('resize', resizeHeartsCanvas);
    for (let i = 0; i < 40; i++) floatingHearts.push(createFloatingHeart(true));
    animateFloatingHearts();
  }

  function createFloatingHeart(randomY) {
    const w = heartsCanvas.width || window.innerWidth;
    const h = heartsCanvas.height || window.innerHeight;
    return {
      x: Math.random() * w, y: randomY ? Math.random() * h : h + 20,
      size: 8 + Math.random() * 28, speed: 0.3 + Math.random() * 0.8,
      opacity: 0.08 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.5,
      wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.005 + Math.random() * 0.015,
    };
  }

  function animateFloatingHearts() {
    heartsCtx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);
    for (let i = 0; i < floatingHearts.length; i++) {
      const h = floatingHearts[i];
      h.y -= h.speed; h.wobble += h.wobbleSpeed;
      h.x += h.drift + Math.sin(h.wobble) * 0.3;
      if (h.y + h.size < -20) { floatingHearts[i] = createFloatingHeart(false); continue; }
      heartsCtx.globalAlpha = h.opacity;
      heartsCtx.fillStyle = '#ffffff';
      drawHeart(heartsCtx, h.x, h.y, h.size, 0);
    }
    requestAnimationFrame(animateFloatingHearts);
  }
  initFloatingHearts();

  /* ═══════════════════════════════════════
     9. MUSIC
     ═══════════════════════════════════════ */
  function startMusic() {
    bgMusic.volume = 0;
    bgMusic.play().then(() => gsap.to(bgMusic, { volume: 0.4, duration: 3 })).catch(() => { });
    muteBtn.classList.remove('hidden');
  }

  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    muteBtn.querySelector('.icon-sound-on').style.display = isMuted ? 'none' : 'block';
    muteBtn.querySelector('.icon-sound-off').style.display = isMuted ? 'block' : 'none';
  });

  /* ═══════════════════════════════════════
     10. REPLAY
     ═══════════════════════════════════════ */
  replayBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    html.classList.remove('unlocked');
    scrollProg.classList.add('hidden');
    muteBtn.classList.add('hidden');

    enteredPwd = ''; isUnlocked = false;
    updateDots();
    lockIcon.classList.remove('unlocked');
    const shackle = document.getElementById('lockShackle');
    if (shackle) shackle.setAttribute('d', 'M22 28V18a10 10 0 0 1 20 0v10');
    lockScreen.style.display = '';
    lockScreen.classList.remove('dismissed');

    // Reset sections
    const t = document.getElementById('birthdayTitle');
    t.textContent = 'Happy Birthday Idiot!'; t.classList.remove('visible'); t.style.opacity = '0';
    document.getElementById('finalTitle').classList.remove('visible');
    gsap.set('#finalTitle', { opacity: 0, scale: 0.9 });
    gsap.set('.final-sub', { opacity: 0 });
    gsap.set('.replay-btn', { opacity: 0 });
    gsap.set('.songs-heading', { opacity: 0, y: 20 });
    gsap.set('.song-tile', { opacity: 0, y: 20 });
    gsap.set('.polaroid', { opacity: 0, y: 60, scale: 0.85 });
    gsap.set('.letter-heading', { opacity: 0, y: 20 });
    gsap.set('.envelope', { opacity: 0, y: 30, scale: 0.95 });
    document.querySelectorAll('.envelope').forEach(e => e.classList.remove('open'));

    // Reset like slider
    const likeSlider = document.getElementById('likeSlider');
    if (likeSlider) likeSlider.style.transform = 'translateX(0)';
    document.querySelectorAll('.like-dot').forEach((d, i) => d.classList.toggle('active', i === 0));
    document.querySelectorAll('.reason-tag').forEach(t => t.classList.remove('visible'));
    const likeHint = document.getElementById('likeSwipeHint');
    if (likeHint) { likeHint.style.opacity = ''; likeHint.style.pointerEvents = ''; }

    ScrollTrigger.getAll().forEach(st => st.kill());
    bgMusic.pause(); bgMusic.currentTime = 0;
  });

  /* ═══════════════════════════════════════
     11. INIT
     ═══════════════════════════════════════ */
  gsap.set('.polaroid', { opacity: 0, y: 60, scale: 0.85 });
  gsap.set('.birthday-title', { opacity: 0 });
  initLockBg();

})();
