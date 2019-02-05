var ctx;

document.addEventListener("DOMContentLoaded", function() {
	setImageForCanvas();
});

function setImageForCanvas() {
  var canvas = document.getElementById("game");
  ctx = canvas.getContext('2d');

  let data = render(canvas.width, canvas.height);

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  let allImageData = [];

  // Iterate through every pixel
  for (let i = 0, colorIndex = 0; i < imageData.data.length - 1; i += 4, colorIndex++) {
    imageData.data[i + 0] = data[colorIndex].x;  // R value
    imageData.data[i + 1] = data[colorIndex].y;  // G value
    imageData.data[i + 2] = data[colorIndex].z;  // B value

    imageData.data[i + 3] = 255;  // A value
  }
  ctx.putImageData(imageData, 0, 0);
}

function render(width, height) {
  let [fov, spheres, lights] = initScene();
  
  let result = [];

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {      
      let x =  (2*(i + 0.5)/width  - 1) * Math.tan(fov/2.) * width / height;
      let y = -(2*(j + 0.5)/height - 1) * Math.tan(fov/2.);

      let dir = new Vector(x, y, -1).normalize();

      let color = castRay(new Vector(0,0,0), dir, spheres, lights);
      result[i+j*width] = color.getRGB();
    }
  }
  
  return result;
}

// orig and dir is Vector
function castRay(orig, dir, spheres, lights) {
  let [intersection, point, N, material] = sceneIntersect(orig, dir, spheres);

  if (!intersection) {
    return new Vector(0.2, 0.7, 0.8);
  }

  let diffuseLightIntensity = 0;
  let specularLightIntensity = 0;
  for (light of lights) {
    let lightDir = (light.position.minus(point)).normalize();
    let lightDistance = (light.position.minus(point)).norm();

    let tinyN = N.mulScalar(0.001);
    let shadowOrig = lightDir.mul(N) < 0 ? point.minus(tinyN) : point.plus(tinyN); // checking if the point lies in the shadow of the light

    let [shadowIntersection, shadowPoint, shadowN, tmpmaterial] = sceneIntersect(shadowOrig, lightDir, spheres);
    if (shadowIntersection && (shadowPoint.minus(shadowOrig)).norm() < lightDistance) {
      continue;
    }

    diffuseLightIntensity += light.intensity * Math.max(0, lightDir.mul(N));

    let reflection = reflect(lightDir.negative(), N);
    specularLightIntensity += Math.pow(Math.max(0, -(reflection.mul(dir))), material.getSpecular());
  }

  let duffuseColor = material.getColor().mulScalar(diffuseLightIntensity).mulScalar(material.getAlbedo(0));
  let specularColor = new Vector(1., 1., 1.).mulScalar(specularLightIntensity).mulScalar(material.getAlbedo(1));
  return duffuseColor.plus(specularColor);
}

function sceneIntersect(orig, dir, spheres) {
  let sphereDist = Infinity;
  let hit, N, material;

  for (let sphere of spheres) {
    let [intersection, dist] = sphere.rayIntersect(orig, dir, 0);
    if (intersection && dist < sphereDist) {
      sphereDist = dist;
      hit = orig.plus(dir.mulScalar(dist));
      N = hit.minus(sphere.center).normalize();
      material = sphere.material;
    }
  }
  
  return [sphereDist < 1000, hit, N, material];
}

function reflect(I, N) {
  return I.minus(N.mulScalar(2).mulScalar(I.mul(N)));
}

function initScene() {
  const ivory = new Material([0.6, 0.3], new Vector(0.4, 0.4, 0.3), 50);
  const redRubber = new Material([0.9, 0.1], new Vector(0.3, 0.1, 0.1), 10);
  const fov = Math.PI / 2;
  
  let spheres = [
    new Sphere(new Vector(-3.0, 0, -16.0), 2, ivory),
    new Sphere(new Vector(-1.0, -1.50, -12.0), 2, redRubber),
    new Sphere(new Vector(1.5, -0.5, -18.0), 3, redRubber),
    new Sphere(new Vector(7.0, 5.0, -18.0), 4, ivory),
  ];
  
  let lights = [
    new Light(new Vector(-20, 20,  20), 1.5),
    new Light(new Vector(30, 50,  -25), 1.8),
    new Light(new Vector(30, 20,  30), 1.7),
  ];

  return [fov, spheres, lights];
}
