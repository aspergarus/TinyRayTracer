class Sphere {

  // Center is Vector
  constructor(center, radius, color) {
    this.center = center;
    this.radius = radius;
    this.color = color;
  }

  
  // orid, dir and t0 are changable
  // orid is Vector
  // dir is Vector
  // t0 is scalar
  rayIntersect(orig, dir, t0) {    
    // L - Vector
    let L = this.center.minus(orig);
    // tca - scalar
    let tca = L.mul(dir);
    // d2 - scalar
    let d2 = L.mul(L) - tca * tca;
    let r_2 = this.radius * this.radius;
    if (d2 > r_2) {
      return [false, null];
    }

    // thc - scalar
    let thc = Math.sqrt(r_2 - d2);
    t0 = tca - thc;
    let t1 = tca + thc;

    if (t0 < 0) {
      t0 = t1;
    }
    if (t0 < 0) {
      return [false, null];
    }

    return [true, t0];
  }
}
