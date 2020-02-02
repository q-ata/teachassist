const sTypes = ["KU", "TI", "COMM", "APP", "OTHER"];
const nTypes = {
  "ffffaa": 0,
  "c0fea4": 1,
  "afafff": 2,
  "ffd490": 3,
  "#dedede": 4
};

class Mark {
  constructor(name, earned, total, weight) {
    this.name = name;
    this.earned = earned;
    this.total = total;
    this.weight = weight;
  }

  static getStringType(type) {
    return sTypes[type];
  }

  static getNumericType(color) {
    return nTypes[color];
  }

}

module.exports = Mark;