import React, { useEffect, useState } from "react";
import { API_URL } from "../../config";

const StudentMessages = ({ courseId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as a student to view messages.");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/messages?course_id=${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch messages");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setMessages(data.data.messages || []);
        } else {
          setError(data.message || "Failed to load messages");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Network error");
        setLoading(false);
      });
  }, [courseId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ course_id: courseId, content: newMessage }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to send message");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setMessages((prev) => [data.data, ...prev]);
          setNewMessage("");
        } else {
          setError(data.message || "Failed to send message");
        }
        setSending(false);
      })
      .catch((err) => {
        setError(err.message || "Network error");
        setSending(false);
      });
  };

  if (!courseId) return <div className="mt-4">Select a course to view messages.</div>;
  if (loading) return <div className="text-center mt-4">Loading messages...</div>;
  if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-2 text-blue-600">Course Messages</h4>
      <form onSubmit={handleSendMessage} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="border p-2 rounded w-full"
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
      {messages.length ? (
        <ul className="divide-y divide-gray-200">
          {messages.map((msg) => (
            <li key={msg.id} className="py-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-700">{msg.user?.name || msg.user_id}</span>
                <span className="text-xs text-gray-500">{msg.created_at}</span>
              </div>
              <div className="text-gray-700 mt-1">{msg.content}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages found for this course.</p>
      )}
    </div>
  );
};

export default StudentMessages;
