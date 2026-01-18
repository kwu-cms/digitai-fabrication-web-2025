import * as THREE from "./vendor/three/three.module.min.js";
import { OrbitControls } from "./vendor/three/OrbitControls.js";
import { STLLoader } from "./vendor/three/STLLoader.js";

(() => {
    let renderer = null;
    let scene = null;
    let camera = null;
    let controls = null;
    let mesh = null;
    let container = null;
    let animationId = null;
    let resizeObserver = null;
    let axesHelper = null;
    let environmentMap = null;

    const setRendererSize = () => {
        if (!renderer || !container || !camera) return;
        const { width, height } = container.getBoundingClientRect();
        if (width === 0 || height === 0) return;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    const fitCameraToMesh = (targetMesh) => {
        if (!camera || !controls) return;
        const box = new THREE.Box3().setFromObject(targetMesh);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = (camera.fov * Math.PI) / 180;
        let cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));
        cameraZ *= 1.6;

        camera.position.set(center.x, center.y, cameraZ);
        camera.near = maxDim / 100;
        camera.far = maxDim * 100;
        camera.updateProjectionMatrix();

        controls.target.copy(center);
        controls.update();
    };

    const animate = () => {
        if (!renderer || !scene || !camera) return;
        animationId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    };

    const dispose = () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (resizeObserver && container) {
            resizeObserver.unobserve(container);
            resizeObserver.disconnect();
            resizeObserver = null;
        }
        if (controls) {
            controls.dispose();
            controls = null;
        }
        if (mesh) {
            mesh.geometry.dispose();
            if (mesh.material && mesh.material.dispose) {
                mesh.material.dispose();
            }
            mesh = null;
        }
        if (environmentMap) {
            environmentMap.dispose();
            environmentMap = null;
        }
        if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
            renderer = null;
        }
        scene = null;
        camera = null;
        container = null;
    };

    const buildEnvironmentMap = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size * 2;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#e2e8f0");
        gradient.addColorStop(0.5, "#f8fafc");
        gradient.addColorStop(1, "#94a3b8");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    };

    const render = ({ containerId, url }) => {
        dispose();

        container = document.getElementById(containerId);
        if (!container) return;

        if (window.location.protocol === "file:") {
            container.innerHTML =
                '<div class="viewer-placeholder">ローカルファイル直開きではSTL表示できません。ローカルサーバーで開いてください。</div>';
            return;
        }

        if (!url) {
            container.innerHTML = `<div class="viewer-placeholder">STLファイルがありません。</div>`;
            return;
        }

        container.innerHTML = "";
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8f9fb);

        const rect = container.getBoundingClientRect();
        const width = rect.width || 640;
        const height = rect.height || 320;
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 100);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 0.8);
        directional.position.set(1, 1, 1);
        scene.add(directional);

        axesHelper = new THREE.AxesHelper(80);
        scene.add(axesHelper);

        environmentMap = buildEnvironmentMap();
        if (environmentMap) {
            scene.environment = environmentMap;
        }

        const loader = new STLLoader();
        loader.load(
            url,
            (geometry) => {
                const material = new THREE.MeshNormalMaterial();
                mesh = new THREE.Mesh(geometry, material);
                geometry.computeBoundingBox();
                const box = geometry.boundingBox;
                if (box) {
                    const size = new THREE.Vector3();
                    box.getSize(size);
                    const maxDim = Math.max(size.x, size.y, size.z) || 1;
                    const targetMax = 120;
                    const scale = targetMax / maxDim;
                    mesh.scale.setScalar(scale);
                }
                mesh.rotation.x = -Math.PI / 2;
                geometry.center();
                scene.add(mesh);
                fitCameraToMesh(mesh);
                animate();
            },
            undefined,
            () => {
                container.innerHTML = `<div class="viewer-placeholder">STLの読み込みに失敗しました。</div>`;
            },
        );

        resizeObserver = new ResizeObserver(setRendererSize);
        resizeObserver.observe(container);
    };

    window.StlViewer = { render, dispose };
})();
