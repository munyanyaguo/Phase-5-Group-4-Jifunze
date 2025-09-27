// src/pages/student/ExamAttempt.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExams, saveAttempt } from "../../services/studentService";
import { getCurrentUser } from "../../services/authServices";

export default function ExamAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exam = getExams().find(e => e.id === id);
  const user = getCurrentUser?.();
  const cls = user?.className || "Class A";

  if (!exam) return <div className="p-6">Exam not found.</div>;
  if (exam.className !== cls) return <div className="p-6">You are not allowed to take this exam.</div>;

  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line
  }, []);

  const select = (qId, cId) => setAnswers(prev => ({ ...prev, [qId]: cId }));

  const grade = (a) => {
    let score = 0;
    exam.questions.forEach(q => { if (a[q.id] === q.answer) score += (q.marks || 1); });
    return score;
  };

  const submit = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const score = grade(answers);
    const total = exam.questions.reduce((s, q) => s + (q.marks || 1), 0);
    const attempt = { id: Date.now().toString(), examId: exam.id, examTitle: exam.title, answers, score, total, startedAt: new Date().toISOString(), submittedAt: new Date().toISOString() };
    saveAttempt(attempt);
    navigate("/student/results");
  };

  const fmt = t => `${String(Math.floor(t/60)).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{exam.title}</h2>
        <div className="bg-gray-100 px-3 py-1 rounded">{fmt(timeLeft)}</div>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-4">
        {exam.questions.map((q, idx) => (
          <div key={q.id}>
            <div className="font-medium">{idx+1}. {q.body}</div>
            <div className="mt-2 space-y-2">
              {q.choices.map(c => (
                <label key={c.id} className={`flex items-center gap-3 p-2 rounded hover:bg-gray-50 ${answers[q.id]===c.id ? "bg-blue-50" : ""}`}>
                  <input type="radio" checked={answers[q.id]===c.id} onChange={() => select(q.id, c.id)} />
                  <span>{c.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 border rounded" onClick={() => navigate(-1)}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>Submit</button>
        </div>
      </div>
    </div>
  );
}
