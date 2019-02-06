class Material {
  // refract - float
  // albedo - 4D-array
  // color - Vector
  // specularExponent - float
  constructor(refract, albedo, color, specularExponent) {
    this.refract = refract;
    this.albedo = albedo;
    this.color = color;
    this.specularExponent = specularExponent;
  }

  getSpecular() {
  	return this.specularExponent;
  }

  getColor() {
  	return this.color;
  }

  getAlbedo(index) {
  	return this.albedo[index];
  }

  getRefract() {
    return this.refract;
  }
}
