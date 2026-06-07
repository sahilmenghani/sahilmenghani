
      const lenis = new Lenis({
        duration: 1.8,
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.2,
        lerp: 0.08,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    
const modal=document.getElementById("videoModal");
const player=document.getElementById("fullVideo");

function openVideo(src){
   player.src = src;
   modal.classList.add("active");

   player.load();
   player.play();
}

function closeVideo(){
   modal.classList.remove("active");

   player.pause();
   player.currentTime=0;
}
const observer = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{
threshold:.15
});

document
.querySelectorAll(".reveal")
.forEach(el=>observer.observe(el));
const videos=document.querySelectorAll(".project-card video");

const videoObserver=
new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.play();

}else{

entry.target.pause();

}

});

},{threshold:.4});

videos.forEach(video=>{

videoObserver.observe(video);

});
const sections=
document.querySelectorAll("section");

const navLinks=
document.querySelectorAll(".section-nav a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(sec=>{

const top=
window.scrollY;

if(top>=sec.offsetTop-200){

current=sec.id;

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(
link.getAttribute("href")
=="#"+current
){

link.classList.add("active");

}

});

});

const tabs =
document.querySelectorAll(".tab-btn");

const contents =
document.querySelectorAll(".project-content");

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    tabs.forEach(t =>
      t.classList.remove("active")
    );

    contents.forEach(c =>
      c.classList.remove("active")
    );

    tab.classList.add("active");

    document
      .getElementById(tab.dataset.tab)
      .classList.add("active");
      localStorage.setItem("activeTab", tab.dataset.tab);
  });

});
document.addEventListener("keydown", e => {

  if(e.key === "Escape"){

    closeVideo();

  }

});
const savedTab =
localStorage.getItem("activeTab");

if(savedTab){

  tabs.forEach(t =>
    t.classList.remove("active")
  );

  contents.forEach(c =>
    c.classList.remove("active")
  );

  document
    .querySelector(`[data-tab="${savedTab}"]`)
    .classList.add("active");

  document
    .getElementById(savedTab)
    .classList.add("active");

}
