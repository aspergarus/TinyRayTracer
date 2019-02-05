class Vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  normalize() {
    const k = 1 / this.norm();

    return this.mulScalar(k);
  }
  
  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  
  plus(newVector) {
    return new Vector(this.x + newVector.x, this.y + newVector.y, this.z + newVector.z);
  }
  
  minus(newVector) {
    return new Vector(this.x - newVector.x, this.y - newVector.y, this.z - newVector.z);
  }
  
  mulScalar(scalar) {    
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }
  
  // result - scalar
  mul(newVector) {
    return this.x * newVector.x + this.y * newVector.y + this.z * newVector.z;
  }

  negative() {
    return this.mulScalar(-1);
  }

  getColor(name) {
    let floatVal = this[name];
    return Math.round(255 * Math.max(0, Math.min(1, floatVal)))
  }

  getRGB() {
    return {
      x: this.getColor('x'),
      y: this.getColor('y'),
      z: this.getColor('z')
    }
  }
}
