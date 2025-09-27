// // src/services/studentService.js
// import { getCurrentUser } from "./authServices";

// const resources = [
//   { id: 1, title: "Algebra Notes (PDF)", className: "Class A", type: "pdf", url: "/static/algebra.pdf" },
//   { id: 2, title: "Physics Lecture (MP4)", className: "Class A", type: "video", url: "/static/physics.mp4" },
//   { id: 3, title: "History Notes (PDF)", className: "Class B", type: "pdf", url: "/static/history.pdf" }
// ];

// const exams = [
//   {
//     id: "exam-1",
//     title: "Algebra Midterm",
//     className: "Class A",
//     durationMinutes: 10,
//     questions: [
//       { id: "q1", qtype: "mcq", body: "2 + 2 = ?", choices: [{id:'a',text:'3'},{id:'b',text:'4'},{id:'c',text:'5'}], answer: "b", marks: 1 },
//       { id: "q2", qtype: "mcq", body: "5 * 3 = ?", choices: [{id:'a',text:'15'},{id:'b',text:'12'},{id:'c',text:'10'}], answer: "a", marks: 1 }
//     ]
//   },
//   {
//     id: "exam-2",
//     title: "History Quiz",
//     className: "Class B",
//     durationMinutes: 5,
//     questions: [
//       { id: "q1", qtype: "mcq", body: "The year 1963 is known for?", choices: [{id:'a',text:'Event A'},{id:'b',text:'Event B'},{id:'c',text:'Event C'}], answer: "c", marks: 1 }
//     ]
//   }
// ];

// export function getResources() { return resources; }
// export function getExams() { return exams; }

// const attemptsKey = () => {
//   const u = getCurrentUser?.();
//   return `jifunze_attempts_${u?.email || "anon"}`;
// };
// export function saveAttempt(attempt) {
//   const key = attemptsKey();
//   const arr = JSON.parse(localStorage.getItem(key) || "[]");
//   arr.push(attempt);
//   localStorage.setItem(key, JSON.stringify(arr));
//   return attempt;
// }
// export function getAttemptsForCurrentUser() {
//   const key = attemptsKey();
//   return JSON.parse(localStorage.getItem(key) || "[]");
// }
// export function getAttemptById(id) {
//   return getAttemptsForCurrentUser().find(a => a.id === id);
// }
