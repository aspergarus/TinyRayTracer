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
  const ivory = new Vector(0.4, 0.4, 0.3);
  const redRubber = new Vector(0.7, 0.4, 0.1);
  const fov = Math.PI / 2;
  
  let spheres = [
    new Sphere(new Vector(-3.0, 0, -16.0), 2, ivory),
    new Sphere(new Vector(-1.0, -1.50, -12.0), 2, redRubber),
    new Sphere(new Vector(1.5, -0.5, -18.0), 3, redRubber),
    new Sphere(new Vector(7.0, 5.0, -18.0), 4, ivory),
  ];
  
  let lights = [
    new Light(new Vector(-20, 20,  20), 1.4),
    // new Light(new Vector(30, 50,  -25), 1.3),
    // new Light(new Vector(30, 20,  30), 1.05),
  ];
  
  let result = [];

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {      
      let x =  (2*(i + 0.5)/width  - 1) * Math.tan(fov/2.) * width / height;
      let y = -(2*(j + 0.5)/height - 1) * Math.tan(fov/2.);

      let dir = new Vector(x, y, -1).normalize();

      let floatColor = castRay(new Vector(0,0,0), dir, spheres, lights);
      result[i+j*width] = floatColor.getRGB();
    }
  }
  
  return result;
}

function sceneIntersect(orig, dir, spheres) {
  let sphereDist = Infinity;
  let hit, N, color;

  for (let sphere of spheres) {
    let [intersection, dist] = sphere.rayIntersect(orig, dir, 0);
    if (intersection && dist < sphereDist) {
      sphereDist = dist;
      hit = orig.plus(dir.mulScalar(dist));
      N = hit.minus(sphere.center).normalize();
      color = sphere.color;
    }
  }
  
  return [sphereDist < 1000, hit, N, color];
}

// orig and dir is Vector
function castRay(orig, dir, spheres, lights) {
  let [intersection, point, N, color] = sceneIntersect(orig, dir, spheres);

  if (!intersection) {
    return new Vector(0.2, 0.7, 0.8);
  }

  let diffuseLightIntensity = 0;
  for (light of lights) {
    let lightDir = (light.position.minus(point)).normalize();
    diffuseLightIntensity += light.intensity * Math.max(0, lightDir.mul(N));
  }

  return color.mulScalar(diffuseLightIntensity);
  return color;
}
