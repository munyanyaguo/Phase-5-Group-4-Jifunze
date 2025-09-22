// src/pages/student/ExamAttempt.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExams, saveAttempt } from "../../services/studentService";
import { getCurrentUser } from "../../services/authServices";
import { v4 as uuidv4 } from "uuid";

export default function ExamAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exams = getExams();
  const exam = exams.find((e) => e.id === id);
  const user = getCurrentUser?.();
  const userClass = user?.className || "Class A";

  // guard: prevent accessing exam for another class
  if (!exam) return <div className="p-6">Exam not found.</div>;
  if (exam.className !== userClass) return <div className="p-6">You are not allowed to take this exam.</div>;

  const [answers, setAnswers] = useState({}); // { questionId: choiceId }
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const timerRef = useRef();

  useEffect(() => {
    // start countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(); // auto-submit when time ends
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (qId, choiceId) => {
    setAnswers((prev) => ({ ...prev, [qId]: choiceId }));
  };

  const grade = (answersObj) => {
    let score = 0;
    exam.questions.forEach((q) => {
      if (q.qtype === "mcq") {
        if (answersObj[q.id] === q.answer) score += q.marks;
      }
      // extend for other qtypes
    });
    return score;
  };

  const handleSubmit = () => {
    // prevent double submit
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const startedAt = new Date().toISOString();
    const submittedAt = new Date().toISOString();
    const score = grade(answers);
    const total = exam.questions.reduce((s, q) => s + (q.marks || 0), 0);
    const attempt = {
      id: uuidv4(),
      examId: exam.id,
      examTitle: exam.title,
      startedAt,
      submittedAt,
      answers,
      score,
      total
    };
    saveAttempt(attempt);
    navigate("/student/results");
  };

  const formatTime = (t) => {
    const mm = Math.floor(t / 60).toString().padStart(2, "0");
    const ss = (t % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{exam.title}</h2>
        <div className="bg-gray-100 px-4 py-2 rounded">{formatTime(timeLeft)}</div>
      </div>

      <div className="bg-white p-6 rounded shadow space-y-6">
        {exam.questions.map((q, idx) => (
          <div key={q.id}>
            <p className="font-medium">{idx + 1}. {q.body}</p>
            <div className="mt-2 space-y-2">
              {q.choices.map((c) => {
                const checked = answers[q.id] === c.id;
                return (
                  <label key={c.id} className={`flex items-center gap-3 p-2 rounded ${checked ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={checked || false}
                      onChange={() => handleSelect(q.id, c.id)}
                      className="form-radio"
                    />
                    <span>{c.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
        </div>
      </div>
    </div>
  );
}
