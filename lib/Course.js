const Mark = require("./Mark.js");
const Weight = require("./Weight.js");
const http = require("./http.js");
const cheerio = require("cheerio");

class Course {
  constructor(id, name, grade, room, period, student) {
    this.id = id;
    this.name = name;
    this.grade = grade;
    this.room = room;
    this.period = period;
    this.student = student;
    this.marks = [];
  }

  async getMarks(token) {
    if (this.token === token && this.marks.length) return this.marks;
    this.token = token;
    this.marks = [];
    const res = await http.get(`https://ta.yrdsb.ca/live/students/viewReport.php?subject_id=${this.id}&student_id=${this.student.id}`, {
      headers: {
        Cookie: `session_token=${token}; student_id=${this.student.id}`
      }
    });
    const $ = cheerio.load(res.body);
    const $$ = cheerio.load($("table")[1]);
    const rows = $$("tbody")[0].children.slice(2);
    for (let i = 0; i < rows.length; i += 4) {
      const row = rows[i];
      const name = row.children[1].children[0].data;
      const earned = [0, 0, 0, 0, 0];
      const total = [0, 0, 0, 0, 0];
      const weight = [0, 0, 0, 0, 0];
      for (let i = 3; i <= 11; i += 2) {
        if (row.children[i] && row.children[i].children[1]) {
          const str = row.children[i].children[1].children[1].children[0].children[1];
          const score = str.children[0].data;
          const w = str.children[3].children[0].data;
          const type = Mark.getNumericType(row.children[i].attribs.bgcolor);
          earned[type] = parseInt(score.slice(0, score.indexOf(" ")));
          total[type] = parseInt(score.slice(score.indexOf(" / ") + 3, score.indexOf(" =")));
          weight[type] = parseInt(w.slice(7));
        }
      }
      earned.KU = earned[0];
      earned.TI = earned[1];
      earned.COMM = earned[2];
      earned.APP = earned[3];
      earned.OTHER = earned[4];
      total.KU = total[0];
      total.TI = total[1];
      total.COMM = total[2];
      total.APP = total[3];
      total.OTHER = total[4];
      weight.KU = weight[0];
      weight.TI = weight[1];
      weight.COMM = weight[2];
      weight.APP = weight[3];
      weight.OTHER = weight[4];
      this.marks.push(new Mark(name, earned, total, weight));
    }
    return this.marks;
  }

  async getMeta(token) {
    if (this.token === token && this.meta) return this.meta;
    this.token = token;
    const res = await http.get(`https://ta.yrdsb.ca/live/students/viewReport.php?subject_id=${this.id}&student_id=${this.student.id}`, {
      headers: {
        Cookie: `session_token=${token}; student_id=${this.student.id}`
      }
    });
    const $ = cheerio.load(res.body);
    const rows = Array.from(cheerio.load(cheerio.load($("table[cellpadding='5']")[0])("table")[0])("tr"));
    const weight = [0, 0, 0, 0, 0];
    const cWeight = [0, 0, 0, 0, 0];
    for (let i = 2; i < rows.length - 1; i++) {
      const row = rows[i];
      const w = row.children[3].children[0].data;
      const cw = row.children[5].children[0].data;
      weight[i - 2] = parseFloat(w.slice(0, -1));
      cWeight[i - 2] = parseFloat(cw.slice(0, -1));
    }
    const fWeight = 100 - cWeight.reduce((a, b) => a + b);
    this.meta = new Weight(weight, cWeight, fWeight);
    return this.meta;
  }
}

module.exports = Course;