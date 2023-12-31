import {
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  Group,
  WebGLRenderer,
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  SplineCurve,
  Vector2,
  BufferGeometry,
  LineBasicMaterial,
  Line,
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function init() {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const renderer = new WebGLRenderer({ antialias: true, canvas });
  renderer.setClearColor(0xaaaaaa);
  renderer.shadowMap.enabled = true;

  function makeCamera(fov = 40) {
    const aspect = 2;
    const zNear = 0.1;
    const zFar = 1000;
    return new PerspectiveCamera(fov, aspect, zNear, zFar);
  }

  const camera = makeCamera();
  camera.position.set(8, 4, 10).multiplyScalar(3);
  camera.lookAt(0, 0, 0);

  new OrbitControls(camera, canvas);

  const scene = new Scene();

  const light1 = new DirectionalLight(0xffffff, 3);
  light1.position.set(0, 20, 0);
  scene.add(light1);
  light1.castShadow = true;
  light1.shadow.mapSize.width = 2048;
  light1.shadow.mapSize.height = 2048;

  const d = 50;
  light1.shadow.camera.left = -d;
  light1.shadow.camera.right = d;
  light1.shadow.camera.top = d;
  light1.shadow.camera.bottom = -d;
  light1.shadow.camera.near = 1;
  light1.shadow.camera.far = 50;
  light1.shadow.bias = 0.001;

  const light2 = new DirectionalLight(0xffffff, 3);
  light2.position.set(1, 2, 4);
  scene.add(light2);

  const groundGeometry = new PlaneGeometry(50, 50);
  const groundMaterial = new MeshPhongMaterial({
    color: 0xcc8866,
  });
  const groundMesh = new Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = Math.PI * -0.5;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const carWidth = 4;
  const carHeight = 1;
  const carLength = 8;

  const tank = new Group();
  scene.add(tank);

  const bodyGeometry = new BoxGeometry(carWidth, carHeight, carLength);
  const bodyMaterial = new MeshPhongMaterial({ color: 0x6688aa });
  const bodyMesh = new Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.position.y = 1.4;
  bodyMesh.castShadow = true;
  tank.add(bodyMesh);

  const cameraFov = 75;
  const tankCamera = makeCamera(cameraFov);
  tankCamera.position.y = 3;
  tankCamera.position.z = -6;
  tankCamera.rotation.y = Math.PI;
  bodyMesh.add(tankCamera);

  const wheelRadius = 1;
  const wheelThickness = 0.5;
  const wheelSegments = 6;
  const wheelGeometry = new CylinderGeometry(
    wheelRadius, // top radius
    wheelRadius, // bottom radius
    wheelThickness, // height of cylinder
    wheelSegments,
  );
  const wheelMaterial = new MeshPhongMaterial({ color: 0x888888 });

  const wheelPositions = [
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, carLength / 3],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, 0],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, 0],
    [-carWidth / 2 - wheelThickness / 2, -carHeight / 2, -carLength / 3],
    [carWidth / 2 + wheelThickness / 2, -carHeight / 2, -carLength / 3],
  ];

  const wheelMeshes = wheelPositions.map((position) => {
    const mesh = new Mesh(wheelGeometry, wheelMaterial);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.rotation.z = Math.PI * 0.5;
    mesh.castShadow = true;
    bodyMesh.add(mesh);
    return mesh;
  });

  const domeRadius = 2;
  const domeWidthSubdivisions = 12;
  const domeHeightSubdivisions = 12;
  const domePhiStart = 0;
  const domePhiEnd = Math.PI * 2;
  const domeThetaStart = 0;
  const domeThetaEnd = Math.PI * 0.5;
  const domeGeometry = new SphereGeometry(
    domeRadius,
    domeWidthSubdivisions,
    domeHeightSubdivisions,
    domePhiStart,
    domePhiEnd,
    domeThetaStart,
    domeThetaEnd,
  );
  const domeMesh = new Mesh(domeGeometry, bodyMaterial);
  domeMesh.castShadow = true;
  bodyMesh.add(domeMesh);
  domeMesh.position.y = 0.5;

  const turretWidth = 0.1;
  const turretHeight = 0.1;
  const turretLength = carLength * 0.75 * 0.2;
  const turretGeometry = new BoxGeometry(
    turretWidth,
    turretHeight,
    turretLength,
  );

  const turretMesh = new Mesh(turretGeometry, bodyMaterial);
  const turretPivot = new Group();
  turretMesh.castShadow = true;
  turretPivot.scale.set(5, 5, 5);
  turretPivot.position.y = 0.5;
  turretMesh.position.z = turretLength * 0.5;
  turretPivot.add(turretMesh);
  bodyMesh.add(turretPivot);

  const turretCamera = makeCamera();
  turretCamera.position.y = 0.75 * 0.2;
  turretMesh.add(turretCamera);

  const targetGeometry = new SphereGeometry(0.5, 6, 3);
  const targetMaterial = new MeshPhongMaterial({
    color: 0x00ff00,
    flatShading: true,
  });
  const targetMesh = new Mesh(targetGeometry, targetMaterial);
  const targetOrbit = new Group();
  const targetElevation = new Group();
  const targetBob = new Group();
  targetMesh.castShadow = true;
  scene.add(targetOrbit);
  targetOrbit.add(targetElevation);
  targetElevation.position.z = carLength * 2;
  targetElevation.position.y = 8;
  targetElevation.add(targetBob);
  targetBob.add(targetMesh);

  const targetCamera = makeCamera();
  const targetCameraPivot = new Group();
  targetCamera.position.y = 1;
  targetCamera.position.z = -2;
  targetCamera.rotation.y = Math.PI;
  targetBob.add(targetCameraPivot);
  targetCameraPivot.add(targetCamera);

  const curve = new SplineCurve([
    new Vector2(-10, 0),
    new Vector2(-5, 5),
    new Vector2(0, 0),
    new Vector2(5, -5),
    new Vector2(10, 0),
    new Vector2(5, 10),
    new Vector2(-5, 10),
    new Vector2(-10, -10),
    new Vector2(-15, -8),
    new Vector2(-10, 0),
  ]);

  const points = curve.getPoints(50);
  const geometry = new BufferGeometry().setFromPoints(points);
  const material = new LineBasicMaterial({ color: 0x00ff00 });
  const splineObjet = new Line(geometry, material);
  splineObjet.rotation.x = Math.PI * 0.5;
  splineObjet.position.y = 0.05;
  scene.add(splineObjet);

  function resizeRendererToDisplaySize(renderer: WebGLRenderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  const targetPosition = new Vector3();
  const tankPosition = new Vector2();
  const tankTarget = new Vector2();

  const cameras = [
    { cam: camera, desc: "detached camera" },
    { cam: turretCamera, desc: "on turret looking at target" },
    { cam: targetCamera, desc: "near target looking at tank" },
    { cam: tankCamera, desc: "above back of tank" },
  ];

  const infoElem = document.getElementById("info") as HTMLDivElement;
  function render(time: number) {
    time = time * 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      cameras.forEach((cameraInfo) => {
        const camera = cameraInfo.cam;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      });
    }

    // target
    targetOrbit.rotation.y = time * 0.27;
    targetBob.position.y = Math.sin(time * 2) * 4;
    targetMesh.rotation.x = time * 7;
    targetMesh.rotation.y = time * 13;
    targetMaterial.emissive.setHSL((time * 10) % 1, 1, 0.25);
    targetMaterial.color.setHSL((time * 10) % 1, 1, 0.25);

    // tank
    const tankTime = time * 0.05;
    curve.getPointAt(tankTime % 1, tankPosition);
    tank.position.set(tankPosition.x, 0, tankPosition.y);
    curve.getPointAt((tankTime + 0.01) % 1, tankTarget);
    tank.lookAt(tankTarget.x, 0, tankTarget.y);

    // position turret
    targetMesh.getWorldPosition(targetPosition);
    turretPivot.lookAt(targetPosition);
    // make the turretCamera look at target
    turretCamera.lookAt(targetPosition);

    // make the targetCameraPivot ook at the tank
    tank.getWorldPosition(targetPosition);
    targetCameraPivot.lookAt(targetPosition);

    wheelMeshes.forEach((obj) => {
      obj.rotation.x = time * 3;
    });

    const camera = cameras[(time * 0.25) % cameras.length | 0];
    infoElem!.textContent = camera.desc;
    renderer.render(scene, camera.cam);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

init();
