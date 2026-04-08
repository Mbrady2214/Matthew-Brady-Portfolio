document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initRevealAnimations();
    initWspDates();
    initContactForm();
    initViewers();
});

function initNavigation() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const navLinks = [...document.querySelectorAll(".site-nav a")];
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    toggle?.addEventListener("click", () => {
        const isOpen = header.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            header.classList.remove("is-open");
            toggle?.setAttribute("aria-expanded", "false");
        });
    });

    if (!sections.length) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                const targetId = `#${entry.target.id}`;
                navLinks.forEach((link) => {
                    link.classList.toggle("is-active", link.getAttribute("href") === targetId);
                });
            });
        },
        {
            threshold: 0.35,
            rootMargin: "-10% 0px -40% 0px"
        }
    );

    sections.forEach((section) => observer.observe(section));
}

function initRevealAnimations() {
    const revealItems = document.querySelectorAll(".reveal");

    if (!revealItems.length) {
        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.18
        }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
}

function initWspDates() {
    const wspDates = document.getElementById("wsp-dates");

    if (!wspDates) {
        return;
    }

    const update = () => {
        const start = new Date(2025, 5, 1);
        const now = new Date();
        const monthDiff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

        let duration = "Less than 1 mo";

        if (monthDiff >= 1 && monthDiff < 12) {
            duration = `${monthDiff} ${monthDiff === 1 ? "mo" : "mos"}`;
        } else if (monthDiff >= 12) {
            const years = Math.floor(monthDiff / 12);
            const months = monthDiff % 12;
            duration = `${years} ${years === 1 ? "yr" : "yrs"}`;
            if (months > 0) {
                duration += ` ${months} ${months === 1 ? "mo" : "mos"}`;
            }
        }

        wspDates.textContent = `Jun 2025 - Present - ${duration}`;
    };

    update();
    window.setInterval(update, 1000 * 60 * 60 * 6);
}

function initContactForm() {
    const form = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    if (!form || !formStatus) {
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = form.querySelector(".submit-btn");
        const originalText = submitButton?.textContent || "Send Message";

        if (submitButton) {
            submitButton.textContent = "Sending...";
            submitButton.setAttribute("disabled", "true");
        }

        formStatus.textContent = "";
        formStatus.className = "form-status";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Unable to send message.");
            }

            form.reset();
            formStatus.textContent = "Thanks! Your message has been sent.";
            formStatus.classList.add("success");
        } catch (error) {
            console.error(error);
            formStatus.textContent = "There was a problem sending your message. Please try again.";
            formStatus.classList.add("error");
        } finally {
            if (submitButton) {
                submitButton.textContent = originalText;
                submitButton.removeAttribute("disabled");
            }
        }
    });
}

function initViewers() {
    const viewerElements = document.querySelectorAll("[data-viewer]");

    if (!viewerElements.length) {
        return;
    }

    viewerElements.forEach((viewer) => {
        try {
            buildViewer(viewer);
        } catch (error) {
            console.error("Viewer initialization failed:", error);
            const status = viewer.querySelector(".viewer-status");
            if (status) {
                status.textContent = "Status: Viewer failed to initialize.";
            }
        }
    });
}

function buildViewer(viewerRoot) {
    const canvasHost = viewerRoot.querySelector(".viewer-canvas");
    const status = viewerRoot.querySelector(".viewer-status");
    const modelPath = viewerRoot.dataset.model || "";
    const placeholderCopy = viewerRoot.dataset.placeholder || "Model viewer ready for a future CAD export.";

    if (!canvasHost || !status || !window.THREE || !THREE.OrbitControls || !THREE.GLTFLoader) {
        status.textContent = "Status: 3D libraries are unavailable.";
        return;
    }

    const placeholder = document.createElement("div");
    placeholder.className = "viewer-placeholder";
    placeholder.textContent = placeholderCopy;
    canvasHost.appendChild(placeholder);

    if (!modelPath.trim()) {
        status.textContent = "Status: Awaiting model upload.";
        bindViewerButtons(viewerRoot, null);
        return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x08111b);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    camera.position.set(2.2, 1.6, 3.2);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasHost.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.15);
    keyLight.position.set(6, 7, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9ac7ff, 0.55);
    fillLight.position.set(-4, 3, -6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8ef7d0, 0.3);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    const gridHelper = new THREE.GridHelper(8, 8, 0x4478c4, 0x244160);
    gridHelper.visible = false;
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(1.5);
    axesHelper.visible = false;
    scene.add(axesHelper);

    let initialCameraPosition = camera.position.clone();
    let initialTarget = controls.target.clone();

    const resize = () => {
        const width = canvasHost.clientWidth;
        const height = canvasHost.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    const frameObject = (object) => {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        object.position.sub(center);

        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = maxDimension > 0 ? 1.9 / maxDimension : 1;
        object.scale.setScalar(scale);

        const framedBox = new THREE.Box3().setFromObject(object);
        const framedSize = framedBox.getSize(new THREE.Vector3());
        const distance = Math.max(framedSize.x, framedSize.y, framedSize.z) * 2.3;

        camera.position.set(distance, distance * 0.66, distance);
        controls.target.set(0, 0, 0);
        controls.update();

        initialCameraPosition = camera.position.clone();
        initialTarget = controls.target.clone();
    };

    const loading = createLoadingOverlay();
    canvasHost.appendChild(loading.element);

    const loader = new THREE.GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            scene.add(gltf.scene);
            frameObject(gltf.scene);
            loading.element.remove();
            placeholder.remove();
            status.textContent = "Status: Model loaded successfully.";
            resize();
        },
        (xhr) => {
            if (!xhr.total) {
                status.textContent = "Status: Loading model...";
                return;
            }

            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            loading.setProgress(percent);
            status.textContent = `Status: Loading ${percent}%`;
        },
        (error) => {
            console.error("Model load failed:", error);
            loading.element.remove();
            status.textContent = `Status: Failed to load ${modelPath}`;
            placeholder.textContent = "The connected model could not be loaded. Confirm the file path and matching `.bin` assets are in the `models/` folder.";
        }
    );

    bindViewerButtons(viewerRoot, {
        controls,
        gridHelper,
        axesHelper,
        reset() {
            camera.position.copy(initialCameraPosition);
            controls.target.copy(initialTarget);
            controls.update();
        }
    });

    window.addEventListener("resize", resize);
    resize();

    const animate = () => {
        window.requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };

    animate();
}

function bindViewerButtons(viewerRoot, viewerApi) {
    viewerRoot.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            if (!viewerApi) {
                return;
            }

            const action = button.dataset.action;

            if (action === "reset") {
                viewerApi.reset();
            }

            if (action === "grid") {
                viewerApi.gridHelper.visible = !viewerApi.gridHelper.visible;
            }

            if (action === "axes") {
                viewerApi.axesHelper.visible = !viewerApi.axesHelper.visible;
            }
        });
    });
}

function createLoadingOverlay() {
    const element = document.createElement("div");
    element.className = "viewer-loading";
    element.innerHTML = `
        <div>
            <strong>Loading 3D model...</strong>
            <div class="progress-track">
                <div class="progress-bar"></div>
            </div>
        </div>
    `;

    const progressBar = element.querySelector(".progress-bar");

    return {
        element,
        setProgress(value) {
            if (progressBar) {
                progressBar.style.width = `${Math.max(0, Math.min(100, value))}%`;
            }
        }
    };
}
