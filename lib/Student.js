const Course = require("./Course.js");
const TeachAssistError = require("./TeachAssistError.js");
const http = require("./http.js");
const cheerio = require("cheerio");

class Student {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.expiration = 0;
    this.courses = [];
  }

  async generateSession() {
    if (Date.now() < this.expiration) return false;
    const res = await http.post("https://ta.yrdsb.ca/yrdsb/index.php", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `subject_id=0&username=${this.username}&password=${this.password}&submit=Login`
    });
    const headers = res.headers;
    const uri = headers.location;
    this.id = uri.slice(uri.indexOf("=") + 1);
    const cookies = headers["set-cookie"];
    const token = cookies
      .filter((c) => c.startsWith("session_token="))
      .map((token) => token.slice(token.indexOf("=") + 1, token.indexOf(";")))
      .find((token) => token !== "deleted");
    if (!token) throw new TeachAssistError("Unable to login, probably invalid credentials.");
    this.token = token;
    this.expiration = Date.now() + 600000;
    return true;
  }

  async getCourses() {
    const res = await this.generateSession();
    if (!res && this.courses.length) return this.courses;
    this.courses = [];
    const main = await http.get(`https://ta.yrdsb.ca/live/students/listReports.php?student_id=${this.id}`, {
      headers: {
        Cookie: `session_token=${this.token}; student_id=${this.id}`
      }
    });
    const $ = cheerio.load(main.body);

    const table = $("table")[1];
    let $$ = cheerio.load(table);

    const rows = Array.from($$("tbody > tr")).slice(1);
    $$ = cheerio.load(rows);
    const data = Array.from($$("td"));
    for (let i = 0; i < data.length; i += 3) {
      const mark = data[i + 2].children[0];
      const name = data[i].children[0].data.trim();
      const block = data[i].children[2].data.trim();
      const room = block.slice(block.lastIndexOf(" ") + 1);
      const period = block.slice(7, 8);
      if (mark.data === "\n") {
        const link = mark.next.attribs.href;
        this.courses.push(new Course(link.slice(link.indexOf("=") + 1, link.indexOf("&")), name, mark.next.children[0].data.trim().slice(-5, -1), room, period, this));
      }
      else {
        this.courses.push(new Course(-1, name, -1, room, period, this));
      }
    }
    return this.courses;
  }

  async getMarks(course) {
    if (!this.courses.length) await this.getCourses();
    const c = this.courses.find((c) => c.id === course);
    if (!c) throw new TeachAssistError("Course not found.");
    return c.getMarks(this.token);
  }

  async getMeta(course) {
    await this.generateSession();
    return this.courses.find((c) => c.id === course).getMeta(this.token);
  }
}

module.exports = Student;