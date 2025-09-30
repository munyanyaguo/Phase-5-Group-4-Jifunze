import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../config";

const StudentMessages = ({ courseId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(""); // start as empty string
  const [coursesLoading, setCoursesLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem("user_id"); // ✅ use user_id
  const PER_PAGE = 10;

  const effectiveCourseId = courseId || selectedCourseId;

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = async () => {
    if (!currentUserId) return console.log("Waiting for user authentication...");

    setCoursesLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/enrollments?user_public_id=${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setEnrolledCourses(data.data.enrollments);
        if (data.data.enrollments.length > 0) {
          setSelectedCourseId(data.data.enrollments[0].course_id);
        }
      } else {
        setError(data.message || "Failed to load courses");
      }
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async (pageNumber = 1) => {
    if (!effectiveCourseId) return;

    const token = localStorage.getItem("token");

    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(
        `${API_URL}/api/messages?course_id=${parseInt(effectiveCourseId)}&page=${pageNumber}&per_page=${PER_PAGE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Failed to load messages");
        return;
      }

      setMessages(prev =>
        pageNumber === 1 ? data.data.messages : [...prev, ...data.data.messages]
      );
      setHasMore(data.data.meta.page < data.data.meta.pages);
      setPage(pageNumber);
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetches
  useEffect(() => {
    if (!courseId) fetchEnrolledCourses();
  }, [courseId, currentUserId]);

  useEffect(() => {
    if (effectiveCourseId) fetchMessages(1);
  }, [effectiveCourseId]);

  // Send new message
  const handleSendMessage = async e => {
    e.preventDefault();

    //  validation before sending message
    const isEnrolled = !courseId && enrolledCourses.some(
      enrollment => parseInt(enrollment.course_id) === parseInt(effectiveCourseId)
    );

    if (!courseId && !isEnrolled) {
      setError("You are not enrolled in this course.");
      return;
    }

    // Validate message content
    if (!newMessage.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    if (newMessage.trim().length < 2) {
      setError("Message must be at least 2 characters long.");
      return;
    }

    // Validate course selection
    if (!effectiveCourseId) {
      setError("Please select a course first.");
      return;
    }

    // For standalone component, validate enrollment
    if (!courseId) {
      const isEnrolled = enrolledCourses.some(enrollment =>
        parseInt(enrollment.course_id) === parseInt(effectiveCourseId)
      );

      if (!isEnrolled) {
        setError("You are not enrolled in this course.");
        return;
      }
    }

    console.log("All validations passed, sending message to course:", effectiveCourseId);

    setSending(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const requestData = {
        course_id: parseInt(effectiveCourseId),
        content: newMessage.trim(),
      };

      console.log("📤 Sending message:", requestData);

      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();
      console.log("📥 Response:", res.status, data);

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage("");
      }
      else {
        console.error("❌ Validation failed:", data.errors || data.message);
        setError(`Validation failed: ${data.errors || data.message}`);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      setError("Network error occurred.");
    } finally {
      setSending(false);
    }
  };


  // Filter messages by selected course
  const filteredMessages = messages.filter(msg => msg.course_id === effectiveCourseId);
  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  return (
    <div className="mt-6 flex flex-col h-96 border rounded-lg p-4 bg-white overflow-y-auto">
      {/* Loading courses */}
      {coursesLoading && <div className="text-center mt-4">Loading courses...</div>}

      {/* No courses */}
      {!coursesLoading && enrolledCourses.length === 0 && !courseId && (
        <div className="text-center mt-4 text-gray-500">You are not enrolled in any courses.</div>
      )}

      {/* Course selection dropdown */}
      {!courseId && enrolledCourses.length > 0 && (
        <select
          value={selectedCourseId || ""}
          onChange={e => {
            const courseId = parseInt(e.target.value) || "";
            console.log(" Selected course:", courseId);
            setSelectedCourseId(courseId);
          }}
          className="mb-2 border p-1 rounded w-full"
        >
          <option value="">Choose a course...</option>
          {enrolledCourses.map(enrollment => (
            <option key={enrollment.course_id} value={enrollment.course_id}>
              {enrollment.course.title}
            </option>
          ))}
        </select>
      )}

      {/* Feedback if no course selected */}
      {!courseId && enrolledCourses.length > 0 && !selectedCourseId && (
        <div className="text-center text-gray-500 mt-4">
          Please select a course above to view messages.
        </div>
      )}

      {/* Messages UI */}
      {effectiveCourseId && (
        <>
          {loading && <div className="text-center mt-4">Loading messages...</div>}
          {error && <div className="text-red-500 text-center mt-4">{error}</div>}

          {!loading && !error && (
            <>
              <ul className="flex-1 space-y-4">
                {(() => {
                  let currentDate = null;
                  return sortedMessages.map(msg => {
                    const msgDate = new Date(msg.timestamp).toLocaleDateString();
                    const showDate = msgDate !== currentDate;
                    currentDate = msgDate;

                    const isSelf = msg.user_public_id === currentUserId;

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="text-center text-gray-500 text-sm mb-2">{msgDate}</div>
                        )}
                        <div className={`flex mb-1 ${isSelf ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-xs p-2 rounded-lg shadow ${isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                              }`}
                          >
                            {!isSelf && <div className="font-semibold text-sm mb-1">{msg.user?.name || "Teacher"}</div>}
                            <div>{msg.content}</div>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
                <div ref={messagesEndRef} />
              </ul>

              {hasMore && (
                <button
                  className="mt-2 text-blue-500 underline self-center"
                  onClick={() => fetchMessages(page + 1)}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              )}

              <form onSubmit={handleSendMessage} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="border p-2 rounded flex-1"
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default StudentMessages;
