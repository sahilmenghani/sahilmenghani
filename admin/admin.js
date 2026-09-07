/* =========================================================
   PORTFOLIO ADMIN
   ========================================================= */

let currentWebProjects = [];
let currentVideoProjects = [];
let currentSiteContent = null;


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen = document.getElementById("loginScreen");
const adminPanel = document.getElementById("adminPanel");

const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

const loginMessage = document.getElementById("loginMessage");


/* =========================================================
   AUTH
========================================================= */

async function checkAuth() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session) {

        await startAdmin();

    } else {

        showLogin();

    }
}


function showLogin() {

    loginScreen.classList.remove("hidden");
    adminPanel.classList.add("hidden");

}

async function startAdmin() {
    console.log("🔐 Checking admin access...");

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    console.log("👤 Auth user:", user);
    console.log("❌ Auth error:", userError);

    if (userError) {
        console.error("AUTH ERROR:", userError);
        alert("Auth error:\n\n" + userError.message);
        showLogin();
        return;
    }

    if (!user) {
        console.error("No authenticated user found.");
        showLogin();
        return;
    }

    console.log("🆔 User UID:", user.id);

    const {
        data: admin,
        error: adminError
    } = await supabaseClient
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    console.log("👑 Admin row:", admin);
    console.log("❌ Admin query error:", adminError);

    if (adminError) {
        console.error("ADMIN QUERY ERROR:", adminError);

        alert(
            "Admin check failed:\n\n" +
            adminError.message +
            "\n\nCode: " +
            adminError.code
        );

        return;
    }

    if (!admin) {
        console.error("User UID is not in admin_users:", user.id);

        alert(
            "Your login works, but this UID was not found:\n\n" +
            user.id
        );

        return;
    }

    console.log("✅ ADMIN VERIFIED");

    loginScreen.classList.add("hidden");
    adminPanel.classList.remove("hidden");

    await loadEverything();
}


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        loginMessage.textContent =
            "Signing in...";


        const {
            error
        } = await supabaseClient.auth.signInWithPassword({

            email,

            password

        });


        if (error) {

            loginMessage.textContent =
                error.message;

            return;

        }


        loginMessage.textContent = "";

        await startAdmin();

    }
);


logoutBtn.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        showLogin();

    }
);


/* =========================================================
   LOAD EVERYTHING
========================================================= */

async function loadEverything() {

    await Promise.all([

        loadSiteContent(),

        loadWebProjects(),

        loadVideoProjects()

    ]);

}


/* =========================================================
   SITE CONTENT
========================================================= */

async function loadSiteContent() {

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


    currentSiteContent = data;


    renderSiteImage(
        "heroPreview",
        data.hero_image
    );


    renderSiteImage(
        "aboutPreview",
        data.about_image
    );


    renderSiteImage(
        "contactPreview",
        data.contact_image
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function renderSiteImage(elementId, url) {

    const element =
        document.getElementById(elementId);

    if (!element) return;


    if (!url) {

        element.innerHTML =
            "<span>No image</span>";

        return;

    }


    element.innerHTML =
        `<img src="${escapeAttribute(url)}" alt="">`;

}


/* =========================================================
   UPLOAD IMAGE
========================================================= */

async function uploadImage(file) {

    if (!file) {

        throw new Error(
            "Please select an image."
        );

    }


    if (!file.type.startsWith("image/")) {

        throw new Error(
            "Please select an image file."
        );

    }


    const extension =
        file.name.split(".").pop();


    const fileName =
        `${crypto.randomUUID()}.${extension}`;


    const path =
        `images/${fileName}`;


    const {
        error
    } = await supabaseClient

        .storage

        .from("portfolio-images")

        .upload(
            path,
            file,
            {
                cacheControl: "3600",
                contentType: file.type,
                upsert: false
            }
        );


    if (error) {

        throw error;

    }


    const {
        data
    } = supabaseClient

        .storage

        .from("portfolio-images")

        .getPublicUrl(path);


    return data.publicUrl;

}


/* =========================================================
   SAVE SITE IMAGE
========================================================= */

async function saveSiteImage(type) {

    try {

        const input =
            document.getElementById(
                `${type}Image`
            );


        const file =
            input.files[0];


        if (!file) {

            showToast(
                "Choose an image first."
            );

            return;

        }


        showToast(
            "Uploading image..."
        );


        const url =
            await uploadImage(file);


        const field =
            `${type}_image`;


        const {
            error
        } = await supabaseClient

            .from("site_content")

            .update({

                [field]: url,

                updated_at:
                    new Date().toISOString()

            })

            .eq("id", 1);


        if (error) {

            throw error;

        }


        currentSiteContent[field] =
            url;


        renderSiteImage(
            `${type}Preview`,
            url
        );


        input.value = "";


        showToast(
            "Image updated."
        );


    } catch (error) {

        console.error(error);

        alert(
            "Image upload failed:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   WEB PROJECTS
========================================================= */

async function loadWebProjects() {

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


    currentWebProjects =
        data || [];


    renderWebProjects();

}


function renderWebProjects() {

    const container =
        document.getElementById(
            "webProjectsList"
        );


    if (!currentWebProjects.length) {

        container.innerHTML = `
            <div class="admin-card">
                <p>No web projects yet.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        currentWebProjects.map(project => {

            return `

                <div class="project-admin-card">

                    <img
                        class="project-thumb"
                        src="${escapeAttribute(project.image_url)}"
                        alt=""
                    >

                    <div class="project-admin-info">

                        <h3>
                            ${escapeHTML(project.title)}
                        </h3>

                        <p>
                            ${escapeHTML(project.description)}
                        </p>

                    </div>

                    <div class="project-actions">

                        <button
                            onclick="editWebProject('${project.id}')"
                        >
                            EDIT
                        </button>

                        <button
                            class="delete"
                            onclick="deleteWebProject('${project.id}')"
                        >
                            DELETE
                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   WEB PROJECT FORM
========================================================= */

function openWebProjectForm() {

    document.getElementById(
        "webProjectModal"
    ).classList.remove("hidden");


    document.getElementById(
        "webProjectForm"
    ).reset();


    document.getElementById(
        "webProjectId"
    ).value = "";


    document.getElementById(
        "webModalTitle"
    ).textContent =
        "Add Web Project";


    document.getElementById(
        "webImageCurrent"
    ).textContent = "";

}


function closeWebProjectForm() {

    document.getElementById(
        "webProjectModal"
    ).classList.add("hidden");

}


function editWebProject(id) {

    const project =
        currentWebProjects.find(
            item => item.id === id
        );


    if (!project) return;


    openWebProjectForm();


    document.getElementById(
        "webModalTitle"
    ).textContent =
        "Edit Web Project";


    document.getElementById(
        "webProjectId"
    ).value =
        project.id;


    document.getElementById(
        "webTitle"
    ).value =
        project.title || "";


    document.getElementById(
        "webDescription"
    ).value =
        project.description || "";


    document.getElementById(
        "webLiveUrl"
    ).value =
        project.live_url || "";


    document.getElementById(
        "webGithubUrl"
    ).value =
        project.github_url || "";


    document.getElementById(
        "webImageCurrent"
    ).innerHTML = project.image_url

        ? `
            Current image:
            <br>
            <a
                href="${escapeAttribute(project.image_url)}"
                target="_blank"
            >
                View current image
            </a>
          `

        : "";

}


document.getElementById(
    "webProjectForm"
).addEventListener(
    "submit",
    saveWebProject
);


async function saveWebProject(event) {

    event.preventDefault();


    try {

        const id =
            document.getElementById(
                "webProjectId"
            ).value;


        const title =
            document.getElementById(
                "webTitle"
            ).value.trim();


        const description =
            document.getElementById(
                "webDescription"
            ).value.trim();


        const liveUrl =
            document.getElementById(
                "webLiveUrl"
            ).value.trim();


        const githubUrl =
            document.getElementById(
                "webGithubUrl"
            ).value.trim();


        const imageInput =
            document.getElementById(
                "webImage"
            );


        const imageFile =
            imageInput.files[0];


        if (!id && !imageFile) {

            alert(
                "Please choose a project image."
            );

            return;

        }


        showToast(
            "Saving project..."
        );


        let imageUrl = null;


        if (imageFile) {

            imageUrl =
                await uploadImage(
                    imageFile
                );

        }


        if (id) {

            const project =
                currentWebProjects.find(
                    item => item.id === id
                );


            const updateData = {

                title,

                description,

                live_url: liveUrl,

                github_url: githubUrl,

                updated_at:
                    new Date().toISOString()

            };


            if (imageUrl) {

                updateData.image_url =
                    imageUrl;

            }


            const {
                error
            } = await supabaseClient

                .from("web_projects")

                .update(updateData)

                .eq("id", id);


            if (error) {

                throw error;

            }

        } else {

            const {
                error
            } = await supabaseClient

                .from("web_projects")

                .insert({

                    title,

                    description,

                    image_url: imageUrl,

                    live_url: liveUrl,

                    github_url: githubUrl

                });


            if (error) {

                throw error;

            }

        }


        closeWebProjectForm();


        await loadWebProjects();


        showToast(
            "Project saved."
        );


    } catch (error) {

        console.error(error);

        alert(
            "Could not save project:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   DELETE WEB PROJECT
========================================================= */

async function deleteWebProject(id) {

    const confirmed =
        confirm(
            "Delete this web project?"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient

        .from("web_projects")

        .delete()

        .eq("id", id);


    if (error) {

        alert(
            error.message
        );

        return;

    }


    await loadWebProjects();


    showToast(
        "Project deleted."
    );

}


/* =========================================================
   VIDEO PROJECTS
========================================================= */

async function loadVideoProjects() {

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


    currentVideoProjects =
        data || [];


    renderVideoProjects();

}


function renderVideoProjects() {

    const container =
        document.getElementById(
            "videoProjectsList"
        );


    if (!currentVideoProjects.length) {

        container.innerHTML = `
            <div class="admin-card">
                <p>No video edits yet.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        currentVideoProjects.map(video => {

            return `

                <div class="project-admin-card">

                    <video
                        class="project-thumb"
                        src="${escapeAttribute(video.video_url)}"
                        muted
                        playsinline
                    ></video>

                    <div class="project-admin-info">

                        <h3>
                            ${escapeHTML(
                                video.title ||
                                "Untitled Edit"
                            )}
                        </h3>

                        <p>
                            Video editing project
                        </p>

                    </div>

                    <div class="project-actions">

                        <button
                            onclick="editVideoProject('${video.id}')"
                        >
                            EDIT
                        </button>

                        <button
                            class="delete"
                            onclick="deleteVideoProject('${video.id}')"
                        >
                            DELETE
                        </button>

                    </div>

                </div>

            `;

        }).join("");

}


/* =========================================================
   VIDEO FORM
========================================================= */

function openVideoProjectForm() {

    document.getElementById(
        "videoProjectModal"
    ).classList.remove("hidden");


    document.getElementById(
        "videoProjectForm"
    ).reset();


    document.getElementById(
        "videoProjectId"
    ).value = "";


    document.getElementById(
        "videoModalTitle"
    ).textContent =
        "Add Video Edit";


    document.getElementById(
        "videoCurrent"
    ).textContent = "";

}


function closeVideoProjectForm() {

    document.getElementById(
        "videoProjectModal"
    ).classList.add("hidden");

}


function editVideoProject(id) {

    const video =
        currentVideoProjects.find(
            item => item.id === id
        );


    if (!video) return;


    openVideoProjectForm();


    document.getElementById(
        "videoModalTitle"
    ).textContent =
        "Edit Video Edit";


    document.getElementById(
        "videoProjectId"
    ).value =
        video.id;


    document.getElementById(
        "videoTitle"
    ).value =
        video.title || "";


    document.getElementById(
        "videoCurrent"
    ).innerHTML = `

        Current video:

        <br>

        <a
            href="${escapeAttribute(video.video_url)}"
            target="_blank"
        >
            Open video
        </a>

    `;

}


document.getElementById(
    "videoProjectForm"
).addEventListener(
    "submit",
    saveVideoProject
);


/* =========================================================
   VIDEO UPLOAD
========================================================= */

async function uploadVideo(file) {

    if (!file) {

        throw new Error(
            "Please choose a video."
        );

    }


    if (!file.type.startsWith("video/")) {

        throw new Error(
            "Please choose a video file."
        );

    }


    const extension =
        file.name.split(".").pop();


    const fileName =
        `${crypto.randomUUID()}.${extension}`;


    const path =
        `videos/${fileName}`;


    showToast(
        "Uploading video..."
    );


    const {
        error
    } = await supabaseClient

        .storage

        .from("portfolio-videos")

        .upload(
            path,
            file,
            {
                cacheControl: "3600",
                contentType: file.type,
                upsert: false
            }
        );


    if (error) {

        throw error;

    }


    const {
        data
    } = supabaseClient

        .storage

        .from("portfolio-videos")

        .getPublicUrl(path);


    return data.publicUrl;

}


/* =========================================================
   SAVE VIDEO
========================================================= */

async function saveVideoProject(event) {

    event.preventDefault();


    try {

        const id =
            document.getElementById(
                "videoProjectId"
            ).value;


        const title =
            document.getElementById(
                "videoTitle"
            ).value.trim();


        const file =
            document.getElementById(
                "videoFile"
            ).files[0];


        if (!id && !file) {

            alert(
                "Please choose a video."
            );

            return;

        }


        let videoUrl = null;


        if (file) {

            videoUrl =
                await uploadVideo(file);

        }


        if (id) {

            const updateData = {

                title,

                updated_at:
                    new Date().toISOString()

            };


            if (videoUrl) {

                updateData.video_url =
                    videoUrl;

            }


            const {
                error
            } = await supabaseClient

                .from("video_projects")

                .update(updateData)

                .eq("id", id);


            if (error) {

                throw error;

            }

        } else {

            const {
                error
            } = await supabaseClient

                .from("video_projects")

                .insert({

                    title,

                    video_url:
                        videoUrl

                });


            if (error) {

                throw error;

            }

        }


        closeVideoProjectForm();


        await loadVideoProjects();


        showToast(
            "Video saved."
        );


    } catch (error) {

        console.error(error);

        alert(
            "Could not save video:\n\n" +
            error.message
        );

    }

}


/* =========================================================
   DELETE VIDEO
========================================================= */

async function deleteVideoProject(id) {

    const confirmed =
        confirm(
            "Delete this video?"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient

        .from("video_projects")

        .delete()

        .eq("id", id);


    if (error) {

        alert(
            error.message
        );

        return;

    }


    await loadVideoProjects();


    showToast(
        "Video deleted."
    );

}


/* =========================================================
   HELPERS
========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

}


function escapeHTML(value) {

    return String(value || "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   START
========================================================= */

checkAuth();