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

      let color = castRay(new Vector(0,0,0), dir, spheres, lights, 0);
      result[i+j*width] = color.getRGB();
    }
  }
  
  return result;
}

// orig and dir is Vector
function castRay(orig, dir, spheres, lights, depth) {
  let [intersection, point, N, material] = sceneIntersect(orig, dir, spheres);

  if (depth > 4 || !intersection) {
    return new Vector(0.2, 0.7, 0.8);
  }

  let reflectDir = reflect(dir, N).normalize();
  let refractDir = refract(dir, N, material.getRefract()).normalize();

  let reflectOrig = vectorShift(reflectDir, N, point); // offset the original point to avoid occlusion by the object itself
  let refractOrig = vectorShift(refractDir, N, point);

  let reflectColor = castRay(reflectOrig, reflectDir, spheres, lights, depth + 1);
  let refractColor = castRay(refractOrig, refractDir, spheres, lights, depth + 1);  

  let [diffuseLightIntensity, specularLightIntensity] = specular(spheres, lights, point, N, material, dir);

  let duffuseColor = material.getColor().mulScalar(diffuseLightIntensity).mulScalar(material.getAlbedo(0));
  let specularColor = new Vector(1., 1., 1.).mulScalar(specularLightIntensity).mulScalar(material.getAlbedo(1));
  reflectColor = reflectColor.mulScalar(material.getAlbedo(2));
  refractColor = refractColor.mulScalar(material.getAlbedo(3));

  return duffuseColor.plus(specularColor).plus(reflectColor).plus(refractColor);
  // return duffuseColor.plus(specularColor).plus(reflectColor);
  // return duffuseColor.plus(specularColor);
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

function refract(I, N, eta_t, eta_i) {
  eta_i = eta_i || 1;

  let cos_i = -1 * Math.max(-1., Math.min(1., I.mul(N)));
  if (cos_i < 0) {
    return refract(I, N.negative(), eta_i, eta_t);
  }

  let eta = eta_i / eta_t;
  let k = 1 - eta * eta * (1 - cos_i * cos_i);

  return k < 0 ? new Vector(1, 0, 0) : I.mulScalar(eta).plus(N.mulScalar(eta * cos_i - Math.sqrt(k)));
}

function specular(spheres, lights, point, N, material, dir) {
  let [diffuseLightIntensity, specularLightIntensity] = [0, 0];

  for (light of lights) {
    let lightDir = (light.position.minus(point)).normalize();
    let lightDistance = (light.position.minus(point)).norm();

    let shadowOrig = vectorShift(lightDir, N, point); // checking if the point lies in the shadow of the light

    let [shadowIntersection, shadowPoint, shadowN, tmpmaterial] = sceneIntersect(shadowOrig, lightDir, spheres);
    if (shadowIntersection && (shadowPoint.minus(shadowOrig)).norm() < lightDistance) {
      continue;
    }

    diffuseLightIntensity += light.intensity * Math.max(0, lightDir.mul(N));

    let reflection = reflect(lightDir.negative(), N);
    specularLightIntensity += Math.pow(Math.max(0, -(reflection.mul(dir))), material.getSpecular());
  }

  return [diffuseLightIntensity, specularLightIntensity];
}

function vectorShift(dirVector, N, point) {
  let tinyN = N.mulScalar(0.001)

  return dirVector.mul(N) < 0 ? point.minus(tinyN) : point.plus(tinyN);
}
