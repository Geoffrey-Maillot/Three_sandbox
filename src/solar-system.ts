import {
  Clock,
  Mesh,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
  Color,
  MeshPhongMaterial,
  PointLight,
  Group,
  AxesHelper,
  Object3D,
  GridHelper,
  Material,
} from "three";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { degToRad } from "three/src/math/MathUtils.js";

let pixelRatio = window.devicePixelRatio;
let canvasWidth: number;
let canvasHeigt: number;
let renderer: WebGLRenderer;
let camera: PerspectiveCamera;
let canvas: HTMLCanvasElement;
let clock: Clock;
let updatables: Array<(delta: number) => void> = [];
let controls: OrbitControls;
let axesHelperArray: Array<any> = [];

const init = () => {
  /**
   * Add GUI
   */
  const gui = new GUI();
  /**
   * get Canva element
   */
  canvas = document.getElementById("canva") as HTMLCanvasElement;
  canvasHeigt = (canvas.clientWidth * pixelRatio) | 0;
  canvasHeigt = (canvas.clientHeight * pixelRatio) | 0;

  /**
   * Init Clock
   */
  clock = new Clock();
  /**
   * SCENE
   */
  const scene = new Scene();
  scene.background = new Color(0x272935);

  /**
   * CAMERA
   */
  const cameraParams = {
    fov: 75,
    aspect: canvas.clientWidth / canvas.clientHeight,
    near: 0.1,
    far: 100,
  };

  camera = new PerspectiveCamera(
    cameraParams.fov,
    cameraParams.aspect,
    cameraParams.near,
    cameraParams.far,
  );
  camera.position.set(0, 5, 50);
  camera.lookAt(0, 0, 0);

  // add camera
  scene.add(camera);

  /**
   * Control
   */
  controls = new OrbitControls(camera, canvas);
  /**
   * Renderer
   */
  renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(canvas.width, canvas.clientHeight, false);

  /**
   * LIGHT
   */
  const light = new PointLight(0xffffff, 500);
  scene.add(light);

  /**
   * SOLAR SYSTEM
   */

  // Solar System Group
  const solarSystem = new Group();
  const animationSolarSystem = (delta: number) => {
    solarSystem.rotation.y += degToRad(80) * delta;
  };
  updatables.push(animationSolarSystem);
  scene.add(solarSystem);
  axesHelperArray.push(solarSystem);

  const commonGeometry = new SphereGeometry(1, 8, 8);

  // SUN
  const sunMaterial = new MeshPhongMaterial({ emissive: 0xffff00 });
  const sun = new Mesh(commonGeometry, sunMaterial);
  sun.scale.set(5, 5, 5);

  const animationSun = (delta: number) => {
    sun.rotation.y += degToRad(80) * delta;
  };
  updatables.push(animationSun);
  solarSystem.add(sun);

  // EARTH Group
  const earthGroup = new Group();
  solarSystem.add(earthGroup);
  const animationEarthGroup = (delta: number) => {
    earthGroup.rotation.y += degToRad(80) * delta;
  };
  earthGroup.position.x = 10;
  updatables.push(animationEarthGroup);

  // Earth
  const earthMaterial = new MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
  });
  const earth = new Mesh(commonGeometry, earthMaterial);
  earthGroup.add(earth);

  // Moon
  const moonMaterial = new MeshPhongMaterial({
    color: 0x888888,
    emissive: 0x222222,
  });

  const moon = new Mesh(commonGeometry, moonMaterial);
  moon.scale.set(0.5, 0.5, 0.5);
  moon.position.x = 2;
  const moonAnimation = (delta: number) => {
    moon.rotation.x = +degToRad(50) * delta;
  };
  updatables.push(moonAnimation);

  earthGroup.add(moon);

  /**
   * Helpers
   */
  // Function to add Helper GUI AXES + GRID
  function makeAxisGrid(node: Object3D, label: string, units?: number) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, "visible").name(label);
  }

  // Add Helpers
  makeAxisGrid(solarSystem, "solarSystem", 25);
  makeAxisGrid(sun, "sunMesh");
  makeAxisGrid(earthGroup, "earthOrbit");
  makeAxisGrid(earth, "earthMesh");
  makeAxisGrid(moon, "moonMesh");

  // setSize
  setSize(renderer, camera, canvas);

  // Render scene and start loop
  render(renderer, camera, scene);

  /**
   *
   */
  window.addEventListener("resize", () => setSize(renderer, camera, canvas));
};
/**
 * ========================
 * Render
 *=========================
 */
const render = (
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  scene: Scene,
) => {
  const delta = clock.getDelta();

  controls.update();

  updatables.map((updatable) => updatable(delta));

  renderer.render(scene, camera);
  requestAnimationFrame(() => render(renderer, camera, scene));
};

/**
 * ========================
 * Reponsive Scene
 *=========================
 */

const setSize = (
  renderer: WebGLRenderer,
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
) => {
  // setSize renderer olny if needed
  if (
    canvas.clientWidth !== canvasWidth ||
    canvas.clientHeight !== canvasHeigt
  ) {
    // set new canvas dimension
    pixelRatio = window.devicePixelRatio;
    canvasWidth = (canvas.clientWidth * pixelRatio) | 0;
    canvasHeigt = (canvas.height * pixelRatio) | 0;

    // update the size of the renderer AND the canvas
    renderer.setSize(canvasWidth, canvasHeigt, false);
    // set the camera's aspect ratio
    camera.aspect = canvasWidth / canvasHeigt;
    // we change camera settings so e have to update the camera's frustum
    camera.updateProjectionMatrix();
  }
};

/**
 * ========================
 * Class Custom Helper
 *=========================
 */

// Activer/désactiver les axes et la grille lil-gui
// nécessite une propriété qui renvoie un bool
// pour décider de faire une case à cocher
// afin que nous créions un setter et un getter pour `visible`
// que nous pouvons dire à lil-gui de regarder.
class AxisGridHelper {
  private axes;
  private grid;
  private _visible: boolean = true;
  constructor(node: Object3D, units = 10) {
    const axes = new AxesHelper();
    (axes.material as Material).depthTest = false;
    // renderOrder définis l'ordre dans lesquels les object sont déssinés
    axes.renderOrder = 2; // after the grid
    node.add(axes);

    const grid = new GridHelper(units, units);
    // depthTest à false permet de dessiner l'axe même s'il se trouve dans la sphere
    grid.material.depthTest = false;

    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}

/**
 * ========================
 * Entry point
 *=========================
 */

init();
