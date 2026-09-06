"use strict";

/* ================================================================
   FAIL-SAFE PAGE NAVIGATION

   This listener is registered before the rest of the website starts.
   Navigation therefore keeps working if a later feature fails.
================================================================ */

function activateLovePage(pageId) {

    const targetPage =
        document.getElementById(pageId);

    if (!targetPage) {
        console.error(
            `Page not found: ${pageId}`
        );
        return false;
    }

    document
        .querySelectorAll(".page")
        .forEach((page) => {

            const isTarget =
                page === targetPage;

            page.classList.toggle(
                "active",
                isTarget
            );

            page.setAttribute(
                "aria-hidden",
                String(!isTarget)
            );
        });

    targetPage.classList.add(
        "active"
    );

    targetPage.setAttribute(
        "aria-hidden",
        "false"
    );

    targetPage.scrollTop = 0;

    return true;
}


document.addEventListener(
    "click",
    (event) => {

        const clickedElement =
            event.target instanceof Element
                ? event.target
                : null;

        const navigationControl =
            clickedElement?.closest(
                "[data-love-target]"
            );

        if (!navigationControl) {
            return;
        }

        const targetPageId =
            navigationControl.dataset
                .loveTarget?.trim();

        if (!targetPageId) {
            return;
        }

        event.preventDefault();

        if (
            typeof window.showPage ===
            "function"
        ) {
            window.showPage(targetPageId);
            return;
        }

        activateLovePage(targetPageId);
    },
    true
);


window.activateLovePage =
    activateLovePage;

/* ================================================================
   WEBSITE SETTINGS
================================================================ */

const SECRET_CODE = "Raji12032004";

const WEDDING_DATE = new Date(
    "2026-11-11T09:15:00+05:30"
);

const NETFLIX_INTRO_DURATION = 3600;


document.addEventListener("DOMContentLoaded", () => {

    /* ============================================================
       SHARED ELEMENTS AND HELPERS
    ============================================================ */

    const pages = [
        ...document.querySelectorAll(".page")
    ];

    const byId = (id) =>
        document.getElementById(id);

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    /* ============================================================
       AUDIO ELEMENTS
    ============================================================ */

    const audio = {
        heartbeat: byId("heartbeatSound"),
        ramVoice: byId("RamVoiceError"),
        netflix: byId("netflixIntroSound"),
        matrix: byId("matrixSound"),
        loveBgm: byId("loveBgm"),
        swirl: byId("swirlSound"),
        voiceMessage: byId("myVoiceMessage")
    };


    if (audio.heartbeat) {
        audio.heartbeat.volume = 1;
    }

    if (audio.ramVoice) {
        audio.ramVoice.volume = 1;
    }

    if (audio.netflix) {
        audio.netflix.volume = 1;
    }

    if (audio.matrix) {
        audio.matrix.volume = 0.7;
    }

    if (audio.loveBgm) {
        audio.loveBgm.volume = 0.7;
    }

    if (audio.swirl) {
        audio.swirl.volume = 0.8;
    }

    if (audio.voiceMessage) {
        audio.voiceMessage.volume = 1;
    }


    [
        audio.heartbeat,
        audio.ramVoice,
        audio.netflix,
        audio.matrix,
        audio.loveBgm,
        audio.swirl,
        audio.voiceMessage
    ].forEach((media) => {

        if (!media) {
            return;
        }

        media.preload = "auto";

        media.load();

        media.addEventListener(
            "error",
            () => {
                console.error(
                    "Audio file could not load:",
                    media.currentSrc ||
                    media.src
                );
            }
        );
    });


    let activePageId =
        document.querySelector(".page.active")?.id ||
        "page-1";

    let introTimer = null;

    let voiceWordsTimer = null;


    async function safePlay(
        media,
        restart = false
    ) {

        if (!media) {
            return false;
        }

        try {

            if (restart) {
                media.currentTime = 0;
            }

            await media.play();

            return true;

        } catch (error) {

            console.error(
                "Audio playback failed:",
                media.currentSrc || media.src,
                error
            );

            return false;
        }
    }


    function stopAudio(
        media,
        rewind = true
    ) {

        if (!media) {
            return;
        }

        media.pause();

        if (rewind) {

            try {
                media.currentTime = 0;
            } catch (error) {
                console.warn(
                    "Audio could not be reset:",
                    error
                );
            }
        }
    }


    /* ============================================================
       PAGE NAVIGATION
    ============================================================ */

    function showPage(
        pageId,
        options = {}
    ) {

        const target =
            byId(pageId);

        if (!target) {

            console.error(
                `Page not found: ${pageId}`
            );

            return;
        }


        const previousPageId =
            activePageId;


        pages.forEach((page) => {

            const isActive =
                page === target;

            page.classList.toggle(
                "active",
                isActive
            );

            page.setAttribute(
                "aria-hidden",
                String(!isActive)
            );

            if (isActive) {
                page.scrollTop = 0;
            }
        });

        /*
         * Activate the requested element explicitly as well.
         * This keeps semantic pages such as #page-home working
         * even if they were added after the initial page list.
         */

        target.classList.add(
            "active"
        );

        target.setAttribute(
            "aria-hidden",
            "false"
        );

        target.scrollTop = 0;


        activePageId = pageId;


        /* Stop Page 1 heartbeat after leaving Page 1 */

        if (
            previousPageId === "page-1" &&
            pageId !== "page-1"
        ) {
            stopAudio(
                audio.heartbeat
            );
        }


        /* Stop matrix audio after leaving Page 4 */

        if (
            previousPageId === "page-4" &&
            pageId !== "page-4"
        ) {
            stopAudio(
                audio.matrix
            );
        }


        /* Stop Page 5 music after leaving Page 5 */

        if (
            previousPageId === "page-5" &&
            pageId !== "page-5"
        ) {
            stopAudio(
                audio.loveBgm
            );
        }


        /* Start Page 4 matrix audio */

        if (pageId === "page-4") {

            safePlay(
                audio.matrix,
                true
            );

            window.setTimeout(
                () => {
                    byId("passInput")?.focus();
                },
                550
            );
        }


        /* Start Page 5 love background music */

        if (pageId === "page-5") {

            stopAudio(
                audio.loveBgm
            );

            safePlay(
                audio.loveBgm,
                true
            );
        }


        /* Gallery background music */

        if (pageId === "page-gallery") {

            createFloatingHearts();

            safePlay(
                audio.loveBgm,
                true
            );
        }


        /* Restart the Page 12 progress animations */

        if (pageId === "page-future") {

            target.classList.remove(
                "progress-ready"
            );

            target
                .querySelectorAll(
                    ".future-track span"
                )
                .forEach((bar) => {

                    bar.style.animation =
                        "none";

                    void bar.offsetWidth;

                    bar.style.animation =
                        "";
                });

            window.requestAnimationFrame(
                () => {

                    window.setTimeout(
                        () => {
                            target.classList.add(
                                "progress-ready"
                            );
                        },
                        reducedMotion.matches
                            ? 0
                            : 180
                    );
                }
            );
        }


        /* Stop voice recording after leaving voice page */

        if (
            pageId !== "page-voice" &&
            audio.voiceMessage &&
            !audio.voiceMessage.paused
        ) {
            stopAudio(
                audio.voiceMessage
            );
        }


        if (options.focus !== false) {

            window.setTimeout(
                () => {

                    const focusTarget =
                        target.querySelector(
                            "button:not([disabled]), input:not([disabled]), [tabindex='0']"
                        );

                    focusTarget?.focus({
                        preventScroll: true
                    });
                },
                560
            );
        }
    }


    /* Allow existing page-specific code to use the same navigator. */

    window.showPage = showPage;


    pages.forEach((page) => {

        page.setAttribute(
            "aria-hidden",
            String(
                !page.classList.contains(
                    "active"
                )
            )
        );
    });


    /* ============================================================
       IMAGE FALLBACKS
    ============================================================ */

    function escapeSvgText(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&apos;");
    }


    function makeFallbackImage(name) {

        const label =
            escapeSvgText(
                name || "Our Memory"
            );


        const svg = `
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="900"
                height="900"
                viewBox="0 0 900 900"
            >
                <defs>
                    <linearGradient
                        id="bg"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <stop
                            offset="0"
                            stop-color="#8e0e2f"
                        />

                        <stop
                            offset="1"
                            stop-color="#210710"
                        />
                    </linearGradient>
                </defs>

                <rect
                    width="900"
                    height="900"
                    fill="url(#bg)"
                />

                <circle
                    cx="450"
                    cy="390"
                    r="165"
                    fill="#ffffff"
                    fill-opacity=".08"
                />

                <text
                    x="450"
                    y="430"
                    text-anchor="middle"
                    font-size="190"
                    fill="#ffd7e2"
                >
                    ♥
                </text>

                <text
                    x="450"
                    y="655"
                    text-anchor="middle"
                    font-family="Arial, sans-serif"
                    font-size="48"
                    fill="#ffffff"
                >
                    ${label}
                </text>
            </svg>
        `;


        return (
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(svg)
        );
    }


    document
        .querySelectorAll("img")
        .forEach((image) => {

            image.addEventListener(
                "error",
                () => {

                    if (
                        image.dataset.fallbackApplied ===
                        "true"
                    ) {
                        return;
                    }

                    image.dataset.fallbackApplied =
                        "true";

                    image.src =
                        makeFallbackImage(
                            image.dataset.fallbackName ||
                            image.alt
                        );
                }
            );
        });


    /* ============================================================
       PAGE 1: HEART AND GLITTER
    ============================================================ */

    /* ================================================================
   PAGE 1: HEART, GLITTER, AUDIO AND NAVIGATION
================================================================ */

const heartPage =
    document.getElementById("page-1");

const heartBtn =
    document.getElementById("heartBtn");

const heartbeatSound =
    document.getElementById("heartbeatSound");

const glitterCanvas =
    document.getElementById("glitterCanvas");

const glitterContext =
    glitterCanvas?.getContext("2d");

const heartReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


let glitterWidth = 0;
let glitterHeight = 0;
let glitterParticles = [];

let heartIsHovered = false;
let heartTransitionStarted = false;

let pointerX =
    window.innerWidth / 2;

let pointerY =
    window.innerHeight / 2;

let lastPointerGlitterTime = 0;


/* ================================================================
   AUDIO CONTROL
================================================================ */

function playPageOneHeartbeat() {

    if (!heartbeatSound) {
        return;
    }

    heartbeatSound.pause();
    heartbeatSound.currentTime = 0;
    heartbeatSound.volume = 0.85;
    heartbeatSound.loop = true;


    const playPromise =
        heartbeatSound.play();


    if (
        playPromise &&
        typeof playPromise.catch === "function"
    ) {
        playPromise.catch((error) => {
            console.warn(
                "Heartbeat sound could not play:",
                error
            );
        });
    }
}


function stopPageOneHeartbeat() {

    if (!heartbeatSound) {
        return;
    }

    heartbeatSound.pause();
    heartbeatSound.currentTime = 0;
}


/* ================================================================
   PAGE 2 REDIRECTION
================================================================ */

function redirectToPageTwo() {

    /*
     * Use your existing showPage() function when available.
     */

    if (typeof showPage === "function") {
        showPage("page-2");
        return;
    }


    /*
     * Fallback navigation if showPage() is unavailable.
     */

    document
        .querySelectorAll(".page")
        .forEach((page) => {
            page.classList.remove("active");
        });


    const pageTwo =
        document.getElementById("page-2");


    if (pageTwo) {
        pageTwo.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    } else {
        console.warn(
            'Page 2 was not found. Add id="page-2" to the next page.'
        );
    }
}


/* ================================================================
   PARTICLE CREATION
================================================================ */

function createGlitterParticle(
    x,
    y,
    temporary = false
) {

    const glitterColors = [
        "255, 255, 255",
        "255, 185, 204",
        "255, 103, 147",
        "229, 9, 72",
        "180, 10, 58"
    ];


    const angle =
        Math.random() * Math.PI * 2;

    const velocity =
        temporary
            ? Math.random() * 2.8 + 0.7
            : Math.random() * 0.2 + 0.05;


    return {
        x,
        y,

        velocityX:
            Math.cos(angle) * velocity,

        velocityY:
            Math.sin(angle) * velocity - 0.6,

        radius:
            temporary
                ? Math.random() * 2.8 + 1
                : Math.random() * 1.6 + 0.5,

        alpha:
            Math.random() * 0.55 + 0.4,

        decay:
            temporary
                ? Math.random() * 0.012 + 0.012
                : 0,

        phase:
            Math.random() * Math.PI * 2,

        color:
            glitterColors[
                Math.floor(
                    Math.random() *
                    glitterColors.length
                )
            ],

        temporary
    };
}


/* ================================================================
   CANVAS SIZE
================================================================ */

function resizeGlitterCanvas() {

    if (
        !glitterCanvas ||
        !glitterContext
    ) {
        return;
    }


    const pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    glitterWidth =
        window.innerWidth;

    glitterHeight =
        window.innerHeight;


    glitterCanvas.width =
        Math.floor(
            glitterWidth * pixelRatio
        );

    glitterCanvas.height =
        Math.floor(
            glitterHeight * pixelRatio
        );


    glitterCanvas.style.width =
        `${glitterWidth}px`;

    glitterCanvas.style.height =
        `${glitterHeight}px`;


    glitterContext.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


    const backgroundParticleAmount =
        heartReducedMotion.matches
            ? 12
            : 38;


    glitterParticles =
        Array.from(
            {
                length:
                    backgroundParticleAmount
            },
            () =>
                createGlitterParticle(
                    Math.random() *
                    glitterWidth,

                    Math.random() *
                    glitterHeight,

                    false
                )
        );
}


/* ================================================================
   CREATE GLITTER AROUND HEART
================================================================ */

function createHeartGlitter(
    amount = 20
) {

    if (
        !heartBtn ||
        heartReducedMotion.matches
    ) {
        return;
    }


    const heartRect =
        heartBtn.getBoundingClientRect();

    const centerX =
        heartRect.left +
        heartRect.width / 2;

    const centerY =
        heartRect.top +
        heartRect.height / 2;


    for (
        let index = 0;
        index < amount;
        index += 1
    ) {
        const angle =
            Math.random() *
            Math.PI *
            2;

        const distance =
            Math.random() *
            heartRect.width *
            0.68;


        glitterParticles.push(
            createGlitterParticle(
                centerX +
                Math.cos(angle) *
                distance,

                centerY +
                Math.sin(angle) *
                distance,

                true
            )
        );
    }
}


/* ================================================================
   DRAW STAR-SHAPED GLITTER
================================================================ */

function drawGlitterStar(
    particle,
    pulse
) {

    glitterContext.save();

    glitterContext.translate(
        particle.x,
        particle.y
    );

    glitterContext.rotate(
        particle.phase
    );


    glitterContext.fillStyle =
        `rgba(
            ${particle.color},
            ${Math.max(
                0,
                particle.alpha * pulse
            )}
        )`;


    glitterContext.beginPath();

    glitterContext.moveTo(
        0,
        -particle.radius * 2.2
    );

    glitterContext.lineTo(
        particle.radius * 0.5,
        -particle.radius * 0.5
    );

    glitterContext.lineTo(
        particle.radius * 2.2,
        0
    );

    glitterContext.lineTo(
        particle.radius * 0.5,
        particle.radius * 0.5
    );

    glitterContext.lineTo(
        0,
        particle.radius * 2.2
    );

    glitterContext.lineTo(
        -particle.radius * 0.5,
        particle.radius * 0.5
    );

    glitterContext.lineTo(
        -particle.radius * 2.2,
        0
    );

    glitterContext.lineTo(
        -particle.radius * 0.5,
        -particle.radius * 0.5
    );

    glitterContext.closePath();
    glitterContext.fill();

    glitterContext.restore();
}


/* ================================================================
   GLITTER ANIMATION
================================================================ */

function drawGlitter(
    time = 0
) {

    if (!glitterContext) {
        return;
    }


    glitterContext.clearRect(
        0,
        0,
        glitterWidth,
        glitterHeight
    );


    const pageOneIsActive =
        heartPage?.classList.contains(
            "active"
        );


    if (pageOneIsActive) {

        /*
         * Continuously generate glitter while the heart is hovered.
         */

        if (
            heartIsHovered &&
            !heartReducedMotion.matches &&
            Math.random() < 0.45
        ) {
            createHeartGlitter(2);
        }


        glitterParticles.forEach(
            (particle) => {

                if (particle.temporary) {

                    particle.x +=
                        particle.velocityX;

                    particle.y +=
                        particle.velocityY;

                    particle.velocityY +=
                        0.012;

                    particle.alpha -=
                        particle.decay;

                    particle.radius *=
                        0.996;

                } else {

                    particle.y -=
                        0.14;

                    particle.x +=
                        Math.sin(
                            time * 0.001 +
                            particle.phase
                        ) *
                        0.07;


                    if (
                        particle.y < -10
                    ) {
                        particle.y =
                            glitterHeight + 10;

                        particle.x =
                            Math.random() *
                            glitterWidth;
                    }
                }


                const pulse =
                    0.58 +
                    Math.sin(
                        time * 0.003 +
                        particle.phase
                    ) *
                    0.35;


                drawGlitterStar(
                    particle,
                    pulse
                );
            }
        );


        glitterParticles =
            glitterParticles.filter(
                (particle) =>
                    !particle.temporary ||
                    particle.alpha > 0.02
            );


        /*
         * Prevent excessive particles.
         */

        if (glitterParticles.length > 240) {
            glitterParticles.splice(
                38,
                glitterParticles.length - 240
            );
        }
    }


    window.requestAnimationFrame(
        drawGlitter
    );
}


/* ================================================================
   HEART HOVER EVENTS
================================================================ */

heartBtn?.addEventListener(
    "pointerenter",
    () => {

        heartIsHovered = true;

        createHeartGlitter(45);
    }
);


heartBtn?.addEventListener(
    "pointerleave",
    () => {

        heartIsHovered = false;
    }
);


heartBtn?.addEventListener(
    "pointermove",
    (event) => {

        pointerX =
            event.clientX;

        pointerY =
            event.clientY;


        const currentTime =
            performance.now();


        if (
            currentTime -
            lastPointerGlitterTime <
            35
        ) {
            return;
        }


        lastPointerGlitterTime =
            currentTime;


        if (heartReducedMotion.matches) {
            return;
        }


        for (
            let index = 0;
            index < 3;
            index += 1
        ) {
            glitterParticles.push(
                createGlitterParticle(
                    pointerX +
                    (
                        Math.random() -
                        0.5
                    ) *
                    18,

                    pointerY +
                    (
                        Math.random() -
                        0.5
                    ) *
                    18,

                    true
                )
            );
        }
    }
);


/* ================================================================
   HEART CLICK EVENT
================================================================ */

heartBtn?.addEventListener(
    "click",
    () => {

        if (
            heartTransitionStarted ||
            heartBtn.disabled
        ) {
            return;
        }


        heartTransitionStarted = true;
        heartBtn.disabled = true;
        heartIsHovered = false;


        /*
         * Audio starts after clicking because browsers block
         * automatic audio before user interaction.
         */

        playPageOneHeartbeat();

        createHeartGlitter(90);


        if (
            typeof heartBtn.animate ===
                "function" &&
            !heartReducedMotion.matches
        ) {
            heartBtn.animate(
                [
                    {
                        transform:
                            "scale(1)"
                    },
                    {
                        transform:
                            "scale(1.22)"
                    },
                    {
                        transform:
                            "scale(0.92)"
                    },
                    {
                        transform:
                            "scale(1.15)"
                    },
                    {
                        transform:
                            "scale(1)"
                    }
                ],
                {
                    duration: 1800,
                    easing: "ease-in-out"
                }
            );
        }


        window.setTimeout(
            () => {

                /*
                 * Stop heartbeat before opening Page 2.
                 */

                stopPageOneHeartbeat();

                redirectToPageTwo();

                heartTransitionStarted = false;
                heartBtn.disabled = false;
            },
            heartReducedMotion.matches
                ? 300
                : 2100
        );
    }
);


/* ================================================================
   GUARANTEED AUDIO STOP OUTSIDE PAGE 1
================================================================ */

if (heartPage) {

    const heartPageObserver =
        new MutationObserver(() => {

            if (
                !heartPage.classList.contains(
                    "active"
                )
            ) {
                stopPageOneHeartbeat();
                heartIsHovered = false;
            }
        });


    heartPageObserver.observe(
        heartPage,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );
}


/*
 * Stop sound when browser tab is hidden.
 */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {
            stopPageOneHeartbeat();
        }
    }
);


window.addEventListener(
    "pagehide",
    stopPageOneHeartbeat
);


/* ================================================================
   INITIALIZE PAGE 1
================================================================ */

window.addEventListener(
    "resize",
    resizeGlitterCanvas
);


resizeGlitterCanvas();

window.requestAnimationFrame(
    drawGlitter
);


    /* ============================================================
       PAGE 2: PROFILE SELECTION
    ============================================================ */

    /* ================================================================
   PAGE 2: PROFILES, GLITTER, ERROR AND INFINITY LOVE METER
================================================================ */

(() => {

    function initializeProfilePage() {

        /* ========================================================
           ELEMENTS
        ======================================================== */

        const profilePage =
            document.getElementById("page-2");

        const profileBtnRaji =
            document.getElementById("profileBtnRaji");

        const profileBtnRam =
            document.getElementById("profileBtnRam");

        const loveMeterBtn =
            document.getElementById("loveMeterBtn");

        const systemErrorModal =
            document.getElementById("systemErrorModal");

        const closeDialogBtn =
            document.getElementById("closeDialogBtn");

        const okDialogBtn =
            document.getElementById("okDialogBtn");

        const ramVoiceError =
            document.getElementById("RamVoiceError");

        const loveMeterModal =
            document.getElementById("loveMeterModal");

        const loveMeterPanel =
            document.getElementById("loveMeterPanel");

        const closeLoveMeterBtn =
            document.getElementById("closeLoveMeterBtn");

        const loveMeterOkBtn =
            document.getElementById("loveMeterOkBtn");

        const loveMeterValue =
            document.getElementById("loveMeterValue");

        const loveMeterFill =
            document.getElementById("loveMeterFill");

        const loveMeterStatus =
            document.getElementById("loveMeterStatus");

        const loveMeterTrack =
            document.querySelector(".love-meter-track");

        const glitterCanvas =
            document.getElementById("profileGlitterCanvas");

        const glitterContext =
            glitterCanvas?.getContext("2d");

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        if (
            !profilePage ||
            !profileBtnRaji ||
            !profileBtnRam
        ) {
            return;
        }


        let returnFocusElement = null;
        let navigationStarted = false;

        let loveMeterAnimationFrame = null;
        let loveMeterFinished = false;

        let glitterWidth = 0;
        let glitterHeight = 0;
        let glitterParticles = [];

        let hoveredGlitterElement = null;
        let lastPointerParticleTime = 0;


        /* ========================================================
           IMAGE FALLBACK
        ======================================================== */

        profilePage
            .querySelectorAll(".portrait-frame img")
            .forEach((image) => {

                image.addEventListener(
                    "error",
                    () => {
                        image.classList.add(
                            "image-missing"
                        );
                    }
                );
            });


        /* ========================================================
           AUDIO
        ======================================================== */

        function playRamVoice() {

            if (!ramVoiceError) {
                return;
            }

            ramVoiceError.pause();
            ramVoiceError.currentTime = 0;
            ramVoiceError.volume = 0.9;
            ramVoiceError.loop = true;


            const playPromise =
                ramVoiceError.play();


            if (
                playPromise &&
                typeof playPromise.catch === "function"
            ) {
                playPromise.catch((error) => {
                    console.warn(
                        "Ram voice could not play:",
                        error
                    );
                });
            }
        }


        function stopRamVoice() {

            if (!ramVoiceError) {
                return;
            }

            ramVoiceError.pause();
            ramVoiceError.currentTime = 0;
        }


        function stopHeartbeatAudio() {

            const heartbeatSound =
                document.getElementById(
                    "heartbeatSound"
                );


            if (!heartbeatSound) {
                return;
            }

            heartbeatSound.pause();
            heartbeatSound.currentTime = 0;
        }


        /* ========================================================
           BODY SCROLL CONTROL
        ======================================================== */

        function updateBodyScroll() {

            const errorIsOpen =
                systemErrorModal &&
                !systemErrorModal.hidden;

            const loveMeterIsOpen =
                loveMeterModal &&
                !loveMeterModal.hidden;


            document.body.classList.toggle(
                "profile-dialog-open",
                Boolean(
                    errorIsOpen ||
                    loveMeterIsOpen
                )
            );
        }


        /* ========================================================
           RAM ERROR DIALOGUE
        ======================================================== */

        function openSystemModal() {

            if (!systemErrorModal) {
                return;
            }

            closeLoveMeter(false);

            returnFocusElement =
                document.activeElement;

            systemErrorModal.hidden = false;

            updateBodyScroll();

            window.requestAnimationFrame(() => {
                closeDialogBtn?.focus();
            });
        }


        function closeSystemModal(
            restoreFocus = true
        ) {

            if (!systemErrorModal) {
                return;
            }

            systemErrorModal.hidden = true;

            stopRamVoice();
            updateBodyScroll();


            if (restoreFocus) {
                returnFocusElement?.focus?.();
            }
        }


        profileBtnRam.addEventListener(
            "click",
            () => {

                if (navigationStarted) {
                    return;
                }

                createGlitterBurst(
                    profileBtnRam,
                    75
                );

                playRamVoice();
                openSystemModal();
            }
        );


        closeDialogBtn?.addEventListener(
            "click",
            () => {
                closeSystemModal(true);
            }
        );


        okDialogBtn?.addEventListener(
            "click",
            () => {
                closeSystemModal(true);
            }
        );


        systemErrorModal?.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    systemErrorModal
                ) {
                    closeSystemModal(true);
                }
            }
        );


        /* ========================================================
           LOVE METER
        ======================================================== */

        function resetLoveMeter() {

            if (loveMeterAnimationFrame) {
                window.cancelAnimationFrame(
                    loveMeterAnimationFrame
                );
            }

            loveMeterAnimationFrame = null;
            loveMeterFinished = false;

            loveMeterPanel?.classList.remove(
                "love-complete"
            );


            if (loveMeterValue) {
                loveMeterValue.textContent =
                    "0%";
            }

            if (loveMeterFill) {
                loveMeterFill.style.width =
                    "0%";
            }

            if (loveMeterStatus) {
                loveMeterStatus.textContent =
                    "Connecting both hearts...";
            }

            if (loveMeterTrack) {
                loveMeterTrack.setAttribute(
                    "aria-valuenow",
                    "0"
                );
            }
        }


        function updateLoveMeterStatus(
            percentage
        ) {

            if (!loveMeterStatus) {
                return;
            }


            if (percentage < 22) {

                loveMeterStatus.textContent =
                    "Searching for the first smile...";

            } else if (percentage < 45) {

                loveMeterStatus.textContent =
                    "Reading beautiful memories...";

            } else if (percentage < 68) {

                loveMeterStatus.textContent =
                    "Matching two special hearts...";

            } else if (percentage < 88) {

                loveMeterStatus.textContent =
                    "Calculating hugs, laughter and care...";

            } else if (percentage < 100) {

                loveMeterStatus.textContent =
                    "The meter cannot find a limit...";

            }
        }


        function finishLoveMeter() {

            loveMeterFinished = true;

            if (loveMeterValue) {
                loveMeterValue.textContent =
                    "∞";
            }

            if (loveMeterFill) {
                loveMeterFill.style.width =
                    "100%";
            }

            if (loveMeterStatus) {
                loveMeterStatus.textContent =
                    "Result: Ram + Raji = Forever and Beyond ♾️";
            }

            if (loveMeterTrack) {
                loveMeterTrack.setAttribute(
                    "aria-valuenow",
                    "100"
                );

                loveMeterTrack.setAttribute(
                    "aria-valuetext",
                    "Infinity"
                );
            }

            loveMeterPanel?.classList.add(
                "love-complete"
            );

            createGlitterBurst(
                loveMeterPanel,
                110
            );
        }


        function startLoveMeter() {

            resetLoveMeter();


            const duration =
                reducedMotion.matches
                    ? 500
                    : 3600;

            const startTime =
                performance.now();


            function animateMeter(
                currentTime
            ) {

                const elapsed =
                    currentTime - startTime;

                const progress =
                    Math.min(
                        elapsed / duration,
                        1
                    );

                /*
                 * Smooth calculation animation.
                 */

                const easedProgress =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );

                const percentage =
                    Math.min(
                        100,
                        Math.floor(
                            easedProgress * 100
                        )
                    );


                if (loveMeterValue) {
                    loveMeterValue.textContent =
                        `${percentage}%`;
                }

                if (loveMeterFill) {
                    loveMeterFill.style.width =
                        `${percentage}%`;
                }

                if (loveMeterTrack) {
                    loveMeterTrack.setAttribute(
                        "aria-valuenow",
                        String(percentage)
                    );
                }

                updateLoveMeterStatus(
                    percentage
                );


                if (progress < 1) {

                    loveMeterAnimationFrame =
                        window.requestAnimationFrame(
                            animateMeter
                        );

                } else {

                    loveMeterAnimationFrame =
                        null;

                    finishLoveMeter();
                }
            }


            loveMeterAnimationFrame =
                window.requestAnimationFrame(
                    animateMeter
                );
        }


        function openLoveMeter() {

            if (!loveMeterModal) {
                return;
            }

            closeSystemModal(false);

            returnFocusElement =
                document.activeElement;

            loveMeterModal.hidden = false;

            updateBodyScroll();

            createGlitterBurst(
                loveMeterBtn,
                75
            );


            window.requestAnimationFrame(
                () => {

                    closeLoveMeterBtn?.focus();

                    startLoveMeter();
                }
            );
        }


        function closeLoveMeter(
            restoreFocus = true
        ) {

            if (!loveMeterModal) {
                return;
            }

            if (loveMeterAnimationFrame) {
                window.cancelAnimationFrame(
                    loveMeterAnimationFrame
                );
            }

            loveMeterAnimationFrame = null;
            loveMeterModal.hidden = true;

            updateBodyScroll();


            if (restoreFocus) {
                returnFocusElement?.focus?.();
            }
        }


        loveMeterBtn?.addEventListener(
            "click",
            openLoveMeter
        );


        closeLoveMeterBtn?.addEventListener(
            "click",
            () => {
                closeLoveMeter(true);
            }
        );


        loveMeterOkBtn?.addEventListener(
            "click",
            () => {
                closeLoveMeter(true);
            }
        );


        loveMeterModal?.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    loveMeterModal
                ) {
                    closeLoveMeter(true);
                }
            }
        );


        /* ========================================================
           KEYBOARD DIALOG CONTROL
        ======================================================== */

        document.addEventListener(
            "keydown",
            (event) => {

                if (event.key !== "Escape") {
                    return;
                }


                if (
                    loveMeterModal &&
                    !loveMeterModal.hidden
                ) {
                    closeLoveMeter(true);
                    return;
                }


                if (
                    systemErrorModal &&
                    !systemErrorModal.hidden
                ) {
                    closeSystemModal(true);
                }
            }
        );


        /* ========================================================
           PAGE NAVIGATION
        ======================================================== */

        function showNextPage() {

            /*
             * Use the existing website showPage() function.
             */

            if (typeof showPage === "function") {

                showPage(
                    "page-3"
                );

                return true;
            }


            /*
             * Fallback navigation.
             */

            const pageThree =
                document.getElementById(
                    "page-3"
                );


            if (!pageThree) {

                console.warn(
                    'Next page not found. Add id="page-3" to the next section.'
                );

                return false;
            }


            document
                .querySelectorAll(".page")
                .forEach((page) => {
                    page.classList.remove(
                        "active"
                    );
                });


            pageThree.classList.add(
                "active"
            );


            window.scrollTo({
                top: 0,
                behavior: "instant"
            });


            return true;
        }


        profileBtnRaji.addEventListener(
            "click",
            () => {

                if (
                    navigationStarted ||
                    profileBtnRaji.disabled
                ) {
                    return;
                }


                navigationStarted = true;
                profileBtnRaji.disabled = true;

                stopRamVoice();
                stopHeartbeatAudio();

                closeSystemModal(false);
                closeLoveMeter(false);

                profileBtnRaji.classList.add(
                    "opening-profile"
                );

                createGlitterBurst(
                    profileBtnRaji,
                    120
                );


                window.setTimeout(
                    () => {

                        const navigationSucceeded =
                            showNextPage();


                        profileBtnRaji.classList.remove(
                            "opening-profile"
                        );

                        profileBtnRaji.disabled =
                            false;

                        navigationStarted =
                            false;


                        if (!navigationSucceeded) {
                            profileBtnRaji.focus();
                        }
                    },
                    reducedMotion.matches
                        ? 100
                        : 900
                );
            }
        );


        /* ========================================================
           GLITTER PARTICLES
        ======================================================== */

        function getGlitterColor(
            element
        ) {

            if (
                element ===
                profileBtnRaji
            ) {
                return "255, 89, 143";
            }


            if (
                element ===
                profileBtnRam
            ) {
                return "255, 187, 102";
            }


            return "255, 75, 132";
        }


        function createParticle(
            x,
            y,
            color
        ) {

            const angle =
                Math.random() *
                Math.PI *
                2;

            const velocity =
                Math.random() *
                2.7 +
                0.6;


            return {
                x,
                y,

                velocityX:
                    Math.cos(angle) *
                    velocity,

                velocityY:
                    Math.sin(angle) *
                    velocity -
                    0.45,

                radius:
                    Math.random() *
                    2.6 +
                    0.8,

                alpha:
                    Math.random() *
                    0.5 +
                    0.5,

                decay:
                    Math.random() *
                    0.014 +
                    0.012,

                rotation:
                    Math.random() *
                    Math.PI *
                    2,

                rotationSpeed:
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.08,

                color
            };
        }


        function resizeGlitterCanvas() {

            if (
                !glitterCanvas ||
                !glitterContext
            ) {
                return;
            }


            const pixelRatio =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );


            glitterWidth =
                window.innerWidth;

            glitterHeight =
                window.innerHeight;


            glitterCanvas.width =
                Math.floor(
                    glitterWidth *
                    pixelRatio
                );

            glitterCanvas.height =
                Math.floor(
                    glitterHeight *
                    pixelRatio
                );


            glitterCanvas.style.width =
                `${glitterWidth}px`;

            glitterCanvas.style.height =
                `${glitterHeight}px`;


            glitterContext.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
            );
        }


        function createGlitterBurst(
            element,
            amount = 40
        ) {

            if (
                !element ||
                !glitterContext ||
                reducedMotion.matches
            ) {
                return;
            }


            const elementRect =
                element.getBoundingClientRect();

            const color =
                getGlitterColor(element);


            for (
                let index = 0;
                index < amount;
                index += 1
            ) {
                const edge =
                    Math.floor(
                        Math.random() * 4
                    );

                let x;
                let y;


                if (edge === 0) {

                    x =
                        elementRect.left +
                        Math.random() *
                        elementRect.width;

                    y =
                        elementRect.top;

                } else if (edge === 1) {

                    x =
                        elementRect.right;

                    y =
                        elementRect.top +
                        Math.random() *
                        elementRect.height;

                } else if (edge === 2) {

                    x =
                        elementRect.left +
                        Math.random() *
                        elementRect.width;

                    y =
                        elementRect.bottom;

                } else {

                    x =
                        elementRect.left;

                    y =
                        elementRect.top +
                        Math.random() *
                        elementRect.height;
                }


                glitterParticles.push(
                    createParticle(
                        x,
                        y,
                        color
                    )
                );
            }
        }


        function createPointerGlitter(
            event,
            element
        ) {

            if (
                reducedMotion.matches ||
                !glitterContext
            ) {
                return;
            }


            const currentTime =
                performance.now();


            if (
                currentTime -
                lastPointerParticleTime <
                32
            ) {
                return;
            }


            lastPointerParticleTime =
                currentTime;


            const color =
                getGlitterColor(element);


            for (
                let index = 0;
                index < 3;
                index += 1
            ) {
                glitterParticles.push(
                    createParticle(
                        event.clientX +
                        (
                            Math.random() -
                            0.5
                        ) *
                        18,

                        event.clientY +
                        (
                            Math.random() -
                            0.5
                        ) *
                        18,

                        color
                    )
                );
            }
        }


        function drawParticle(
            particle
        ) {

            glitterContext.save();

            glitterContext.translate(
                particle.x,
                particle.y
            );

            glitterContext.rotate(
                particle.rotation
            );

            glitterContext.fillStyle =
                `rgba(
                    ${particle.color},
                    ${Math.max(
                        0,
                        particle.alpha
                    )}
                )`;


            glitterContext.beginPath();

            glitterContext.moveTo(
                0,
                -particle.radius * 2.3
            );

            glitterContext.lineTo(
                particle.radius * 0.48,
                -particle.radius * 0.48
            );

            glitterContext.lineTo(
                particle.radius * 2.3,
                0
            );

            glitterContext.lineTo(
                particle.radius * 0.48,
                particle.radius * 0.48
            );

            glitterContext.lineTo(
                0,
                particle.radius * 2.3
            );

            glitterContext.lineTo(
                -particle.radius * 0.48,
                particle.radius * 0.48
            );

            glitterContext.lineTo(
                -particle.radius * 2.3,
                0
            );

            glitterContext.lineTo(
                -particle.radius * 0.48,
                -particle.radius * 0.48
            );

            glitterContext.closePath();
            glitterContext.fill();

            glitterContext.restore();
        }


        function animateProfileGlitter() {

            if (!glitterContext) {
                return;
            }


            glitterContext.clearRect(
                0,
                0,
                glitterWidth,
                glitterHeight
            );


            const pageIsActive =
                profilePage.classList.contains(
                    "active"
                );


            if (pageIsActive) {

                /*
                 * Continuous glitter while hovering.
                 */

                if (
                    hoveredGlitterElement &&
                    Math.random() < 0.32
                ) {
                    createGlitterBurst(
                        hoveredGlitterElement,
                        1
                    );
                }


                glitterContext.globalCompositeOperation =
                    "lighter";


                glitterParticles.forEach(
                    (particle) => {

                        particle.x +=
                            particle.velocityX;

                        particle.y +=
                            particle.velocityY;

                        particle.velocityY +=
                            0.018;

                        particle.velocityX *=
                            0.992;

                        particle.alpha -=
                            particle.decay;

                        particle.radius *=
                            0.996;

                        particle.rotation +=
                            particle.rotationSpeed;


                        drawParticle(
                            particle
                        );
                    }
                );


                glitterContext.globalCompositeOperation =
                    "source-over";


                glitterParticles =
                    glitterParticles.filter(
                        (particle) =>
                            particle.alpha > 0.02
                    );


                if (
                    glitterParticles.length >
                    300
                ) {
                    glitterParticles.splice(
                        0,
                        glitterParticles.length -
                        300
                    );
                }

            } else {

                glitterParticles = [];
            }


            window.requestAnimationFrame(
                animateProfileGlitter
            );
        }


        const glitterElements = [
            profileBtnRaji,
            profileBtnRam,
            loveMeterBtn
        ].filter(Boolean);


        glitterElements.forEach(
            (element) => {

                element.addEventListener(
                    "pointerenter",
                    () => {

                        hoveredGlitterElement =
                            element;

                        createGlitterBurst(
                            element,
                            element === loveMeterBtn
                                ? 35
                                : 55
                        );
                    }
                );


                element.addEventListener(
                    "pointermove",
                    (event) => {

                        hoveredGlitterElement =
                            element;

                        createPointerGlitter(
                            event,
                            element
                        );
                    }
                );


                element.addEventListener(
                    "pointerleave",
                    () => {

                        if (
                            hoveredGlitterElement ===
                            element
                        ) {
                            hoveredGlitterElement =
                                null;
                        }
                    }
                );
            }
        );


        /* ========================================================
           GUARANTEED CLEANUP WHEN PAGE 2 CLOSES
        ======================================================== */

        const profilePageObserver =
            new MutationObserver(() => {

                if (
                    !profilePage.classList.contains(
                        "active"
                    )
                ) {
                    stopRamVoice();

                    closeSystemModal(false);
                    closeLoveMeter(false);

                    hoveredGlitterElement =
                        null;

                    glitterParticles = [];
                }
            });


        profilePageObserver.observe(
            profilePage,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );


        window.addEventListener(
            "resize",
            resizeGlitterCanvas
        );


        window.addEventListener(
            "pagehide",
            stopRamVoice
        );


        resizeGlitterCanvas();

        window.requestAnimationFrame(
            animateProfileGlitter
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeProfilePage,
            {
                once: true
            }
        );
    } else {
        initializeProfilePage();
    }

})();

/* ================================================================
   PAGE 3: INFINITY INTRO AND PAGE 4 NAVIGATION
================================================================ */

(() => {

    function initializeInfinityIntro() {

        const pageThree =
            document.getElementById("page-3");

        const introScreen =
            document.getElementById(
                "foreverIntroScreen"
            );

        const transitionText =
            document.getElementById(
                "foreverTransitionText"
            );

        const skipIntroButton =
            document.getElementById(
                "skipInfinityIntroBtn"
            );

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        if (
            !pageThree ||
            !introScreen
        ) {
            return;
        }


        /*
         * Total time Page 3 remains visible.
         */

        const INTRO_DURATION =
            reducedMotion.matches
                ? 1100
                : 6500;

        const EXIT_DURATION =
            reducedMotion.matches
                ? 100
                : 650;


        let introTimer = null;
        let exitTimer = null;
        let statusTimers = [];

        let introRunning = false;
        let transitionStarted = false;


        /* ========================================================
           AUDIO CLEANUP
        ======================================================== */

        function stopAudioById(
            audioId
        ) {

            const sound =
                document.getElementById(
                    audioId
                );


            if (!sound) {
                return;
            }

            sound.pause();
            sound.currentTime = 0;
        }


        function stopPreviousPageAudio() {

            stopAudioById(
                "heartbeatSound"
            );

            stopAudioById(
                "RamVoiceError"
            );
        }


        /* ========================================================
           TIMER CLEANUP
        ======================================================== */

        function clearInfinityTimers() {

            if (introTimer) {
                window.clearTimeout(
                    introTimer
                );
            }

            if (exitTimer) {
                window.clearTimeout(
                    exitTimer
                );
            }


            introTimer = null;
            exitTimer = null;


            statusTimers.forEach(
                (timer) => {
                    window.clearTimeout(
                        timer
                    );
                }
            );


            statusTimers = [];
        }


        /* ========================================================
           PAGE 4 NAVIGATION
        ======================================================== */

        function displayPageFour() {

            /*
             * Use your existing showPage() function.
             */

            if (
                typeof showPage ===
                "function"
            ) {
                showPage(
                    "page-4"
                );

                return true;
            }


            /*
             * Fallback navigation if showPage() is unavailable.
             */

            const pageFour =
                document.getElementById(
                    "page-4"
                );


            if (!pageFour) {

                console.warn(
                    'Matrix Page not found. Add id="page-4" to the Matrix section.'
                );

                return false;
            }


            document
                .querySelectorAll(".page")
                .forEach((page) => {

                    page.classList.remove(
                        "active"
                    );
                });


            pageFour.classList.add(
                "active"
            );


            window.scrollTo({
                top: 0,
                behavior: "instant"
            });


            return true;
        }


        /* ========================================================
           EXIT PAGE 3
        ======================================================== */

        function beginPageFourTransition() {

            if (
                transitionStarted ||
                !pageThree.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            transitionStarted = true;

            clearInfinityTimers();


            if (transitionText) {
                transitionText.textContent =
                    "Entering our next chapter...";
            }


            introScreen.classList.add(
                "is-leaving"
            );


            exitTimer =
                window.setTimeout(
                    () => {

                        const pageChanged =
                            displayPageFour();


                        if (!pageChanged) {

                            introScreen.classList.remove(
                                "is-leaving"
                            );

                            transitionStarted =
                                false;

                            introRunning =
                                false;


                            if (transitionText) {
                                transitionText.textContent =
                                    "Page 4 could not be found.";
                            }
                        }
                    },
                    EXIT_DURATION
                );
        }


        /* ========================================================
           START PAGE 3 ANIMATION
        ======================================================== */

        function startInfinityIntro() {

            if (
                introRunning ||
                !pageThree.classList.contains(
                    "active"
                )
            ) {
                return;
            }


            clearInfinityTimers();

            introRunning = true;
            transitionStarted = false;

            stopPreviousPageAudio();


            /*
             * Remove classes and force layout recalculation.
             * This restarts all Page 3 animations.
             */

            introScreen.classList.remove(
                "play",
                "is-leaving"
            );

            void introScreen.offsetWidth;

            introScreen.classList.add(
                "play"
            );


            if (transitionText) {
                transitionText.textContent =
                    "Drawing our infinite bond...";
            }


            if (!reducedMotion.matches) {

                statusTimers.push(
                    window.setTimeout(
                        () => {

                            if (transitionText) {
                                transitionText.textContent =
                                    "Connecting Raji and Ram...";
                            }
                        },
                        2450
                    )
                );


                statusTimers.push(
                    window.setTimeout(
                        () => {

                            if (transitionText) {
                                transitionText.textContent =
                                    "Our forever is ready...";
                            }
                        },
                        4300
                    )
                );


                statusTimers.push(
                    window.setTimeout(
                        () => {

                            if (transitionText) {
                                transitionText.textContent =
                                    "Opening the Matrix Page...";
                            }
                        },
                        5450
                    )
                );
            }


            introTimer =
                window.setTimeout(
                    beginPageFourTransition,
                    INTRO_DURATION
                );
        }


        /* ========================================================
           MANUAL CONTINUE BUTTON
        ======================================================== */

        skipIntroButton?.addEventListener(
            "click",
            beginPageFourTransition
        );


        /* ========================================================
           WATCH PAGE 3 ACTIVATION
        ======================================================== */

        const pageThreeObserver =
            new MutationObserver(() => {

                const pageIsActive =
                    pageThree.classList.contains(
                        "active"
                    );


                if (pageIsActive) {

                    startInfinityIntro();

                } else {

                    clearInfinityTimers();

                    introRunning = false;
                    transitionStarted = false;

                    introScreen.classList.remove(
                        "play",
                        "is-leaving"
                    );
                }
            });


        pageThreeObserver.observe(
            pageThree,
            {
                attributes: true,
                attributeFilter: ["class"]
            }
        );


        /*
         * Start immediately if Page 3 already has the active class.
         */

        if (
            pageThree.classList.contains(
                "active"
            )
        ) {
            startInfinityIntro();
        }


        window.addEventListener(
            "pagehide",
            clearInfinityTimers
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeInfinityIntro,
            {
                once: true
            }
        );
    } else {
        initializeInfinityIntro();
    }

})();


    /* ============================================================
       PAGE 4: MATRIX AND PASSWORD
    ============================================================ */

    /* ================================================================
   PAGE 4: MATRIX, PASSWORD AND ERROR DIALOGUE
================================================================ */

const PAGE_4_SECRET_CODE = "24062026";

const matrixCanvas =
    document.getElementById("matrixCanvas");

const matrixContext =
    matrixCanvas?.getContext("2d");

const matrixSound =
    document.getElementById("matrixSound");

const passwordForm =
    document.getElementById("passwordForm");

const passInput =
    document.getElementById("passInput");

const enterBtn =
    document.getElementById("enterBtn");

const passwordErrorDialog =
    document.getElementById("passwordErrorDialog");

const funnyErrorMessage =
    document.getElementById("funnyErrorMessage");

const closeErrorDialogButton =
    document.getElementById("closeErrorDialog");

const tryAgainButton =
    document.getElementById("tryAgainBtn");


/* ================================================================
   MATRIX SETTINGS
================================================================ */

const matrixCharacters =
    "RAJI❤RAM24062026FOREVER∞01";

const matrixFontSize = 16;

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

let matrixWidth = 0;
let matrixHeight = 0;
let matrixDrops = [];
let matrixAnimationFrame = null;
let matrixLastFrameTime = 0;


/* ================================================================
   ACTIVE PAGE CHECK
================================================================ */

function isPageFourActive() {

    const pageFour =
        document.getElementById("page-4");

    return Boolean(
        pageFour?.classList.contains("active")
    );
}


/* ================================================================
   MATRIX CANVAS SIZE
================================================================ */

function resizeMatrixCanvas() {

    if (
        !matrixCanvas ||
        !matrixContext
    ) {
        return;
    }

    const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2
    );

    matrixWidth =
        window.innerWidth;

    matrixHeight =
        window.innerHeight;

    matrixCanvas.width =
        Math.floor(
            matrixWidth * pixelRatio
        );

    matrixCanvas.height =
        Math.floor(
            matrixHeight * pixelRatio
        );

    matrixCanvas.style.width =
        `${matrixWidth}px`;

    matrixCanvas.style.height =
        `${matrixHeight}px`;

    matrixContext.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    matrixDrops =
        Array.from(
            {
                length: Math.ceil(
                    matrixWidth /
                    matrixFontSize
                )
            },
            () =>
                Math.floor(
                    Math.random() * -60
                )
        );

    matrixContext.fillStyle =
        "#020806";

    matrixContext.fillRect(
        0,
        0,
        matrixWidth,
        matrixHeight
    );
}


/* ================================================================
   DRAW MATRIX
================================================================ */

function drawMatrix(timestamp = 0) {

    const frameDelay =
        prefersReducedMotion.matches
            ? 180
            : 55;

    if (
        timestamp -
        matrixLastFrameTime <
        frameDelay
    ) {
        matrixAnimationFrame =
            window.requestAnimationFrame(
                drawMatrix
            );

        return;
    }

    matrixLastFrameTime =
        timestamp;

    if (
        matrixContext &&
        isPageFourActive()
    ) {
        matrixContext.fillStyle =
            "rgba(2, 8, 6, 0.09)";

        matrixContext.fillRect(
            0,
            0,
            matrixWidth,
            matrixHeight
        );

        matrixContext.fillStyle =
            "#5bffa1";

        matrixContext.font =
            `${matrixFontSize}px monospace`;

        matrixContext.textAlign =
            "left";

        matrixContext.textBaseline =
            "top";

        matrixDrops.forEach(
            (drop, column) => {

                const randomIndex =
                    Math.floor(
                        Math.random() *
                        matrixCharacters.length
                    );

                const character =
                    matrixCharacters[randomIndex];

                const x =
                    column *
                    matrixFontSize;

                const y =
                    drop *
                    matrixFontSize;

                matrixContext.shadowColor =
                    "#5bffa1";

                matrixContext.shadowBlur =
                    Math.random() > 0.85
                        ? 10
                        : 0;

                matrixContext.fillText(
                    character,
                    x,
                    y
                );

                matrixContext.shadowBlur = 0;

                if (
                    y > matrixHeight &&
                    Math.random() > 0.975
                ) {
                    matrixDrops[column] = 0;
                } else {
                    matrixDrops[column] += 1;
                }
            }
        );
    }

    matrixAnimationFrame =
        window.requestAnimationFrame(
            drawMatrix
        );
}


/* ================================================================
   MATRIX SOUND
================================================================ */

async function startMatrixSound() {

    if (
        !matrixSound ||
        !isPageFourActive()
    ) {
        return;
    }

    try {
        matrixSound.volume = 0.38;
        matrixSound.loop = true;

        await matrixSound.play();

    } catch (error) {

        /*
         * Browsers can block audio until the user
         * clicks or touches the page.
         */

        console.info(
            "Matrix sound is waiting for user interaction."
        );
    }
}


function stopMatrixSound() {

    if (!matrixSound) {
        return;
    }

    matrixSound.pause();
    matrixSound.currentTime = 0;
}


/*
 * This solves browser autoplay blocking.
 * The sound starts when the user first interacts
 * while Page 4 is active.
 */

function unlockMatrixSound() {

    if (isPageFourActive()) {
        startMatrixSound();
    }
}

document.addEventListener(
    "pointerdown",
    unlockMatrixSound
);

document.addEventListener(
    "keydown",
    unlockMatrixSound
);


/* ================================================================
   PASSWORD HELPERS
================================================================ */

function normalizeSecret(value) {

    return String(value || "")
        .replace(/[\s./-]/g, "")
        .trim();
}


const funnyPasswordMessages = [
    "Ram is watching you! How could you forget our special day? 🤨",

    "Password wrong-ah? The Love Police have been informed! 🚨😂",

    "Access denied! Please update your romantic memory immediately. 🧠❤️",

    "Even the Matrix knows the date. Why don't you? 😜",

    "Wrong password! One chocolate penalty has been added to your account. 🍫",

    "System says: Nice try, but your heart needs a software update! 😂",

    "Ayyo Ram! Think carefully before Raji sees this error! 😅",

    "Love authentication failed. Try using your heart instead ❤️"
];


function getRandomFunnyMessage() {

    const randomIndex =
        Math.floor(
            Math.random() *
            funnyPasswordMessages.length
        );

    return funnyPasswordMessages[
        randomIndex
    ];
}


/* ================================================================
   ERROR DIALOGUE
================================================================ */

function openPasswordError() {

    if (!passwordErrorDialog) {
        return;
    }

    if (funnyErrorMessage) {
        funnyErrorMessage.textContent =
            getRandomFunnyMessage();
    }

    passwordErrorDialog.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    window.setTimeout(
        () => {
            tryAgainButton?.focus();
        },
        50
    );
}


function closePasswordError() {

    if (!passwordErrorDialog) {
        return;
    }

    passwordErrorDialog.hidden =
        true;

    document.body.style.overflow =
        "";

    if (passInput) {
        passInput.value = "";
        passInput.focus();
    }
}


closeErrorDialogButton?.addEventListener(
    "click",
    closePasswordError
);


tryAgainButton?.addEventListener(
    "click",
    closePasswordError
);


passwordErrorDialog
    ?.querySelector(
        ".error-dialog-backdrop"
    )
    ?.addEventListener(
        "click",
        closePasswordError
    );


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            passwordErrorDialog &&
            !passwordErrorDialog.hidden
        ) {
            closePasswordError();
        }
    }
);


/* ================================================================
   ALLOW ONLY NUMBERS
================================================================ */

passInput?.addEventListener(
    "input",
    () => {

        passInput.value =
            passInput.value
                .replace(/\D/g, "")
                .slice(0, 8);

        passwordForm?.classList.remove(
            "shake"
        );
    }
);


/* ================================================================
   PASSWORD SUBMISSION
================================================================ */

passwordForm?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const enteredPassword =
            normalizeSecret(
                passInput?.value
            );

        const correctPassword =
            normalizeSecret(
                PAGE_4_SECRET_CODE
            );

        if (
            enteredPassword ===
            correctPassword
        ) {
            passwordForm.classList.remove(
                "shake"
            );

            if (enterBtn) {
                enterBtn.disabled = true;
                enterBtn.textContent =
                    "Access Granted ❤️";
            }

            stopMatrixSound();

            window.setTimeout(
                () => {

                    /*
                     * This opens Page 5 using your
                     * existing showPage function.
                     */

                    if (
                        typeof showPage ===
                        "function"
                    ) {
                        showPage("page-5");
                    } else {
                        /*
                         * Fallback navigation if your
                         * showPage function is unavailable.
                         */

                        document
                            .querySelectorAll(".page")
                            .forEach(
                                (page) => {
                                    page.classList.remove(
                                        "active"
                                    );
                                }
                            );

                        document
                            .getElementById("page-5")
                            ?.classList.add(
                                "active"
                            );
                    }

                    /*
                     * Starts the Page 5 countdown if
                     * your function already exists.
                     */

                    if (
                        typeof startCountdown ===
                        "function"
                    ) {
                        startCountdown();
                    }

                    if (enterBtn) {
                        enterBtn.disabled = false;
                        enterBtn.textContent =
                            "Come Inside ❤️";
                    }

                    if (passInput) {
                        passInput.value = "";
                    }

                },
                450
            );

            return;
        }

        passwordForm.classList.remove(
            "shake"
        );

        /*
         * Restart the shake animation.
         */

        void passwordForm.offsetWidth;

        passwordForm.classList.add(
            "shake"
        );

        openPasswordError();
    }
);


/* ================================================================
   PAGE 4 STARTUP
================================================================ */

function initializePageFour() {

    resizeMatrixCanvas();

    if (!matrixAnimationFrame) {
        matrixAnimationFrame =
            window.requestAnimationFrame(
                drawMatrix
            );
    }

    if (isPageFourActive()) {
        startMatrixSound();

        window.setTimeout(
            () => {
                passInput?.focus();
            },
            350
        );
    }
}


window.addEventListener(
    "resize",
    resizeMatrixCanvas
);


initializePageFour();


/* ================================================================
   PAGE CHANGE OBSERVER
   Automatically controls sound when Page 4 opens or closes.
================================================================ */

const pageFour =
    document.getElementById("page-4");

if (pageFour) {

    const pageFourObserver =
        new MutationObserver(
            () => {

                if (isPageFourActive()) {

                    resizeMatrixCanvas();
                    startMatrixSound();

                    window.setTimeout(
                        () => {
                            passInput?.focus();
                        },
                        300
                    );

                } else {

                    stopMatrixSound();

                    if (
                        passwordErrorDialog &&
                        !passwordErrorDialog.hidden
                    ) {
                        closePasswordError();
                    }
                }
            }
        );

    pageFourObserver.observe(
        pageFour,
        {
            attributes: true,
            attributeFilter: [
                "class"
            ]
        }
    );
}


    /* ============================================================
       PAGE 5: WEDDING COUNTDOWN
    ============================================================ */

    /* ================================================================
   PAGE 5: WEDDING COUNTDOWN AND BACKGROUND MUSIC
================================================================ */

/*
 * If WEDDING_DATE is already declared at the beginning of your
 * script.js, do not declare it again.
 *
 * Use this date format at the beginning of your script:
 *
 * const WEDDING_DATE =
 *     new Date("2026-11-11T09:15:00+05:30");
 */


let countdownTimer = null;

const pageFive =
    document.getElementById("page-5");

const loveBgm =
    document.getElementById("loveBgm");

const page5MusicButton =
    document.getElementById(
        "page5MusicButton"
    );

const page5MusicLabel =
    document.getElementById(
        "page5MusicLabel"
    );

const nextBtn =
    document.getElementById("nextBtn");

let pageFiveMusicPausedByUser = false;


/* ================================================================
   PAGE 5 ACTIVE CHECK
================================================================ */

function isPageFiveActive() {

    return Boolean(
        pageFive?.classList.contains(
            "active"
        )
    );
}


/* ================================================================
   COUNTDOWN
================================================================ */

function setCountdownValue(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        String(value).padStart(
            2,
            "0"
        );
}


function updateCountdown() {

    /*
     * WEDDING_DATE must be declared once at the
     * beginning of your main script.js file.
     */

    if (
        typeof WEDDING_DATE ===
            "undefined" ||
        !(WEDDING_DATE instanceof Date) ||
        Number.isNaN(
            WEDDING_DATE.getTime()
        )
    ) {
        console.error(
            "Please provide a valid WEDDING_DATE."
        );

        return;
    }

    const difference =
        Math.max(
            0,
            WEDDING_DATE.getTime() -
            Date.now()
        );

    const totalSeconds =
        Math.floor(
            difference / 1000
        );

    const days =
        Math.floor(
            totalSeconds / 86400
        );

    const hours =
        Math.floor(
            (
                totalSeconds %
                86400
            ) /
            3600
        );

    const minutes =
        Math.floor(
            (
                totalSeconds %
                3600
            ) /
            60
        );

    const seconds =
        totalSeconds % 60;

    setCountdownValue(
        "days",
        days
    );

    setCountdownValue(
        "hours",
        hours
    );

    setCountdownValue(
        "minutes",
        minutes
    );

    setCountdownValue(
        "seconds",
        seconds
    );

    if (
        difference === 0 &&
        countdownTimer
    ) {
        window.clearInterval(
            countdownTimer
        );

        countdownTimer = null;
    }
}


function startCountdown() {

    updateCountdown();

    if (!countdownTimer) {

        countdownTimer =
            window.setInterval(
                updateCountdown,
                1000
            );
    }
}


function stopCountdown() {

    if (!countdownTimer) {
        return;
    }

    window.clearInterval(
        countdownTimer
    );

    countdownTimer = null;
}


/* ================================================================
   MUSIC BUTTON APPEARANCE
================================================================ */

function updatePageFiveMusicButton(
    isPlaying
) {

    if (!page5MusicButton) {
        return;
    }

    page5MusicButton.classList.toggle(
        "music-paused",
        !isPlaying
    );

    page5MusicButton.setAttribute(
        "aria-label",
        isPlaying
            ? "Pause background music"
            : "Play background music"
    );

    page5MusicButton.title =
        isPlaying
            ? "Pause music"
            : "Play music";

    if (page5MusicLabel) {
        page5MusicLabel.textContent =
            isPlaying
                ? "Our Song"
                : "Play Song";
    }
}


/* ================================================================
   PAGE 5 MUSIC
================================================================ */

async function playPageFiveMusic() {

    if (
        !loveBgm ||
        !isPageFiveActive() ||
        pageFiveMusicPausedByUser
    ) {
        return;
    }

    try {
        loveBgm.loop = true;
        loveBgm.volume = 0.42;

        await loveBgm.play();

        updatePageFiveMusicButton(true);

    } catch (error) {

        /*
         * Some browsers block sound until a click,
         * touch, or keyboard interaction occurs.
         */

        updatePageFiveMusicButton(false);

        console.info(
            "Page 5 music is waiting for user interaction."
        );
    }
}


function stopPageFiveMusic(
    resetAudio = true
) {

    if (!loveBgm) {
        return;
    }

    loveBgm.pause();

    if (resetAudio) {
        loveBgm.currentTime = 0;
    }

    updatePageFiveMusicButton(false);
}


/* ================================================================
   MUSIC CONTROL BUTTON
================================================================ */

page5MusicButton?.addEventListener(
    "click",
    async () => {

        if (!loveBgm) {
            return;
        }

        if (loveBgm.paused) {

            pageFiveMusicPausedByUser =
                false;

            try {
                await loveBgm.play();

                updatePageFiveMusicButton(
                    true
                );

            } catch (error) {
                console.error(
                    "Unable to play Page 5 music.",
                    error
                );
            }

        } else {

            pageFiveMusicPausedByUser =
                true;

            loveBgm.pause();

            updatePageFiveMusicButton(
                false
            );
        }
    }
);


/* ================================================================
   BROWSER AUTOPLAY FALLBACK
================================================================ */

function unlockPageFiveMusic() {

    if (
        isPageFiveActive() &&
        !pageFiveMusicPausedByUser &&
        loveBgm?.paused
    ) {
        playPageFiveMusic();
    }
}


document.addEventListener(
    "pointerdown",
    unlockPageFiveMusic
);

document.addEventListener(
    "keydown",
    unlockPageFiveMusic
);


/* ================================================================
   PAGE 5 OPEN AND CLOSE
================================================================ */

function activatePageFiveFeatures() {

    if (!isPageFiveActive()) {
        return;
    }

    pageFiveMusicPausedByUser =
        false;

    startCountdown();
    playPageFiveMusic();
}


function deactivatePageFiveFeatures() {

    stopCountdown();

    /*
     * Audio stops and returns to the beginning
     * whenever Page 5 is closed.
     */

    stopPageFiveMusic(true);

    pageFiveMusicPausedByUser =
        false;
}


/* ================================================================
   WATCH PAGE 5 ACTIVE CLASS
================================================================ */

if (pageFive) {

    const pageFiveObserver =
        new MutationObserver(
            () => {

                if (isPageFiveActive()) {
                    activatePageFiveFeatures();
                } else {
                    deactivatePageFiveFeatures();
                }
            }
        );

    pageFiveObserver.observe(
        pageFive,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );
}


/* ================================================================
   NEXT PAGE BUTTON
================================================================ */

nextBtn?.addEventListener(
    "click",
    () => {

        deactivatePageFiveFeatures();

        if (
            typeof showPage ===
            "function"
        ) {
            showPage(
                "page-gallery"
            );

            return;
        }

        /*
         * Fallback if showPage() is unavailable.
         */

        document
            .querySelectorAll(".page")
            .forEach(
                (page) => {
                    page.classList.remove(
                        "active"
                    );
                }
            );

        document
            .getElementById(
                "page-gallery"
            )
            ?.classList.add(
                "active"
            );
    }
);


/* ================================================================
   INITIAL PAGE STATE
================================================================ */

updateCountdown();

if (isPageFiveActive()) {
    activatePageFiveFeatures();
} else {
    stopPageFiveMusic(true);
}

    /* ============================================================
       PAGE 6: GALLERY
    ============================================================ */

    /* ================================================================
   MEMORY GALLERY
================================================================ */

const galleryPage =
    document.getElementById(
        "page-gallery"
    );

const floatingHearts =
    document.getElementById(
        "floatingHearts"
    );

const imageTiles = [
    ...document.querySelectorAll(
        "#page-gallery .image-tile"
    )
];

const imageModal =
    document.getElementById(
        "imageModal"
    );

const expandedImg =
    document.getElementById(
        "expandedImg"
    );

const imageCaption =
    document.getElementById(
        "imageCaption"
    );

const closeImageButton =
    document.getElementById(
        "closeImageBtn"
    );

const specialMessageButton =
    document.getElementById(
        "specialMessageBtn"
    );

const galleryReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


/* ================================================================
   FLOATING BACKGROUND HEARTS
================================================================ */

function createFloatingHearts() {

    if (
        !floatingHearts ||
        floatingHearts.childElementCount > 0
    ) {
        return;
    }

    const count =
        galleryReducedMotion.matches
            ? 6
            : 22;

    for (
        let index = 0;
        index < count;
        index += 1
    ) {
        const heart =
            document.createElement(
                "span"
            );

        heart.className =
            "float-heart";

        heart.textContent =
            Math.random() > 0.45
                ? "♥"
                : "♡";

        heart.style.setProperty(
            "--heart-left",
            `${Math.random() * 100}%`
        );

        heart.style.setProperty(
            "--heart-size",
            `${
                12 +
                Math.random() * 28
            }px`
        );

        heart.style.setProperty(
            "--heart-duration",
            `${
                8 +
                Math.random() * 9
            }s`
        );

        heart.style.setProperty(
            "--heart-delay",
            `${
                Math.random() * -15
            }s`
        );

        heart.style.setProperty(
            "--heart-sway",
            `${
                -70 +
                Math.random() * 140
            }px`
        );

        floatingHearts.appendChild(
            heart
        );
    }
}


/* ================================================================
   HEART SPLASH WHEN A CARD IS REVEALED
================================================================ */

function createHeartSplash(tile) {

    if (
        galleryReducedMotion.matches ||
        !tile
    ) {
        return;
    }

    const heartCount = 15;

    for (
        let index = 0;
        index < heartCount;
        index += 1
    ) {
        const heart =
            document.createElement(
                "span"
            );

        const angle =
            (
                Math.PI *
                2 *
                index
            ) /
            heartCount;

        const distance =
            65 +
            Math.random() * 90;

        heart.className =
            "mini-heart";

        heart.textContent =
            Math.random() > 0.35
                ? "♥"
                : "♡";

        heart.style.setProperty(
            "--heart-x",
            `${
                Math.cos(angle) *
                distance
            }px`
        );

        heart.style.setProperty(
            "--heart-y",
            `${
                Math.sin(angle) *
                distance
            }px`
        );

        heart.style.setProperty(
            "--heart-rotate",
            `${
                -100 +
                Math.random() * 200
            }deg`
        );

        heart.style.setProperty(
            "--heart-size",
            `${
                12 +
                Math.random() * 16
            }px`
        );

        heart.style.setProperty(
            "--heart-duration",
            `${
                760 +
                Math.random() * 280
            }ms`
        );

        tile.appendChild(heart);

        heart.addEventListener(
            "animationend",
            () => {
                heart.remove();
            },
            {
                once: true
            }
        );

        /*
         * Removes the heart even when an animation
         * is interrupted by a page change.
         */

        window.setTimeout(
            () => {
                heart.remove();
            },
            1300
        );
    }
}


/* ================================================================
   OPTIONAL REVEAL SOUND
================================================================ */

function playGalleryRevealSound() {

    /*
     * This uses your existing audio.swirl and
     * safePlay() functions when available.
     */

    if (
        typeof safePlay === "function" &&
        typeof audio !== "undefined" &&
        audio?.swirl
    ) {
        safePlay(
            audio.swirl,
            true
        );
    }
}


/* ================================================================
   IMAGE DIALOG
================================================================ */

function openImageDialog(tile) {

    if (
        !tile ||
        !imageModal ||
        !expandedImg ||
        !imageCaption
    ) {
        return;
    }

    const tileImage =
        tile.querySelector("img");

    expandedImg.src =
        tile.dataset.img ||
        tileImage?.src ||
        "";

    expandedImg.alt =
        tileImage?.alt ||
        "Expanded memory";

    imageCaption.textContent =
        tile.dataset.caption ||
        "Our special memory";

    if (
        typeof imageModal.showModal ===
        "function"
    ) {
        if (!imageModal.open) {
            imageModal.showModal();
        }
    } else {
        imageModal.setAttribute(
            "open",
            ""
        );
    }
}


function closeImageDialog() {

    if (!imageModal) {
        return;
    }

    if (
        typeof imageModal.close ===
            "function" &&
        imageModal.open
    ) {
        imageModal.close();
    } else {
        imageModal.removeAttribute(
            "open"
        );
    }
}


/* ================================================================
   CARD REVEAL
================================================================ */

imageTiles.forEach(
    (tile) => {

        let isAnimating = false;

        tile.addEventListener(
            "click",
            () => {

                /*
                 * Prevent repeated clicks during the
                 * reveal animation.
                 */

                if (isAnimating) {
                    return;
                }

                /*
                 * First click reveals the hidden image.
                 */

                if (
                    !tile.classList.contains(
                        "revealed"
                    )
                ) {
                    isAnimating = true;

                    tile.classList.add(
                        "is-revealing"
                    );

                    tile.setAttribute(
                        "aria-pressed",
                        "true"
                    );

                    playGalleryRevealSound();

                    createHeartSplash(tile);

                    const revealDuration =
                        galleryReducedMotion.matches
                            ? 10
                            : 1080;

                    window.setTimeout(
                        () => {
                            tile.classList.remove(
                                "is-revealing"
                            );

                            tile.classList.add(
                                "revealed"
                            );

                            tile.setAttribute(
                                "aria-label",
                                `Open ${
                                    tile.dataset.caption ||
                                    "memory"
                                }`
                            );

                            isAnimating = false;
                        },
                        revealDuration
                    );

                    return;
                }

                /*
                 * Clicking a revealed image opens it
                 * in the full-size dialog.
                 */

                openImageDialog(tile);
            }
        );
    }
);


/* ================================================================
   CLOSE IMAGE DIALOG
================================================================ */

closeImageButton?.addEventListener(
    "click",
    closeImageDialog
);


imageModal?.addEventListener(
    "click",
    (event) => {

        /*
         * Clicking the dark area around the image
         * closes the dialog.
         */

        if (
            event.target === imageModal
        ) {
            closeImageDialog();
        }
    }
);


imageModal?.addEventListener(
    "cancel",
    (event) => {

        event.preventDefault();

        closeImageDialog();
    }
);


/* ================================================================
   REDIRECT TO NEXT PAGE
================================================================ */

specialMessageButton?.addEventListener(
    "click",
    () => {

        closeImageDialog();

        /*
         * Opens the next page using your existing
         * page navigation function.
         */

        if (
            typeof showPage ===
            "function"
        ) {
            showPage(
                "page-reasons"
            );

            return;
        }

        /*
         * Fallback navigation if showPage() is
         * unavailable.
         */

        document
            .querySelectorAll(".page")
            .forEach(
                (page) => {
                    page.classList.remove(
                        "active"
                    );
                }
            );

        document
            .getElementById(
                "page-reasons"
            )
            ?.classList.add(
                "active"
            );
    }
);


/* ================================================================
   INITIALIZE GALLERY
================================================================ */

createFloatingHearts();


/*
 * Recreate background hearts and reset the gallery
 * scroll position whenever the page becomes active.
 */

if (galleryPage) {

    const galleryObserver =
        new MutationObserver(
            () => {

                if (
                    galleryPage.classList.contains(
                        "active"
                    )
                ) {
                    createFloatingHearts();

                    galleryPage.scrollTo({
                        top: 0,
                        behavior: "auto"
                    });
                } else {
                    closeImageDialog();
                }
            }
        );

    galleryObserver.observe(
        galleryPage,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );
}


    /* ============================================================
       PAGE 7: LOVE REASONS
    ============================================================ */

    document
        .querySelectorAll(
            ".reason-card"
        )
        .forEach((card) => {

            card.setAttribute(
                "aria-pressed",
                "false"
            );


            card.addEventListener(
                "click",
                () => {

                    const isOpen =
                        card.classList.toggle(
                            "open"
                        );


                    card.setAttribute(
                        "aria-pressed",
                        String(isOpen)
                    );
                }
            );
        });


    /* ============================================================
       PAGE 8: VOICE MESSAGE
    ============================================================ */

    /* ================================================================
   LOVE LETTER MESSAGE PAGE
================================================================ */

const loveMessagePage =
    document.getElementById(
        "page-voice"
    );

const loveLetterStage =
    document.getElementById(
        "loveLetterStage"
    );

const openLoveLetterButton =
    document.getElementById(
        "openLoveLetterBtn"
    );

const loveMessageLines = [
    ...document.querySelectorAll(
        "#page-voice .love-message-line"
    )
];

const letterSignature =
    document.querySelector(
        "#page-voice .letter-signature"
    );

const messageNextButton =
    document.getElementById(
        "messageNextBtn"
    );

const loveLetterReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

let loveLetterOpened = false;
let loveLetterTimers = [];


/* ================================================================
   CLEAR LOVE-LETTER TIMERS
================================================================ */

function clearLoveLetterTimers() {

    loveLetterTimers.forEach(
        (timer) => {
            window.clearTimeout(timer);
        }
    );

    loveLetterTimers = [];
}


/* ================================================================
   OPEN THE LOVE LETTER
================================================================ */

function openLoveLetter() {

    if (
        loveLetterOpened ||
        !loveLetterStage
    ) {
        return;
    }

    loveLetterOpened = true;

    loveLetterStage.classList.add(
        "is-opening"
    );

    const openingDelay =
        loveLetterReducedMotion.matches
            ? 10
            : 780;

    const openingTimer =
        window.setTimeout(
            () => {

                loveLetterStage.classList.remove(
                    "is-opening"
                );

                loveLetterStage.classList.add(
                    "is-open"
                );

                revealLoveMessageLines();

            },
            openingDelay
        );

    loveLetterTimers.push(
        openingTimer
    );
}


/* ================================================================
   REVEAL MESSAGE LINE BY LINE
================================================================ */

function revealLoveMessageLines() {

    const lineDelay =
        loveLetterReducedMotion.matches
            ? 0
            : 700;

    const firstLineDelay =
        loveLetterReducedMotion.matches
            ? 10
            : 650;

    loveMessageLines.forEach(
        (line, index) => {

            const timer =
                window.setTimeout(
                    () => {
                        line.classList.add(
                            "show"
                        );
                    },
                    firstLineDelay +
                    index * lineDelay
                );

            loveLetterTimers.push(
                timer
            );
        }
    );

    const signatureDelay =
        firstLineDelay +
        loveMessageLines.length *
        lineDelay;

    const signatureTimer =
        window.setTimeout(
            () => {

                letterSignature?.classList.add(
                    "show"
                );

            },
            signatureDelay
        );

    loveLetterTimers.push(
        signatureTimer
    );

    const nextButtonTimer =
        window.setTimeout(
            () => {

                messageNextButton?.classList.add(
                    "show"
                );

                /*
                 * Scroll the button gently into view
                 * on smaller screens.
                 */

                if (
                    window.innerWidth <= 600 &&
                    messageNextButton
                ) {
                    messageNextButton.scrollIntoView({
                        behavior:
                            loveLetterReducedMotion.matches
                                ? "auto"
                                : "smooth",
                        block: "center"
                    });
                }

            },
            signatureDelay +
            (
                loveLetterReducedMotion.matches
                    ? 10
                    : 700
            )
        );

    loveLetterTimers.push(
        nextButtonTimer
    );
}


/* ================================================================
   OPEN BUTTON
================================================================ */

openLoveLetterButton?.addEventListener(
    "click",
    openLoveLetter
);


/* ================================================================
   NEXT PAGE
================================================================ */

messageNextButton?.addEventListener(
    "click",
    () => {

        const nextPageId =
            messageNextButton.dataset
                .loveTarget ||
            "page-story";

        if (
            typeof showPage ===
            "function"
        ) {
            showPage(nextPageId);
            return;
        }

        /*
         * Fallback navigation if showPage()
         * is unavailable.
         */

        document
            .querySelectorAll(".page")
            .forEach(
                (page) => {
                    page.classList.remove(
                        "active"
                    );
                }
            );

        document
            .getElementById(nextPageId)
            ?.classList.add(
                "active"
            );
    }
);


/* ================================================================
   RESET PAGE
================================================================ */

function resetLoveLetterPage() {

    clearLoveLetterTimers();

    loveLetterOpened = false;

    loveLetterStage?.classList.remove(
        "is-opening",
        "is-open"
    );

    loveMessageLines.forEach(
        (line) => {
            line.classList.remove(
                "show"
            );
        }
    );

    letterSignature?.classList.remove(
        "show"
    );

    messageNextButton?.classList.remove(
        "show"
    );
}


/* ================================================================
   PAGE OBSERVER
================================================================ */

if (loveMessagePage) {

    const loveMessagePageObserver =
        new MutationObserver(
            () => {

                if (
                    loveMessagePage.classList.contains(
                        "active"
                    )
                ) {
                    /*
                     * Always begin at the top when
                     * entering this page.
                     */

                    loveMessagePage.scrollTo({
                        top: 0,
                        behavior: "auto"
                    });

                } else {

                    /*
                     * The letter closes and resets when
                     * the user leaves the page.
                     */

                    resetLoveLetterPage();
                }
            }
        );

    loveMessagePageObserver.observe(
        loveMessagePage,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );
}


    /* ============================================================
       PAGE 10: COUPLE QUIZ
    ============================================================ */

    /* ================================================================
   RELATIONSHIP QUIZ – 10 QUESTIONS
================================================================ */

const quizQuestions = [
    {
        question:
            "Who is the more dramatic one in this relationship?",

        answers: [
            "Ram",
            "Raji",
            "Both of us 😂"
        ],

        correct: 2,

        feedback:
            "Correct! Namma rendu perum perfect-ah balanced drama team. 😂❤️"
    },

    {
        question:
            "What is Ram's favourite place?",

        answers: [
            "Anywhere with Raji",
            "A five-star hotel",
            "The cricket ground"
        ],

        correct: 0,

        feedback:
            "Exactly! Raji irukkura idam dhaan Ennaku favourite place. ❤️"
    },

    {
        question:
            "Who will win most of our future arguments?",

        answers: [
            "Ram",
            "Raji",
            "The person holding the food"
        ],

        correct: 2,

        feedback:
            "Correct, Azhagi! Na already Unkitta Maatikita 😂"
    },

    {
        question:
            "What is our relationship plan?",

        answers: [
            "Temporary trial",
            "Lifetime subscription",
            "Ask again later"
        ],

        correct: 1,

        feedback:
            "Lifetime subscription activated! Cancellation option available illa. ❤️"
    },

    {
        question:
            "How much does Ram love Raji?",

        answers: [
            "A little",
            "A lot",
            "More than words can explain"
        ],

        correct: 2,

        feedback:
            "Answer locked: words-la explain panna mudiyadha alavukku. ❤️"
    },

    {
        question:
            "What happens when Ram sees Raji's smile?",

        answers: [
            "His mood becomes better",
            "He forgets all his worries",
            "Both of these ❤️"
        ],

        correct: 2,

        feedback:
            "Correct! Un sirippu dhaan Ennoda favourite magic. ✨❤️"
    },

    {
        question:
            "What should Ram do when Raji is angry?",

        answers: [
            "Say sorry",
            "Bring food and give her a hug",
            "All of the above 😂"
        ],

        correct: 2,

        feedback:
            "Correct! Emergency love protocol successfully activated. 😂❤️"
    },

    {
        question:
            "What is the secret ingredient in our relationship?",

        answers: [
            "Love",
            "Understanding",
            "Love, understanding and unlimited comedy"
        ],

        correct: 2,

        feedback:
            "Perfect! Love-oda konjam comedy serndha life romba azhaga irukkum. ❤️"
    },

    {
        question:
            "What does Ram promise to do every day?",

        answers: [
            "Choose Raji again and again",
            "Steal all the blankets",
            "Pretend to forget everything"
        ],

        correct: 0,

        feedback:
            "Correct! Ovvoru naalum unnai thirumba thirumba choose pannuvae. ❤️"
    },

    {
        question:
            "What is the final destination of our love story?",

        answers: [
            "Grow old together",
            "Create endless memories",
            "Both of these, forever ❤️"
        ],

        correct: 2,

        feedback:
            "Correct! Innaikku, naalaikku, eppavume namma onna dhaan. ❤️"
    }
];


/* ================================================================
   ELEMENTS
================================================================ */

const quizPage =
    document.getElementById(
        "page-quiz"
    );

const quizBox =
    document.getElementById(
        "quizBox"
    );

const quizQuestion =
    document.getElementById(
        "quizQuestion"
    );

const quizQuestionNumber =
    document.getElementById(
        "quizQuestionNumber"
    );

const quizAnswers =
    document.getElementById(
        "quizAnswers"
    );

const quizFeedback =
    document.getElementById(
        "quizFeedback"
    );

const quizProgress =
    document.getElementById(
        "quizProgress"
    );

const quizProgressPercentage =
    document.getElementById(
        "quizProgressPercentage"
    );

const quizProgressBar =
    document.getElementById(
        "quizProgressBar"
    );

const quizNextQuestionButton =
    document.getElementById(
        "quizNextQuestionBtn"
    );

const quizResult =
    document.getElementById(
        "quizResult"
    );

const quizWrongDialog =
    document.getElementById(
        "quizWrongDialog"
    );

const quizWrongMessage =
    document.getElementById(
        "quizWrongMessage"
    );

const closeQuizDialogButton =
    document.getElementById(
        "closeQuizDialogBtn"
    );

const quizFinalNextButton =
    document.getElementById(
        "quizFinalNextBtn"
    );

const quizReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


/* ================================================================
   QUIZ STATE
================================================================ */

let currentQuizQuestion = 0;
let quizLocked = false;
let quizDialogOpen = false;


/* ================================================================
   RENDER CURRENT QUESTION
================================================================ */

function renderQuizQuestion() {

    const currentItem =
        quizQuestions[
            currentQuizQuestion
        ];

    if (
        !currentItem ||
        !quizQuestion ||
        !quizAnswers
    ) {
        return;
    }

    quizLocked = false;

    quizQuestion.textContent =
        currentItem.question;

    if (quizQuestionNumber) {

        quizQuestionNumber.textContent =
            String(
                currentQuizQuestion + 1
            ).padStart(
                2,
                "0"
            );
    }

    if (quizFeedback) {

        quizFeedback.textContent = "";

        quizFeedback.classList.remove(
            "correct-feedback",
            "wrong-feedback"
        );
    }

    if (quizNextQuestionButton) {

        quizNextQuestionButton.hidden =
            true;
    }

    const progressPercentage =
        (
            (
                currentQuizQuestion + 1
            ) /
            quizQuestions.length
        ) *
        100;

    if (quizProgress) {

        quizProgress.textContent =
            `Question ${
                currentQuizQuestion + 1
            } / ${
                quizQuestions.length
            }`;
    }

    if (quizProgressPercentage) {

        quizProgressPercentage.textContent =
            `${Math.round(
                progressPercentage
            )}%`;
    }

    if (quizProgressBar) {

        quizProgressBar.style.width =
            `${progressPercentage}%`;
    }

    quizAnswers.replaceChildren();

    currentItem.answers.forEach(
        (
            answer,
            answerIndex
        ) => {

            const answerButton =
                document.createElement(
                    "button"
                );

            answerButton.className =
                "quiz-answer";

            answerButton.type =
                "button";

            answerButton.textContent =
                answer;

            answerButton.dataset
                .answerLabel =
                String.fromCharCode(
                    65 + answerIndex
                );

            answerButton.addEventListener(
                "click",
                () => {

                    answerQuizQuestion(
                        answerIndex
                    );
                }
            );

            quizAnswers.appendChild(
                answerButton
            );
        }
    );
}


/* ================================================================
   ANSWER QUESTION
================================================================ */

function answerQuizQuestion(
    selectedAnswerIndex
) {

    if (quizLocked) {
        return;
    }

    const currentItem =
        quizQuestions[
            currentQuizQuestion
        ];

    if (!currentItem) {
        return;
    }

    quizLocked = true;

    const answerButtons = [
        ...quizAnswers.querySelectorAll(
            ".quiz-answer"
        )
    ];

    const selectedButton =
        answerButtons[
            selectedAnswerIndex
        ];

    const correctButton =
        answerButtons[
            currentItem.correct
        ];

    const selectedCorrectAnswer =
        selectedAnswerIndex ===
        currentItem.correct;

    /*
     * Disable all answers after one selection.
     */

    answerButtons.forEach(
        (button) => {

            button.disabled = true;
        }
    );

    /*
     * Always highlight the correct answer
     * using green.
     */

    correctButton?.classList.add(
        "correct-answer"
    );

    if (selectedCorrectAnswer) {

        selectedButton?.classList.add(
            "correct-answer"
        );

        if (quizFeedback) {

            quizFeedback.textContent =
                currentItem.feedback;

            quizFeedback.classList.add(
                "correct-feedback"
            );
        }

    } else {

        /*
         * Highlight selected wrong answer
         * using red.
         */

        selectedButton?.classList.add(
            "wrong-answer"
        );

        if (quizFeedback) {

            quizFeedback.textContent =
                `Nice try, Azhagi! Correct answer green color-la highlight pannirukken. ${currentItem.feedback}`;

            quizFeedback.classList.add(
                "wrong-feedback"
            );
        }

        openQuizWrongDialog(
            currentItem.answers[
                currentItem.correct
            ]
        );
    }

    /*
     * Display Aduthu Polama button.
     * It will not move automatically.
     */

    if (quizNextQuestionButton) {

        quizNextQuestionButton.hidden =
            false;
    }
}


/* ================================================================
   WRONG ANSWER DIALOG
================================================================ */

function openQuizWrongDialog(
    correctAnswer
) {

    if (!quizWrongDialog) {
        return;
    }

    quizDialogOpen = true;

    if (quizWrongMessage) {

        quizWrongMessage.textContent =
            `Thappana answer select pannita! Correct answer “${correctAnswer}”. Green color-la highlight pannirukken. 😂❤️`;
    }

    quizWrongDialog.hidden =
        false;

    document.body.style.overflow =
        "hidden";

    window.setTimeout(
        () => {

            closeQuizDialogButton
                ?.focus();

        },
        50
    );
}


function closeQuizWrongDialog() {

    if (
        !quizWrongDialog ||
        quizWrongDialog.hidden
    ) {
        return;
    }

    quizWrongDialog.hidden =
        true;

    quizDialogOpen = false;

    document.body.style.overflow =
        "";

    /*
     * Return focus to the Aduthu Polama
     * button. The question stays visible.
     */

    window.setTimeout(
        () => {

            quizNextQuestionButton
                ?.focus();

        },
        50
    );
}


closeQuizDialogButton
    ?.addEventListener(
        "click",
        closeQuizWrongDialog
    );


document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            quizDialogOpen
        ) {
            closeQuizWrongDialog();
        }
    }
);


/* ================================================================
   ADUTHU POLAMA BUTTON
================================================================ */

quizNextQuestionButton
    ?.addEventListener(
        "click",
        () => {

            /*
             * Do not proceed before an answer
             * has been selected.
             */

            if (!quizLocked) {
                return;
            }

            currentQuizQuestion += 1;

            if (
                currentQuizQuestion <
                quizQuestions.length
            ) {
                renderQuizQuestion();

                quizBox?.scrollIntoView({
                    behavior:
                        quizReducedMotion.matches
                            ? "auto"
                            : "smooth",
                    block: "center"
                });

                return;
            }

            showFinalQuizResult();
        }
    );


/* ================================================================
   FINAL RESULT – ALWAYS 100%
================================================================ */

function showFinalQuizResult() {

    if (quizBox) {
        quizBox.hidden = true;
    }

    if (!quizResult) {
        return;
    }

    quizResult.hidden = false;

    quizResult.classList.remove(
        "show-result"
    );

    /*
     * Restart the 100% loading animation.
     */

    void quizResult.offsetWidth;

    window.setTimeout(
        () => {

            quizResult.classList.add(
                "show-result"
            );

        },
        quizReducedMotion.matches
            ? 10
            : 200
    );

    quizResult.scrollIntoView({
        behavior:
            quizReducedMotion.matches
                ? "auto"
                : "smooth",
        block: "center"
    });
}


/* ================================================================
   FINAL NEXT PAGE
================================================================ */

quizFinalNextButton
    ?.addEventListener(
        "click",
        () => {

            const nextPageId =
                quizFinalNextButton.dataset
                    .loveTarget ||
                "page-puzzle";

            if (
                typeof showPage ===
                "function"
            ) {
                showPage(nextPageId);
                return;
            }

            /*
             * Fallback page navigation.
             */

            document
                .querySelectorAll(".page")
                .forEach(
                    (page) => {

                        page.classList.remove(
                            "active"
                        );
                    }
                );

            document
                .getElementById(
                    nextPageId
                )
                ?.classList.add(
                    "active"
                );
        }
    );


/* ================================================================
   RESET QUIZ
================================================================ */

function resetRelationshipQuiz() {

    currentQuizQuestion = 0;
    quizLocked = false;

    if (
        quizWrongDialog &&
        !quizWrongDialog.hidden
    ) {
        quizWrongDialog.hidden =
            true;

        quizDialogOpen = false;

        document.body.style.overflow =
            "";
    }

    if (quizBox) {
        quizBox.hidden = false;
    }

    if (quizResult) {

        quizResult.hidden = true;

        quizResult.classList.remove(
            "show-result"
        );
    }

    if (quizNextQuestionButton) {

        quizNextQuestionButton.hidden =
            true;
    }

    renderQuizQuestion();
}


/* ================================================================
   INITIALIZE
================================================================ */

renderQuizQuestion();


/*
 * Restart the quiz whenever Page Quiz
 * becomes active.
 */

if (quizPage) {

    const quizPageObserver =
        new MutationObserver(
            () => {

                if (
                    quizPage.classList.contains(
                        "active"
                    )
                ) {
                    resetRelationshipQuiz();

                    quizPage.scrollTo({
                        top: 0,
                        behavior: "auto"
                    });

                } else {

                    if (
                        quizWrongDialog &&
                        !quizWrongDialog.hidden
                    ) {
                        quizWrongDialog.hidden =
                            true;

                        quizDialogOpen = false;

                        document.body.style
                            .overflow = "";
                    }
                }
            }
        );

    quizPageObserver.observe(
        quizPage,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );
}


    /* ============================================================
       PAGE 11: PHOTO PUZZLE
    ============================================================ */

    /* ================================================================
   LOVE PUZZLE
================================================================ */

const puzzlePage =
    document.getElementById(
        "page-puzzle"
    );

const lovePuzzle =
    document.getElementById(
        "lovePuzzle"
    );

const puzzleStatus =
    document.getElementById(
        "puzzleStatus"
    );

const puzzleComplete =
    document.getElementById(
        "puzzleComplete"
    );

const shufflePuzzleButton =
    document.getElementById(
        "shufflePuzzleBtn"
    );

const puzzleAlternative =
    document.getElementById(
        "puzzleAlternative"
    );

const referencePictureButton =
    document.getElementById(
        "referencePictureBtn"
    );

const referencePicture =
    document.getElementById(
        "referencePicture"
    );

const loveUnlockForm =
    document.getElementById(
        "loveUnlockForm"
    );

const loveUnlockInput =
    document.getElementById(
        "loveUnlockInput"
    );

const loveUnlockSubmit =
    document.getElementById(
        "loveUnlockSubmit"
    );

const loveUnlockFeedback =
    document.getElementById(
        "loveUnlockFeedback"
    );

const puzzleReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


/* ================================================================
   PUZZLE SETTINGS
================================================================ */

const puzzleSize = 3;

const requiredLovePhrase =
    "I Love You Ramprasath";

let puzzleOrder = [];
let selectedPuzzleIndex = null;
let puzzleSolved = false;


/* ================================================================
   SET PUZZLE IMAGE
================================================================ */

function setPuzzleImage() {

    if (!lovePuzzle) {
        return;
    }

    const imageSource =
        lovePuzzle.dataset.image ||
        "IMG_20260720_224058_253.jpg";

    lovePuzzle.style.setProperty(
        "--puzzle-image",
        `url("${imageSource}")`
    );
}


/* ================================================================
   CREATE SHUFFLED ORDER
================================================================ */

function createShuffledPuzzleOrder() {

    const order =
        Array.from(
            {
                length:
                    puzzleSize *
                    puzzleSize
            },
            (
                unused,
                index
            ) => index
        );

    /*
     * Shuffle until the image is not already
     * in the completed position.
     */

    do {
        for (
            let index =
                order.length - 1;
            index > 0;
            index -= 1
        ) {
            const randomIndex =
                Math.floor(
                    Math.random() *
                    (index + 1)
                );

            [
                order[index],
                order[randomIndex]
            ] = [
                order[randomIndex],
                order[index]
            ];
        }
    } while (
        order.every(
            (
                value,
                index
            ) => value === index
        )
    );

    return order;
}


/* ================================================================
   RENDER PUZZLE
================================================================ */

function renderPuzzle() {

    if (!lovePuzzle) {
        return;
    }

    lovePuzzle.replaceChildren();

    puzzleOrder.forEach(
        (
            correctPosition,
            currentPosition
        ) => {

            const row =
                Math.floor(
                    correctPosition /
                    puzzleSize
                );

            const column =
                correctPosition %
                puzzleSize;

            const piece =
                document.createElement(
                    "button"
                );

            piece.className =
                "puzzle-piece";

            piece.type =
                "button";

            piece.disabled =
                puzzleSolved;

            piece.setAttribute(
                "aria-label",
                `Puzzle piece ${
                    currentPosition + 1
                }`
            );

            piece.style.backgroundPosition =
                `${
                    column *
                    50
                }% ${
                    row *
                    50
                }%`;

            if (
                currentPosition ===
                selectedPuzzleIndex
            ) {
                piece.classList.add(
                    "selected"
                );

                piece.setAttribute(
                    "aria-pressed",
                    "true"
                );
            } else {
                piece.setAttribute(
                    "aria-pressed",
                    "false"
                );
            }

            piece.addEventListener(
                "click",
                () => {
                    selectPuzzlePiece(
                        currentPosition
                    );
                }
            );

            lovePuzzle.appendChild(
                piece
            );
        }
    );
}


/* ================================================================
   SELECT AND SWAP PIECES
================================================================ */

function selectPuzzlePiece(index) {

    if (puzzleSolved) {
        return;
    }

    /*
     * Select the first piece.
     */

    if (
        selectedPuzzleIndex ===
        null
    ) {
        selectedPuzzleIndex = index;

        if (puzzleStatus) {
            puzzleStatus.textContent =
                "Now choose the piece you want to swap it with ❤️";
        }

        renderPuzzle();

        return;
    }

    /*
     * Clicking the selected piece again clears
     * the selection.
     */

    if (
        selectedPuzzleIndex ===
        index
    ) {
        selectedPuzzleIndex = null;

        if (puzzleStatus) {
            puzzleStatus.textContent =
                "Selection cleared. Choose two pieces ❤️";
        }

        renderPuzzle();

        return;
    }

    /*
     * Swap the two puzzle pieces.
     */

    [
        puzzleOrder[
            selectedPuzzleIndex
        ],
        puzzleOrder[index]
    ] = [
        puzzleOrder[index],
        puzzleOrder[
            selectedPuzzleIndex
        ]
    ];

    selectedPuzzleIndex = null;

    renderPuzzle();

    const solved =
        puzzleOrder.every(
            (
                value,
                position
            ) => value === position
        );

    if (solved) {
        completeLovePuzzle();
    } else if (puzzleStatus) {
        puzzleStatus.textContent =
            "Good swap! Choose another two pieces ❤️";
    }
}


/* ================================================================
   COMPLETE PUZZLE
================================================================ */

function completeLovePuzzle() {

    puzzleSolved = true;
    selectedPuzzleIndex = null;

    /*
     * Display the completed picture.
     */

    puzzleOrder =
        Array.from(
            {
                length:
                    puzzleSize *
                    puzzleSize
            },
            (
                unused,
                index
            ) => index
        );

    lovePuzzle?.classList.add(
        "is-solved"
    );

    renderPuzzle();

    if (puzzleStatus) {
        puzzleStatus.textContent =
            "Perfect! You completed our picture. ❤️";
    }

    if (shufflePuzzleButton) {
        shufflePuzzleButton.hidden =
            true;
    }

    if (puzzleAlternative) {
        puzzleAlternative.hidden =
            true;
    }

    if (puzzleComplete) {
        puzzleComplete.hidden =
            false;
    }

    window.setTimeout(
        () => {
            puzzleComplete?.scrollIntoView({
                behavior:
                    puzzleReducedMotion.matches
                        ? "auto"
                        : "smooth",
                block: "center"
            });
        },
        puzzleReducedMotion.matches
            ? 10
            : 350
    );
}


/* ================================================================
   SHUFFLE PUZZLE
================================================================ */

function shufflePuzzle() {

    puzzleOrder =
        createShuffledPuzzleOrder();

    selectedPuzzleIndex = null;
    puzzleSolved = false;

    lovePuzzle?.classList.remove(
        "is-solved"
    );

    if (puzzleComplete) {
        puzzleComplete.hidden =
            true;
    }

    if (shufflePuzzleButton) {
        shufflePuzzleButton.hidden =
            false;
    }

    if (puzzleAlternative) {
        puzzleAlternative.hidden =
            false;
    }

    if (puzzleStatus) {
        puzzleStatus.textContent =
            "Select two pieces to swap them ❤️";
    }

    if (loveUnlockInput) {
        loveUnlockInput.value = "";
        loveUnlockInput.disabled =
            false;

        loveUnlockInput.classList.remove(
            "input-error"
        );
    }

    if (loveUnlockSubmit) {
        loveUnlockSubmit.disabled =
            false;
    }

    if (loveUnlockFeedback) {
        loveUnlockFeedback.textContent =
            "";

        loveUnlockFeedback.classList.remove(
            "success",
            "error"
        );
    }

    renderPuzzle();
}


/* ================================================================
   ALTERNATIVE LOVE PHRASE
================================================================ */

function normalizeLovePhrase(value) {

    return String(value || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}


loveUnlockForm?.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        const enteredPhrase =
            normalizeLovePhrase(
                loveUnlockInput?.value
            );

        const correctPhrase =
            normalizeLovePhrase(
                requiredLovePhrase
            );

        if (
            enteredPhrase ===
            correctPhrase
        ) {
            if (loveUnlockFeedback) {
                loveUnlockFeedback.textContent =
                    "Love password accepted! Unlocking our picture… ❤️";

                loveUnlockFeedback.classList.remove(
                    "error"
                );

                loveUnlockFeedback.classList.add(
                    "success"
                );
            }

            if (loveUnlockInput) {
                loveUnlockInput.disabled =
                    true;
            }

            if (loveUnlockSubmit) {
                loveUnlockSubmit.disabled =
                    true;
            }

            window.setTimeout(
                completeLovePuzzle,
                puzzleReducedMotion.matches
                    ? 50
                    : 700
            );

            return;
        }

        if (loveUnlockFeedback) {
            loveUnlockFeedback.textContent =
                'Ayyo! Correct-ah “I Love You Ramprasath” nu type pannanum. 😂❤️';

            loveUnlockFeedback.classList.remove(
                "success"
            );

            loveUnlockFeedback.classList.add(
                "error"
            );
        }

        if (loveUnlockInput) {
            loveUnlockInput.classList.remove(
                "input-error"
            );

            void loveUnlockInput.offsetWidth;

            loveUnlockInput.classList.add(
                "input-error"
            );

            loveUnlockInput.select();
        }
    }
);


loveUnlockInput?.addEventListener(
    "input",
    () => {

        loveUnlockInput.classList.remove(
            "input-error"
        );

        if (loveUnlockFeedback) {
            loveUnlockFeedback.textContent =
                "";

            loveUnlockFeedback.classList.remove(
                "success",
                "error"
            );
        }
    }
);


/* ================================================================
   REFERENCE PICTURE
================================================================ */

referencePictureButton?.addEventListener(
    "click",
    () => {

        if (!referencePicture) {
            return;
        }

        const willOpen =
            referencePicture.hidden;

        referencePicture.hidden =
            !willOpen;

        referencePictureButton.setAttribute(
            "aria-expanded",
            String(willOpen)
        );

        const buttonText =
            referencePictureButton.querySelector(
                "span:first-child"
            );

        if (buttonText) {
            buttonText.textContent =
                willOpen
                    ? "🙈 Hide Original Picture"
                    : "👀 View Original Picture";
        }
    }
);


/* ================================================================
   SHUFFLE BUTTON
================================================================ */

shufflePuzzleButton?.addEventListener(
    "click",
    shufflePuzzle
);


/* ================================================================
   INITIALIZE PUZZLE
================================================================ */

setPuzzleImage();
shufflePuzzle();


/*
 * Reset the puzzle whenever the page opens again.
 */

if (puzzlePage) {

    const puzzlePageObserver =
        new MutationObserver(
            () => {

                if (
                    puzzlePage.classList.contains(
                        "active"
                    )
                ) {
                    shufflePuzzle();

                    puzzlePage.scrollTo({
                        top: 0,
                        behavior: "auto"
                    });
                }
            }
        );

    puzzlePageObserver.observe(
        puzzlePage,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );
}

"use strict";

/* ================================================================
   FUTURE HOME — SIX OPENING DOORS
================================================================ */

/*
 * This works whether you paste it inside or outside
 * your existing DOMContentLoaded function.
 */

(function setupFutureHomeDoors() {

    function initializeFutureHomeDoors() {

        const futureHomePage =
            document.getElementById(
                "page-future-home"
            );

        if (!futureHomePage) {
            console.error(
                "Future Home page was not found."
            );
            return;
        }


        /*
         * Prevent duplicate click listeners.
         */

        if (
            futureHomePage.dataset
                .futureHomeDoorsReady ===
            "true"
        ) {
            return;
        }

        futureHomePage.dataset
            .futureHomeDoorsReady =
            "true";


        const roomCards = [
            ...futureHomePage
                .querySelectorAll(
                    ".future-room-card"
                )
        ];

        const progressText =
            document.getElementById(
                "futureRoomProgressText"
            );

        const progressPercent =
            document.getElementById(
                "futureRoomProgressPercent"
            );

        const progressTrack =
            futureHomePage.querySelector(
                ".future-progress-track"
            );

        const progressBar =
            document.getElementById(
                "futureRoomProgressBar"
            );

        const messagePanel =
            document.getElementById(
                "futureRoomMessage"
            );

        const messageIcon =
            document.getElementById(
                "futureRoomMessageIcon"
            );

        const messageTitle =
            document.getElementById(
                "futureRoomMessageTitle"
            );

        const messageText =
            document.getElementById(
                "futureRoomMessageText"
            );

        const completionCard =
            document.getElementById(
                "futureHomeComplete"
            );

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );

        const visitedRooms =
            new Set();

        let completionWasShown =
            false;


        /* ========================================================
           PUZZLE TO FUTURE HOME
        ======================================================== */

        const puzzleHomeButton =
            document.getElementById(
                "puzzleHomeBtn"
            ) ||
            document.getElementById(
                "puzzleNextBtn"
            );


        function displayPage(pageId) {

            /*
             * Use the existing navigation function
             * if it is available.
             */

            if (
                typeof window.showPage ===
                "function"
            ) {
                window.showPage(pageId);
                return;
            }


            /*
             * Navigation fallback.
             */

            const targetPage =
                document.getElementById(
                    pageId
                );

            if (!targetPage) {
                console.error(
                    `Page not found: ${pageId}`
                );
                return;
            }


            document
                .querySelectorAll(".page")
                .forEach(function (page) {

                    const shouldOpen =
                        page === targetPage;

                    page.classList.toggle(
                        "active",
                        shouldOpen
                    );

                    page.setAttribute(
                        "aria-hidden",
                        String(!shouldOpen)
                    );
                });


            targetPage.classList.add(
                "active"
            );

            targetPage.removeAttribute(
                "hidden"
            );

            targetPage.setAttribute(
                "aria-hidden",
                "false"
            );

            targetPage.scrollTop = 0;

            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto"
            });
        }


        if (puzzleHomeButton) {

            /*
             * Remove older inline navigation.
             */

            puzzleHomeButton.removeAttribute(
                "onclick"
            );

            puzzleHomeButton.dataset
                .loveTarget =
                "page-future-home";


            if (
                puzzleHomeButton.matches("a")
            ) {
                puzzleHomeButton.setAttribute(
                    "href",
                    "#page-future-home"
                );
            }


            puzzleHomeButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    displayPage(
                        "page-future-home"
                    );
                }
            );
        }


        /* ========================================================
           UPDATE PROGRESS
        ======================================================== */

        function updateRoomProgress() {

            const totalRooms =
                roomCards.length;

            const openedRooms =
                visitedRooms.size;

            const percentage =
                totalRooms > 0
                    ? Math.round(
                        (
                            openedRooms /
                            totalRooms
                        ) * 100
                    )
                    : 0;


            if (progressText) {
                progressText.textContent =
                    `${openedRooms} of ${totalRooms} rooms opened`;
            }


            if (progressPercent) {
                progressPercent.textContent =
                    `${percentage}%`;
            }


            if (progressBar) {
                progressBar.style.width =
                    `${percentage}%`;
            }


            if (progressTrack) {

                progressTrack.setAttribute(
                    "aria-valuemax",
                    String(totalRooms)
                );

                progressTrack.setAttribute(
                    "aria-valuenow",
                    String(openedRooms)
                );
            }


            /*
             * Show the completion message after
             * every room is visited.
             */

            if (
                completionCard &&
                totalRooms > 0 &&
                openedRooms === totalRooms
            ) {

                completionCard.hidden =
                    false;


                if (!completionWasShown) {

                    completionWasShown =
                        true;

                    window.setTimeout(
                        function () {

                            completionCard
                                .scrollIntoView({
                                    behavior:
                                        reducedMotion
                                            .matches
                                            ? "auto"
                                            : "smooth",
                                    block: "center"
                                });
                        },
                        reducedMotion.matches
                            ? 20
                            : 850
                    );
                }
            }
        }


        /* ========================================================
           DISPLAY ROOM MESSAGE
        ======================================================== */

        function displayRoomMessage(
            roomCard
        ) {

            if (
                !messagePanel ||
                !messageIcon ||
                !messageTitle ||
                !messageText
            ) {
                return;
            }


            messagePanel.classList.remove(
                "is-changing"
            );


            /*
             * Restart the reveal animation.
             */

            void messagePanel.offsetWidth;


            messageIcon.textContent =
                roomCard.dataset.roomIcon ||
                "❤️";


            messageTitle.textContent =
                roomCard.dataset.roomTitle ||
                "Our Future Home";


            messageText.textContent =
                roomCard.dataset.roomMessage ||
                "Every room in our home will hold a piece of our love.";


            messagePanel.classList.add(
                "is-changing"
            );
        }


        /* ========================================================
           OPEN SELECTED DOOR
        ======================================================== */

        function openRoomDoor(
            selectedCard
        ) {

            /*
             * Close the currently opened door.
             * Visited rooms retain their checkmark.
             */

            roomCards.forEach(
                function (roomCard) {

                    const isSelected =
                        roomCard ===
                        selectedCard;

                    roomCard.classList.toggle(
                        "is-open",
                        isSelected
                    );

                    roomCard.setAttribute(
                        "aria-expanded",
                        String(isSelected)
                    );


                    const instruction =
                        roomCard.querySelector(
                            ".future-door-instruction"
                        );


                    if (instruction) {

                        instruction.textContent =
                            roomCard.classList
                                .contains(
                                    "is-visited"
                                )
                                ? "Opened · tap again"
                                : "Tap to open";
                    }
                }
            );


            const roomId =
                selectedCard.dataset.roomId ||
                String(
                    roomCards.indexOf(
                        selectedCard
                    )
                );


            visitedRooms.add(
                roomId
            );


            selectedCard.classList.add(
                "is-open",
                "is-visited"
            );

            selectedCard.setAttribute(
                "aria-expanded",
                "true"
            );


            const selectedInstruction =
                selectedCard.querySelector(
                    ".future-door-instruction"
                );


            if (selectedInstruction) {
                selectedInstruction.textContent =
                    "Door opened ❤️";
            }


            displayRoomMessage(
                selectedCard
            );

            updateRoomProgress();
        }


        /* ========================================================
           ATTACH DOOR CLICK EVENTS
        ======================================================== */

        roomCards.forEach(
            function (roomCard) {

                roomCard.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        openRoomDoor(
                            roomCard
                        );
                    }
                );
            }
        );


        /* ========================================================
           OPTIONAL RESET FUNCTION

           Use:
           window.resetFutureHomeDoors();
        ======================================================== */

        window.resetFutureHomeDoors =
            function () {

                visitedRooms.clear();

                completionWasShown =
                    false;


                roomCards.forEach(
                    function (roomCard) {

                        roomCard.classList.remove(
                            "is-open",
                            "is-visited"
                        );

                        roomCard.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        const instruction =
                            roomCard.querySelector(
                                ".future-door-instruction"
                            );


                        if (instruction) {
                            instruction.textContent =
                                "Tap to open";
                        }
                    }
                );


                if (messagePanel) {
                    messagePanel.classList.remove(
                        "is-changing"
                    );
                }


                if (messageIcon) {
                    messageIcon.textContent =
                        "🔑";
                }


                if (messageTitle) {
                    messageTitle.textContent =
                        "Choose your first room";
                }


                if (messageText) {
                    messageText.textContent =
                        "Tap any door above. I left a different piece of our future behind each one.";
                }


                if (completionCard) {
                    completionCard.hidden =
                        true;
                }


                updateRoomProgress();
            };


        updateRoomProgress();

        console.log(
            `${roomCards.length} Future Home doors initialized successfully.`
        );
    }


    /*
     * Run immediately when the DOM is already ready.
     * Otherwise, wait for DOMContentLoaded once.
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeFutureHomeDoors,
            {
                once: true
            }
        );

    } else {

        initializeFutureHomeDoors();
    }

})();


"use strict";

/* ================================================================
   LOVE FM — INTERACTIVE CASSETTE PLAYLIST
================================================================ */

(function setupLoveRadioPlaylist() {

    function initializeLoveRadioPlaylist() {

        const radioPage =
            document.getElementById(
                "page-love-playlist"
            );

        if (!radioPage) {
            return;
        }


        /*
         * Prevent duplicate event listeners.
         */

        if (
            radioPage.dataset
                .loveRadioReady ===
            "true"
        ) {
            return;
        }

        radioPage.dataset
            .loveRadioReady =
            "true";


        const audio =
            document.getElementById(
                "lovePlaylistAudio"
            );

        const trackCards = [
            ...radioPage.querySelectorAll(
                ".love-radio-track"
            )
        ];


        if (
            !audio ||
            trackCards.length === 0
        ) {
            console.error(
                "Love Radio audio player or song cards were not found."
            );
            return;
        }


        /* Player elements */

        const vinylButton =
            document.getElementById(
                "loveRadioVinylButton"
            );

        const vinylEmoji =
            document.getElementById(
                "loveRadioVinylEmoji"
            );

        const nowPlayingLabel =
            document.getElementById(
                "loveRadioNowPlayingLabel"
            );

        const nowTitle =
            document.getElementById(
                "loveRadioNowTitle"
            );

        const nowArtist =
            document.getElementById(
                "loveRadioNowArtist"
            );

        const funnyMessage =
            document.getElementById(
                "loveRadioFunnyMessage"
            );

        const seekInput =
            document.getElementById(
                "loveRadioSeek"
            );

        const currentTimeElement =
            document.getElementById(
                "loveRadioCurrentTime"
            );

        const durationElement =
            document.getElementById(
                "loveRadioDuration"
            );

        const shuffleButton =
            document.getElementById(
                "loveRadioShuffleBtn"
            );

        const previousButton =
            document.getElementById(
                "loveRadioPreviousBtn"
            );

        const playButton =
            document.getElementById(
                "loveRadioPlayBtn"
            );

        const playIcon =
            document.getElementById(
                "loveRadioPlayIcon"
            );

        const nextButton =
            document.getElementById(
                "loveRadioNextBtn"
            );

        const muteButton =
            document.getElementById(
                "loveRadioMuteBtn"
            );

        const volumeInput =
            document.getElementById(
                "loveRadioVolume"
            );

        const listenedCount =
            document.getElementById(
                "loveRadioListenedCount"
            );

        const listenedBar =
            document.getElementById(
                "loveRadioListenedBar"
            );

        const completionCard =
            document.getElementById(
                "loveRadioComplete"
            );


        const listenedTracks =
            new Set();


        const funnyMessages = [
            "😄 Warning: sudden smiling has been detected.",

            "💃 Dance-step quality is not guaranteed by Love FM.",

            "😂 Neighbours may report two suspicious bathroom singers.",

            "❤️ Arguments have been temporarily paused for this song.",

            "🎤 Please imagine me singing this with 300% confidence and 12% accuracy.",

            "🥰 Side effect: you may start missing me more than usual.",

            "📻 Breaking news: Azhagi has officially taken over the radio station.",

            "🤭 This track contains dangerously high levels of romance.",

            "🕺 Professional dancers request that I stop copying their moves.",

            "💌 Doctor's advice: replay whenever your smile level becomes low."
        ];


        let currentIndex = -1;

        let shuffleEnabled = false;

        let completionWasShown = false;


        audio.volume = 0.75;


        /* ========================================================
           FUTURE HOME TO PLAYLIST NAVIGATION
        ======================================================== */

        const futureHomePlaylistButton =
            document.getElementById(
                "futureHomePlaylistBtn"
            );


        function displayPage(pageId) {

            /*
             * Use existing navigation.
             */

            if (
                typeof window.showPage ===
                "function"
            ) {
                window.showPage(pageId);
                return;
            }


            /*
             * Navigation fallback.
             */

            const targetPage =
                document.getElementById(
                    pageId
                );

            if (!targetPage) {
                console.error(
                    `Page not found: ${pageId}`
                );
                return;
            }


            document
                .querySelectorAll(".page")
                .forEach(
                    function (page) {

                        const shouldOpen =
                            page ===
                            targetPage;

                        page.classList.toggle(
                            "active",
                            shouldOpen
                        );

                        page.setAttribute(
                            "aria-hidden",
                            String(!shouldOpen)
                        );
                    }
                );


            targetPage.classList.add(
                "active"
            );

            targetPage.removeAttribute(
                "hidden"
            );

            targetPage.setAttribute(
                "aria-hidden",
                "false"
            );

            targetPage.scrollTop = 0;
        }


        if (futureHomePlaylistButton) {

            futureHomePlaylistButton
                .dataset
                .loveTarget =
                "page-love-playlist";


            futureHomePlaylistButton
                .addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        displayPage(
                            "page-love-playlist"
                        );
                    }
                );
        }


        /* ========================================================
           HELPERS
        ======================================================== */

        function formatTime(seconds) {

            if (
                !Number.isFinite(seconds) ||
                seconds < 0
            ) {
                return "0:00";
            }


            const minutes =
                Math.floor(
                    seconds / 60
                );

            const remainingSeconds =
                Math.floor(
                    seconds % 60
                )
                    .toString()
                    .padStart(
                        2,
                        "0"
                    );


            return (
                `${minutes}:${remainingSeconds}`
            );
        }


        function changeFunnyMessage(
            message = ""
        ) {

            if (!funnyMessage) {
                return;
            }


            funnyMessage.classList.remove(
                "is-changing"
            );

            void funnyMessage.offsetWidth;


            funnyMessage.textContent =
                message ||
                funnyMessages[
                    Math.floor(
                        Math.random() *
                        funnyMessages.length
                    )
                ];


            funnyMessage.classList.add(
                "is-changing"
            );
        }


        function updateListenedProgress() {

            const total =
                trackCards.length;

            const listened =
                listenedTracks.size;

            const percentage =
                total
                    ? Math.round(
                        (
                            listened /
                            total
                        ) * 100
                    )
                    : 0;


            if (listenedCount) {
                listenedCount.textContent =
                    `${listened} / ${total} listened`;
            }


            if (listenedBar) {
                listenedBar.style.width =
                    `${percentage}%`;
            }


            if (
                completionCard &&
                total > 0 &&
                listened === total
            ) {

                completionCard.hidden =
                    false;


                if (!completionWasShown) {

                    completionWasShown =
                        true;


                    window.setTimeout(
                        function () {

                            completionCard
                                .scrollIntoView({
                                    behavior:
                                        "smooth",
                                    block:
                                        "center"
                                });
                        },
                        650
                    );
                }
            }
        }


        function setPlayingAppearance(
            isPlaying
        ) {

            radioPage.classList.toggle(
                "is-playing",
                isPlaying
            );


            if (playIcon) {
                playIcon.textContent =
                    isPlaying
                        ? "❚❚"
                        : "▶";
            }


            if (playButton) {

                playButton.setAttribute(
                    "aria-label",
                    isPlaying
                        ? "Pause current song"
                        : "Play current song"
                );
            }


            trackCards.forEach(
                function (
                    card,
                    index
                ) {

                    const isCurrentAndPlaying =
                        index ===
                        currentIndex &&
                        isPlaying;


                    card.classList.toggle(
                        "is-track-playing",
                        isCurrentAndPlaying
                    );


                    const action =
                        card.querySelector(
                            ".love-track-action"
                        );


                    if (action) {
                        action.textContent =
                            isCurrentAndPlaying
                                ? "❚❚"
                                : "▶";
                    }
                }
            );
        }


        function selectTrackCard(
            index
        ) {

            trackCards.forEach(
                function (
                    card,
                    cardIndex
                ) {

                    card.classList.toggle(
                        "is-current",
                        cardIndex ===
                            index
                    );
                }
            );
        }


        /* ========================================================
           LOAD A SONG
        ======================================================== */

        function loadTrack(
            index,
            shouldPlay = true
        ) {

            if (
                index < 0 ||
                index >= trackCards.length
            ) {
                return;
            }


            const selectedTrack =
                trackCards[index];

            const source =
                selectedTrack.dataset.src;

            const title =
                selectedTrack.dataset.title ||
                "Our Love Song";

            const artist =
                selectedTrack.dataset.artist ||
                "Ram + Raji";

            const emoji =
                selectedTrack.dataset.emoji ||
                "💗";

            const accent =
                selectedTrack.dataset.accent ||
                "#ff5f91";


            currentIndex =
                index;


            /*
             * Stop previous song.
             */

            audio.pause();

            audio.src =
                source;

            audio.load();


            radioPage.style.setProperty(
                "--radio-accent",
                accent
            );


            selectTrackCard(
                index
            );


            if (vinylEmoji) {
                vinylEmoji.textContent =
                    emoji;
            }


            if (nowPlayingLabel) {
                nowPlayingLabel.textContent =
                    `Cassette ${index + 1} of ${trackCards.length}`;
            }


            if (nowTitle) {
                nowTitle.textContent =
                    title;
            }


            if (nowArtist) {
                nowArtist.textContent =
                    artist;
            }


            if (seekInput) {
                seekInput.value =
                    "0";
            }


            if (currentTimeElement) {
                currentTimeElement.textContent =
                    "0:00";
            }


            if (durationElement) {
                durationElement.textContent =
                    "0:00";
            }


            changeFunnyMessage();


            if (shouldPlay) {
                playCurrentTrack();
            }
        }


        async function playCurrentTrack() {

            if (currentIndex < 0) {
                loadTrack(
                    0,
                    false
                );
            }


            try {

                await audio.play();

            } catch (error) {

                setPlayingAppearance(
                    false
                );


                changeFunnyMessage(
                    "🚨 Song file could not play. Check the data-src MP3 filename and keep the file inside your songs folder."
                );


                console.error(
                    "Love Radio playback failed:",
                    error
                );
            }
        }


        function toggleCurrentTrack() {

            if (currentIndex < 0) {

                loadTrack(
                    0,
                    true
                );

                return;
            }


            if (audio.paused) {

                playCurrentTrack();

            } else {

                audio.pause();
            }
        }


        function getNextIndex(
            direction = 1
        ) {

            if (
                shuffleEnabled &&
                trackCards.length > 1
            ) {

                let randomIndex =
                    currentIndex;


                while (
                    randomIndex ===
                    currentIndex
                ) {

                    randomIndex =
                        Math.floor(
                            Math.random() *
                            trackCards.length
                        );
                }


                return randomIndex;
            }


            const startingIndex =
                currentIndex < 0
                    ? 0
                    : currentIndex;


            return (
                startingIndex +
                direction +
                trackCards.length
            ) % trackCards.length;
        }


        function playNextTrack() {

            loadTrack(
                getNextIndex(1),
                true
            );
        }


        function playPreviousTrack() {

            loadTrack(
                getNextIndex(-1),
                true
            );
        }


        /* ========================================================
           SONG CARD CLICKS
        ======================================================== */

        trackCards.forEach(
            function (
                trackCard,
                index
            ) {

                const accent =
                    trackCard.dataset
                        .accent ||
                    "#ff5f91";


                trackCard.style
                    .setProperty(
                        "--track-color",
                        accent
                    );


                trackCard.addEventListener(
                    "click",
                    function () {

                        if (
                            currentIndex ===
                            index
                        ) {

                            toggleCurrentTrack();

                        } else {

                            loadTrack(
                                index,
                                true
                            );
                        }
                    }
                );
            }
        );


        /* ========================================================
           PLAYER BUTTONS
        ======================================================== */

        vinylButton?.addEventListener(
            "click",
            toggleCurrentTrack
        );


        playButton?.addEventListener(
            "click",
            toggleCurrentTrack
        );


        previousButton?.addEventListener(
            "click",
            playPreviousTrack
        );


        nextButton?.addEventListener(
            "click",
            playNextTrack
        );


        /* Shuffle */

        shuffleButton?.addEventListener(
            "click",
            function () {

                shuffleEnabled =
                    !shuffleEnabled;


                shuffleButton.classList.toggle(
                    "is-active",
                    shuffleEnabled
                );


                shuffleButton.setAttribute(
                    "aria-pressed",
                    String(
                        shuffleEnabled
                    )
                );


                changeFunnyMessage(
                    shuffleEnabled
                        ? "🔀 Shuffle activated. Even the radio no longer knows what is happening. 😂"
                        : "📼 Shuffle stopped. The cassettes have returned to their assigned seats."
                );
            }
        );


        /* Volume */

        volumeInput?.addEventListener(
            "input",
            function () {

                audio.volume =
                    Number(
                        volumeInput.value
                    );


                if (audio.volume > 0) {

                    audio.muted =
                        false;


                    muteButton?.setAttribute(
                        "aria-pressed",
                        "false"
                    );


                    if (muteButton) {
                        muteButton.textContent =
                            "🔊";
                    }
                }
            }
        );


        /* Mute */

        muteButton?.addEventListener(
            "click",
            function () {

                audio.muted =
                    !audio.muted;


                muteButton.setAttribute(
                    "aria-pressed",
                    String(audio.muted)
                );


                muteButton.textContent =
                    audio.muted
                        ? "🔇"
                        : "🔊";


                changeFunnyMessage(
                    audio.muted
                        ? "🔇 Music muted. My imaginary singing unfortunately continues."
                        : "🔊 Sound restored. The neighbours have been warned."
                );
            }
        );


        /* Seek */

        seekInput?.addEventListener(
            "input",
            function () {

                if (
                    !Number.isFinite(
                        audio.duration
                    ) ||
                    audio.duration <= 0
                ) {
                    return;
                }


                audio.currentTime =
                    (
                        Number(
                            seekInput.value
                        ) / 100
                    ) *
                    audio.duration;
            }
        );


        /* ========================================================
           AUDIO EVENTS
        ======================================================== */

        audio.addEventListener(
            "play",
            function () {

                setPlayingAppearance(
                    true
                );


                if (currentIndex >= 0) {

                    listenedTracks.add(
                        currentIndex
                    );


                    trackCards[
                        currentIndex
                    ]?.classList.add(
                        "is-listened"
                    );


                    updateListenedProgress();
                }
            }
        );


        audio.addEventListener(
            "pause",
            function () {

                setPlayingAppearance(
                    false
                );
            }
        );


        audio.addEventListener(
            "loadedmetadata",
            function () {

                if (durationElement) {

                    durationElement.textContent =
                        formatTime(
                            audio.duration
                        );
                }
            }
        );


        audio.addEventListener(
            "timeupdate",
            function () {

                if (currentTimeElement) {

                    currentTimeElement.textContent =
                        formatTime(
                            audio.currentTime
                        );
                }


                if (
                    seekInput &&
                    Number.isFinite(
                        audio.duration
                    ) &&
                    audio.duration > 0
                ) {

                    seekInput.value =
                        String(
                            (
                                audio.currentTime /
                                audio.duration
                            ) * 100
                        );
                }
            }
        );


        audio.addEventListener(
            "ended",
            function () {

                changeFunnyMessage(
                    "👏 Song completed! The imaginary audience is demanding an encore."
                );


                window.setTimeout(
                    playNextTrack,
                    650
                );
            }
        );


        audio.addEventListener(
            "error",
            function () {

                setPlayingAppearance(
                    false
                );


                changeFunnyMessage(
                    "🚨 I could not find this MP3. Replace the track's data-src with your exact song filename."
                );
            }
        );


        /*
         * Pause the playlist after leaving
         * this page.
         */

        const radioPageObserver =
            new MutationObserver(
                function () {

                    if (
                        !radioPage
                            .classList
                            .contains(
                                "active"
                            )
                    ) {
                        audio.pause();
                    }
                }
            );


        radioPageObserver.observe(
            radioPage,
            {
                attributes: true,
                attributeFilter: [
                    "class"
                ]
            }
        );


        updateListenedProgress();


        console.log(
            `${trackCards.length} Love FM songs initialized successfully.`
        );
    }


    /*
     * Safe initialization for both standalone
     * and existing DOMContentLoaded scripts.
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeLoveRadioPlaylist,
            {
                once: true
            }
        );

    } else {

        initializeLoveRadioPlaylist();
    }

})();


"use strict";

/* ================================================================
   FOREVER LETTER PAGE
   Append this complete JavaScript to the end of script.js.
================================================================ */

(function setupForeverLetterPage() {

function initializeForeverLetterPage() {

    const foreverPage =
        document.getElementById("page-forever-letter");

    if (!foreverPage) {
        return;
    }

    if (foreverPage.dataset.foreverReady === "true") {
        return;
    }

    foreverPage.dataset.foreverReady = "true";


    /* ============================================================
       ELEMENTS
    ============================================================ */

    const loveRadioPage =
        document.getElementById("page-love-playlist");

    let loveRadioForeverButton =
        document.getElementById("loveRadioForeverBtn");

    const envelopeButton =
        document.getElementById("foreverEnvelopeButton");

    const envelopeInstruction =
        document.getElementById(
            "foreverEnvelopeInstruction"
        );

    const letterContent =
        document.getElementById("foreverLetterContent");

    const letterParagraphs = [
        ...foreverPage.querySelectorAll(
            ".forever-letter-paragraph"
        )
    ];

    const promiseButton =
        document.getElementById("foreverPromiseButton");

    const promiseReveal =
        document.getElementById("foreverPromiseReveal");

    const readAgainButton =
        document.getElementById(
            "foreverReadAgainButton"
        );

    const heartLayer =
        document.getElementById("foreverHeartLayer");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let letterIsOpen = false;
    let promiseIsVisible = false;
    let paragraphTimers = [];
    let lastSparkleTime = 0;


    /* ============================================================
       CREATE LOVE FM -> FOREVER BUTTON

       This creates the navigation button inside Love FM.
       Therefore, it will not accidentally appear on Page 1.
    ============================================================ */

    if (!loveRadioForeverButton && loveRadioPage) {

        loveRadioForeverButton =
            document.createElement("button");

        loveRadioForeverButton.id =
            "loveRadioForeverBtn";

        loveRadioForeverButton.className =
            "love-radio-forever-btn page-next-btn";

        loveRadioForeverButton.type = "button";

        loveRadioForeverButton.dataset.loveTarget =
            "page-forever-letter";

        loveRadioForeverButton.innerHTML =
            "<span>There Is One Last Thing... 💌</span>" +
            "<span aria-hidden=\"true\">→</span>";

        const loveRadioButtonParent =
            loveRadioPage.querySelector(
                ".love-radio-shell"
            ) || loveRadioPage;

        loveRadioButtonParent.appendChild(
            loveRadioForeverButton
        );
    }


    /* ============================================================
       STOP PREVIOUS PAGE AUDIO
    ============================================================ */

    function pauseAllWebsiteMedia() {

        document
            .querySelectorAll("audio, video")
            .forEach(function (media) {
                media.pause();
            });
    }


    /*
     * Prevent an older page script from restarting
     * Wedding Countdown or Love FM audio here.
     */

    document.addEventListener(
        "play",
        function (event) {

            if (
                foreverPage.classList.contains("active") &&
                event.target instanceof HTMLMediaElement
            ) {
                event.target.pause();
            }
        },
        true
    );


    /* ============================================================
       PAGE NAVIGATION
    ============================================================ */

    function displayForeverPage() {

        pauseAllWebsiteMedia();

        /*
         * Use the website's existing navigation function
         * when it is globally available.
         */

        if (typeof window.showPage === "function") {

            window.showPage(
                "page-forever-letter"
            );

            pauseAllWebsiteMedia();

            return;
        }


        /*
         * Independent navigation fallback.
         */

        document
            .querySelectorAll(".page")
            .forEach(function (page) {

                const shouldOpen =
                    page === foreverPage;

                page.classList.toggle(
                    "active",
                    shouldOpen
                );

                page.setAttribute(
                    "aria-hidden",
                    String(!shouldOpen)
                );
            });


        foreverPage.hidden = false;

        foreverPage.classList.add(
            "active"
        );

        foreverPage.setAttribute(
            "aria-hidden",
            "false"
        );

        foreverPage.scrollTop = 0;

        pauseAllWebsiteMedia();
    }


    if (loveRadioForeverButton) {

        loveRadioForeverButton.dataset.loveTarget =
            "page-forever-letter";

        loveRadioForeverButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                displayForeverPage();
            }
        );
    }


    /* ============================================================
       PARAGRAPH REVEAL
    ============================================================ */

    function clearParagraphTimers() {

        paragraphTimers.forEach(
            function (timer) {
                window.clearTimeout(timer);
            }
        );

        paragraphTimers = [];
    }


    function revealLetterParagraphs() {

        clearParagraphTimers();

        letterParagraphs.forEach(
            function (paragraph) {

                paragraph.classList.remove(
                    "is-visible"
                );
            }
        );


        letterParagraphs.forEach(
            function (paragraph, index) {

                const delay =
                    reducedMotion.matches
                        ? 0
                        : 250 + (index * 380);

                const timer =
                    window.setTimeout(
                        function () {

                            paragraph.classList.add(
                                "is-visible"
                            );
                        },
                        delay
                    );

                paragraphTimers.push(timer);
            }
        );
    }


    /* ============================================================
       FLOATING HEART EFFECT
    ============================================================ */

    function releaseHearts(
        amount = 18,
        originElement = promiseButton
    ) {

        if (!heartLayer || reducedMotion.matches) {
            return;
        }

        const pageRect =
            foreverPage.getBoundingClientRect();

        const originRect =
            originElement?.getBoundingClientRect();

        const originX =
            originRect
                ? originRect.left +
                  (originRect.width / 2) -
                  pageRect.left
                : pageRect.width / 2;

        const originY =
            originRect
                ? originRect.top +
                  (originRect.height / 2) -
                  pageRect.top
                : pageRect.height * 0.65;

        const colors = [
            "#ff6f97",
            "#ffc0d1",
            "#f3cc8c",
            "#ffffff"
        ];


        for (
            let index = 0;
            index < amount;
            index += 1
        ) {

            const heart =
                document.createElement("span");

            heart.className =
                "forever-floating-heart";

            heart.textContent =
                index % 4 === 0
                    ? "✦"
                    : "♥";


            heart.style.setProperty(
                "--heart-x",
                `${
                    originX +
                    ((Math.random() - 0.5) * 150)
                }px`
            );


            heart.style.setProperty(
                "--heart-y",
                `${
                    originY +
                    ((Math.random() - 0.5) * 35)
                }px`
            );


            heart.style.setProperty(
                "--heart-size",
                `${
                    12 +
                    (Math.random() * 18)
                }px`
            );


            heart.style.setProperty(
                "--heart-color",
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ]
            );


            heart.style.setProperty(
                "--heart-duration",
                `${
                    2.5 +
                    (Math.random() * 1.6)
                }s`
            );


            heart.style.setProperty(
                "--heart-drift",
                `${
                    (Math.random() - 0.5) *
                    170
                }px`
            );


            heart.style.setProperty(
                "--heart-rotate",
                `${
                    (Math.random() - 0.5) *
                    90
                }deg`
            );


            heart.style.animationDelay =
                `${Math.random() * 0.35}s`;

            heartLayer.appendChild(heart);


            window.setTimeout(
                function () {
                    heart.remove();
                },
                4500
            );
        }
    }


    /* ============================================================
       OPEN ENVELOPE
    ============================================================ */

    function openForeverLetter() {

        if (!envelopeButton || !letterContent) {
            return;
        }


        if (letterIsOpen) {

            letterContent.scrollIntoView({
                behavior:
                    reducedMotion.matches
                        ? "auto"
                        : "smooth",
                block: "start"
            });

            return;
        }


        letterIsOpen = true;

        foreverPage.classList.add(
            "letter-is-open"
        );

        envelopeButton.setAttribute(
            "aria-expanded",
            "true"
        );


        if (envelopeInstruction) {

            envelopeInstruction.textContent =
                "My Heart Is Open For You ❤️";
        }


        releaseHearts(
            12,
            envelopeButton
        );


        const openingDelay =
            reducedMotion.matches
                ? 0
                : 760;


        window.setTimeout(
            function () {

                letterContent.hidden = false;


                window.requestAnimationFrame(
                    function () {

                        letterContent.classList.add(
                            "is-paper-visible"
                        );

                        revealLetterParagraphs();
                    }
                );


                window.setTimeout(
                    function () {

                        letterContent.scrollIntoView({
                            behavior:
                                reducedMotion.matches
                                    ? "auto"
                                    : "smooth",
                            block: "start"
                        });
                    },
                    reducedMotion.matches
                        ? 0
                        : 280
                );
            },
            openingDelay
        );
    }


    envelopeButton?.addEventListener(
        "click",
        openForeverLetter
    );


    /* ============================================================
       FINAL PROMISE
    ============================================================ */

    function showForeverPromise() {

        if (!promiseReveal || !promiseButton) {
            return;
        }


        if (promiseIsVisible) {

            promiseReveal.scrollIntoView({
                behavior:
                    reducedMotion.matches
                        ? "auto"
                        : "smooth",
                block: "center"
            });

            return;
        }


        promiseIsVisible = true;

        promiseReveal.hidden = false;

        promiseButton.classList.add(
            "is-complete"
        );

        promiseButton.setAttribute(
            "aria-expanded",
            "true"
        );


        const promiseButtonText =
            promiseButton.querySelector("span");


        if (promiseButtonText) {

            promiseButtonText.textContent =
                "My Promise Is Yours Forever";
        }


        window.requestAnimationFrame(
            function () {

                promiseReveal.classList.add(
                    "is-revealed"
                );
            }
        );


        releaseHearts(
            28,
            promiseButton
        );


        window.setTimeout(
            function () {

                promiseReveal.scrollIntoView({
                    behavior:
                        reducedMotion.matches
                            ? "auto"
                            : "smooth",
                    block: "center"
                });
            },
            reducedMotion.matches
                ? 0
                : 350
        );
    }


    promiseButton?.addEventListener(
        "click",
        showForeverPromise
    );


    /* ============================================================
       READ LETTER AGAIN
    ============================================================ */

    readAgainButton?.addEventListener(
        "click",
        function () {

            if (!letterContent) {
                return;
            }


            promiseIsVisible = false;


            if (promiseReveal) {

                promiseReveal.classList.remove(
                    "is-revealed"
                );

                promiseReveal.hidden = true;
            }


            if (promiseButton) {

                promiseButton.classList.remove(
                    "is-complete"
                );

                promiseButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                const promiseButtonText =
                    promiseButton.querySelector(
                        "span"
                    );


                if (promiseButtonText) {

                    promiseButtonText.textContent =
                        "Touch Here For My Promise";
                }
            }


            revealLetterParagraphs();

            releaseHearts(
                9,
                readAgainButton
            );


            letterContent.scrollIntoView({
                behavior:
                    reducedMotion.matches
                        ? "auto"
                        : "smooth",
                block: "start"
            });
        }
    );


    /* ============================================================
       CURSOR SPARKLES
    ============================================================ */

    foreverPage.addEventListener(
        "pointermove",
        function (event) {

            if (
                reducedMotion.matches ||
                event.pointerType === "touch" ||
                performance.now() -
                    lastSparkleTime < 75
            ) {
                return;
            }


            lastSparkleTime =
                performance.now();


            const sparkle =
                document.createElement("span");

            sparkle.className =
                "forever-cursor-sparkle";

            sparkle.style.left =
                `${event.clientX}px`;

            sparkle.style.top =
                `${event.clientY}px`;


            document.body.appendChild(
                sparkle
            );


            window.setTimeout(
                function () {
                    sparkle.remove();
                },
                700
            );
        }
    );


    /* ============================================================
       WATCH PAGE VISIBILITY
    ============================================================ */

    const foreverPageObserver =
        new MutationObserver(
            function () {

                if (
                    foreverPage.classList.contains(
                        "active"
                    )
                ) {

                    pauseAllWebsiteMedia();

                    foreverPage.setAttribute(
                        "aria-hidden",
                        "false"
                    );
                }
            }
        );


    foreverPageObserver.observe(
        foreverPage,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );


    if (
        foreverPage.classList.contains(
            "active"
        )
    ) {
        pauseAllWebsiteMedia();
    }


    console.log(
        "Forever Letter page initialized successfully."
    );
}


/* ================================================================
   SAFE INITIALIZATION

   This works whether the code is added before or after the
   DOMContentLoaded event.
================================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeForeverLetterPage,
        { once: true }
    );

} else {

    initializeForeverLetterPage();
}

})();


/* ================================================================
   HOLD MY HEART PAGE
================================================================ */

(function setupHoldMyHeartPage() {

function initializeHoldMyHeartPage() {

    const holdPage =
        document.getElementById(
            "page-hold-my-heart"
        );

    const foreverPage =
        document.getElementById(
            "page-forever-letter"
        );


    if (!holdPage) {

        console.error(
            "Hold My Heart page was not found."
        );

        return;
    }


    if (
        holdPage.dataset.holdHeartReady ===
        "true"
    ) {
        return;
    }


    holdPage.dataset.holdHeartReady =
        "true";


    let foreverToHeartButton =
        document.getElementById(
            "foreverToHeartBtn"
        );


    const heartButton =
        document.getElementById(
            "holdHeartButton"
        );

    const progressCircle =
        document.getElementById(
            "holdProgressCircle"
        );

    const progressText =
        document.getElementById(
            "holdProgressText"
        );

    const statusText =
        document.getElementById(
            "holdHeartStatus"
        );

    const milestoneOne =
        document.getElementById(
            "holdMilestoneOne"
        );

    const milestoneTwo =
        document.getElementById(
            "holdMilestoneTwo"
        );

    const milestoneThree =
        document.getElementById(
            "holdMilestoneThree"
        );

    const promiseCard =
        document.getElementById(
            "holdHeartPromise"
        );

    const holdAgainButton =
        document.getElementById(
            "holdHeartAgainButton"
        );

    const celebrationLayer =
        document.getElementById(
            "holdHeartCelebrationLayer"
        );


    if (
        !heartButton ||
        !progressCircle
    ) {

        console.error(
            "Hold button or progress circle was not found."
        );

        return;
    }


    const HOLD_DURATION = 5000;

    const CIRCLE_LENGTH = 402.124;

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    let isHolding = false;

    let isCompleted = false;

    let holdStartedAt = 0;

    let animationFrameId = null;

    let activePointerId = null;


    progressCircle.style.strokeDasharray =
        String(CIRCLE_LENGTH);

    progressCircle.style.strokeDashoffset =
        String(CIRCLE_LENGTH);


    /* ============================================================
       CREATE OR MOVE THE FOREVER PAGE BUTTON
    ============================================================ */

    if (foreverPage) {

        const foreverShell =
            foreverPage.querySelector(
                ".forever-letter-shell"
            ) ||
            foreverPage;


        let foreverNextPageWrap =
            document.getElementById(
                "foreverNextPageWrap"
            );


        if (!foreverNextPageWrap) {

            foreverNextPageWrap =
                document.createElement(
                    "div"
                );

            foreverNextPageWrap.id =
                "foreverNextPageWrap";

            foreverNextPageWrap.className =
                "forever-next-page-wrap";


            const foreverFootnote =
                foreverShell.querySelector(
                    ".forever-page-footnote"
                );


            if (foreverFootnote) {

                foreverShell.insertBefore(
                    foreverNextPageWrap,
                    foreverFootnote
                );

            } else {

                foreverShell.appendChild(
                    foreverNextPageWrap
                );
            }
        }


        if (!foreverToHeartButton) {

            foreverToHeartButton =
                document.createElement(
                    "button"
                );

            foreverToHeartButton.id =
                "foreverToHeartBtn";

            foreverToHeartButton.className =
                "forever-to-heart-btn page-next-btn";

            foreverToHeartButton.type =
                "button";

            foreverToHeartButton.dataset.loveTarget =
                "page-hold-my-heart";

            foreverToHeartButton.innerHTML =
                "<span>Will You Hold My Heart? ❤️</span>" +
                "<span aria-hidden=\"true\">→</span>";
        }


        /*
         * This moves the button out of the hidden
         * letter if it was placed there previously.
         */

        if (
            foreverToHeartButton.parentElement !==
            foreverNextPageWrap
        ) {

            foreverNextPageWrap.appendChild(
                foreverToHeartButton
            );
        }


        foreverNextPageWrap.hidden = false;

        foreverNextPageWrap.style.display =
            "flex";

        foreverNextPageWrap.style.visibility =
            "visible";

        foreverNextPageWrap.style.opacity =
            "1";

        foreverNextPageWrap.style.pointerEvents =
            "auto";


        foreverToHeartButton.hidden = false;

        foreverToHeartButton.style.display =
            "inline-flex";

        foreverToHeartButton.style.visibility =
            "visible";

        foreverToHeartButton.style.opacity =
            "1";

        foreverToHeartButton.style.pointerEvents =
            "auto";
    }


    /* ============================================================
       AUDIO CLEANUP
    ============================================================ */

    function pauseAllWebsiteMedia() {

        document
            .querySelectorAll(
                "audio, video"
            )
            .forEach(
                function (media) {

                    media.pause();
                }
            );
    }


    /* ============================================================
       NAVIGATION
    ============================================================ */

    function displayHoldHeartPage() {

        pauseAllWebsiteMedia();


        const targetPage =
            document.getElementById(
                "page-hold-my-heart"
            );


        if (!targetPage) {

            console.error(
                "Target page #page-hold-my-heart was not found."
            );

            return;
        }


        document
            .querySelectorAll(".page")
            .forEach(
                function (page) {

                    const shouldOpen =
                        page === targetPage;


                    page.classList.toggle(
                        "active",
                        shouldOpen
                    );


                    page.setAttribute(
                        "aria-hidden",
                        String(!shouldOpen)
                    );
                }
            );


        targetPage.hidden = false;

        targetPage.classList.add(
            "active"
        );

        targetPage.setAttribute(
            "aria-hidden",
            "false"
        );

        targetPage.scrollTop = 0;


        window.requestAnimationFrame(
            function () {

                if (
                    window.getComputedStyle(
                        targetPage
                    ).display ===
                    "none"
                ) {

                    targetPage.style.display =
                        "block";
                }
            }
        );


        pauseAllWebsiteMedia();
    }


    if (foreverToHeartButton) {

        foreverToHeartButton.dataset.loveTarget =
            "page-hold-my-heart";


        if (
            foreverToHeartButton.dataset
                .holdNavigationReady !==
            "true"
        ) {

            foreverToHeartButton.dataset
                .holdNavigationReady =
                "true";


            foreverToHeartButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    displayHoldHeartPage();
                }
            );
        }
    }


    /* ============================================================
       SET PROGRESS
    ============================================================ */

    function setProgress(progress) {

        const safeProgress =
            Math.min(
                1,
                Math.max(0, progress)
            );


        const dashOffset =
            CIRCLE_LENGTH *
            (1 - safeProgress);


        progressCircle.style.strokeDashoffset =
            String(dashOffset);


        if (progressText) {

            progressText.textContent =
                safeProgress <= 0
                    ? "HOLD"
                    : `${
                        Math.round(
                            safeProgress * 100
                        )
                    }%`;
        }


        milestoneOne?.classList.toggle(
            "is-active",
            safeProgress < 0.35
        );


        milestoneTwo?.classList.toggle(
            "is-active",
            safeProgress >= 0.35 &&
            safeProgress < 0.75
        );


        milestoneThree?.classList.toggle(
            "is-active",
            safeProgress >= 0.75
        );


        if (
            !statusText ||
            isCompleted
        ) {
            return;
        }


        if (safeProgress < 0.15) {

            statusText.textContent =
                "I felt your touch... don't let go yet ❤️";

        } else if (safeProgress < 0.4) {

            statusText.textContent =
                "It is beating a little happier now 🥰";

        } else if (safeProgress < 0.65) {

            statusText.textContent =
                "See? It already trusts you completely 💗";

        } else if (safeProgress < 0.88) {

            statusText.textContent =
                "Almost yours... although it always was 💞";

        } else {

            statusText.textContent =
                "One more heartbeat, Azhagi... ❤️";
        }
    }


    function updateHoldProgress(now) {

        if (
            !isHolding ||
            isCompleted
        ) {
            return;
        }


        const elapsed =
            now - holdStartedAt;


        const progress =
            elapsed / HOLD_DURATION;


        setProgress(progress);


        if (progress >= 1) {

            completeHeartHold();

            return;
        }


        animationFrameId =
            window.requestAnimationFrame(
                updateHoldProgress
            );
    }


    /* ============================================================
       START HOLD
    ============================================================ */

    function startHeartHold() {

        if (
            isHolding ||
            isCompleted
        ) {
            return;
        }


        isHolding = true;

        holdStartedAt =
            performance.now();


        holdPage.classList.add(
            "is-holding"
        );


        heartButton.setAttribute(
            "aria-pressed",
            "true"
        );


        if (statusText) {

            statusText.textContent =
                "I felt your touch... don't let go yet ❤️";
        }


        animationFrameId =
            window.requestAnimationFrame(
                updateHoldProgress
            );


        if (navigator.vibrate) {

            navigator.vibrate(35);
        }
    }


    /* ============================================================
       CANCEL HOLD
    ============================================================ */

    function cancelHeartHold(
        showMessage = true
    ) {

        if (
            !isHolding ||
            isCompleted
        ) {
            return;
        }


        isHolding = false;


        holdPage.classList.remove(
            "is-holding"
        );


        heartButton.setAttribute(
            "aria-pressed",
            "false"
        );


        if (
            animationFrameId !== null
        ) {

            window.cancelAnimationFrame(
                animationFrameId
            );

            animationFrameId = null;
        }


        setProgress(0);


        if (
            showMessage &&
            statusText
        ) {

            statusText.textContent =
                "You let go—but don't worry, my heart will wait for you ❤️";
        }
    }


    /* ============================================================
       CELEBRATION HEARTS
    ============================================================ */

    function createHeartCelebration(
        amount = 38
    ) {

        if (
            !celebrationLayer ||
            reducedMotion.matches
        ) {
            return;
        }


        const colors = [
            "#ff4d78",
            "#ff9db1",
            "#ffd0b3",
            "#ffffff"
        ];


        for (
            let index = 0;
            index < amount;
            index += 1
        ) {

            const heart =
                document.createElement(
                    "span"
                );


            heart.className =
                "hold-celebration-heart";


            heart.textContent =
                index % 5 === 0
                    ? "✦"
                    : "♥";


            heart.style.setProperty(
                "--celebration-x",
                `${Math.random() * 100}%`
            );


            heart.style.setProperty(
                "--celebration-color",
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ]
            );


            heart.style.setProperty(
                "--celebration-size",
                `${
                    12 +
                    Math.random() * 22
                }px`
            );


            heart.style.setProperty(
                "--celebration-duration",
                `${
                    3.2 +
                    Math.random() * 2.2
                }s`
            );


            heart.style.setProperty(
                "--celebration-drift",
                `${
                    (Math.random() - 0.5) *
                    190
                }px`
            );


            heart.style.setProperty(
                "--celebration-rotate",
                `${
                    (Math.random() - 0.5) *
                    150
                }deg`
            );


            heart.style.animationDelay =
                `${
                    Math.random() *
                    0.8
                }s`;


            celebrationLayer.appendChild(
                heart
            );


            window.setTimeout(
                function () {

                    heart.remove();
                },
                6500
            );
        }
    }


    /* ============================================================
       COMPLETE HOLD
    ============================================================ */

    function completeHeartHold() {

        isHolding = false;

        isCompleted = true;


        if (
            animationFrameId !== null
        ) {

            window.cancelAnimationFrame(
                animationFrameId
            );

            animationFrameId = null;
        }


        setProgress(1);


        holdPage.classList.remove(
            "is-holding"
        );


        holdPage.classList.add(
            "heart-is-trusted"
        );


        heartButton.setAttribute(
            "aria-pressed",
            "false"
        );


        heartButton.setAttribute(
            "aria-label",
            "My heart is safely held by you"
        );


        if (progressText) {

            progressText.textContent =
                "YOURS";
        }


        if (statusText) {

            statusText.textContent =
                "Heart successfully delivered to its forever home ❤️";
        }


        milestoneOne?.classList.add(
            "is-active"
        );

        milestoneTwo?.classList.add(
            "is-active"
        );

        milestoneThree?.classList.add(
            "is-active"
        );


        if (navigator.vibrate) {

            navigator.vibrate([
                80,
                60,
                100,
                70,
                160
            ]);
        }


        createHeartCelebration();


        if (promiseCard) {

            promiseCard.hidden = false;


            window.requestAnimationFrame(
                function () {

                    promiseCard.classList.add(
                        "is-visible"
                    );
                }
            );


            window.setTimeout(
                function () {

                    promiseCard.scrollIntoView({
                        behavior:
                            reducedMotion.matches
                                ? "auto"
                                : "smooth",

                        block: "center"
                    });
                },
                reducedMotion.matches
                    ? 0
                    : 650
            );
        }
    }


    /* ============================================================
       POINTER EVENTS
    ============================================================ */

    heartButton.addEventListener(
        "pointerdown",
        function (event) {

            event.preventDefault();

            activePointerId =
                event.pointerId;


            try {

                heartButton.setPointerCapture(
                    event.pointerId
                );

            } catch (error) {

                console.info(
                    "Pointer capture was not available.",
                    error
                );
            }


            startHeartHold();
        }
    );


    heartButton.addEventListener(
        "pointerup",
        function (event) {

            if (
                activePointerId !== null &&
                event.pointerId !==
                    activePointerId
            ) {
                return;
            }


            activePointerId = null;

            cancelHeartHold(true);
        }
    );


    heartButton.addEventListener(
        "pointercancel",
        function () {

            activePointerId = null;

            cancelHeartHold(true);
        }
    );


    heartButton.addEventListener(
        "lostpointercapture",
        function () {

            activePointerId = null;

            cancelHeartHold(false);
        }
    );


    heartButton.addEventListener(
        "contextmenu",
        function (event) {

            event.preventDefault();
        }
    );


    /* ============================================================
       KEYBOARD EVENTS
    ============================================================ */

    heartButton.addEventListener(
        "keydown",
        function (event) {

            if (
                (
                    event.key === " " ||
                    event.key === "Enter"
                ) &&
                !event.repeat
            ) {

                event.preventDefault();

                startHeartHold();
            }
        }
    );


    heartButton.addEventListener(
        "keyup",
        function (event) {

            if (
                event.key === " " ||
                event.key === "Enter"
            ) {

                event.preventDefault();

                cancelHeartHold(true);
            }
        }
    );


    window.addEventListener(
        "blur",
        function () {

            cancelHeartHold(false);
        }
    );


    /* ============================================================
       HOLD AGAIN
    ============================================================ */

    holdAgainButton?.addEventListener(
        "click",
        function () {

            isHolding = false;

            isCompleted = false;


            holdPage.classList.remove(
                "is-holding",
                "heart-is-trusted"
            );


            setProgress(0);


            heartButton.setAttribute(
                "aria-label",
                "Press and hold my heart for five seconds"
            );


            heartButton.setAttribute(
                "aria-pressed",
                "false"
            );


            milestoneOne?.classList.add(
                "is-active"
            );


            milestoneTwo?.classList.remove(
                "is-active"
            );


            milestoneThree?.classList.remove(
                "is-active"
            );


            if (statusText) {

                statusText.textContent =
                    "Waiting for your touch again, Azhagi ❤️";
            }


            if (promiseCard) {

                promiseCard.classList.remove(
                    "is-visible"
                );

                promiseCard.hidden = true;
            }


            holdPage.scrollTo({
                top: 0,

                behavior:
                    reducedMotion.matches
                        ? "auto"
                        : "smooth"
            });
        }
    );


    /* ============================================================
       PREVENT OLD AUDIO FROM PLAYING
    ============================================================ */

    document.addEventListener(
        "play",
        function (event) {

            if (
                holdPage.classList.contains(
                    "active"
                ) &&
                event.target instanceof
                    HTMLMediaElement
            ) {

                event.target.pause();
            }
        },
        true
    );


    const holdPageObserver =
        new MutationObserver(
            function () {

                if (
                    holdPage.classList.contains(
                        "active"
                    )
                ) {

                    pauseAllWebsiteMedia();

                    holdPage.setAttribute(
                        "aria-hidden",
                        "false"
                    );

                } else {

                    cancelHeartHold(false);
                }
            }
        );


    holdPageObserver.observe(
        holdPage,
        {
            attributes: true,
            attributeFilter: ["class"]
        }
    );


    console.log(
        "Hold My Heart page initialized successfully."
    );
}


/* ================================================================
   SAFE INITIALIZATION
================================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeHoldMyHeartPage,
        { once: true }
    );

} else {

    initializeHoldMyHeartPage();
}

})();


/* ================================================================
   BOARDING PASS TO FOREVER
   ================================================================ */

(function setupBoardingPassToForeverPage() {
    "use strict";

    const PAGE_ID = "page-boarding-pass";
    const HOLD_PAGE_ID = "page-hold-my-heart";

    function pauseAllWebsiteMedia() {
        document.querySelectorAll("audio, video").forEach(function (media) {
            try {
                media.pause();
            } catch (error) {
                console.warn(
                    "A media element could not be paused:",
                    error
                );
            }
        });
    }

    function openLovePage(targetId) {
        const targetPage = document.getElementById(targetId);

        if (!targetPage) {
            console.error(
                'Boarding Pass page was not found. Check that id="' +
                targetId +
                '" exists in index.html.'
            );

            return;
        }

        pauseAllWebsiteMedia();

        document.querySelectorAll(".page").forEach(function (page) {
            const isTarget = page === targetPage;

            page.classList.toggle("active", isTarget);
            page.setAttribute(
                "aria-hidden",
                isTarget ? "false" : "true"
            );
        });

        targetPage.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        document.dispatchEvent(
            new CustomEvent("lovePageChanged", {
                detail: {
                    pageId: targetId
                }
            })
        );
    }

    function ensureHoldToBoardingButton() {
        const holdPage = document.getElementById(HOLD_PAGE_ID);

        if (!holdPage) {
            return;
        }

        const holdShell =
            holdPage.querySelector(".hold-heart-shell") ||
            holdPage;

        const footnote =
            holdPage.querySelector(".hold-heart-footnote");

        let wrapper =
            document.getElementById("holdToBoardingWrap");

        let button =
            document.getElementById("holdToBoardingBtn");

        /*
         * This automatically creates the next-page button if the
         * HTML snippet was accidentally missed.
         */
        if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = "holdToBoardingWrap";
            wrapper.className = "hold-to-boarding-wrap";
        }

        if (!button) {
            button = document.createElement("button");

            button.id = "holdToBoardingBtn";
            button.className =
                "hold-to-boarding-btn page-next-btn";
            button.type = "button";
            button.dataset.loveTarget = PAGE_ID;

            const label = document.createElement("span");
            label.textContent =
                "Board Our Forever Flight ✈️";

            const arrow = document.createElement("span");
            arrow.className = "hold-to-boarding-arrow";
            arrow.setAttribute("aria-hidden", "true");
            arrow.textContent = "→";

            button.append(label, arrow);
        }

        if (!wrapper.contains(button)) {
            wrapper.appendChild(button);
        }

        /*
         * Keep the button outside #holdHeartPromise.
         * That promise card begins with the hidden attribute.
         */
        if (footnote) {
            holdShell.insertBefore(wrapper, footnote);
        } else if (!holdShell.contains(wrapper)) {
            holdShell.appendChild(wrapper);
        }

        if (
            button.dataset.boardingNavigationReady !== "true"
        ) {
            button.dataset.boardingNavigationReady = "true";

            button.addEventListener("click", function (event) {
                event.preventDefault();
                openLovePage(PAGE_ID);
            });
        }
    }

    function initializeBoardingPassPage() {
        ensureHoldToBoardingButton();

        const page = document.getElementById(PAGE_ID);

        if (!page) {
            console.error(
                "Boarding Pass HTML is missing. Paste the " +
                "#page-boarding-pass section after the " +
                "Hold My Heart section."
            );

            return;
        }

        if (
            page.dataset.boardingInitialized === "true"
        ) {
            return;
        }

        page.dataset.boardingInitialized = "true";

        const boardingPass =
            document.getElementById(
                "foreverBoardingPass"
            );

        const stampButton =
            document.getElementById(
                "boardingStampButton"
            );

        const stampAgainButton =
            document.getElementById(
                "boardingStampAgainButton"
            );

        const message =
            document.getElementById(
                "boardingForeverMessage"
            );

        const status =
            document.getElementById(
                "boardingStatus"
            );

        const statusDot =
            document.getElementById(
                "boardingStatusDot"
            );

        const celebrationLayer =
            document.getElementById(
                "boardingCelebrationLayer"
            );

        if (
            !boardingPass ||
            !stampButton ||
            !message ||
            !status
        ) {
            console.error(
                "Boarding Pass setup stopped because " +
                "one or more required HTML IDs are missing."
            );

            return;
        }

        let isStamping = false;
        let isApproved = false;
        let timers = [];

        function schedule(callback, delay) {
            const timerId =
                window.setTimeout(callback, delay);

            timers.push(timerId);

            return timerId;
        }

        function clearTimers() {
            timers.forEach(function (timerId) {
                window.clearTimeout(timerId);
            });

            timers = [];
        }

        function updateStatus(text, approved) {
            status.textContent = text;

            if (statusDot) {
                statusDot.classList.toggle(
                    "is-approved",
                    Boolean(approved)
                );
            }
        }

        function createCelebration() {
            if (!celebrationLayer) {
                return;
            }

            celebrationLayer.replaceChildren();

            const symbols = [
                "♥",
                "✦",
                "♥",
                "✈",
                "●"
            ];

            const colors = [
                "#ffd1df",
                "#ffe0a8",
                "#ffffff",
                "#ff91b6",
                "#e9b9ff"
            ];

            for (
                let index = 0;
                index < 42;
                index += 1
            ) {
                const particle =
                    document.createElement("span");

                const left =
                    Math.random() * 100;

                const size =
                    11 + Math.random() * 17;

                const delay =
                    Math.random() * 0.7;

                const duration =
                    2.5 + Math.random() * 1.7;

                const drift =
                    -85 + Math.random() * 170;

                const spin =
                    -720 + Math.random() * 1440;

                particle.className =
                    "boarding-confetti";

                particle.textContent =
                    symbols[index % symbols.length];

                particle.style.setProperty(
                    "--boarding-left",
                    left + "%"
                );

                particle.style.setProperty(
                    "--boarding-size",
                    size + "px"
                );

                particle.style.setProperty(
                    "--boarding-delay",
                    delay + "s"
                );

                particle.style.setProperty(
                    "--boarding-duration",
                    duration + "s"
                );

                particle.style.setProperty(
                    "--boarding-drift",
                    drift + "px"
                );

                particle.style.setProperty(
                    "--boarding-spin",
                    spin + "deg"
                );

                particle.style.setProperty(
                    "--boarding-color",
                    colors[index % colors.length]
                );

                celebrationLayer.appendChild(particle);
            }

            schedule(function () {
                celebrationLayer.replaceChildren();
            }, 5200);
        }

        function resetBoardingPass() {
            clearTimers();

            isStamping = false;
            isApproved = false;

            boardingPass.classList.remove(
                "is-stamping",
                "is-stamped"
            );

            stampButton.classList.remove(
                "is-pressing"
            );

            stampButton.disabled = false;

            stampButton.setAttribute(
                "aria-pressed",
                "false"
            );

            message.hidden = true;

            message.classList.remove(
                "is-revealed"
            );

            if (celebrationLayer) {
                celebrationLayer.replaceChildren();
            }

            updateStatus(
                "Stamp illa-na boarding allowed illa, " +
                "Azhagi. 😂❤️",
                false
            );
        }

        function stampForeverTicket() {
            if (isStamping || isApproved) {
                return;
            }

            clearTimers();

            isStamping = true;

            stampButton.disabled = true;

            stampButton.classList.add(
                "is-pressing"
            );

            boardingPass.classList.add(
                "is-stamping"
            );

            updateStatus(
                "Passenger details verify pannitu irukken…",
                false
            );

            schedule(function () {
                updateStatus(
                    "Chennai + Rajapalayam routes " +
                    "connect aagudhu… ✈️",
                    false
                );
            }, 430);

            schedule(function () {
                boardingPass.classList.remove(
                    "is-stamping"
                );

                boardingPass.classList.add(
                    "is-stamped"
                );

                stampButton.classList.remove(
                    "is-pressing"
                );

                stampButton.setAttribute(
                    "aria-pressed",
                    "true"
                );

                createCelebration();
            }, 780);

            schedule(function () {
                updateStatus(
                    "Forever visa approve aagudhu… " +
                    "konjam wait-u! 💞",
                    false
                );
            }, 1050);

            schedule(function () {
                isStamping = false;
                isApproved = true;

                message.hidden = false;

                window.requestAnimationFrame(function () {
                    message.classList.add(
                        "is-revealed"
                    );
                });

                updateStatus(
                    "Boarding confirmed! Ippo namma " +
                    "official-ah TOGETHER. ❤️",
                    true
                );
            }, 1450);

            schedule(function () {
                const smallScreen =
                    window.matchMedia(
                        "(max-width: 780px)"
                    ).matches;

                if (smallScreen) {
                    message.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            }, 1800);
        }

        stampButton.setAttribute(
            "aria-pressed",
            "false"
        );

        stampButton.addEventListener(
            "click",
            stampForeverTicket
        );

        if (stampAgainButton) {
            stampAgainButton.addEventListener(
                "click",
                function () {
                    resetBoardingPass();

                    boardingPass.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                    schedule(
                        stampForeverTicket,
                        650
                    );
                }
            );
        }

        /*
         * Prevent music from Wedding Countdown or Love FM
         * from playing while this page is active.
         */
        document.addEventListener(
            "play",
            function stopMediaOnBoardingPage(event) {
                const media = event.target;

                if (
                    page.classList.contains("active") &&
                    media instanceof HTMLMediaElement
                ) {
                    media.pause();
                }
            },
            true
        );

        const pageStateObserver =
            new MutationObserver(function () {
                if (
                    page.classList.contains("active")
                ) {
                    pauseAllWebsiteMedia();
                }
            });

        pageStateObserver.observe(page, {
            attributes: true,
            attributeFilter: ["class"]
        });

        document.addEventListener(
            "lovePageChanged",
            function (event) {
                if (
                    event.detail &&
                    event.detail.pageId === PAGE_ID
                ) {
                    pauseAllWebsiteMedia();
                }
            }
        );

        console.log(
            "Boarding Pass to Forever page initialized successfully."
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeBoardingPassPage,
            { once: true }
        );
    } else {
        initializeBoardingPassPage();
    }
})();


/* ================================================================
   ROLL CREDITS PAGE
   ================================================================ */

(function setupRomanticRollCreditsPage() {
    "use strict";

    const CREDITS_PAGE_ID = "page-roll-credits";
    const HOLD_PAGE_ID = "page-hold-my-heart";

    /*
     * Total duration of the scrolling credits.
     * 78000 means 78 seconds.
     */
    const CREDITS_DURATION = 78000;

    function pauseAllWebsiteMedia() {
        document
            .querySelectorAll("audio, video")
            .forEach(function (media) {
                try {
                    media.pause();
                } catch (error) {
                    console.warn(
                        "A media element could not be paused:",
                        error
                    );
                }
            });
    }

    function showCreditsPage(targetId) {
        const targetPage =
            document.getElementById(targetId);

        if (!targetPage) {
            console.error(
                'Roll Credits page not found. Check that id="' +
                targetId +
                '" exists in index.html.'
            );

            return;
        }

        pauseAllWebsiteMedia();

        document
            .querySelectorAll(".page")
            .forEach(function (page) {
                const isTarget =
                    page === targetPage;

                page.classList.toggle(
                    "active",
                    isTarget
                );

                page.setAttribute(
                    "aria-hidden",
                    isTarget ? "false" : "true"
                );
            });

        /*
         * Removes a native hidden attribute if another
         * script added one.
         */
        targetPage.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        document.dispatchEvent(
            new CustomEvent("lovePageChanged", {
                detail: {
                    pageId: targetId
                }
            })
        );
    }

    function ensureHoldToCreditsButton() {
        const holdPage =
            document.getElementById(
                HOLD_PAGE_ID
            );

        if (!holdPage) {
            return;
        }

        const holdShell =
            holdPage.querySelector(
                ".hold-heart-shell"
            ) || holdPage;

        const footnote =
            holdPage.querySelector(
                ".hold-heart-footnote"
            );

        const boardingWrapper =
            document.getElementById(
                "holdToBoardingWrap"
            );

        let wrapper =
            document.getElementById(
                "holdToCreditsWrap"
            );

        let button =
            document.getElementById(
                "holdToCreditsBtn"
            );

        /*
         * Create the redirection button automatically
         * when the HTML button was missed.
         */
        if (!wrapper) {
            wrapper =
                document.createElement("div");

            wrapper.id =
                "holdToCreditsWrap";

            wrapper.className =
                "hold-to-credits-wrap";
        }

        if (!button) {
            button =
                document.createElement("button");

            button.id =
                "holdToCreditsBtn";

            button.className =
                "hold-to-credits-btn page-next-btn";

            button.type = "button";

            button.dataset.loveTarget =
                CREDITS_PAGE_ID;

            const clapper =
                document.createElement("span");

            clapper.className =
                "hold-credits-clapper";

            clapper.setAttribute(
                "aria-hidden",
                "true"
            );

            clapper.textContent = "🎬";

            const label =
                document.createElement("span");

            const smallLabel =
                document.createElement("small");

            smallLabel.textContent =
                "OUR STORY DOESN'T END";

            label.appendChild(smallLabel);

            label.appendChild(
                document.createTextNode(
                    "Watch Our Roll Credits"
                )
            );

            const arrow =
                document.createElement("span");

            arrow.className =
                "hold-credits-arrow";

            arrow.setAttribute(
                "aria-hidden",
                "true"
            );

            arrow.textContent = "→";

            button.append(
                clapper,
                label,
                arrow
            );
        }

        if (!wrapper.contains(button)) {
            wrapper.appendChild(button);
        }

        /*
         * Keep this outside #holdHeartPromise because
         * that card starts with the hidden attribute.
         */
        if (footnote) {
            holdShell.insertBefore(
                wrapper,
                footnote
            );
        } else if (
            boardingWrapper &&
            boardingWrapper.parentElement === holdShell
        ) {
            boardingWrapper.insertAdjacentElement(
                "afterend",
                wrapper
            );
        } else if (!holdShell.contains(wrapper)) {
            holdShell.appendChild(wrapper);
        }

        if (
            button.dataset
                .creditsNavigationReady !== "true"
        ) {
            button.dataset
                .creditsNavigationReady = "true";

            button.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    showCreditsPage(
                        CREDITS_PAGE_ID
                    );
                }
            );
        }
    }

    function initializeRollCreditsPage() {
        ensureHoldToCreditsButton();

        const page =
            document.getElementById(
                CREDITS_PAGE_ID
            );

        if (!page) {
            console.error(
                "Roll Credits HTML is missing. " +
                "Paste the #page-roll-credits " +
                "section after your previous page."
            );

            return;
        }

        if (
            page.dataset
                .rollCreditsInitialized === "true"
        ) {
            return;
        }

        page.dataset
            .rollCreditsInitialized = "true";

        const intro =
            document.getElementById(
                "rollCreditsIntro"
            );

        const startButton =
            document.getElementById(
                "rollCreditsStartBtn"
            );

        const viewport =
            document.getElementById(
                "rollCreditsViewport"
            );

        const track =
            document.getElementById(
                "rollCreditsTrack"
            );

        const controls =
            document.getElementById(
                "rollCreditsControls"
            );

        const pauseButton =
            document.getElementById(
                "rollCreditsPauseBtn"
            );

        const skipButton =
            document.getElementById(
                "rollCreditsSkipBtn"
            );

        const progressBar =
            document.getElementById(
                "rollCreditsProgressBar"
            );

        const progressWrap =
            controls
                ? controls.querySelector(
                    ".roll-credits-progress"
                )
                : null;

        const encore =
            document.getElementById(
                "rollCreditsEncore"
            );

        const replayButton =
            document.getElementById(
                "rollCreditsReplayBtn"
            );

        const status =
            document.getElementById(
                "rollCreditsStatus"
            );

        const petalLayer =
            document.getElementById(
                "creditsPetalLayer"
            );

        if (
            !intro ||
            !startButton ||
            !viewport ||
            !track ||
            !controls ||
            !pauseButton ||
            !skipButton ||
            !progressBar ||
            !encore ||
            !replayButton ||
            !status
        ) {
            console.error(
                "Roll Credits setup stopped because " +
                "one or more required HTML IDs " +
                "are missing."
            );

            return;
        }

        let creditsState = "idle";
        let elapsedTime = 0;
        let lastStartTime = 0;
        let animationFrameId = null;
        let currentProgress = 0;

        function createPetals() {
            if (
                !petalLayer ||
                petalLayer.childElementCount > 0
            ) {
                return;
            }

            const symbols = [
                "♥",
                "✦",
                "●",
                "❀"
            ];

            const colors = [
                "#ef639b",
                "#ffd497",
                "#ffffff",
                "#c8327a"
            ];

            for (
                let index = 0;
                index < 24;
                index += 1
            ) {
                const petal =
                    document.createElement("span");

                petal.className =
                    "credits-petal";

                petal.textContent =
                    symbols[
                        index % symbols.length
                    ];

                petal.style.setProperty(
                    "--petal-left",
                    Math.random() * 100 + "%"
                );

                petal.style.setProperty(
                    "--petal-size",
                    8 + Math.random() * 13 + "px"
                );

                petal.style.setProperty(
                    "--petal-delay",
                    -Math.random() * 12 + "s"
                );

                petal.style.setProperty(
                    "--petal-duration",
                    7 + Math.random() * 7 + "s"
                );

                petal.style.setProperty(
                    "--petal-drift",
                    -90 +
                    Math.random() * 180 +
                    "px"
                );

                petal.style.setProperty(
                    "--petal-color",
                    colors[
                        index % colors.length
                    ]
                );

                petalLayer.appendChild(petal);
            }
        }

        function setPauseButton(isPaused) {
            const icon =
                document.createElement("span");

            icon.setAttribute(
                "aria-hidden",
                "true"
            );

            icon.textContent =
                isPaused ? "▶" : "⏸";

            pauseButton.replaceChildren(
                icon,
                document.createTextNode(
                    isPaused
                        ? " Resume"
                        : " Pause"
                )
            );
        }

        function renderCredits(progress) {
            const safeProgress =
                Math.max(
                    0,
                    Math.min(1, progress)
                );

            const startPosition =
                viewport.clientHeight * 0.92;

            const finishPosition =
                -track.scrollHeight;

            const currentPosition =
                startPosition +
                (
                    finishPosition -
                    startPosition
                ) *
                safeProgress;

            currentProgress =
                safeProgress;

            track.style.transform =
                "translate3d(0," +
                currentPosition +
                "px,0)";

            progressBar.style.width =
                safeProgress * 100 + "%";

            if (progressWrap) {
                progressWrap.setAttribute(
                    "aria-valuenow",
                    String(
                        Math.round(
                            safeProgress * 100
                        )
                    )
                );
            }
        }

        function finishCredits() {
            if (animationFrameId !== null) {
                window.cancelAnimationFrame(
                    animationFrameId
                );

                animationFrameId = null;
            }

            elapsedTime =
                CREDITS_DURATION;

            creditsState =
                "completed";

            renderCredits(1);

            controls.hidden = true;

            page.classList.add(
                "is-credits-completed"
            );

            encore.hidden = false;

            window.requestAnimationFrame(
                function () {
                    encore.classList.add(
                        "is-visible"
                    );
                }
            );

            status.textContent =
                "Credits mudinjiduchu… aana namma " +
                "forever ippo dhaan start. ❤️";

            window.setTimeout(
                function () {
                    encore.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                },
                450
            );
        }

        function animateCredits(timestamp) {
            if (
                creditsState !== "running"
            ) {
                return;
            }

            const liveElapsed =
                elapsedTime +
                (
                    timestamp -
                    lastStartTime
                );

            const progress =
                liveElapsed /
                CREDITS_DURATION;

            renderCredits(progress);

            if (progress >= 1) {
                finishCredits();
                return;
            }

            animationFrameId =
                window.requestAnimationFrame(
                    animateCredits
                );
        }

        function startCredits() {
            pauseAllWebsiteMedia();

            if (
                animationFrameId !== null
            ) {
                window.cancelAnimationFrame(
                    animationFrameId
                );
            }

            elapsedTime = 0;
            currentProgress = 0;
            creditsState = "running";

            lastStartTime =
                performance.now();

            page.classList.add(
                "is-credits-started"
            );

            page.classList.remove(
                "is-credits-completed"
            );

            controls.hidden = false;
            encore.hidden = true;

            encore.classList.remove(
                "is-visible"
            );

            setPauseButton(false);
            renderCredits(0);

            status.textContent =
                "Now rolling: Ram & Raji — " +
                "Forever Edition. 🎬❤️";

            animationFrameId =
                window.requestAnimationFrame(
                    animateCredits
                );
        }

        function pauseCredits() {
            if (
                creditsState !== "running"
            ) {
                return;
            }

            elapsedTime +=
                performance.now() -
                lastStartTime;

            creditsState = "paused";

            if (
                animationFrameId !== null
            ) {
                window.cancelAnimationFrame(
                    animationFrameId
                );

                animationFrameId = null;
            }

            setPauseButton(true);

            status.textContent =
                "Credits pause panniyachu. " +
                "Namma love mattum pause aagadhu. 😌❤️";
        }

        function resumeCredits() {
            if (
                creditsState !== "paused"
            ) {
                return;
            }

            creditsState = "running";

            lastStartTime =
                performance.now();

            setPauseButton(false);

            status.textContent =
                "Credits continue aagudhu… " +
                "namma forever maadhiri. ✨";

            animationFrameId =
                window.requestAnimationFrame(
                    animateCredits
                );
        }

        function toggleCreditsPause() {
            if (
                creditsState === "running"
            ) {
                pauseCredits();
            } else if (
                creditsState === "paused"
            ) {
                resumeCredits();
            }
        }

        function resetCreditsToIntro() {
            if (
                animationFrameId !== null
            ) {
                window.cancelAnimationFrame(
                    animationFrameId
                );

                animationFrameId = null;
            }

            creditsState = "idle";
            elapsedTime = 0;
            currentProgress = 0;

            page.classList.remove(
                "is-credits-started",
                "is-credits-completed"
            );

            controls.hidden = true;
            encore.hidden = true;

            encore.classList.remove(
                "is-visible"
            );

            setPauseButton(false);
            renderCredits(0);

            status.textContent =
                "Press Start — popcorn optional, " +
                "Raji mandatory. 🍿❤️";
        }

        startButton.addEventListener(
            "click",
            startCredits
        );

        pauseButton.addEventListener(
            "click",
            toggleCreditsPause
        );

        skipButton.addEventListener(
            "click",
            function () {
                if (
                    creditsState === "idle"
                ) {
                    page.classList.add(
                        "is-credits-started"
                    );
                }

                finishCredits();
            }
        );

        replayButton.addEventListener(
            "click",
            function () {
                startCredits();

                viewport.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }
        );

        /*
         * Press Space while the credits screen
         * is focused to pause or resume.
         */
        viewport.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.code === "Space"
                ) {
                    event.preventDefault();

                    toggleCreditsPause();
                }
            }
        );

        window.addEventListener(
            "resize",
            function () {
                renderCredits(
                    currentProgress
                );
            }
        );

        /*
         * Automatically pause if the browser tab
         * becomes hidden.
         */
        document.addEventListener(
            "visibilitychange",
            function () {
                if (
                    document.hidden &&
                    creditsState === "running"
                ) {
                    pauseCredits();
                }
            }
        );

        /*
         * Stop Wedding Countdown and Love FM
         * music on the Roll Credits page.
         */
        document.addEventListener(
            "play",
            function stopMediaDuringCredits(
                event
            ) {
                const media =
                    event.target;

                if (
                    page.classList.contains(
                        "active"
                    ) &&
                    media instanceof
                        HTMLMediaElement
                ) {
                    media.pause();
                }
            },
            true
        );

        const pageObserver =
            new MutationObserver(
                function () {
                    if (
                        page.classList.contains(
                            "active"
                        )
                    ) {
                        pauseAllWebsiteMedia();
                        createPetals();
                    } else if (
                        creditsState === "running"
                    ) {
                        pauseCredits();
                    }
                }
            );

        pageObserver.observe(page, {
            attributes: true,
            attributeFilter: ["class"]
        });

        document.addEventListener(
            "lovePageChanged",
            function (event) {
                if (
                    event.detail &&
                    event.detail.pageId ===
                        CREDITS_PAGE_ID
                ) {
                    pauseAllWebsiteMedia();
                    createPetals();
                }
            }
        );

        createPetals();
        resetCreditsToIntro();

        console.log(
            "Romantic Roll Credits page " +
            "initialized successfully."
        );
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeRollCreditsPage,
            { once: true }
        );
    } else {
        initializeRollCreditsPage();
    }
})();


/* ================================================================
   TRILLION STARS PAGE
   ================================================================ */

(function setupTrillionStarsPage() {
    "use strict";

    const STARS_PAGE_ID =
        "page-trillion-stars";

    const CREDITS_PAGE_ID =
        "page-roll-credits";

    function pauseAllWebsiteMedia() {
        document
            .querySelectorAll("audio, video")
            .forEach(function (media) {
                try {
                    media.pause();
                } catch (error) {
                    console.warn(
                        "Media could not be paused:",
                        error
                    );
                }
            });
    }

    function openLovePage(targetId) {
        const targetPage =
            document.getElementById(targetId);

        if (!targetPage) {
            console.error(
                'Page not found: "' +
                targetId +
                '".'
            );

            return;
        }

        pauseAllWebsiteMedia();

        document
            .querySelectorAll(".page")
            .forEach(function (page) {
                const isTarget =
                    page === targetPage;

                page.classList.toggle(
                    "active",
                    isTarget
                );

                page.setAttribute(
                    "aria-hidden",
                    isTarget
                        ? "false"
                        : "true"
                );
            });

        targetPage.hidden = false;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        document.dispatchEvent(
            new CustomEvent(
                "lovePageChanged",
                {
                    detail: {
                        pageId: targetId
                    }
                }
            )
        );
    }

    function ensureCreditsToStarsButton() {
        const creditsPage =
            document.getElementById(
                CREDITS_PAGE_ID
            );

        if (!creditsPage) {
            return;
        }

        const creditsShell =
            creditsPage.querySelector(
                ".roll-credits-shell"
            ) || creditsPage;

        const status =
            document.getElementById(
                "rollCreditsStatus"
            );

        let navigation =
            document.getElementById(
                "rollCreditsStarsNavigation"
            );

        let button =
            document.getElementById(
                "rollCreditsToStarsBtn"
            );

        if (!navigation) {
            navigation =
                document.createElement("div");

            navigation.id =
                "rollCreditsStarsNavigation";

            navigation.className =
                "roll-credits-stars-navigation";
        }

        if (!button) {
            button =
                document.createElement("button");

            button.id =
                "rollCreditsToStarsBtn";

            button.className =
                "roll-credits-to-stars-btn " +
                "page-next-btn";

            button.type = "button";

            button.dataset.loveTarget =
                STARS_PAGE_ID;

            button.innerHTML =
                "<span>Explore Our Trillion Stars ✨</span>" +
                '<span class="roll-credits-stars-arrow" ' +
                'aria-hidden="true">→</span>';
        }

        button.classList.add(
            "roll-credits-to-stars-btn",
            "page-next-btn"
        );

        button.dataset.loveTarget =
            STARS_PAGE_ID;

        button.hidden = false;
        button.removeAttribute("hidden");

        /* Repairs older HTML by moving the button out of the
           hidden #rollCreditsEncore completion card. */
        if (!navigation.contains(button)) {
            navigation.appendChild(button);
        }

        navigation.hidden = false;
        navigation.removeAttribute("hidden");

        if (
            status &&
            status.parentElement === creditsShell
        ) {
            creditsShell.insertBefore(
                navigation,
                status
            );
        } else if (
            !creditsShell.contains(navigation)
        ) {
            creditsShell.appendChild(navigation);
        }

        if (
            button.dataset
                .starsNavigationReady !== "true"
        ) {
            button.dataset
                .starsNavigationReady = "true";

            button.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    openLovePage(
                        STARS_PAGE_ID
                    );
                }
            );
        }
    }

    function initializeTrillionStarsPage() {
        ensureCreditsToStarsButton();

        const page =
            document.getElementById(
                STARS_PAGE_ID
            );

        if (!page) {
            console.error(
                "Trillion Stars HTML is missing."
            );

            return;
        }

        if (
            page.dataset
                .trillionStarsInitialized ===
            "true"
        ) {
            return;
        }

        page.dataset
            .trillionStarsInitialized =
            "true";

        const universe =
            document.getElementById(
                "trillionUniverse"
            );

        const canvas =
            document.getElementById(
                "trillionStarsCanvas"
            );

        const findButton =
            document.getElementById(
                "trillionFindStarBtn"
            );

        const favouriteStar =
            document.getElementById(
                "trillionFavouriteStar"
            );

        const status =
            document.getElementById(
                "trillionStatus"
            );

        const statusDot =
            document.getElementById(
                "trillionStatusDot"
            );

        const touchCount =
            document.getElementById(
                "trillionTouchCount"
            );

        const cosmicNote =
            document.getElementById(
                "trillionCosmicNote"
            );

        const cosmicNoteText =
            cosmicNote
                ? cosmicNote.querySelector("p")
                : null;

        const tapBurstLayer =
            document.getElementById(
                "trillionTapBurstLayer"
            );

        const reveal =
            document.getElementById(
                "trillionLoveReveal"
            );

        const searchAgainButton =
            document.getElementById(
                "trillionSearchAgainBtn"
            );

        const celebrationLayer =
            document.getElementById(
                "trillionCelebrationLayer"
            );

        if (
            !universe ||
            !canvas ||
            !findButton ||
            !favouriteStar ||
            !status ||
            !touchCount ||
            !cosmicNote ||
            !cosmicNoteText ||
            !reveal ||
            !searchAgainButton
        ) {
            console.error(
                "Trillion Stars setup stopped " +
                "because required HTML IDs " +
                "are missing."
            );

            return;
        }

        const context =
            canvas.getContext("2d");

        if (!context) {
            console.error(
                "Canvas is not supported."
            );

            return;
        }

        const loveNotes = [
            "Un smile paatha odane, en worst day-kooda konjam beautiful-a maaridum. ❤️",

            "Nee pakkathula irundha silence-kooda enakku favourite conversation dhaan.",

            "Un kooda share pannura ordinary morning-kooda enakku celebration maadhiri.",

            "Namma chinna sandaikku appuram vara andha first smile… adhu dhaan en favourite peace treaty. 😂❤️",

            "En future plans-la date, place ellam change aagalaam; aana un name mattum change aagadhu.",

            "Nee tired-a irukkum naal-la unakku rest-a irukkanum; nee happy-a irukkum naal-la un sirippula naanum irukkanum.",

            "Un voice kekkura ovvoru muraiyum, en heart-ku home vandha feeling varudhu.",

            "Vaanam full-ah stars irundhaalum, naan wish panna ore person nee mattum dhaan.",

            "Enakku perfect life vendaam, Azhagi. Un kooda irukkura real life podhum.",

            "Nee en story-la vandha character illa; nee dhaan en whole story. ✨",

            "Chennai-um Rajapalayam-um rendu place; namma heart-ku distance zero.",

            "Every universe-layum naan unna kandupidikka oru vazhi theduven. Promise. ❤️"
        ];

        let stars = [];
        let wishes = [];

        let canvasWidth = 0;
        let canvasHeight = 0;

        let animationFrameId = null;

        let touchedStars = 0;
        let isSearching = false;
        let loveWasFound = false;

        let searchTimers = [];

        function schedule(
            callback,
            delay
        ) {
            const timerId =
                window.setTimeout(
                    callback,
                    delay
                );

            searchTimers.push(timerId);

            return timerId;
        }

        function clearSearchTimers() {
            searchTimers.forEach(
                function (timerId) {
                    window.clearTimeout(
                        timerId
                    );
                }
            );

            searchTimers = [];
        }

        function randomBetween(
            minimum,
            maximum
        ) {
            return (
                minimum +
                Math.random() *
                (maximum - minimum)
            );
        }

        function createStarField() {
            if (
                canvasWidth <= 0 ||
                canvasHeight <= 0
            ) {
                return;
            }

            const reducedMotion =
                window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches;

            const starCount =
                reducedMotion
                    ? 180
                    : Math.min(
                        760,
                        Math.max(
                            280,
                            Math.floor(
                                (
                                    canvasWidth *
                                    canvasHeight
                                ) /
                                1050
                            )
                        )
                    );

            stars = [];

            for (
                let index = 0;
                index < starCount;
                index += 1
            ) {
                const colourChoice =
                    Math.random();

                let colour =
                    "255, 250, 235";

                if (colourChoice > 0.88) {
                    colour =
                        "255, 155, 205";
                } else if (
                    colourChoice > 0.78
                ) {
                    colour =
                        "167, 203, 255";
                } else if (
                    colourChoice > 0.68
                ) {
                    colour =
                        "255, 215, 137";
                }

                stars.push({
                    x:
                        Math.random() *
                        canvasWidth,

                    y:
                        Math.random() *
                        canvasHeight,

                    radius:
                        randomBetween(
                            0.35,
                            1.8
                        ),

                    baseAlpha:
                        randomBetween(
                            0.22,
                            0.88
                        ),

                    phase:
                        Math.random() *
                        Math.PI *
                        2,

                    speed:
                        randomBetween(
                            0.0006,
                            0.0021
                        ),

                    drift:
                        randomBetween(
                            -0.012,
                            0.012
                        ),

                    colour:
                        colour
                });
            }
        }

        function resizeCanvas() {
            const rectangle =
                canvas.getBoundingClientRect();

            if (
                rectangle.width <= 0 ||
                rectangle.height <= 0
            ) {
                return;
            }

            const pixelRatio =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

            canvasWidth =
                rectangle.width;

            canvasHeight =
                rectangle.height;

            canvas.width =
                Math.round(
                    canvasWidth *
                    pixelRatio
                );

            canvas.height =
                Math.round(
                    canvasHeight *
                    pixelRatio
                );

            context.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
            );

            createStarField();
        }

        function drawStar(
            star,
            timestamp
        ) {
            const twinkle =
                Math.sin(
                    timestamp *
                    star.speed +
                    star.phase
                );

            const alpha =
                Math.max(
                    0.08,
                    Math.min(
                        1,
                        star.baseAlpha +
                        twinkle *
                        0.25
                    )
                );

            star.x += star.drift;

            if (star.x < -3) {
                star.x =
                    canvasWidth + 3;
            } else if (
                star.x >
                canvasWidth + 3
            ) {
                star.x = -3;
            }

            context.beginPath();

            context.fillStyle =
                "rgba(" +
                star.colour +
                "," +
                alpha +
                ")";

            context.arc(
                star.x,
                star.y,
                star.radius,
                0,
                Math.PI * 2
            );

            context.fill();

            if (
                star.radius > 1.45 &&
                alpha > 0.62
            ) {
                context.strokeStyle =
                    "rgba(" +
                    star.colour +
                    "," +
                    alpha * 0.38 +
                    ")";

                context.lineWidth = 0.55;

                context.beginPath();

                context.moveTo(
                    star.x -
                    star.radius * 3.4,
                    star.y
                );

                context.lineTo(
                    star.x +
                    star.radius * 3.4,
                    star.y
                );

                context.moveTo(
                    star.x,
                    star.y -
                    star.radius * 3.4
                );

                context.lineTo(
                    star.x,
                    star.y +
                    star.radius * 3.4
                );

                context.stroke();
            }
        }

        function drawWishes() {
            wishes =
                wishes.filter(
                    function (wish) {
                        wish.life -= 1;

                        wish.x +=
                            wish.velocityX;

                        wish.y +=
                            wish.velocityY;

                        const progress =
                            wish.life /
                            wish.maximumLife;

                        context.save();

                        context.globalAlpha =
                            Math.max(
                                0,
                                progress
                            );

                        context.strokeStyle =
                            wish.colour;

                        context.lineWidth =
                            1.4;

                        context.shadowBlur =
                            13;

                        context.shadowColor =
                            wish.colour;

                        context.beginPath();

                        context.moveTo(
                            wish.x,
                            wish.y
                        );

                        context.lineTo(
                            wish.x -
                            wish.velocityX *
                            17,

                            wish.y -
                            wish.velocityY *
                            17
                        );

                        context.stroke();
                        context.restore();

                        return wish.life > 0;
                    }
                );
        }

        function drawUniverse(
            timestamp
        ) {
            if (
                !page.classList.contains(
                    "active"
                )
            ) {
                animationFrameId = null;
                return;
            }

            context.clearRect(
                0,
                0,
                canvasWidth,
                canvasHeight
            );

            const glow =
                context
                    .createRadialGradient(
                        canvasWidth * 0.5,
                        canvasHeight * 0.48,
                        0,

                        canvasWidth * 0.5,
                        canvasHeight * 0.48,

                        Math.max(
                            canvasWidth,
                            canvasHeight
                        ) * 0.55
                    );

            glow.addColorStop(
                0,
                "rgba(107, 48, 154, 0.12)"
            );

            glow.addColorStop(
                0.55,
                "rgba(25, 14, 69, 0.035)"
            );

            glow.addColorStop(
                1,
                "rgba(0, 0, 0, 0)"
            );

            context.fillStyle = glow;

            context.fillRect(
                0,
                0,
                canvasWidth,
                canvasHeight
            );

            stars.forEach(
                function (star) {
                    drawStar(
                        star,
                        timestamp
                    );
                }
            );

            drawWishes();

            animationFrameId =
                window.requestAnimationFrame(
                    drawUniverse
                );
        }

        function startCanvasAnimation() {
            if (
                animationFrameId !== null
            ) {
                return;
            }

            resizeCanvas();

            animationFrameId =
                window.requestAnimationFrame(
                    drawUniverse
                );
        }

        function stopCanvasAnimation() {
            if (
                animationFrameId !== null
            ) {
                window.cancelAnimationFrame(
                    animationFrameId
                );

                animationFrameId = null;
            }
        }

        function setFindButtonLabel(
            text,
            iconText
        ) {
            const icon =
                document.createElement("span");

            icon.setAttribute(
                "aria-hidden",
                "true"
            );

            icon.textContent =
                iconText;

            findButton.replaceChildren(
                icon,
                document.createTextNode(text)
            );
        }

        function updateStatus(
            message,
            loveFound
        ) {
            status.textContent = message;

            if (statusDot) {
                statusDot.classList.toggle(
                    "is-love-found",
                    Boolean(loveFound)
                );
            }
        }

        function animateCosmicNote(
            message
        ) {
            cosmicNote.classList.remove(
                "is-changing"
            );

            void cosmicNote.offsetWidth;

            cosmicNote.classList.add(
                "is-changing"
            );

            window.setTimeout(
                function () {
                    cosmicNoteText
                        .textContent =
                        message;
                },
                180
            );
        }

        function createTapSparks(
            x,
            y
        ) {
            if (!tapBurstLayer) {
                return;
            }

            const colours = [
                "#fff0a9",
                "#ff8fc2",
                "#b797ff",
                "#a5dcff"
            ];

            for (
                let index = 0;
                index < 9;
                index += 1
            ) {
                const spark =
                    document
                        .createElement(
                            "span"
                        );

                const angle =
                    (
                        Math.PI *
                        2 *
                        index
                    ) /
                    9;

                const distance =
                    randomBetween(
                        24,
                        70
                    );

                spark.className =
                    "trillion-tap-spark";

                spark.textContent =
                    index % 3 === 0
                        ? "♥"
                        : "✦";

                spark.style.setProperty(
                    "--tap-x",
                    x + "px"
                );

                spark.style.setProperty(
                    "--tap-y",
                    y + "px"
                );

                spark.style.setProperty(
                    "--tap-dx",
                    Math.cos(angle) *
                    distance +
                    "px"
                );

                spark.style.setProperty(
                    "--tap-dy",
                    Math.sin(angle) *
                    distance +
                    "px"
                );

                spark.style.setProperty(
                    "--tap-size",
                    randomBetween(
                        8,
                        17
                    ) +
                    "px"
                );

                spark.style.setProperty(
                    "--tap-color",
                    colours[
                        index %
                        colours.length
                    ]
                );

                tapBurstLayer
                    .appendChild(spark);

                window.setTimeout(
                    function () {
                        spark.remove();
                    },
                    1000
                );
            }
        }

        function handleUniverseTap(
            event
        ) {
            const rectangle =
                canvas
                    .getBoundingClientRect();

            const x =
                event.clientX -
                rectangle.left;

            const y =
                event.clientY -
                rectangle.top;

            wishes.push({
                x: x,
                y: y,

                velocityX:
                    randomBetween(
                        3.2,
                        5.7
                    ),

                velocityY:
                    randomBetween(
                        -3.6,
                        -1.8
                    ),

                life: 54,
                maximumLife: 54,

                colour:
                    Math.random() > 0.5
                        ? "#ffd98d"
                        : "#ff8fc2"
            });

            touchedStars += 1;

            touchCount.textContent =
                String(touchedStars)
                    .padStart(2, "0");

            animateCosmicNote(
                loveNotes[
                    (
                        touchedStars -
                        1
                    ) %
                    loveNotes.length
                ]
            );

            createTapSparks(x, y);
        }

        function beginFavouriteStarSearch() {
            if (
                isSearching ||
                loveWasFound
            ) {
                return;
            }

            clearSearchTimers();

            isSearching = true;

            findButton.disabled = true;

            universe.classList.add(
                "is-searching"
            );

            setFindButtonLabel(
                "Scanning Our Universe…",
                "⌁"
            );

            updateStatus(
                "Trillion signals scan pannitu irukken…",
                false
            );

            schedule(
                function () {
                    updateStatus(
                        "Chennai signal detected… " +
                        "Rajapalayam signal " +
                        "connect aagudhu…",
                        false
                    );
                },
                850
            );

            schedule(
                function () {
                    updateStatus(
                        "Oru romba bright-aana " +
                        "azhagana star " +
                        "kidaichirukku! ✨",
                        false
                    );
                },
                1800
            );

            schedule(
                function () {
                    isSearching = false;

                    universe.classList.remove(
                        "is-searching"
                    );

                    universe.classList.add(
                        "has-found-star"
                    );

                    favouriteStar.disabled =
                        false;

                    favouriteStar.setAttribute(
                        "aria-hidden",
                        "false"
                    );

                    setFindButtonLabel(
                        "Favourite Star Found",
                        "✓"
                    );

                    updateStatus(
                        "Kandupidichitten! " +
                        "Naduvula glow aagura " +
                        "star-ah tap pannu, " +
                        "Azhagi. ❤️",
                        true
                    );
                },
                3000
            );
        }

        function createLoveCelebration() {
            if (!celebrationLayer) {
                return;
            }

            celebrationLayer
                .replaceChildren();

            const symbols = [
                "✦",
                "♥",
                "✧",
                "★",
                "♥"
            ];

            const colours = [
                "#fff1ad",
                "#ff83bb",
                "#c6a4ff",
                "#9bdcff"
            ];

            for (
                let index = 0;
                index < 46;
                index += 1
            ) {
                const particle =
                    document
                        .createElement(
                            "span"
                        );

                const angle =
                    Math.random() *
                    Math.PI *
                    2;

                const distance =
                    randomBetween(
                        120,
                        520
                    );

                particle.className =
                    "trillion-celebration-star";

                particle.textContent =
                    symbols[
                        index %
                        symbols.length
                    ];

                particle.style.setProperty(
                    "--celebrate-left",
                    "50%"
                );

                particle.style.setProperty(
                    "--celebrate-top",
                    "42%"
                );

                particle.style.setProperty(
                    "--celebrate-x",
                    Math.cos(angle) *
                    distance +
                    "px"
                );

                particle.style.setProperty(
                    "--celebrate-y",
                    Math.sin(angle) *
                    distance +
                    "px"
                );

                particle.style.setProperty(
                    "--celebrate-size",
                    randomBetween(
                        9,
                        24
                    ) +
                    "px"
                );

                particle.style.setProperty(
                    "--celebrate-delay",
                    Math.random() *
                    0.35 +
                    "s"
                );

                particle.style.setProperty(
                    "--celebrate-duration",
                    randomBetween(
                        1.4,
                        2.8
                    ) +
                    "s"
                );

                particle.style.setProperty(
                    "--celebrate-spin",
                    randomBetween(
                        -720,
                        720
                    ) +
                    "deg"
                );

                particle.style.setProperty(
                    "--celebrate-color",
                    colours[
                        index %
                        colours.length
                    ]
                );

                celebrationLayer
                    .appendChild(particle);
            }

            window.setTimeout(
                function () {
                    celebrationLayer
                        .replaceChildren();
                },
                3800
            );
        }

        function revealFavouriteStar() {
            if (
                loveWasFound ||
                favouriteStar.disabled
            ) {
                return;
            }

            loveWasFound = true;

            favouriteStar.disabled = true;

            favouriteStar.setAttribute(
                "aria-hidden",
                "true"
            );

            universe.classList.add(
                "has-found-love"
            );

            createLoveCelebration();

            updateStatus(
                "Search complete: Ram-oda " +
                "one and only favourite " +
                "star — RAJI. ❤️",
                true
            );

            animateCosmicNote(
                "Plot twist: naan star-ah " +
                "search pannala… ovvoru " +
                "universe-layum unna dhaan " +
                "search panninen. ✨"
            );

            reveal.hidden = false;

            window.requestAnimationFrame(
                function () {
                    reveal.classList.add(
                        "is-visible"
                    );
                }
            );

            window.setTimeout(
                function () {
                    if (
                        window.matchMedia(
                            "(max-width: 760px)"
                        ).matches
                    ) {
                        reveal.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                },
                1500
            );
        }

        function resetStarSearch() {
            clearSearchTimers();

            isSearching = false;
            loveWasFound = false;

            universe.classList.remove(
                "is-searching",
                "has-found-star",
                "has-found-love"
            );

            favouriteStar.disabled = true;

            favouriteStar.setAttribute(
                "aria-hidden",
                "true"
            );

            findButton.disabled = false;

            setFindButtonLabel(
                "Find Ram's Favourite Star",
                "⌖"
            );

            reveal.hidden = true;

            reveal.classList.remove(
                "is-visible"
            );

            updateStatus(
                "Telescope ready. En favourite " +
                "star-ah search pannalama? 🔭",
                false
            );

            animateCosmicNote(
                "Universe reset aagiduchu… " +
                "aana en favourite star " +
                "eppavume nee dhaan. ❤️"
            );
        }

        canvas.addEventListener(
            "click",
            handleUniverseTap
        );

        findButton.addEventListener(
            "click",
            beginFavouriteStarSearch
        );

        favouriteStar.addEventListener(
            "click",
            function (event) {
                event.stopPropagation();

                revealFavouriteStar();
            }
        );

        searchAgainButton.addEventListener(
            "click",
            function () {
                resetStarSearch();

                universe.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                schedule(
                    beginFavouriteStarSearch,
                    700
                );
            }
        );

        window.addEventListener(
            "resize",
            function () {
                if (
                    page.classList.contains(
                        "active"
                    )
                ) {
                    resizeCanvas();
                }
            }
        );

        /*
         * Prevent music from other pages
         * playing on this page.
         */
        document.addEventListener(
            "play",
            function stopMediaOnStarsPage(
                event
            ) {
                const media =
                    event.target;

                if (
                    page.classList.contains(
                        "active"
                    ) &&
                    media instanceof
                        HTMLMediaElement
                ) {
                    media.pause();
                }
            },
            true
        );

        const pageObserver =
            new MutationObserver(
                function () {
                    if (
                        page.classList.contains(
                            "active"
                        )
                    ) {
                        pauseAllWebsiteMedia();

                        window.setTimeout(
                            startCanvasAnimation,
                            60
                        );
                    } else {
                        stopCanvasAnimation();
                    }
                }
            );

        pageObserver.observe(page, {
            attributes: true,
            attributeFilter: ["class"]
        });

        document.addEventListener(
            "lovePageChanged",
            function (event) {
                if (
                    event.detail &&
                    event.detail.pageId ===
                        STARS_PAGE_ID
                ) {
                    pauseAllWebsiteMedia();

                    window.setTimeout(
                        startCanvasAnimation,
                        60
                    );
                }
            }
        );

        document.addEventListener(
            "visibilitychange",
            function () {
                if (document.hidden) {
                    stopCanvasAnimation();
                } else if (
                    page.classList.contains(
                        "active"
                    )
                ) {
                    startCanvasAnimation();
                }
            }
        );

        if (
            page.classList.contains(
                "active"
            )
        ) {
            window.setTimeout(
                startCanvasAnimation,
                60
            );
        }

        console.log(
            "Trillion Stars page " +
            "initialized successfully."
        );
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeTrillionStarsPage,
            { once: true }
        );
    } else {
        initializeTrillionStarsPage();
    }
})();


/* ================================================================
   GRAND FINALE PAGE
   ================================================================ */

/* ================================================================
   GRAND FINALE PAGE — PERFORMANCE OPTIMIZED
   Trillion Stars → Grand Finale
================================================================ */

(function setupGrandFinale() {
    "use strict";

    const FINALE_PAGE_ID = "page-grand-finale";
    const STARS_PAGE_ID = "page-trillion-stars";
    const MAX_PARTICLES = 450;

    const colors = [
        "#ffd27d",
        "#ff77ad",
        "#fff4cf",
        "#b98cff",
        "#73dcff",
        "#ff9bd0",
        "#8fffc4"
    ];

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let page;
    let canvas;
    let context;
    let stage;
    let launchButton;
    let replayButton;
    let finalMessage;
    let status;
    let burstCounter;
    let celebrationLayer;

    let canvasWidth = 0;
    let canvasHeight = 0;
    let pixelRatio = 1;

    let animationFrame = 0;
    let resizeFrame = 0;

    let pageIsActive = false;
    let showIsRunning = false;
    let welcomePlayed = false;
    let burstCount = 0;
    let lastPointerLaunch = 0;

    const rockets = [];
    const particles = [];
    const timers = new Set();


    /* ============================================================
       SMALL HELPERS
    ============================================================ */

    function random(minimum, maximum) {
        return (
            minimum +
            Math.random() *
            (maximum - minimum)
        );
    }


    function randomItem(items) {
        return items[
            Math.floor(
                Math.random() *
                items.length
            )
        ];
    }


    function isSmallScreen() {
        return window.innerWidth < 600;
    }


    function pauseAllMedia() {
        document
            .querySelectorAll("audio, video")
            .forEach(function (media) {
                try {
                    media.pause();
                } catch (error) {
                    console.warn(
                        "Media could not be paused:",
                        error
                    );
                }
            });
    }


    /* ============================================================
       PAGE NAVIGATION
    ============================================================ */

    function fallbackOpenPage(pageId) {
        const targetPage =
            document.getElementById(pageId);

        if (!targetPage) {
            console.error(
                `Page not found: ${pageId}`
            );

            return false;
        }

        document
            .querySelectorAll(".page")
            .forEach(function (currentPage) {
                const isTarget =
                    currentPage === targetPage;

                currentPage.classList.toggle(
                    "active",
                    isTarget
                );

                currentPage.setAttribute(
                    "aria-hidden",
                    isTarget
                        ? "false"
                        : "true"
                );
            });

        targetPage.hidden = false;
        targetPage.removeAttribute("hidden");

        return true;
    }


    function openFinalePage() {
        pauseAllMedia();

        if (
            typeof window.showPage ===
            "function"
        ) {
            window.showPage(
                FINALE_PAGE_ID
            );
        } else if (
            typeof window.activateLovePage ===
            "function"
        ) {
            window.activateLovePage(
                FINALE_PAGE_ID
            );
        } else {
            fallbackOpenPage(
                FINALE_PAGE_ID
            );
        }

        window.scrollTo({
            top: 0,

            behavior:
                reducedMotion.matches
                    ? "auto"
                    : "smooth"
        });

        window.requestAnimationFrame(
            syncPageState
        );
    }


    /* ============================================================
       REMOVE WRONG HOLD MY HEART BUTTON
    ============================================================ */

    function removeMisplacedFinaleButtons() {
        const wrongSelectors = [
            "#holdFinaleNavigation",
            "#holdToFinaleBtn",
            "#holdGrandFinaleNavigation",
            "#holdToGrandFinaleBtn",

            "#page-hold-my-heart .hold-finale-navigation",
            "#page-hold-my-heart .hold-finale-btn",

            "#page-hold-my-heart .hold-grand-finale-navigation",
            "#page-hold-my-heart .hold-grand-finale-btn",

            '#page-hold-my-heart [data-love-target="page-grand-finale"]'
        ];

        wrongSelectors.forEach(
            function (selector) {
                document
                    .querySelectorAll(selector)
                    .forEach(function (element) {
                        element.remove();
                    });
            }
        );
    }


    /* ============================================================
       KEEP GRAND FINALE BUTTON IN TRILLION STARS
    ============================================================ */

    function ensureTrillionFinaleButton() {
        removeMisplacedFinaleButtons();

        const starsPage =
            document.getElementById(
                STARS_PAGE_ID
            );

        if (!starsPage) {
            console.error(
                "Trillion Stars page is missing."
            );

            return;
        }

        const starsShell =
            starsPage.querySelector(
                ".trillion-stars-shell"
            ) || starsPage;

        const loveReveal =
            starsPage.querySelector(
                "#trillionLoveReveal"
            );

        let navigation =
            document.getElementById(
                "trillionGrandFinaleNavigation"
            );

        let button =
            document.getElementById(
                "trillionToGrandFinaleBtn"
            );


        if (!navigation) {
            navigation =
                document.createElement("div");

            navigation.id =
                "trillionGrandFinaleNavigation";

            navigation.className =
                "trillion-grand-finale-navigation";
        }


        if (!button) {
            button =
                document.createElement(
                    "button"
                );

            button.id =
                "trillionToGrandFinaleBtn";

            button.className =
                "trillion-grand-finale-btn " +
                "page-next-btn";

            button.type = "button";

            button.innerHTML = `
                <span>
                    Enter Our Grand Finale 🎆
                </span>

                <span
                    class="trillion-grand-finale-arrow"
                    aria-hidden="true"
                >
                    →
                </span>
            `;
        }


        button.dataset.loveTarget =
            FINALE_PAGE_ID;

        button.setAttribute(
            "aria-controls",
            FINALE_PAGE_ID
        );

        button.hidden = false;
        button.removeAttribute("hidden");

        navigation.hidden = false;
        navigation.removeAttribute("hidden");


        if (
            !navigation.contains(button)
        ) {
            navigation.appendChild(button);
        }


        /*
         * Place the navigation after the
         * Trillion Stars love reveal.
         */

        if (
            loveReveal &&
            loveReveal.parentElement ===
                starsShell
        ) {
            loveReveal.insertAdjacentElement(
                "afterend",
                navigation
            );
        } else if (
            navigation.parentElement !==
                starsShell
        ) {
            starsShell.appendChild(
                navigation
            );
        }


        /*
         * Direct navigation fallback.
         * Your global data-love-target navigation
         * will normally handle this first.
         */

        if (
            button.dataset
                .grandFinaleNavigationReady !==
            "true"
        ) {
            button.dataset
                .grandFinaleNavigationReady =
            "true";

            button.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();

                    const finale =
                        document.getElementById(
                            FINALE_PAGE_ID
                        );

                    if (
                        !finale ||
                        !finale.classList
                            .contains("active")
                    ) {
                        openFinalePage();
                    } else {
                        pauseAllMedia();

                        window
                            .requestAnimationFrame(
                                syncPageState
                            );
                    }
                }
            );
        }
    }


    /* ============================================================
       SAFE TIMERS
    ============================================================ */

    function schedule(
        callback,
        delay
    ) {
        const timer =
            window.setTimeout(
                function () {
                    timers.delete(timer);

                    if (
                        pageIsActive &&
                        !document.hidden
                    ) {
                        callback();
                    }
                },
                delay
            );

        timers.add(timer);

        return timer;
    }


    function clearTimers() {
        timers.forEach(
            function (timer) {
                window.clearTimeout(timer);
            }
        );

        timers.clear();
    }


    /* ============================================================
       PERFORMANCE-OPTIMIZED CANVAS
    ============================================================ */

    function resizeCanvas() {
        if (
            !canvas ||
            !context ||
            !stage ||
            !pageIsActive
        ) {
            return;
        }

        const rectangle =
            stage.getBoundingClientRect();

        const nextWidth =
            Math.max(
                1,
                Math.round(
                    rectangle.width
                )
            );

        const nextHeight =
            Math.max(
                1,
                Math.round(
                    rectangle.height
                )
            );

        /*
         * Limit canvas resolution.
         * High DPR values create large canvases
         * and cause mobile/low-end device lag.
         */

        const nextRatio =
            Math.min(
                window.devicePixelRatio || 1,

                isSmallScreen()
                    ? 1
                    : 1.25
            );


        if (
            nextWidth === canvasWidth &&
            nextHeight === canvasHeight &&
            nextRatio === pixelRatio
        ) {
            return;
        }


        canvasWidth = nextWidth;
        canvasHeight = nextHeight;
        pixelRatio = nextRatio;

        canvas.width =
            Math.round(
                canvasWidth *
                pixelRatio
            );

        canvas.height =
            Math.round(
                canvasHeight *
                pixelRatio
            );

        canvas.style.width = "100%";
        canvas.style.height = "100%";

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );
    }


    function queueCanvasResize() {
        if (
            resizeFrame ||
            !pageIsActive
        ) {
            return;
        }

        resizeFrame =
            window.requestAnimationFrame(
                function () {
                    resizeFrame = 0;
                    resizeCanvas();
                }
            );
    }


    function getStagePoint(
        horizontalRatio,
        verticalRatio
    ) {
        return {
            x:
                canvasWidth *
                horizontalRatio,

            y:
                canvasHeight *
                verticalRatio
        };
    }


    /* ============================================================
       ROCKET CREATION
    ============================================================ */

    function createRocket(
        targetX,
        targetY,
        shape
    ) {
        if (
            !pageIsActive ||
            document.hidden
        ) {
            return;
        }

        const startY =
            Math.max(
                targetY + 120,
                canvasHeight - 18
            );

        const startX =
            targetX +
            random(-34, 34);

        rockets.push({
            startX: startX,
            startY: startY,

            x: startX,
            y: startY,

            targetX: targetX,
            targetY: targetY,

            progress: 0,

            speed:
                random(
                    0.025,
                    0.038
                ),

            color:
                randomItem(colors),

            shape:
                shape ||
                randomItem([
                    "circle",
                    "ring",
                    "heart"
                ]),

            trail: []
        });
    }


    function createParticle(
        x,
        y,
        velocityX,
        velocityY,
        color
    ) {
        /*
         * Prevent unlimited particles.
         */

        if (
            particles.length >=
            MAX_PARTICLES
        ) {
            return;
        }

        particles.push({
            x: x,
            y: y,

            previousX: x,
            previousY: y,

            velocityX: velocityX,
            velocityY: velocityY,

            gravity:
                random(
                    0.04,
                    0.075
                ),

            friction:
                random(
                    0.972,
                    0.985
                ),

            opacity: 1,

            fadeSpeed:
                random(
                    0.014,
                    0.024
                ),

            size:
                random(
                    1,
                    2.4
                ),

            color: color,

            twinkle:
                Math.random() > 0.72
        });
    }


    /* ============================================================
       FIREWORK SHAPES
    ============================================================ */

    function createCircleExplosion(
        x,
        y,
        color,
        total
    ) {
        for (
            let index = 0;
            index < total;
            index += 1
        ) {
            const angle =
                Math.PI *
                2 *
                index /
                total;

            const speed =
                random(
                    1.7,
                    5
                );

            createParticle(
                x,
                y,

                Math.cos(angle) *
                    speed,

                Math.sin(angle) *
                    speed,

                color
            );
        }
    }


    function createRingExplosion(
        x,
        y,
        color,
        total
    ) {
        for (
            let index = 0;
            index < total;
            index += 1
        ) {
            const angle =
                Math.PI *
                2 *
                index /
                total;

            const speed =
                index % 2 === 0
                    ? random(3.4, 4.8)
                    : random(1.7, 2.6);

            createParticle(
                x,
                y,

                Math.cos(angle) *
                    speed,

                Math.sin(angle) *
                    speed,

                index % 2 === 0
                    ? color
                    : randomItem(colors)
            );
        }
    }


    function createHeartExplosion(
        x,
        y,
        color,
        total
    ) {
        for (
            let index = 0;
            index < total;
            index += 1
        ) {
            const angle =
                Math.PI *
                2 *
                index /
                total;

            const sine =
                Math.sin(angle);

            const heartX =
                16 *
                sine *
                sine *
                sine;

            const heartY = -(
                13 *
                    Math.cos(angle) -

                5 *
                    Math.cos(
                        2 * angle
                    ) -

                2 *
                    Math.cos(
                        3 * angle
                    ) -

                Math.cos(
                    4 * angle
                )
            );

            const scale =
                random(
                    0.19,
                    0.26
                );

            createParticle(
                x,
                y,

                heartX * scale,
                heartY * scale,

                color
            );
        }
    }


    function explodeRocket(
        x,
        y,
        color,
        shape
    ) {
        const particleTotal =
            reducedMotion.matches
                ? 16

                : isSmallScreen()
                    ? 22
                    : 34;


        if (shape === "heart") {
            createHeartExplosion(
                x,
                y,
                color,
                particleTotal
            );
        } else if (
            shape === "ring"
        ) {
            createRingExplosion(
                x,
                y,
                color,
                particleTotal
            );
        } else {
            createCircleExplosion(
                x,
                y,
                color,
                particleTotal
            );
        }


        burstCount += 1;

        if (burstCounter) {
            burstCounter.textContent =
                String(
                    burstCount
                ).padStart(
                    2,
                    "0"
                );
        }
    }


    /* ============================================================
       UPDATE FIREWORKS
    ============================================================ */

    function updateRockets() {
        for (
            let index =
                rockets.length - 1;

            index >= 0;

            index -= 1
        ) {
            const rocket =
                rockets[index];

            rocket.trail.push({
                x: rocket.x,
                y: rocket.y
            });

            if (
                rocket.trail.length > 6
            ) {
                rocket.trail.shift();
            }

            rocket.progress =
                Math.min(
                    1,

                    rocket.progress +
                        rocket.speed
                );

            const easedProgress =
                1 -
                Math.pow(
                    1 -
                    rocket.progress,
                    3
                );

            rocket.x =
                rocket.startX +
                (
                    rocket.targetX -
                    rocket.startX
                ) *
                easedProgress;

            rocket.y =
                rocket.startY +
                (
                    rocket.targetY -
                    rocket.startY
                ) *
                easedProgress;


            if (
                rocket.progress >= 1
            ) {
                explodeRocket(
                    rocket.targetX,
                    rocket.targetY,
                    rocket.color,
                    rocket.shape
                );

                rockets.splice(
                    index,
                    1
                );
            }
        }
    }


    function updateParticles() {
        for (
            let index =
                particles.length - 1;

            index >= 0;

            index -= 1
        ) {
            const particle =
                particles[index];

            particle.previousX =
                particle.x;

            particle.previousY =
                particle.y;

            particle.velocityX *=
                particle.friction;

            particle.velocityY *=
                particle.friction;

            particle.velocityY +=
                particle.gravity;

            particle.x +=
                particle.velocityX;

            particle.y +=
                particle.velocityY;

            particle.opacity -=
                particle.fadeSpeed;


            if (
                particle.opacity <= 0
            ) {
                particles.splice(
                    index,
                    1
                );
            }
        }
    }


    /* ============================================================
       DRAW FIREWORKS
    ============================================================ */

    function drawRockets() {
        rockets.forEach(
            function (rocket) {
                if (
                    rocket.trail.length > 1
                ) {
                    context.beginPath();

                    context.moveTo(
                        rocket.trail[0].x,
                        rocket.trail[0].y
                    );

                    rocket.trail.forEach(
                        function (point) {
                            context.lineTo(
                                point.x,
                                point.y
                            );
                        }
                    );

                    context.lineTo(
                        rocket.x,
                        rocket.y
                    );

                    context.strokeStyle =
                        rocket.color;

                    context.globalAlpha =
                        0.65;

                    context.lineWidth =
                        1.4;

                    context.stroke();
                }


                context.beginPath();

                context.arc(
                    rocket.x,
                    rocket.y,
                    2.2,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    "#fffbe8";

                context.globalAlpha = 1;

                context.fill();
            }
        );
    }


    function drawParticles() {
        particles.forEach(
            function (particle) {
                context.beginPath();

                context.moveTo(
                    particle.previousX,
                    particle.previousY
                );

                context.lineTo(
                    particle.x,
                    particle.y
                );

                context.strokeStyle =
                    particle.color;

                context.globalAlpha =
                    particle.twinkle
                        ? particle.opacity *
                            0.62
                        : particle.opacity;

                context.lineWidth =
                    particle.size;

                context.stroke();
            }
        );
    }


    /* ============================================================
       ANIMATION LOOP
    ============================================================ */

    function animateFireworks() {
        animationFrame = 0;

        if (
            !pageIsActive ||
            document.hidden ||
            !context
        ) {
            return;
        }

        context.clearRect(
            0,
            0,
            canvasWidth,
            canvasHeight
        );

        context.save();

        context.globalCompositeOperation =
            "lighter";

        updateRockets();
        updateParticles();

        drawRockets();
        drawParticles();

        context.restore();


        /*
         * Important performance fix:
         * stop requestAnimationFrame when
         * there are no fireworks left.
         */

        if (
            rockets.length ||
            particles.length
        ) {
            animationFrame =
                window.requestAnimationFrame(
                    animateFireworks
                );
        }
    }


    function startAnimation() {
        if (
            !animationFrame &&
            pageIsActive &&
            !document.hidden &&
            (
                rockets.length ||
                particles.length
            )
        ) {
            animationFrame =
                window.requestAnimationFrame(
                    animateFireworks
                );
        }
    }


    function launchAtStage(
        horizontalRatio,
        verticalRatio,
        shape
    ) {
        if (
            !stage ||
            !pageIsActive ||
            document.hidden
        ) {
            return;
        }

        resizeCanvas();

        const target =
            getStagePoint(
                horizontalRatio,
                verticalRatio
            );

        createRocket(
            target.x,
            target.y,
            shape
        );

        startAnimation();
    }


    /* ============================================================
       LAUNCH BUTTON
    ============================================================ */

    function updateLaunchButton(
        isRunning
    ) {
        if (!launchButton) {
            return;
        }

        launchButton.disabled =
            isRunning;

        const label =
            launchButton.querySelector(
                ".grand-launch-copy strong"
            );

        if (label) {
            label.textContent =
                isRunning
                    ? "Namma Vaanam Lighting Up…"
                    : "Light Our Forever Sky";
        }
    }


    /* ============================================================
       CELEBRATION HEARTS
    ============================================================ */

    function createCelebrationHearts() {
        if (!celebrationLayer) {
            return;
        }

        celebrationLayer.replaceChildren();

        const total =
            reducedMotion.matches
                ? 5

                : isSmallScreen()
                    ? 8
                    : 14;


        for (
            let index = 0;
            index < total;
            index += 1
        ) {
            const heart =
                document.createElement(
                    "span"
                );

            heart.className =
                "grand-floating-heart";

            heart.textContent =
                index % 4 === 0
                    ? "✦"
                    : "♥";

            heart.style.setProperty(
                "--heart-left",
                `${random(2, 98)}%`
            );

            heart.style.setProperty(
                "--heart-size",
                `${random(12, 27)}px`
            );

            heart.style.setProperty(
                "--heart-color",
                randomItem(colors)
            );

            heart.style.setProperty(
                "--heart-delay",
                `${random(0, 0.65)}s`
            );

            heart.style.setProperty(
                "--heart-duration",
                `${random(2.7, 4.3)}s`
            );

            heart.style.setProperty(
                "--heart-drift",
                `${random(-75, 75)}px`
            );

            heart.style.setProperty(
                "--heart-spin",
                `${random(-130, 130)}deg`
            );

            heart.addEventListener(
                "animationend",
                function () {
                    heart.remove();
                },
                { once: true }
            );

            celebrationLayer.appendChild(
                heart
            );
        }
    }


    /* ============================================================
       COMPLETE FIREWORK SHOW
    ============================================================ */

    function completeFireworksShow() {
        if (!pageIsActive) {
            return;
        }

        showIsRunning = false;

        updateLaunchButton(false);

        stage.classList.remove(
            "is-showing"
        );

        status.textContent =
            "Vaanam full-ah namma kadhal colour, Azhagi. Crackers mudinjudhu… namma forever ippo dhaan start! ❤️";

        finalMessage.hidden = false;

        finalMessage.removeAttribute(
            "hidden"
        );

        createCelebrationHearts();

        window.requestAnimationFrame(
            function () {
                finalMessage.scrollIntoView({
                    behavior:
                        reducedMotion.matches
                            ? "auto"
                            : "smooth",

                    block: "center"
                });
            }
        );
    }


    /* ============================================================
       FULL FIREWORK SHOW
    ============================================================ */

    function startFullFireworksShow() {
        if (
            !pageIsActive ||
            showIsRunning ||
            document.hidden
        ) {
            return;
        }

        clearTimers();

        showIsRunning = true;
        burstCount = 0;

        rockets.length = 0;
        particles.length = 0;

        burstCounter.textContent = "00";

        finalMessage.hidden = true;

        stage.classList.add(
            "is-showing"
        );

        status.textContent =
            "Ready… 3, 2, 1… Ram ❤️ Raji forever show starts now! 🎆";

        updateLaunchButton(true);

        resizeCanvas();


        /*
         * Optimized sequence:
         * only eight controlled bursts.
         */

        const regularSequence = [
            [0, 0.18, 0.32, "circle"],
            [420, 0.82, 0.29, "ring"],
            [900, 0.50, 0.23, "heart"],
            [1500, 0.30, 0.47, "ring"],
            [2050, 0.70, 0.45, "circle"],
            [2700, 0.18, 0.22, "heart"],
            [3200, 0.82, 0.22, "ring"],
            [3750, 0.50, 0.38, "heart"]
        ];


        const reducedSequence = [
            [0, 0.25, 0.32, "circle"],
            [360, 0.75, 0.30, "ring"],
            [720, 0.50, 0.24, "heart"]
        ];


        const sequence =
            reducedMotion.matches
                ? reducedSequence
                : regularSequence;


        sequence.forEach(
            function (firework) {
                schedule(
                    function () {
                        launchAtStage(
                            firework[1],
                            firework[2],
                            firework[3]
                        );
                    },
                    firework[0]
                );
            }
        );


        schedule(
            completeFireworksShow,

            reducedMotion.matches
                ? 1700
                : 5600
        );
    }


    /* ============================================================
       SMALL WELCOME FIREWORKS
    ============================================================ */

    function playWelcomeFireworks() {
        if (
            welcomePlayed ||
            !pageIsActive ||
            document.hidden
        ) {
            return;
        }

        welcomePlayed = true;

        schedule(
            function () {
                launchAtStage(
                    0.30,
                    0.31,
                    "circle"
                );
            },
            350
        );

        schedule(
            function () {
                launchAtStage(
                    0.70,
                    0.28,
                    "heart"
                );
            },
            720
        );
    }


    /* ============================================================
       TAP-TO-LAUNCH FIREWORK
    ============================================================ */

    function launchCustomFirework(
        event
    ) {
        const clickedElement =
            event.target instanceof Element
                ? event.target
                : null;

        if (
            !pageIsActive ||
            document.hidden ||
            clickedElement?.closest(
                "button"
            )
        ) {
            return;
        }


        /*
         * Prevent excessive rapid clicks.
         */

        const currentTime =
            performance.now();

        if (
            currentTime -
            lastPointerLaunch <
            90
        ) {
            return;
        }

        lastPointerLaunch =
            currentTime;


        const rectangle =
            stage.getBoundingClientRect();

        const targetX =
            Math.max(
                12,

                Math.min(
                    rectangle.width - 12,

                    event.clientX -
                        rectangle.left
                )
            );

        const targetY =
            Math.max(
                20,

                Math.min(
                    rectangle.height * 0.7,

                    event.clientY -
                        rectangle.top
                )
            );


        createRocket(
            targetX,
            targetY,

            randomItem([
                "circle",
                "ring",
                "heart"
            ])
        );

        startAnimation();


        if (!showIsRunning) {
            status.textContent =
                "Nee tap panna edathula kooda love vedikkudhu paaru! 😂❤️";
        }
    }


    /* ============================================================
       STOP AND CLEAN FIREWORKS
    ============================================================ */

    function stopAnimation() {
        clearTimers();

        showIsRunning = false;

        rockets.length = 0;
        particles.length = 0;


        if (animationFrame) {
            window.cancelAnimationFrame(
                animationFrame
            );

            animationFrame = 0;
        }


        if (resizeFrame) {
            window.cancelAnimationFrame(
                resizeFrame
            );

            resizeFrame = 0;
        }


        if (context) {
            context.clearRect(
                0,
                0,
                canvasWidth,
                canvasHeight
            );
        }


        if (stage) {
            stage.classList.remove(
                "is-showing"
            );
        }


        if (celebrationLayer) {
            celebrationLayer
                .replaceChildren();
        }

        updateLaunchButton(false);
    }


    /* ============================================================
       PAGE ACTIVE STATE
    ============================================================ */

    function syncPageState() {
        if (!page) {
            return;
        }

        const currentlyActive =
            page.classList.contains(
                "active"
            ) &&

            page.getAttribute(
                "aria-hidden"
            ) !== "true" &&

            !page.hidden &&

            !document.hidden;


        if (
            currentlyActive ===
            pageIsActive
        ) {
            if (currentlyActive) {
                queueCanvasResize();
            }

            return;
        }


        pageIsActive =
            currentlyActive;


        if (pageIsActive) {
            pauseAllMedia();

            window.requestAnimationFrame(
                function () {
                    resizeCanvas();
                    playWelcomeFireworks();
                }
            );
        } else {
            stopAnimation();
        }
    }


    /* ============================================================
       INITIALIZATION
    ============================================================ */

    function initializeGrandFinale() {
        /*
         * First remove the wrong Hold page button
         * and secure the correct Stars page button.
         */

        ensureTrillionFinaleButton();


        page =
            document.getElementById(
                FINALE_PAGE_ID
            );

        if (!page) {
            console.error(
                "Grand Finale HTML is missing."
            );

            return;
        }


        if (
            page.dataset
                .grandFinaleInitialized ===
            "true"
        ) {
            return;
        }

        page.dataset
            .grandFinaleInitialized =
        "true";


        canvas =
            document.getElementById(
                "grandFireworksCanvas"
            );

        stage =
            document.getElementById(
                "grandFireworksStage"
            );

        launchButton =
            document.getElementById(
                "grandLaunchBtn"
            );

        replayButton =
            document.getElementById(
                "grandReplayBtn"
            );

        finalMessage =
            document.getElementById(
                "grandFinalMessage"
            );

        status =
            document.getElementById(
                "grandFireworksStatus"
            );

        burstCounter =
            document.getElementById(
                "grandBurstCount"
            );

        celebrationLayer =
            document.getElementById(
                "grandCelebrationLayer"
            );


        if (
            !canvas ||
            !stage ||
            !launchButton ||
            !replayButton ||
            !finalMessage ||
            !status ||
            !burstCounter
        ) {
            console.error(
                "Grand Finale elements are incomplete."
            );

            return;
        }


        /*
         * Critical performance fix:
         * move the canvas inside the fireworks
         * stage instead of covering the whole page.
         */

        if (
            canvas.parentElement !==
            stage
        ) {
            stage.prepend(canvas);
        }


        context =
            canvas.getContext(
                "2d",
                {
                    alpha: true
                }
            );

        if (!context) {
            console.error(
                "Canvas is not supported."
            );

            return;
        }


        launchButton.addEventListener(
            "click",
            startFullFireworksShow
        );


        replayButton.addEventListener(
            "click",
            function () {
                stage.scrollIntoView({
                    behavior:
                        reducedMotion.matches
                            ? "auto"
                            : "smooth",

                    block: "center"
                });

                schedule(
                    startFullFireworksShow,
                    180
                );
            }
        );


        stage.addEventListener(
            "click",
            launchCustomFirework
        );


        stage.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }

                if (
                    event.target ===
                    launchButton
                ) {
                    return;
                }

                event.preventDefault();

                launchAtStage(
                    random(0.2, 0.8),
                    random(0.2, 0.5),

                    randomItem([
                        "circle",
                        "ring",
                        "heart"
                    ])
                );
            }
        );


        window.addEventListener(
            "resize",
            queueCanvasResize,
            {
                passive: true
            }
        );


        document.addEventListener(
            "lovePageChanged",
            function () {
                window.requestAnimationFrame(
                    syncPageState
                );
            }
        );


        document.addEventListener(
            "visibilitychange",
            syncPageState
        );


        /*
         * Observe only active/hidden changes.
         * Do not use ResizeObserver on the
         * entire Grand Finale page.
         */

        const pageObserver =
            new MutationObserver(
                syncPageState
            );

        pageObserver.observe(
            page,
            {
                attributes: true,

                attributeFilter: [
                    "class",
                    "aria-hidden",
                    "hidden"
                ]
            }
        );


        syncPageState();

        console.log(
            "Grand Finale initialized successfully."
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeGrandFinale,
            {
                once: true
            }
        );
    } else {
        initializeGrandFinale();
    }
})();


/* ================================================================
   NAMMA VAASAL KOLAM — FINAL PAGE
   Matches the existing Namma Vaasal Kolam HTML and CSS.
   ================================================================ */

(function setupVaasalKolamPage() {
    "use strict";

    const PAGE_ID = "page-vaasal-kolam";
    const TOTAL_STEPS = 9;

    const stepMessages = [
        "Mudhal pulli-la namma rendu hearts meet aagudhu. ❤️",
        "Rajapalayam kaalai maadhiri oru azhagana petal ready. 🌿",
        "Un sirippu maadhiri innoru pakkam bright aagudhu. ✨",
        "Chennai pakkamum namma kolathoda serndhuduchu. 🌊",
        "Rendu oorukkum naduvula love route complete aagudhu. ❤️",
        "Namma future home vaasal konjam konjama azhagaagudhu. 🏠",
        "Innum moonu pulli dhaan, Azhagi… kaiya vidaadha. 🤝",
        "Ore oru pulli baaki — namma forever romba pakkathula. 💕",
        "Kolam complete! Rendu ooru mudinju, ore veedu aarambam. 🪷❤️"
    ];

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let page;
    let board;
    let startButton;
    let replayButton;
    let status;
    let instruction;
    let progressCount;
    let completion;
    let petalLayer;

    let dotButtons = [];
    let drawingPaths = [];

    let expectedStep = 1;
    let started = false;
    let completed = false;
    let pageIsActive = false;

    let audioContext = null;
    let completionTimer = 0;

    /* ------------------------------------------------------------
       SMALL HELPERS
       ------------------------------------------------------------ */

    function random(minimum, maximum) {
        return minimum + Math.random() * (maximum - minimum);
    }

    function getButton(step) {
        return dotButtons.find(
            (button) => Number(button.dataset.kolamStep) === step
        );
    }

    function getPath(step) {
        return drawingPaths.find(
            (path) => Number(path.dataset.kolamStep) === step
        );
    }

    /* ------------------------------------------------------------
       SOFT INTERACTION SOUNDS
       No external music files required.
       ------------------------------------------------------------ */

    function playTone(frequency, duration, volume = 0.04) {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            return;
        }

        audioContext ||= new AudioContextClass();

        if (audioContext.state === "suspended") {
            audioContext.resume().catch(() => undefined);
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        const now = audioContext.currentTime;

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            now
        );

        gain.gain.setValueAtTime(
            0.0001,
            now
        );

        gain.gain.exponentialRampToValueAtTime(
            volume,
            now + 0.018
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            now + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(now);
        oscillator.stop(now + duration + 0.03);
    }

    function playCompletionChime() {
        [523.25, 659.25, 783.99].forEach((note, index) => {
            window.setTimeout(() => {
                if (pageIsActive) {
                    playTone(note, 0.42, 0.055);
                }
            }, index * 145);
        });
    }

    /* ------------------------------------------------------------
       PROGRESS AND SUNRISE
       ------------------------------------------------------------ */

    function setProgress(value) {
        progressCount.textContent = String(value).padStart(2, "0");

        const sunOffset = Math.round(
            90 - (value / TOTAL_STEPS) * 90
        );

        page.style.setProperty(
            "--kolam-sun-y",
            `${sunOffset}px`
        );
    }

    function markNextPulli() {
        dotButtons.forEach((button) => {
            button.classList.remove("is-next");
            button.removeAttribute("aria-current");
        });

        const nextButton = getButton(expectedStep);

        if (nextButton) {
            nextButton.classList.add("is-next");
            nextButton.setAttribute("aria-current", "step");
        }
    }

    function enablePullis() {
        dotButtons.forEach((button) => {
            if (!button.classList.contains("is-done")) {
                button.disabled = false;
            }
        });

        markNextPulli();
    }

    /* ------------------------------------------------------------
       COMPLETION PETALS
       Bounded particle count; no continuous animation loop.
       ------------------------------------------------------------ */

    function createCelebrationPetals() {
        petalLayer.replaceChildren();

        const total = reducedMotion.matches
            ? 5
            : window.innerWidth < 600
                ? 12
                : 20;

        const symbols = ["✿", "❀", "♥", "✦"];

        const colors = [
            "#fff8df",
            "#ef6f8d",
            "#f5ba50",
            "#ffffff"
        ];

        for (let index = 0; index < total; index += 1) {
            const petal = document.createElement("span");

            petal.className = "kolam-falling-petal";

            petal.textContent =
                symbols[index % symbols.length];

            petal.style.setProperty(
                "--petal-left",
                `${random(2, 98)}%`
            );

            petal.style.setProperty(
                "--petal-size",
                `${random(12, 26)}px`
            );

            petal.style.setProperty(
                "--petal-color",
                colors[index % colors.length]
            );

            petal.style.setProperty(
                "--petal-delay",
                `${random(0, 0.8)}s`
            );

            petal.style.setProperty(
                "--petal-duration",
                `${random(3.2, 5.2)}s`
            );

            petal.style.setProperty(
                "--petal-drift",
                `${random(-90, 90)}px`
            );

            petal.style.setProperty(
                "--petal-spin",
                `${random(-220, 220)}deg`
            );

            petal.addEventListener(
                "animationend",
                () => petal.remove(),
                { once: true }
            );

            petalLayer.appendChild(petal);
        }
    }

    /* ------------------------------------------------------------
       FINAL REVEAL
       ------------------------------------------------------------ */

    function finishKolam() {
        if (completed || !pageIsActive) {
            return;
        }

        completed = true;

        page.classList.add("is-complete");
        board.classList.add("is-complete");

        status.textContent = stepMessages[8];

        instruction.textContent =
            "Namma vaasal ready, Azhagi. Kolam-oda centre-la ippo namma rendu perum dhaan. ❤️";

        completion.hidden = false;
        completion.removeAttribute("hidden");

        createCelebrationPetals();
        playCompletionChime();

        window.requestAnimationFrame(() => {
            completion.scrollIntoView({
                behavior: reducedMotion.matches
                    ? "auto"
                    : "smooth",
                block: "center"
            });
        });
    }

    /* ------------------------------------------------------------
       DRAW ONE PART OF THE KOLAM
       ------------------------------------------------------------ */

    function drawStep(step) {
        const button = getButton(step);
        const path = getPath(step);

        if (!button || !path) {
            return;
        }

        button.classList.remove("is-next");
        button.classList.add("is-done");

        button.disabled = true;

        button.setAttribute("aria-pressed", "true");
        button.removeAttribute("aria-current");

        path.classList.add("is-drawn");

        setProgress(step);

        status.textContent = stepMessages[step - 1];

        playTone(
            320 + step * 42,
            0.24,
            0.038
        );

        if (step === TOTAL_STEPS) {
            completionTimer = window.setTimeout(
                finishKolam,
                reducedMotion.matches ? 80 : 720
            );

            return;
        }

        expectedStep += 1;

        markNextPulli();
    }

    /* ------------------------------------------------------------
       FRIENDLY WRONG-DOT RESPONSE
       ------------------------------------------------------------ */

    function showWrongStep(button) {
        button.classList.remove("is-wrong");

        // Restart the short CSS shake animation.
        void button.offsetWidth;

        button.classList.add("is-wrong");

        status.textContent =
            `Aiyo, indha pulli konjam wait pannanum! Mudhala glow aagura number ${expectedStep}-ah touch pannu. 😂❤️`;

        playTone(190, 0.16, 0.025);

        window.setTimeout(() => {
            button.classList.remove("is-wrong");
        }, 340);
    }

    function handlePulliClick(event) {
        if (!started || completed) {
            return;
        }

        const button = event.currentTarget;

        const selectedStep = Number(
            button.dataset.kolamStep
        );

        if (selectedStep !== expectedStep) {
            showWrongStep(button);
            return;
        }

        drawStep(selectedStep);
    }

    /* ------------------------------------------------------------
       START
       ------------------------------------------------------------ */

    function beginKolam() {
        if (started) {
            return;
        }

        started = true;

        startButton.hidden = true;
        startButton.setAttribute("aria-hidden", "true");

        status.textContent =
            "Centre-la glow aagura mudhal pulli-ah touch pannu, Azhagi. 🪷";

        instruction.textContent =
            "Glow aagura pulli-ah order-la touch pannu — ovvoru touch-um namma vaasalukku oru pudhu line.";

        enablePullis();

        playTone(293.66, 0.28, 0.04);

        getButton(1)?.focus({
            preventScroll: true
        });
    }

    /* ------------------------------------------------------------
       RESET / REPLAY
       ------------------------------------------------------------ */

    function resetKolam(startImmediately = false) {
        if (completionTimer) {
            window.clearTimeout(completionTimer);
            completionTimer = 0;
        }

        expectedStep = 1;
        started = startImmediately;
        completed = false;

        page.classList.remove("is-complete");
        board.classList.remove("is-complete");

        petalLayer.replaceChildren();

        completion.hidden = true;

        drawingPaths.forEach((path) => {
            path.classList.remove("is-drawn");
        });

        dotButtons.forEach((button) => {
            button.classList.remove(
                "is-next",
                "is-done",
                "is-wrong"
            );

            button.removeAttribute("aria-current");

            button.setAttribute(
                "aria-pressed",
                "false"
            );

            button.disabled = !startImmediately;
        });

        setProgress(0);

        if (startImmediately) {
            startButton.hidden = true;

            enablePullis();

            status.textContent =
                "Thirumba centre pulli-la irundhu namma kolam-ah start pannalaam. ❤️";

            instruction.textContent =
                "Glow aagura pulli-ah order-la touch pannu, Azhagi.";

            board.scrollIntoView({
                behavior: reducedMotion.matches
                    ? "auto"
                    : "smooth",
                block: "center"
            });
        } else {
            startButton.hidden = false;

            startButton.removeAttribute("aria-hidden");

            status.textContent =
                "Namma pudhu vaasalukku kolam poda ready-ah? ❤️";

            instruction.textContent =
                "Start button-ah press pannitu, glow aagura pulli-ah order-la touch pannu.";
        }
    }

    /* ------------------------------------------------------------
       PAGE VISIBILITY
       Pause existing media when this final page opens.
       ------------------------------------------------------------ */

    function syncPageState() {
        const currentlyActive =
            page.classList.contains("active") &&
            page.getAttribute("aria-hidden") !== "true" &&
            !page.hidden &&
            !document.hidden;

        if (currentlyActive === pageIsActive) {
            return;
        }

        pageIsActive = currentlyActive;

        if (!pageIsActive) {
            petalLayer.replaceChildren();
            return;
        }

        document.querySelectorAll("audio, video").forEach((media) => {
            try {
                media.pause();
            } catch (error) {
                console.warn(
                    "Media could not be paused:",
                    error
                );
            }
        });

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

        window.setTimeout(() => {
            if (pageIsActive && !started) {
                startButton.focus({
                    preventScroll: true
                });
            }
        }, 350);
    }

    /* ------------------------------------------------------------
       INITIALIZATION
       ------------------------------------------------------------ */

    function initializeVaasalKolamPage() {
        page = document.getElementById(PAGE_ID);

        if (!page) {
            console.error(
                "Namma Vaasal Kolam HTML is missing."
            );

            return;
        }

        if (page.dataset.vaasalKolamInitialized === "true") {
            return;
        }

        page.dataset.vaasalKolamInitialized = "true";

        board = document.getElementById("kolamBoard");

        startButton = document.getElementById(
            "kolamStartBtn"
        );

        replayButton = document.getElementById(
            "kolamReplayBtn"
        );

        status = document.getElementById("kolamStatus");

        instruction = document.getElementById(
            "kolamInstruction"
        );

        progressCount = document.getElementById(
            "kolamProgressCount"
        );

        completion = document.getElementById(
            "kolamCompletion"
        );

        petalLayer = document.getElementById(
            "kolamPetalLayer"
        );

        dotButtons = [
            ...page.querySelectorAll(".kolam-pulli")
        ];

        drawingPaths = [
            ...page.querySelectorAll(
                ".kolam-love-lines [data-kolam-step]"
            )
        ];

        if (
            !board ||
            !startButton ||
            !replayButton ||
            !status ||
            !instruction ||
            !progressCount ||
            !completion ||
            !petalLayer ||
            dotButtons.length !== TOTAL_STEPS ||
            drawingPaths.length !== TOTAL_STEPS
        ) {
            console.error(
                "Namma Vaasal Kolam elements are incomplete."
            );

            return;
        }

        startButton.addEventListener(
            "click",
            beginKolam
        );

        replayButton.addEventListener(
            "click",
            () => resetKolam(true)
        );

        dotButtons.forEach((button) => {
            button.addEventListener(
                "click",
                handlePulliClick
            );
        });

        const pageObserver = new MutationObserver(
            syncPageState
        );

        pageObserver.observe(page, {
            attributes: true,
            attributeFilter: [
                "class",
                "aria-hidden",
                "hidden"
            ]
        });

        document.addEventListener(
            "lovePageChanged",
            syncPageState
        );

        document.addEventListener(
            "visibilitychange",
            syncPageState
        );

        resetKolam(false);
        syncPageState();

        console.log(
            "Namma Vaasal Kolam initialized successfully."
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeVaasalKolamPage,
            { once: true }
        );
    } else {
        initializeVaasalKolamPage();
    }
})();


/* ================= ROMANTIC END CARD ================= */

(() => {
    "use strict";

    function setupLoveEndCard() {
        const page = document.getElementById("page-love-end");

        if (!page || page.dataset.endCardReady === "true") {
            return;
        }

        const promise = page.querySelector("#loveEndPromise");
        const message = page.querySelector(".le-promise-body");
        const celebration = page.querySelector(".le-celebration");

        if (!promise || !message || !celebration) {
            return;
        }

        page.dataset.endCardReady = "true";

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const animations = new Set();

        let scrollFrame = 0;
        let wasActive = false;

        /* Remove completed or interrupted effects. */

        function clearCelebration() {
            animations.forEach((animation) => {
                animation.cancel();
            });

            animations.clear();
            celebration.replaceChildren();

            cancelAnimationFrame(scrollFrame);
            scrollFrame = 0;
        }

        /* Ten hearts, one short burst. */

        function releaseHearts() {
            clearCelebration();

            if (reducedMotion.matches || document.hidden) {
                return;
            }

            if (typeof Element.prototype.animate !== "function") {
                return;
            }

            for (let index = 0; index < 10; index += 1) {
                const heart = document.createElement("span");

                heart.className = "le-particle";
                heart.textContent = index % 2 ? "♡" : "♥";

                celebration.appendChild(heart);

                const spread = (index - 4.5) * 28;
                const rise = 75 + (index % 3) * 24;
                const rotation = (index - 4.5) * 9;

                const animation = heart.animate(
                    [
                        {
                            opacity: 0,
                            transform: "translate(-50%, 0) scale(0.5)"
                        },
                        {
                            opacity: 1,
                            offset: 0.18
                        },
                        {
                            opacity: 0,
                            transform:
                                `translate(calc(-50% + ${spread}px), -${rise}px) ` +
                                `rotate(${rotation}deg) scale(1.1)`
                        }
                    ],
                    {
                        duration: 1050,
                        delay: (index % 3) * 45,
                        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                        fill: "both"
                    }
                );

                animations.add(animation);

                animation.onfinish = () => {
                    animations.delete(animation);
                    heart.remove();
                };
            }
        }

        /* Native details handles opening, closing, and keyboard access. */

        promise.addEventListener("toggle", () => {
            if (!promise.open || !page.classList.contains("active")) {
                clearCelebration();
                return;
            }

            releaseHearts();

            scrollFrame = requestAnimationFrame(() => {
                scrollFrame = 0;

                if (!promise.open || document.hidden) {
                    return;
                }

                message.scrollIntoView({
                    behavior: reducedMotion.matches ? "auto" : "smooth",
                    block: "nearest"
                });
            });
        });

        /*
         * Your existing router handles navigation.
         * Keep this card's accessibility state and effects in sync.
         */

        function syncPageState() {
            const active = page.classList.contains("active");

            page.setAttribute("aria-hidden", String(!active));

            if (!active) {
                clearCelebration();
            }

            if (active && !wasActive) {
                page.querySelector("#loveEndTitle")?.focus({
                    preventScroll: true
                });
            }

            wasActive = active;
        }

        const observer = new MutationObserver(syncPageState);

        observer.observe(page, {
            attributes: true,
            attributeFilter: ["class"]
        });

        syncPageState();

        /* Stop the brief effects when the page is hidden. */

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                clearCelebration();
            }
        });

        reducedMotion.addEventListener("change", clearCelebration);

        window.addEventListener("pagehide", clearCelebration);
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            setupLoveEndCard,
            { once: true }
        );
    } else {
        setupLoveEndCard();
    }
})();


    /* ============================================================
       GLOBAL EVENTS
    ============================================================ */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            if (
                systemErrorModal &&
                !systemErrorModal.hidden
            ) {

                closeSystemModal();
            }


            if (
                imageModal &&
                imageModal.open
            ) {

                closeImageDialog();
            }


            if (
                openWhenDialog &&
                openWhenDialog.open
            ) {

                closeOpenWhenDialog();
            }
        }
    );


    window.addEventListener(
        "resize",
        () => {

            resizeGlitterCanvas();

            resizeMatrixCanvas();

            resizeConfettiCanvas();
        }
    );


    document.addEventListener(
        "visibilitychange",
        () => {

            if (document.hidden) {

                audio.heartbeat?.pause();

                audio.ramVoice?.pause();

                audio.netflix?.pause();

                audio.matrix?.pause();

                audio.loveBgm?.pause();

                audio.voiceMessage?.pause();

                return;
            }


            /*
             * Page 5 is not included here.
             * Therefore, loveBgm resumes when returning
             * to the browser tab while Page 5 is active.
             */

            const noBgmPages = [
                "page-5",
                "page-gallery"
            ];


            if (
                BgmPages.includes(
                    activePageId
                )
            ) {

                safePlay(
                    audio.loveBgm
                );
            } else {
                stopAudio(audio.loveBgm);

            }
        }
    );

});
