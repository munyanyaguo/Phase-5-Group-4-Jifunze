import React, { useEffect, useState, useRef } from "react";
import { API_URL } from "../../config";
import { FaPaperPlane, FaComments } from "react-icons/fa";

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
    
    // Debug: decode token to see claims
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log("🔑 Token claims:", decoded);
    } catch (e) {
      console.error("Failed to decode token:", e);
    }

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
        
        // Better error message for school mismatch
        if (data.message?.includes("not allowed for this school")) {
          setError("This course belongs to a different school. Please contact your administrator.");
        } else {
          setError(`Failed to send message: ${data.message || "Unknown error"}`);
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">💬 Messages</h1>
          <p className="text-sm text-gray-600">Chat with your educators and classmates</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Course selection dropdown */}
          {!courseId && (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
              {coursesLoading ? (
                <div className="text-white text-center text-sm">Loading courses...</div>
              ) : enrolledCourses.length === 0 ? (
                <div className="text-center text-white py-4">
                  <FaComments className="mx-auto text-3xl mb-2 opacity-70" />
                  <p className="text-sm">You are not enrolled in any courses.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-white text-xs font-medium mb-2">Select Course</label>
                  <select
                    value={selectedCourseId || ""}
                    onChange={e => {
                      const courseId = parseInt(e.target.value) || "";
                      console.log("Selected course:", courseId);
                      setSelectedCourseId(courseId);
                    }}
                    className="w-full p-2 text-sm rounded-lg border-0 focus:ring-2 focus:ring-white/50 outline-none"
                  >
                    <option value="">Choose a course...</option>
                    {enrolledCourses.map(enrollment => (
                      <option key={enrollment.course_id} value={enrollment.course_id}>
                        {enrollment.course.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Feedback if no course selected */}
          {!courseId && enrolledCourses.length > 0 && !selectedCourseId && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FaComments className="text-4xl mb-3 opacity-50" />
              <p className="text-sm">Please select a course above to view messages</p>
            </div>
          )}

          {/* Messages UI */}
          {effectiveCourseId && (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="p-6">
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-semibold">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Messages Container */}
                  <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
                    {sortedMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <FaComments className="text-4xl mb-3 opacity-50" />
                        <p className="text-base">No messages yet</p>
                        <p className="text-xs">Be the first to start the conversation!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
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
                                  <div className="flex justify-center my-4">
                                    <span className="bg-white px-4 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                                      {msgDate}
                                    </span>
                                  </div>
                                )}
                                <div className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-md ${isSelf ? "order-2" : "order-1"}`}>
                                    {!isSelf && (
                                      <div className="text-xs text-gray-600 mb-1 ml-3">
                                        {msg.user?.name || "Teacher"}
                                      </div>
                                    )}
                                    <div
                                      className={`p-4 rounded-2xl shadow-md ${
                                        isSelf
                                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                                          : "bg-white text-gray-800 rounded-bl-none"
                                      }`}
                                    >
                                      <div className="break-words">{msg.content}</div>
                                      <div className={`text-xs mt-2 ${isSelf ? "text-blue-100" : "text-gray-500"}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                        <div ref={messagesEndRef} />
                      </div>
                    )}

                    {hasMore && (
                      <div className="text-center mt-4">
                        <button
                          className="bg-white text-blue-600 px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all font-medium"
                          onClick={() => fetchMessages(page + 1)}
                          disabled={loadingMore}
                        >
                          {loadingMore ? "Loading..." : "Load older messages"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 bg-white border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
                        disabled={sending || !newMessage.trim()}
                      >
                        {sending ? (
                          "Sending..."
                        ) : (
                          <>
                            <FaPaperPlane className="text-xs" />
                            Send
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
