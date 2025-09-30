import React, { useEffect, useState, useRef } from "react";
import { Send, MessageSquare, BookOpen, Inbox } from "lucide-react";
import { fetchEducatorCourses } from "../../services/courseService";
import { fetchMessagesByCourse, sendMessage } from "../../services/messageService";

export default function EducatorMessages() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const STORAGE_KEY = "educator_messages_course_id";

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const res = await fetchEducatorCourses();
        const list = Array.isArray(res?.data) ? res.data : [];
        setCourses(list);
        if (list.length > 0) {
          const saved = localStorage.getItem(STORAGE_KEY);
          const initial = saved && list.find((c) => String(c.id) === saved) ? saved : String(list[0].id);
          setSelectedCourseId(initial);
        }
      } catch (e) {
        setError(e.message || "Failed to load courses");
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedCourseId) return;
      try {
        setLoading(true);
        const data = await fetchMessagesByCourse(Number(selectedCourseId));
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
      } catch (e) {
        setError(e.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [selectedCourseId]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || content.length < 2 || !selectedCourseId) return;
    try {
      setLoading(true);
      // Optimistic update
      const optimistic = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        user: { name: "You" },
      };
      setMessages((prev) => [...prev, optimistic]);
      setNewMessage("");

      // Send to server
      const saved = await sendMessage(Number(selectedCourseId), content);

      // Replace optimistic with saved (refresh list to get server ordering/nesting)
      const refreshed = await fetchMessagesByCourse(Number(selectedCourseId));
      setMessages(Array.isArray(refreshed?.messages) ? refreshed.messages : []);
    } catch (e) {
      setError(e.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!loading) handleSend();
    }
  };

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
        <MessageSquare className="w-6 h-6 text-blue-600" /> Messages
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
        {/* Left: course list */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
          <div className="p-3 border-b text-sm font-medium text-gray-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-gray-500" /> My Courses
          </div>
          <div className="flex-1 overflow-auto">
            {courses.length === 0 ? (
              <div className="p-4 text-gray-500">No courses</div>
            ) : (
              courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { const id = String(c.id); setSelectedCourseId(id); localStorage.setItem(STORAGE_KEY, id); }}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${String(c.id) === selectedCourseId ? "bg-blue-50" : ""}`}
                >
                  <div className="font-medium text-gray-800">{c.title || c.name}</div>
                  {c.description && (
                    <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: chat pane */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border flex flex-col">
          <div className="p-3 border-b text-sm text-gray-600">
            {courses.find((c) => String(c.id) === selectedCourseId)?.title || "Select a course"}
          </div>

          <div ref={listRef} className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-6 text-gray-600">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="p-6 text-gray-500 flex items-center gap-2"><Inbox className="w-4 h-4" /> No messages yet</div>
            ) : (
              <div className="p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="max-w-xl">
                    <div className="text-xs text-gray-500 mb-1">
                      {m.user?.name || m.user_public_id} • {new Date(m.timestamp).toLocaleString()}
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 inline-block">
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t flex gap-2 items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button
              onClick={handleSend}
              disabled={loading || newMessage.trim().length < 2 || !selectedCourseId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}


