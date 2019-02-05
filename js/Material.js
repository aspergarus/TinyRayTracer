class Material {
  // albedo - 2d-array
  // color - Vector
  // specularExponent - float
  constructor(albedo, color, specularExponent) {
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
}
