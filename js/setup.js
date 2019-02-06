
function initScene() {
  const ivory =     new Material(1.0, [0.6, 0.3, 0.1, 0.0], new Vector(0.4, 0.4, 0.3), 50.);
  const glass =     new Material(1.5, [0.0, 0.5, 0.1, 0.8], new Vector(0.6, 0.7, 0.8), 125.);
  const redRubber = new Material(1.0, [0.9, 0.1, 0.0, 0.0], new Vector(0.3, 0.1, 0.1), 10.);
  const mirror =    new Material(1.0, [0.0, 10., 0.8, 0.0], new Vector(1., 1., 1.), 1425.);
  const fov = Math.PI / 2;
  
  let spheres = [
    new Sphere(new Vector(-3.0, 0, -16.0), 2, ivory),
    new Sphere(new Vector(-1.0, -1.50, -12.0), 2, glass),
    new Sphere(new Vector(1.5, -0.5, -18.0), 3, redRubber),
    new Sphere(new Vector(7.0, 5.0, -18.0), 4, mirror),
  ];
  
  let lights = [
    new Light(new Vector(-20, 20,  20), 1.5),
    new Light(new Vector(30, 50,  -25), 1.8),
    new Light(new Vector(30, 20,  30), 1.7),
  ];

  return [fov, spheres, lights];
}
