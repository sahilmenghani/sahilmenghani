/* =========================================================
   PORTFOLIO
   ========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://bflpxidetcwvvezrnejm.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_CqcSMaNerpk-niIiqoWwGQ_kT-QrL8X";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   LENIS
========================================================= */

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


/* =========================================================
   VIDEO MODAL
========================================================= */

const modal =
  document.getElementById(
    "videoModal"
  );


const player =
  document.getElementById(
    "fullVideo"
  );


function openVideo(src) {

  player.src = src;

  modal.classList.add(
    "active"
  );

  player.load();

  player.play();

}


function closeVideo() {

  modal.classList.remove(
    "active"
  );

  player.pause();

  player.currentTime = 0;

}


/* =========================================================
   LOAD PORTFOLIO CONTENT
========================================================= */

async function loadPortfolioContent() {

  try {

    await Promise.allSettled([

      loadSiteImages(),

      loadWebProjects(),

      loadVideoProjects()

    ]);

  } catch (error) {

    console.error(
      "Portfolio loading error:",
      error
    );

  } finally {

    // Always wire up the reveal/video observers, even if one of the
    // Supabase calls above failed or was slow. Previously this only ran
    // inside the try block after Promise.all resolved, so any single
    // failed request (bad network, RLS error, etc.) would leave every
    // ".reveal" section - including #about - permanently stuck at
    // opacity: 0 (it just looks "hidden").
    initialiseDynamicObservers();

  }

}


/* =========================================================
   SITE IMAGES
========================================================= */

async function loadSiteImages() {

  const {
    data,
    error
  } = await supabaseClient

    .from("site_content")

    .select("*")

    .eq("id", 1)

    .single();


  if (error) {

    console.error(error);

    return;

  }


  const hero =
    document.getElementById(
      "heroImage"
    );


  const about =
    document.getElementById(
      "aboutImage"
    );


  const contact =
    document.getElementById(
      "contactImage"
    );


  if (
    hero &&
    data.hero_image
  ) {

    hero.src =
      data.hero_image;

  }


  if (
    about &&
    data.about_image
  ) {

    about.src =
      data.about_image;

  }


  if (
    contact &&
    data.contact_image
  ) {

    contact.src =
      data.contact_image;

  }

}


/* =========================================================
   WEB PROJECTS
========================================================= */

async function loadWebProjects() {

  const container =
    document.getElementById(
      "webProjectsContainer"
    );


  if (!container) return;


  const {
    data,
    error
  } = await supabaseClient

    .from("web_projects")

    .select("*")

    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(error);

    return;

  }


  container.innerHTML = "";


  data.forEach(
    project => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "web-card";


      card.innerHTML = `

        <img
          src="${escapeHTML(project.image_url)}"
          alt="${escapeHTML(project.title)}"
        >

        <h3>
          ${escapeHTML(project.title)}
        </h3>

        <p>
          ${escapeHTML(project.description)}
        </p>

        ${
          project.live_url
            ? `
              <a
                href="${escapeHTML(project.live_url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Live Demo
              </a>
            `
            : ""
        }

        ${
          project.github_url
            ? `
              <a
                href="${escapeHTML(project.github_url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Github
              </a>
            `
            : ""
        }

      `;


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   VIDEO PROJECTS
========================================================= */

async function loadVideoProjects() {

  const container =
    document.getElementById(
      "videoProjectsContainer"
    );


  if (!container) return;


  const {
    data,
    error
  } = await supabaseClient

    .from("video_projects")

    .select("*")

    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(error);

    return;

  }


  container.innerHTML = "";


  data.forEach(
    (project, index) => {

      const card =
        document.createElement(
          "div"
        );


      card.className =
        "project-card " +
        (
          index % 3 === 1
            ? "portrait"
            : "landscape"
        );


      card.innerHTML = `

        <video
          autoplay
          muted
          loop
          playsinline
          preload="metadata"
        >

          <source
            src="${escapeHTML(project.video_url)}"
          >

        </video>

      `;


      card.addEventListener(
        "click",
        () => {

          openVideo(
            project.video_url
          );

        }
      );


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   OBSERVERS
========================================================= */

function initialiseDynamicObservers() {


  /* ------------------------------
     REVEAL
  ------------------------------ */

  const revealObserver =
    new IntersectionObserver(

      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "show"
              );

            }

          }
        );

      },

      {
        threshold: 0.15
      }

    );


  document
    .querySelectorAll(
      ".reveal"
    )
    .forEach(
      element => {

        revealObserver.observe(
          element
        );

      }
    );


  /* ------------------------------
     PROJECT VIDEOS
  ------------------------------ */

  const videos =
    document.querySelectorAll(
      ".project-card video"
    );


  const videoObserver =
    new IntersectionObserver(

      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.play()
                .catch(
                  () => {}
                );

            } else {

              entry.target.pause();

            }

          }
        );

      },

      {
        threshold: 0.4
      }

    );


  videos.forEach(
    video => {

      videoObserver.observe(
        video
      );

    }
  );

}


/* =========================================================
   SECTION NAVIGATION
========================================================= */

const sections =
  document.querySelectorAll(
    "section"
  );


const navLinks =
  document.querySelectorAll(
    ".section-nav a"
  );


window.addEventListener(
  "scroll",
  () => {

    let current = "";


    sections.forEach(
      section => {

        const top =
          window.scrollY;


        if (
          top >=
          section.offsetTop - 200
        ) {

          current =
            section.id;

        }

      }
    );


    navLinks.forEach(
      link => {

        link.classList.remove(
          "active"
        );


        if (
          link.getAttribute(
            "href"
          ) ===
          "#" + current
        ) {

          link.classList.add(
            "active"
          );

        }

      }
    );

  }
);


/* =========================================================
   PROJECT TABS
========================================================= */

const tabs =
  document.querySelectorAll(
    ".tab-btn"
  );


const contents =
  document.querySelectorAll(
    ".project-content"
  );


tabs.forEach(
  tab => {

    tab.addEventListener(
      "click",
      () => {

        tabs.forEach(
          t =>
            t.classList.remove(
              "active"
            )
        );


        contents.forEach(
          content =>
            content.classList.remove(
              "active"
            )
        );


        tab.classList.add(
          "active"
        );


        document
          .getElementById(
            tab.dataset.tab
          )
          .classList.add(
            "active"
          );


        localStorage.setItem(
          "activeTab",
          tab.dataset.tab
        );

      }
    );

  }
);


/* =========================================================
   ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closeVideo();

    }

  }
);


/* =========================================================
   RESTORE TAB
========================================================= */

const savedTab =
  localStorage.getItem(
    "activeTab"
  );


if (savedTab) {

  tabs.forEach(
    tab =>
      tab.classList.remove(
        "active"
      )
  );


  contents.forEach(
    content =>
      content.classList.remove(
        "active"
      )
  );


  const savedButton =
    document.querySelector(
      `[data-tab="${savedTab}"]`
    );


  const savedContent =
    document.getElementById(
      savedTab
    );


  savedButton?.classList.add(
    "active"
  );


  savedContent?.classList.add(
    "active"
  );


} else {

  tabs[0]?.classList.add(
    "active"
  );

  contents[0]?.classList.add(
    "active"
  );

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  return String(
    value || ""
  )

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   START
========================================================= */

loadPortfolioContent();