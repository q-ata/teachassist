# TeachAssist

`teachassist` authenticates with the YRDSB TeachAssist website for student course information.

## Installation
```bash
$ npm install teachassist
```

## Example Usage
```js
const {Student} = require("teachassist");
// No HTTP requests are done at this time.
const me = new Student("my_username", "my_password");

// Attempts to authenticate and extract list of courses.
me.getCourses().then(async (courses) => {
  for (const course of courses) {
    console.log(`Student is taking ${course.name} in room ${course.room} and has a ${course.grade}%.`);
  }
  // Attempts to get individual assignment data for first course.
  const marks = await me.getMarks(courses[0].id);
  for (const mark of marks) {
    console.log(`Student got ${mark.earned[0]}/${mark.total[0]} K/U marks on ${mark.name}.`);
  }
  // Attemps to get course weightings for first course.
  const weights = await me.getMeta(courses[0].id);
  console.log(`Knowledge and Understanding is worth ${weights.weight.KU}% excluding finals.`);
  console.log(`Thinking and inquiry is worth ${weights.cWeight.TI}% including finals.`);
});
```

## Documentation
### Student
Represents a student with a YRDSB TeachAssist login.

`<Student>.courses`: Array of loaded courses for student. Empty until `<Student>.getCourses()` is called.

**Constructor**

`username`: Login username of the student.  
`password`: Login password of the student.

**generateSession()**

Obtain and store a session token that can be used to access course information. Expires after 10 minutes. Does nothing if existing token is valid.  
All methods that require a token automatically call *generateSessions()* if needed.

*Returns*: Promise::boolean `true` if a new token was generated, `false` otherwise.

**getCourses()**

Obtain an array of *Course* objects representing the courses this student is currently taking. This populates the `courses` property.

*Returns*: Promise::Array::Course

**getMarks(courseID)**

`courseID`: ID of course to get marks for. This is *not* the name of the course.

Obtain an array of all individual assignments for the given course.

*Returns*: Promise::Array::Mark

**getMeta(courseID)**

`courseID`: ID of course to get marks for. This is *not* the name of the course.

Obtain the weightings of each category for the given course.

*Returns*: Promise::Weight

### Course
Represents a course being taken by a student.

`<Course>.student` The student object that is taking this course.  
`<Course>.marks` Array of loaded assignment data for this course. Empty until `<Student>.getMarks(courseID)` is called.  
`<Course>.meta` Loaded course weightings for this course. Undefined until `<Student>.getMeta(courseID)` is called.

### Mark
Represents an individual assignment for a course.

`<Mark>.name` Name of this assignment.  
`<Mark>.earned` Array representing number of marks earned for each category in order: KU, TI, COMM, APP, OTHER.  
`<Mark>.total` Array representing number of total marks for each category in order: KU, TI, COMM, APP, OTHER.  
`<Mark>.weight` Array representing numerical weightings for each category in order: KU, TI, COMM, APP, OTHER.

Quantities for `earned`, `total`, and `weight` can also be accessed as properties with `.KU`, `.TI`, `.COMM`, `.APP`, and `.OTHER` respectively.

**static getStringType(type)**

`type`: Number representation of mark type.

*Returns*: String `KU` for 0, `TI` for 1, `COMM` for 2, `APP` for 3, `OTHER` for 4.

### Weight
Represents course weightings for each category.

`<Weight>.weight` Array of percentage weights for each category before finals in order: KU, TI, COMM, APP, OTHER.  
`<Weight>.cWeight` Array of percentage weights for each category including finals in order: KU, TI, COMM, APP, OTHER.  
`<Weight>.final` Percentage the final is worth overall in the course.

Quantities for `weight` and `cWeight` can also be accessed as properties with `.KU`, `.TI`, `.COMM`, `.APP`, and `.OTHER` respectively.