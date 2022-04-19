import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls";
import { GUI } from "https://cdn.skypack.dev/lil-gui@0.16.1";
import { AbstractView } from "./abstract-view.mjs";


let glassConfig = {
    showTexture: false,

    // glass geometry parameters to customize via controls
    topRadius: 3.65,
    bottomRadius: 2.5,
    topHeightPercentage: .14,
    bottomHeightPercentage: .05,
    thickness: .3,
    outerFaceNumber: 12,
    bottomNotchDepth: .1,

    // other glass geometry parameters
    glassFullHeight: 10.5,
    bottomExtraThickness: 3,
    circleSegments: 30,
    glassPosition: .5,

    // material parameters (all customizable)
    metalness: .1,
    roughness: .15,
    transmission: .8,
    materialThickness: 3,
    opacity: .7,
};

class Controls {
    constructor() {
        const gui = new GUI();
        if (window.innerWidth < 600) gui.close();

        let folder;

        folder = gui.addFolder('Background');
        folder.close();
        folder.add(glassConfig, 'showTexture').onChange(v => {
            visualization.backPlaneMesh.material = visualization.createBackgroundMaterial();
            visualization.bottomPlaneMesh.visible = !v;
        }).name('show background');

        folder = gui.addFolder('Geometry');
        folder.add(glassConfig, 'topRadius', 1, 6).step(.01).onChange(() => {
            visualization.updateGeometry(visualization.glassMeshes.topCylinder, visualization.generateOuterTopCylinder());
            visualization.updateGeometry(visualization.glassMeshes.outerFaces, visualization.generateOuterFacedCylinder());
            visualization.updateGeometry(visualization.glassMeshes.innerSurface, visualization.generateInnerSurface());
            visualization.updateGeometry(visualization.glassMeshes.topRing, visualization.generateTopRing());
        }).name('top radius');
        folder.add(glassConfig, 'bottomRadius', 1, 6).step(.01).onChange(() => {
            visualization.updateGeometry(visualization.glassMeshes.outerFaces, visualization.generateOuterFacedCylinder());
            visualization.updateGeometry(visualization.glassMeshes.innerSurface, visualization.generateInnerSurface());
            visualization.updateGeometry(visualization.glassMeshes.bottom, visualization.generateBottom());
        }).name('bottom radius');
        folder.add(glassConfig, 'thickness', .01, .6).step(.01).onChange(() => {
            visualization.updateGeometry(visualization.glassMeshes.innerSurface, visualization.generateInnerSurface());
            visualization.updateGeometry(visualization.glassMeshes.topRing, visualization.generateTopRing());
        });
        folder.add(glassConfig, 'topHeightPercentage', 0, .25).step(.01).onChange(() => {
            visualization.updateGeometry(visualization.glassMeshes.topCylinder, visualization.generateOuterTopCylinder());
            visualization.updateGeometry(visualization.glassMeshes.outerFaces, visualization.generateOuterFacedCylinder());
        }).name('top, height %');
        folder.add(glassConfig, 'bottomHeightPercentage', 0, .25).step(.01).onChange(() => {
            visualization.updateGeometry(visualization.glassMeshes.outerFaces, visualization.generateOuterFacedCylinder());
            visualization.updateGeometry(visualization.glassMeshes.bottom, visualization.generateBottom());
        }).name('bottom, height %');
        folder.add(glassConfig, 'outerFaceNumber', 7, 20).step(1).onChange(() => {
            visualization.updateGeometry(visualization.glassMeshes.outerFaces, visualization.generateOuterFacedCylinder());
        }).name('number of faces');
        folder.add(glassConfig, 'bottomNotchDepth', .01, .25).step(.01).onChange(() => {
            visualization.updateGeometry(visualization.glassMeshes.bottom, visualization.generateBottom());
        }).name('bottom notch depth');


        folder = gui.addFolder('Material');
        folder.close();
        folder.add(glassConfig, 'metalness', 0, .3).step(.01).onChange((v) => {
            visualization.materals.forEach((m) => {
                m.metalness = v;
            });
        });
        folder.add(glassConfig, 'roughness', 0, .5).step(.01).onChange((v) => {
            visualization.materals.forEach((m) => {
                m.roughness = v;
            });
        });
        folder.add(glassConfig, 'transmission', .5, 1).step(.01).onChange((v) => {
            visualization.materals.forEach((m) => {
                m.transmission = v;
            });
        });
        folder.add(glassConfig, 'materialThickness', 1, 10).step(.01).onChange((v) => {
            visualization.materals.forEach((m) => {
                m.thickness = v;
            });
        }).name('thickness');
        folder.add(glassConfig, 'opacity', .2, .9).step(.01).onChange((v) => {
            visualization.materals.forEach((m) => {
                m.opacity = v;
            });
        });
    }
}

class Visualization {

    constructor(container) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.shadowMap.enabled = true;
        container.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.fakeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        this.fakeCamera.up.set(0, -1, 0);
        this.camera.position.z = this.fakeCamera.position.z = 33;

        this.glassGroup = new THREE.Group();

        this.orbit = new OrbitControls(this.fakeCamera, this.renderer.domElement);
        this.orbit.enableZoom = false;
        this.orbit.enableDamping = true;
        this.orbit.autoRotate = true;

        this.setupScene();
        this.createBackgroundMaterial();
        this.createGlass();
        this.render();
    }

    setupScene() {
        this.scene.background = new THREE.Color(0xffffff);

        const pointLightShadow = new THREE.PointLight(0xffffff, .3);
        pointLightShadow.castShadow = true;
        pointLightShadow.shadow.mapSize.width = 1500;
        pointLightShadow.shadow.mapSize.height = 1500;
        pointLightShadow.position.set(0, 40, 0);
        this.scene.add(pointLightShadow);

        const pointLight = new THREE.PointLight(0xffffff, .9);
        pointLight.position.set(10, 0, 10);
        this.scene.add(pointLight);

        this.backGroundCanvas = document.createElement('canvas');
        this.backPlaneMesh = new THREE.Mesh(this.generateFullWidthPlaneGeometry(), this.createBackgroundMaterial());
        this.backPlaneMesh.position.z = -10;
        this.scene.add(this.backPlaneMesh);

        const bottomPlaneGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);
        this.bottomPlaneMesh = new THREE.Mesh(bottomPlaneGeometry, new THREE.ShadowMaterial({
            opacity: .02
        }));
        this.bottomPlaneMesh.rotateX(-.5 * Math.PI);
        this.bottomPlaneMesh.position.y = -10;
        this.bottomPlaneMesh.receiveShadow = true;
        this.scene.add(this.bottomPlaneMesh);
    }

    generateFullWidthPlaneGeometry() {
        return new THREE.PlaneBufferGeometry(38 * window.innerWidth / window.innerHeight, 38, 1, 1);
    }

    createBackgroundMaterial() {
        const canvasWidth = this.backGroundCanvas.width = 3000 * window.innerWidth / window.innerHeight;
        const canvasHeight = this.backGroundCanvas.height = 3000;
        const ctx = this.backGroundCanvas.getContext('2d');

        if (!glassConfig.showTexture) {
            ctx.rect(0, 0, canvasWidth, canvasHeight);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.fillStyle = '#000000';
            const fontSize = .05 * canvasWidth;
            ctx.font = fontSize + "px sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText("Glass Configurator", .5 * canvasWidth, .5 * canvasHeight);
        } else {
            const w = Math.round(canvasWidth / 15);
            const numCol = Math.ceil(canvasWidth / w);
            const numRow = Math.ceil(canvasHeight / w);
            const constColors = ["#F06449", "#EDE6E3", "#DADAD9", "#36382E", "#5BC3EB"];
            for (let j = 0; j < numRow; j++) {
                for (let i = 0; i < numCol; i++) {
                    const shuffledArr = constColors.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
                    ctx.fillStyle = shuffledArr[0];
                    ctx.fillRect(w * i, w * j, w, w);
                    if (Math.random() > .5) {
                        ctx.beginPath();
                        ctx.arc(w * i, w * j, .5 * w, 0, .5 * Math.PI, false);
                        ctx.lineTo(w * i, w * j);
                        ctx.closePath();
                        ctx.fillStyle = shuffledArr[1];
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(w * (i + 1), w * (j + 1), .5 * w, 0, 1.5 * Math.PI, false);
                        ctx.lineTo(w * (i + 1), w * (j + 1));
                        ctx.closePath();
                        ctx.fillStyle = shuffledArr[2];
                        ctx.fill();
                    } else {
                        ctx.beginPath();
                        ctx.arc(w * (i + 1), w * j, .5 * w, .5 * Math.PI, 1.5 * Math.PI, false);
                        ctx.lineTo(w * (i + 1), w * j);
                        ctx.closePath();
                        ctx.fillStyle = shuffledArr[1];
                        ctx.fill();

                        ctx.beginPath();
                        ctx.arc(w * i, w * (j + 1), .5 * w, 1.5 * Math.PI, 0, false);
                        ctx.lineTo(w * i, w * (j + 1));
                        ctx.closePath();
                        ctx.fillStyle = shuffledArr[2];
                        ctx.fill();
                    }
                }
            }
        }
        const shadowTexture = new THREE.CanvasTexture(this.backGroundCanvas);
        return new THREE.MeshBasicMaterial({ map: shadowTexture });
    }

    createGlass() {

        this.materals = [];

        const glassMaterial = new THREE.MeshPhysicalMaterial({
            metalness: glassConfig.metalness,
            roughness: glassConfig.roughness,
            transmission: glassConfig.transmission,
            thickness: glassConfig.materialThickness,
            transparent: true,
            emissive: new THREE.Color(0x3C4444),
            opacity: glassConfig.opacity,
        });
        this.materals.push(glassMaterial);

        const glassMaterialDSide = glassMaterial.clone();
        glassMaterialDSide.side = THREE.DoubleSide;
        this.materals.push(glassMaterialDSide);

        const glassMaterialFlatDSide = glassMaterial.clone();
        glassMaterialFlatDSide.flatShading = true;
        glassMaterialFlatDSide.side = THREE.DoubleSide;
        this.materals.push(glassMaterialFlatDSide);

        const glassMaterialNoDepth = glassMaterial.clone();
        glassMaterialNoDepth.depthTest = false;
        this.materals.push(glassMaterialNoDepth);

        this.glassMeshes = {
            outerFaces: new THREE.Mesh(this.generateOuterFacedCylinder(), glassMaterialFlatDSide),
            topCylinder: new THREE.Mesh(this.generateOuterTopCylinder(), glassMaterialDSide),
            bottom: new THREE.Mesh(this.generateBottom(), glassMaterialDSide),
            innerSurface: new THREE.Mesh(this.generateInnerSurface(), glassMaterialNoDepth),
            topRing: new THREE.Mesh(this.generateTopRing(), glassMaterialDSide)
        };

        this.glassMeshes.outerFaces.renderOrder = 2;
        this.glassMeshes.topCylinder.renderOrder = 2;
        this.glassMeshes.bottom.renderOrder = 2;

        this.glassMeshes.outerFaces.castShadow = true;
        this.glassMeshes.bottom.castShadow = true;

        const keys = Object.keys(this.glassMeshes);
        keys.forEach((key) => {
            this.glassGroup.add(this.glassMeshes[key]);
        });

        this.scene.add(this.glassGroup);
    }


    generateOuterFacedCylinder() {
        const points = [];
        points.push(new THREE.Vector2(glassConfig.bottomRadius, glassConfig.glassFullHeight * glassConfig.bottomHeightPercentage));
        points.push(new THREE.Vector2(glassConfig.topRadius, glassConfig.glassFullHeight - glassConfig.glassFullHeight * glassConfig.topHeightPercentage));
        points.forEach(p => p.y -= glassConfig.glassPosition * glassConfig.glassFullHeight);

        return new THREE.LatheGeometry(points, glassConfig.outerFaceNumber);
    }

    generateBottom() {
        const points = [];
        points.push(new THREE.Vector2(0, 0));
        points.push(new THREE.Vector2(glassConfig.bottomRadius - .9, 0));
        points.push(new THREE.Vector2(glassConfig.bottomRadius - .8, glassConfig.bottomNotchDepth));
        points.push(new THREE.Vector2(glassConfig.bottomRadius - .4, glassConfig.bottomNotchDepth));
        points.push(new THREE.Vector2(glassConfig.bottomRadius - .3, 0));
        points.push(new THREE.Vector2(glassConfig.bottomRadius, 0));
        points.push(new THREE.Vector2(glassConfig.bottomRadius, glassConfig.glassFullHeight * glassConfig.bottomHeightPercentage));
        points.push(new THREE.Vector2(.9 * glassConfig.bottomRadius, glassConfig.glassFullHeight * glassConfig.bottomHeightPercentage + glassConfig.bottomRadius * .05));
        points.forEach(p => p.y -= (glassConfig.glassPosition * glassConfig.glassFullHeight));

        return new THREE.LatheGeometry(points, glassConfig.circleSegments);
    }

    generateOuterTopCylinder() {
        const overlay = .05;
        const points = [];
        points.push(new THREE.Vector2(glassConfig.topRadius * .9, glassConfig.glassFullHeight - glassConfig.glassFullHeight * glassConfig.topHeightPercentage - glassConfig.topRadius * .05));
        points.push(new THREE.Vector2(glassConfig.topRadius, glassConfig.glassFullHeight - glassConfig.glassFullHeight * glassConfig.topHeightPercentage));
        points.push(new THREE.Vector2(glassConfig.topRadius, glassConfig.glassFullHeight + overlay));
        points.forEach(p => p.y -= (glassConfig.glassPosition * glassConfig.glassFullHeight + overlay));

        return new THREE.LatheGeometry(points, glassConfig.circleSegments);
    }

    generateInnerSurface() {
        const points = [];
        points.push(new THREE.Vector2(glassConfig.topRadius - glassConfig.thickness, glassConfig.glassFullHeight));
        points.push(new THREE.Vector2(glassConfig.bottomRadius - glassConfig.thickness, glassConfig.bottomExtraThickness * glassConfig.thickness));
        points.push(new THREE.Vector2(0, glassConfig.bottomExtraThickness * glassConfig.thickness));
        points.forEach(p => p.y -= glassConfig.glassPosition * glassConfig.glassFullHeight);

        return new THREE.LatheGeometry(points, glassConfig.circleSegments);
    }

    generateTopRing() {
        const geometry = new THREE.RingGeometry(glassConfig.topRadius, glassConfig.topRadius - glassConfig.thickness, glassConfig.circleSegments, 1);
        geometry.translate(0, 0, (glassConfig.glassPosition - 1) * glassConfig.glassFullHeight);
        geometry.rotateX(Math.PI / 2);
        return geometry;
    }

    updateGeometry(mesh, geometry) {
        mesh.geometry.dispose();
        mesh.geometry = geometry;
    }

    render() {
        this.orbit.update();
        this.glassGroup.lookAt(this.fakeCamera.position);
        this.renderer.render(this.scene, this.camera);
    }

    loop() {
        this.render();
        requestAnimationFrame(this.loop.bind(this));
    }

    updateSize() {
        this.camera.aspect = this.fakeCamera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.fakeCamera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.updateGeometry(this.backPlaneMesh, this.generateFullWidthPlaneGeometry());
        this.backPlaneMesh.material = this.createBackgroundMaterial();
    }
}

export class GlassView extends AbstractView {
    constructor(args) {
        super(args);
        this.html = undefined;
        this.path = args ? args.path : undefined;
    }

    /** @override */
    async buildHTML() {
        if (this.html == undefined) {
            let response = await fetch(this.path);
            this.html = await response.text();
        }
        return this.html;
    }

    /** @override */
    modelToView() {
        container = document.querySelector('.container');
        controls = new Controls();
        visualization = new Visualization(container);
        visualization.updateSize();
        window.addEventListener('resize', () => visualization.updateSize());
        visualization.loop();
    }
}

let container; // = document.querySelector('.container');
let controls; // = new Controls();
let visualization; // = new Visualization();

// visualization.updateSize();

// window.addEventListener('resize', () => visualization.updateSize());
// visualization.loop();