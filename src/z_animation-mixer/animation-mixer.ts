import {
  WebGLRenderer,
  Scene,
  AnimationAction,
  AnimationMixer,
  HemisphereLight,
  DirectionalLight,
  PerspectiveCamera,
  PlaneGeometry,
  MeshPhongMaterial,
  Mesh,
  Object3D,
  Clock,
  GridHelper,
} from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let updatables: Array<(delta: number) => void> = [];
let mixer: AnimationMixer;
// liste de toutes les actions du personnage
const clipsAction: Record<string, AnimationAction> = {};
// action à lancer
let action = "walk";
// Action en cours
let currentAction: AnimationAction;
// Vitesse de l'animation

const guiConfig = {
  walk: () => (action = "walk"),
  run: () => (action = "run"),
};

function init() {
  //Renderer
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.shadowMap.enabled = true;
  renderer.setClearColor(0x3297a8);

  // Scene
  const scene = new Scene();

  // Camera
  const fov = 75;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100;
  const camera = new PerspectiveCamera(fov, aspect, zNear, zFar);
  camera.position.set(0, 5, 5);
  camera.lookAt(0, 1, 0);
  scene.add(camera);

  // Ambiant Light
  const ambiantLight = new HemisphereLight(0xffffff, 0x8d8d8d, 3);
  scene.add(ambiantLight);

  // Main light
  const dirLight = new DirectionalLight(0xffffff, 3);
  dirLight.position.set(10, 5, 10);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 10;
  dirLight.shadow.camera.bottom = -10;
  dirLight.shadow.camera.left = -10;
  dirLight.shadow.camera.right = 10;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 100;
  scene.add(dirLight);

  // Ground
  const groundGeometry = new PlaneGeometry(100, 100);
  const groundMaterial = new MeshPhongMaterial({ color: 0xa86d32 });
  const groundMesh = new Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = Math.PI * -0.5;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const axesHelper = new GridHelper(100, 100);
  scene.add(axesHelper);

  // Set size
  new Resizer(renderer, camera);

  // load Model
  let model: Object3D;
  const loader = new GLTFLoader();
  loader.load("/src/z_animation-mixer/Xbot.glb", (gltf) => {
    // Je reécupère le model
    model = gltf.scene.children[0];
    // le model est un group de mesh, je veux que tous les mesh de model projettent de l'ombre
    model.traverse((object) => {
      const _object = object as Mesh;
      if (_object?.isMesh) {
        object.castShadow = true;
      }
    });

    // Je crée le mixer
    mixer = new AnimationMixer(model);

    updatables.push((delta) => mixer.update(delta));

    // Je récupère toutes les animations, je les passe dans le mixer
    // Je pousse chaque animation dans un objet avec son nom comme clé
    gltf.animations.forEach((clip) => {
      clipsAction[clip.name] = mixer.clipAction(clip);
    });

    scene.add(model);
  });

  // Set Action
  // Permet de lancer une animation
  const setAction = (action: string) => {
    // On récupère la précédente action en cours si il y en a une
    const prevAction = currentAction;
    // Si l'animation demandé est déjà celle en cours on ne fait rien
    if (prevAction?.getClip().name === action) return;

    // On applique la nouvelle animation
    currentAction = clipsAction[action];

    // Comme on applique un crossFadeFrom, les paramètre de l'animation ont changé, il faut réapliquer les paramètre qui vont permettrent de lancer l'animation
    if (prevAction) {
      // enabled a été passé à false par le crossFadeFrom il faut le repasser à true
      currentAction.enabled = true;
      // On applique un crossFade entre l'animation précédente et la suivante
      currentAction.crossFadeFrom(prevAction, 0.5, false);
    }
    // On lance l'animation suivante
    currentAction?.play();
  };

  //GUI
  const gui = new GUI();
  gui.add(guiConfig, "walk");
  gui.add(guiConfig, "run");

  const clock = new Clock();
  function render() {
    const delta = clock.getDelta();
    updatables.forEach((tick) => {
      tick(delta);
    });

    // On se base sur la variable "action" pour savoir quel animation lancé
    setAction(action);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

document.addEventListener("DOMContentLoaded", init);

// Responsive
class Resizer {
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;

  constructor(renderer: WebGLRenderer, camera: PerspectiveCamera) {
    this.renderer = renderer;
    this.camera = camera;

    this.setSize();

    window.addEventListener("resize", () => this.setSize());
  }

  setSize() {
    const canvas = this.renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
  }
}
