/* ============================================================
   LESHINE EXPERIENCE — MAIN JS
   ============================================================ */

// ── CONFIG ──────────────────────────────────────────────────
var NAME = 'LESHINE';
var PART1 = 'LES';
var PART2 = 'HINE';
var TILT_THRESHOLD = 8;
var GYRO_STRENGTH  = 18;

// ── STATE ────────────────────────────────────────────────────
var currentScreen  = 0;
var currentSlide   = 0;
var totalSlides    = 4;
var leftTriggered  = false;
var rightTriggered = false;
var gyroEnabled    = false;
var isDragging     = false;
var dragDx         = 0;
var swipeStartX    = 0;
var swipeStartY    = 0;
var smoothGX       = 0;
var smoothGY       = 0;
var mouseFallback  = false;
var mouseDown      = false;
var mouseSX        = 0;
var catPopTimer    = null;

function $(id){ return document.getElementById(id); }

// ── SCREEN NAV ───────────────────────────────────────────────
function goToScreen(n){
  var prev = $('screen-'+currentScreen);
  var next = $('screen-'+n);
  if(!next) return;
  prev.classList.remove('active');
  next.classList.add('active');
  currentScreen = n;
  if(n === 4) buildReveal();
}

// ── PETALS ───────────────────────────────────────────────────
var PETALS = ['🌸','🌺','🌼','🌷'];
function spawnPetals(id,count){
  var el=$(id); if(!el) return;
  for(var i=0;i<count;i++){
    var p=document.createElement('span');
    p.classList.add('petal');
    p.textContent=PETALS[Math.floor(Math.random()*PETALS.length)];
    p.style.left=Math.random()*100+'%';
    p.style.fontSize=(0.7+Math.random()*0.8)+'rem';
    p.style.animationDuration=(4+Math.random()*6)+'s';
    p.style.animationDelay=(Math.random()*6)+'s';
    el.appendChild(p);
  }
}
spawnPetals('petals-0',18);
spawnPetals('petals-1',12);
spawnPetals('petals-4',22);
spawnPetals('petals-msg',16);

// ── NAV DOTS ─────────────────────────────────────────────────
function buildDots(){
  var navs=document.querySelectorAll('.nav-dots');
  for(var i=0;i<navs.length;i++){
    var el=navs[i];
    var active=parseInt(el.dataset.active);
    var isLight=(active===1);
    el.innerHTML='';
    for(var j=0;j<totalSlides;j++){
      var d=document.createElement('div');
      d.classList.add('dot-pip');
      if(isLight) d.classList.add('dark-dot');
      if(j===active) d.classList.add('on');
      el.appendChild(d);
    }
  }
}
buildDots();

// ── SCREEN 0 ─────────────────────────────────────────────────
$('screen-0').addEventListener('click',function(){ goToScreen(1); });

// ── SCREEN 1 ─────────────────────────────────────────────────
$('excited-btn').addEventListener('click',function(){
  requestGyro();
  goToScreen(2);
  buildLetterStage('letter-stage-left',PART1,'right');
});

// ── GYRO ─────────────────────────────────────────────────────
function requestGyro(){
  if(typeof DeviceOrientationEvent!=='undefined' &&
     typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission()
      .then(function(r){ if(r==='granted') startGyro(); })
      .catch(function(){});
  } else { startGyro(); }
}

function startGyro(){
  window.addEventListener('deviceorientation',onGyroTutorial,true);
  gyroEnabled=true;
}

function onGyroTutorial(e){
  var gamma=e.gamma||0;
  var phoneL=$('phone-left'), phoneR=$('phone-right');
  if(phoneL) phoneL.style.transform='rotate('+(gamma*0.5)+'deg)';
  if(phoneR) phoneR.style.transform='rotate('+(gamma*0.5)+'deg)';

  if(currentScreen===2 && !leftTriggered && gamma < -TILT_THRESHOLD){
    leftTriggered=true;
    dropLetters('letter-stage-left',PART1,'right',function(){
      setTimeout(function(){ goToScreen(3); buildLetterStage('letter-stage-right',PART2,'left'); },1200);
    });
  }
  if(currentScreen===3 && !rightTriggered && gamma > TILT_THRESHOLD){
    rightTriggered=true;
    dropLetters('letter-stage-right',PART2,'left',function(){
      setTimeout(function(){ goToScreen(4); },1200);
    });
  }
}

// ── SKIP BTNS ────────────────────────────────────────────────
$('skip-left').addEventListener('click',function(){
  if(!leftTriggered){
    leftTriggered=true;
    dropLetters('letter-stage-left',PART1,'right',function(){
      setTimeout(function(){ goToScreen(3); buildLetterStage('letter-stage-right',PART2,'left'); },1000);
    });
  }
});
$('skip-right').addEventListener('click',function(){
  if(!rightTriggered){
    rightTriggered=true;
    dropLetters('letter-stage-right',PART2,'left',function(){
      setTimeout(function(){ goToScreen(4); },1000);
    });
  }
});

// ── LETTERS ──────────────────────────────────────────────────
function buildLetterStage(stageId,text,fromSide){
  var stage=$(stageId); if(!stage) return;
  stage.innerHTML='';
  text.split('').forEach(function(ch){
    var span=document.createElement('span');
    span.classList.add('letter-char');
    span.textContent=ch;
    span.style.transform=fromSide==='right'
      ? 'translateX(80px) translateY(-40px) rotate(10deg)'
      : 'translateX(-80px) translateY(-40px) rotate(-10deg)';
    stage.appendChild(span);
  });
}

function dropLetters(stageId,text,fromSide,cb){
  buildLetterStage(stageId,text,fromSide);
  var chars=$(stageId).querySelectorAll('.letter-char');
  chars.forEach(function(c,i){
    setTimeout(function(){
      c.classList.add('landed');
      if(i===chars.length-1 && cb) setTimeout(cb,400);
    },i*120);
  });
}

// ── NAME REVEAL ──────────────────────────────────────────────
function buildReveal(){
  var stage=$('name-reveal'); stage.innerHTML='';
  NAME.split('').forEach(function(ch,i){
    var span=document.createElement('span');
    span.classList.add('letter-char');
    span.textContent=ch;
    var from=i%2===0 ? -80 : 80;
    span.style.transform='translateX('+from+'px) translateY(-50px) rotate('+(from>0?10:-10)+'deg)';
    stage.appendChild(span);
    setTimeout(function(){ span.classList.add('landed'); },200+i*100);
  });
}

// ── ENTER CAROUSEL ───────────────────────────────────────────
var carouselEntered=false;
function enterCarousel(){
  if(carouselEntered) return;
  carouselEntered=true;
  $('screen-4').classList.remove('active');
  currentScreen=-1;
  var w=$('carousel-wrap');
  w.classList.add('visible');
  w.style.transform='translateX(0%)';
  window.removeEventListener('deviceorientation',onGyroTutorial,true);
  window.addEventListener('deviceorientation',onGyroCarousel,true);
  setupCatEgg();
}

$('screen-4').addEventListener('touchstart',function(e){ swipeStartX=e.touches[0].clientX; },{passive:true});
$('screen-4').addEventListener('touchend',function(e){
  if(e.changedTouches[0].clientX - swipeStartX < -40) enterCarousel();
},{passive:true});
setTimeout(function(){ $('screen-4').addEventListener('click',enterCarousel); },2500);

// ── CAROUSEL SWIPE ────────────────────────────────────────────
var wrap=$('carousel-wrap');
wrap.addEventListener('touchstart',function(e){
  swipeStartX=e.touches[0].clientX;
  swipeStartY=e.touches[0].clientY;
  isDragging=true; dragDx=0;
},{passive:true});

wrap.addEventListener('touchmove',function(e){
  if(!isDragging) return;
  dragDx=e.touches[0].clientX-swipeStartX;
  var dy=Math.abs(e.touches[0].clientY-swipeStartY);
  if(dy>Math.abs(dragDx)){isDragging=false;return;}
  var base=-currentSlide*100;
  wrap.style.transition='none';
  wrap.style.transform='translateX(calc('+base+'% + '+dragDx+'px))';
},{passive:true});

wrap.addEventListener('touchend',function(e){
  if(!isDragging) return;
  isDragging=false;
  var threshold=window.innerWidth*0.25;
  if(dragDx < -threshold && currentSlide < totalSlides-1) currentSlide++;
  else if(dragDx > threshold && currentSlide > 0) currentSlide--;
  snapToSlide();
},{passive:true});

function snapToSlide(){
  wrap.style.transition='transform .45s cubic-bezier(.4,0,.2,1)';
  wrap.style.transform='translateX('+(-currentSlide*100)+'%)';
}

// ── GYRO FOR CAROUSEL ─────────────────────────────────────────
function onGyroCarousel(e){
  var gamma=e.gamma||0; var beta=e.beta||0;
  smoothGX+=(gamma-smoothGX)*0.08;
  smoothGY+=(beta-smoothGY)*0.08;
  applyParallax();
}

function applyParallax(){
  var ids=['par-0','par-1','par-2'];
  var depths=[0.28,0.38,0.48];
  ids.forEach(function(id,i){
    var el=$(id); if(!el) return;
    var s=depths[i]*GYRO_STRENGTH;
    var tx=smoothGX*s*0.1;
    var ty=smoothGY*s*0.05;
    el.style.transform='translate('+tx+'px,'+ty+'px)';
  });
}

// ── CAT EGG ──────────────────────────────────────────────────
function setupCatEgg(){
  var catEl=$('cat-tap'); var popup=$('cat-popup');
  if(!catEl||!popup) return;
  catEl.addEventListener('click',function(){
    popup.classList.add('show');
    clearTimeout(catPopTimer);
    catPopTimer=setTimeout(function(){ popup.classList.remove('show'); },2000);
  });
}

// ── MOUSE FALLBACK (desktop preview) ─────────────────────────
setTimeout(function(){ if(!gyroEnabled) mouseFallback=true; },1500);

document.addEventListener('mousemove',function(e){
  if(!mouseFallback) return;
  var cx=window.innerWidth/2; var cy=window.innerHeight/2;
  smoothGX=(e.clientX-cx)/cx*15;
  smoothGY=(e.clientY-cy)/cy*10;
  if(currentScreen===2 && !leftTriggered && e.clientX < cx*0.55){
    leftTriggered=true;
    dropLetters('letter-stage-left',PART1,'right',function(){
      setTimeout(function(){ goToScreen(3); buildLetterStage('letter-stage-right',PART2,'left'); },1200);
    });
  }
  if(currentScreen===3 && !rightTriggered && e.clientX > cx*1.45){
    rightTriggered=true;
    dropLetters('letter-stage-right',PART2,'left',function(){
      setTimeout(function(){ goToScreen(4); },1200);
    });
  }
  if(currentScreen===-1) applyParallax();
});

wrap.addEventListener('mousedown',function(e){ mouseDown=true; mouseSX=e.clientX; dragDx=0; isDragging=true; });
wrap.addEventListener('mousemove',function(e){
  if(!mouseDown) return;
  dragDx=e.clientX-mouseSX;
  var base=-currentSlide*100;
  wrap.style.transition='none';
  wrap.style.transform='translateX(calc('+base+'% + '+dragDx+'px))';
});
wrap.addEventListener('mouseup',function(){
  if(!mouseDown) return;
  mouseDown=false; isDragging=false;
  var threshold=window.innerWidth*0.18;
  if(dragDx < -threshold && currentSlide < totalSlides-1) currentSlide++;
  else if(dragDx > threshold && currentSlide > 0) currentSlide--;
  snapToSlide();
});
