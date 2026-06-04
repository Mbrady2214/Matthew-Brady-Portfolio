document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initRevealAnimations();
    initWspDates();
    initContactForm();
    initJourneyTimelines();
    initViewers();
});

function initNavigation() {
    const navLinks = [...document.querySelectorAll(".site-nav a")];
    const sectionLinks = navLinks.filter((link) => {
        const href = link.getAttribute("href") || "";
        return href.startsWith("#");
    });
    const sections = sectionLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    const normalizePath = (value) => decodeURIComponent(value.split(/[?#]/)[0]).toLowerCase();
    const currentPath = normalizePath(window.location.pathname || "/");
    const currentFile = currentPath.split("/").pop() || "";
    const isProjectDetailPage = currentFile.startsWith("project-");

    navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";

        if (href.startsWith("#")) {
            return;
        }

        const hrefPath = normalizePath(href);
        const hrefFile = hrefPath.split("/").pop() || "";
        const isHome = (hrefFile === "index.html" || hrefFile === "index 2.0.html") && (currentFile === "" || currentFile === "index.html" || currentFile === "index 2.0.html");
        const isProjectsAnchor = hrefFile === "projects.html" && isProjectDetailPage;
        const isMatch = isHome || isProjectsAnchor || hrefFile === currentFile;

        link.classList.toggle("is-active", isMatch);
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

function initJourneyTimelines() {
    const journeyRoots = document.querySelectorAll("[data-journey]");

    if (!journeyRoots.length) {
        return;
    }

    journeyRoots.forEach((root) => {
        const slides = [...root.querySelectorAll("[data-journey-slide]")];
        const nodes = [...root.querySelectorAll("[data-journey-jump]")];
        const prevButton = root.querySelector("[data-journey-dir='prev']");
        const nextButton = root.querySelector("[data-journey-dir='next']");

        if (!slides.length) {
            return;
        }

        let index = slides.findIndex((slide) => slide.classList.contains("is-active"));
        if (index < 0) {
            index = 0;
        }

        const setActive = (nextIndex) => {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            nodes.forEach((node, nodeIndex) => {
                const isActive = nodeIndex === index;
                node.classList.toggle("is-active", isActive);
                node.setAttribute("aria-selected", String(isActive));
            });
        };

        prevButton?.addEventListener("click", () => setActive(index - 1));
        nextButton?.addEventListener("click", () => setActive(index + 1));

        nodes.forEach((node, nodeIndex) => {
            node.addEventListener("click", () => setActive(nodeIndex));
        });

        root.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                setActive(index - 1);
            }

            if (event.key === "ArrowRight") {
                setActive(index + 1);
            }
        });

        setActive(index);
    });
}

function initWspDates() {
    const wspDates = [...document.querySelectorAll("#wsp-dates, #wsp-dates-home")];

    if (!wspDates.length) {
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

        wspDates.forEach((dateNode) => {
            dateNode.textContent = `Jun 2025 - Present - ${duration}`;
        });
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
    const modelTitle = viewerRoot.dataset.title || "Connected model";

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasHost.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(6, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9ac7ff, 0.5);
    fillLight.position.set(-4, 3, -6);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x8ef7d0, 0.4);
    rimLight.position.set(0, 6, -6);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 16),
        new THREE.ShadowMaterial({
            color: 0x000000,
            opacity: 0.24
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.2;
    floor.receiveShadow = true;
    scene.add(floor);

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
        const framedCenter = framedBox.getCenter(new THREE.Vector3());
        const minY = framedBox.min.y;
        const distance = Math.max(framedSize.x, framedSize.y, framedSize.z) * 2.3;

        object.position.y -= minY;
        floor.position.y = framedCenter.y - framedSize.y / 2 - 0.02;

        camera.position.set(distance, distance * 0.66, distance);
        controls.target.set(0, framedSize.y * 0.28, 0);
        controls.update();

        initialCameraPosition = camera.position.clone();
        initialTarget = controls.target.clone();
    };

    const stylizeModel = (root) => {
        root.traverse((child) => {
            if (!child.isMesh) {
                return;
            }

            const sourceMaterial = Array.isArray(child.material) ? child.material[0] : child.material;
            const grayMaterial = new THREE.MeshStandardMaterial({
                color: 0xb8bec7,
                metalness: 0.18,
                roughness: 0.72,
                envMapIntensity: 0.75,
                flatShading: false
            });

            if (sourceMaterial?.map) {
                grayMaterial.map = sourceMaterial.map;
            }

            child.material = grayMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
        });
    };

    const loading = createLoadingOverlay();
    canvasHost.appendChild(loading.element);

    const loader = new THREE.GLTFLoader();
    loader.load(
        modelPath,
        (gltf) => {
            stylizeModel(gltf.scene);
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
            placeholder.innerHTML = `
                <div>
                    <strong>${modelTitle} could not be loaded.</strong>
                    <p>Confirm the file path is correct and that every export asset, including the matching <code>.bin</code> file, is present in <code>models/</code>.</p>
                </div>
            `;
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
