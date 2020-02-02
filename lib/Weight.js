class Weight {
  constructor(weight, cWeight, final) {
    this.weight = weight;
    this.cWeight = cWeight;
    this.weight.KU = weight[0];
    this.weight.TI = weight[1];
    this.weight.COMM = weight[2];
    this.weight.APP = weight[3];
    this.weight.OTHER = weight[4];
    this.cWeight.KU = cWeight[0];
    this.cWeight.TI = cWeight[1];
    this.cWeight.COMM = cWeight[2];
    this.cWeight.APP = cWeight[3];
    this.cWeight.OTHER = cWeight[4];
    this.final = final;
  }
}

module.exports = Weight;