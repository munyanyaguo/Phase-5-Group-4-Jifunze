import React, { useEffect, useState, useRef, useCallback } from "react";
import { Send, MessageSquare, BookOpen, Inbox, User, Clock, CheckCircle2, ChevronRight, Check, CheckCheck, Info, X, Users, Calendar, FileText } from "lucide-react";
import { fetchEducatorCourses } from "../../services/courseService";
import { fetchMessagesByCourse, sendMessage } from "../../services/messageService";
import { MessagesSkeleton } from "../../components/common/SkeletonLoader";
import { API_URL as CONFIG_URL } from '../../config';

const API_URL = `${CONFIG_URL}/api`;

export default function EducatorMessages() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const listRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const STORAGE_KEY = "educator_messages_course_id";

  // Function to update unread counts and last message time for all courses
  const updateUnreadCounts = useCallback(async () => {
    try {
      const counts = {};
      const lastMessageTimes = {};
      
      await Promise.all(courses.map(async (course) => {
        try {
          const data = await fetchMessagesByCourse(Number(course.id));
          const msgs = Array.isArray(data?.messages) ? data.messages : [];
          const lastReadKey = `lastRead_course_${course.id}`;
          const lastReadTime = localStorage.getItem(lastReadKey);
          
          const unread = msgs.filter(msg => {
            if (!lastReadTime) return true;
            return new Date(msg.timestamp) > new Date(lastReadTime);
          }).length;
          
          counts[course.id] = unread;
          
          // Get the most recent message timestamp
          if (msgs.length > 0) {
            const sortedMsgs = [...msgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            lastMessageTimes[course.id] = sortedMsgs[0].timestamp;
          } else {
            lastMessageTimes[course.id] = null;
          }
        } catch (error) {
          console.error('Failed to fetch messages for course:', course.id, error);
          counts[course.id] = 0;
          lastMessageTimes[course.id] = null;
        }
      }));
      
      setUnreadCounts(counts);
    } catch (err) {
      console.error('Failed to update unread counts:', err);
    }
  }, [courses]);

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        
        // Get current user's public_id from token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            setCurrentUserId(decoded.sub); // 'sub' contains user_public_id
          } catch (error) {
            console.error('Failed to decode token:', error);
          }
        }
        
        const res = await fetchEducatorCourses();
        const list = Array.isArray(res?.data) ? res.data : [];
        
        // Sort courses by most recent message activity
        const lastMessageTimes = {};
        await Promise.all(list.map(async (course) => {
          try {
            const data = await fetchMessagesByCourse(Number(course.id));
            const msgs = Array.isArray(data?.messages) ? data.messages : [];
            if (msgs.length > 0) {
              const sortedMsgs = [...msgs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
              lastMessageTimes[course.id] = sortedMsgs[0].timestamp;
            } else {
              lastMessageTimes[course.id] = null;
            }
          } catch {
            lastMessageTimes[course.id] = null;
          }
        }));
        
        // Sort courses by most recent message
        const sortedCourses = [...list].sort((a, b) => {
          const timeA = lastMessageTimes[a.id];
          const timeB = lastMessageTimes[b.id];
          
          // Courses with messages come first
          if (!timeA && !timeB) return 0;
          if (!timeA) return 1;
          if (!timeB) return -1;
          
          // Sort by most recent message
          return new Date(timeB) - new Date(timeA);
        });
        
        setCourses(sortedCourses);
        if (sortedCourses.length > 0) {
          const saved = localStorage.getItem(STORAGE_KEY);
          const initial = saved && sortedCourses.find((c) => String(c.id) === saved) ? saved : String(sortedCourses[0].id);
          setSelectedCourseId(initial);
        }
        setInitialLoading(false);
      } catch (e) {
        setError(e.message || "Failed to load courses");
        setInitialLoading(false);
      }
    };
    load();
  }, []);
  
  // Update unread counts when courses change
  useEffect(() => {
    if (courses.length > 0) {
      updateUnreadCounts();
    }
  }, [courses, updateUnreadCounts]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedCourseId) return;
      try {
        setLoading(true);
        const data = await fetchMessagesByCourse(Number(selectedCourseId));
        const msgs = Array.isArray(data?.messages) ? data.messages : [];
        // Sort by timestamp ascending (oldest first) for proper display
        const sorted = [...msgs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Mark educator's own messages
        const markedMessages = sorted.map(msg => ({
          ...msg,
          isOwnMessage: currentUserId && msg.user_public_id === currentUserId,
          status: msg.status || 'sent'
        }));
        
        setMessages(markedMessages);
        lastMessageCountRef.current = markedMessages.length;
        
        // Mark messages as read for this course
        const lastReadKey = `lastRead_course_${selectedCourseId}`;
        localStorage.setItem(lastReadKey, new Date().toISOString());
      } catch (e) {
        setError(e.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    loadMessages();
  }, [selectedCourseId, currentUserId]);

  // Poll for new incoming messages for the selected course
  useEffect(() => {
    if (!selectedCourseId) return;
    const interval = setInterval(async () => {
      try {
        const data = await fetchMessagesByCourse(Number(selectedCourseId));
        const latest = Array.isArray(data?.messages) ? data.messages : [];
        
        // Only check if there are more messages than last count
        if (latest.length > lastMessageCountRef.current) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = latest.filter((m) => !existingIds.has(m.id));
            
            if (newOnes.length > 0) {
              // Sort new messages and append to bottom
              const sortedNew = newOnes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
              
              // Mark educator's own messages and notify for others
              const course = courses.find((c) => String(c.id) === selectedCourseId);
              const markedNew = sortedNew.map(msg => ({
                ...msg,
                isOwnMessage: currentUserId && msg.user_public_id === currentUserId,
                status: msg.status || 'sent'
              }));
              
              markedNew.forEach((msg) => {
                if (!msg.isOwnMessage) {
                  window.dispatchEvent(
                    new CustomEvent("edu:new-message", {
                      detail: {
                        courseId: Number(selectedCourseId),
                        courseTitle: course?.title || course?.name || `Course ${selectedCourseId}`,
                        message: msg,
                      },
                    })
                  );
                }
              });
              
              const updated = [...prev, ...markedNew];
              lastMessageCountRef.current = updated.length;
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedCourseId, courses, currentUserId]);

  useEffect(() => {
    // Auto-scroll to bottom on new messages (smooth scroll)
    if (listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || content.length < 2 || !selectedCourseId) return;
    if (sending) return; // Prevent double-send
    
    try {
      setSending(true);
      // Optimistic update - add message immediately to bottom
      const optimistic = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date().toISOString(),
        user: { name: "You" },
        isOwnMessage: true, // Mark as own message
        status: 'sending', // Message status: sending, sent, seen
      };
      setMessages((prev) => {
        const updated = [...prev, optimistic];
        return updated;
      });
      setNewMessage("");

      // Send to server
      const saved = await sendMessage(Number(selectedCourseId), content);
      // Replace the optimistic message with the saved one (no full reload)
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => !String(m.id).startsWith("temp-"));
        // Mark saved message as own message with 'sent' status
        const savedWithFlag = { ...saved, isOwnMessage: true, status: 'sent' };
        const updated = [...withoutTemp, savedWithFlag];
        lastMessageCountRef.current = updated.length;
        return updated;
      });
    } catch (e) {
      setError(e.message || "Failed to send message");
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !String(m.id).startsWith("temp-")));
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sending) handleSend();
    }
  };

  // Fetch course details and enrolled students
  const fetchCourseDetails = async (courseId) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      
      // Fetch course details
      const courseRes = await fetch(`${API_URL}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      
      // Fetch enrollments with user data
      const enrollRes = await fetch(`${API_URL}/enrollments?course_id=${courseId}&page=1&per_page=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const enrollData = await enrollRes.json();
      
      const course = courseData?.data?.course || courseData?.data || courseData?.course || {};
      let enrollments = enrollData?.data?.items || enrollData?.data?.enrollments || enrollData?.items || [];
      
      // If enrollments don't have user data, fetch it
      if (enrollments.length > 0 && !enrollments[0].user) {
        const enrichedEnrollments = await Promise.all(
          enrollments.map(async (enrollment) => {
            try {
              const userRes = await fetch(`${API_URL}/users/${enrollment.user_public_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const userData = await userRes.json();
              const user = userData?.data?.user || userData?.data || userData?.user || {};
              return {
                ...enrollment,
                user: {
                  name: user.name || 'Unknown Student',
                  email: user.email || '',
                  public_id: enrollment.user_public_id
                }
              };
            } catch (err) {
              console.error(`Failed to fetch user ${enrollment.user_public_id}:`, err);
              return {
                ...enrollment,
                user: {
                  name: enrollment.user_public_id || 'Unknown Student',
                  email: '',
                  public_id: enrollment.user_public_id
                }
              };
            }
          })
        );
        enrollments = enrichedEnrollments;
      }
      
      setCourseDetails({
        ...course,
        enrollments: enrollments
      });
      setShowCourseDetails(true);
    } catch (err) {
      console.error('Failed to fetch course details:', err);
      setError('Failed to load course details');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (initialLoading) {
    return <MessagesSkeleton />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            Messages
          </h1>
          <p className="text-gray-600">Chat with students in your courses</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - Takes remaining height */}
      <div className="flex-1 px-6 pb-6 min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left: course list */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="font-bold text-lg">My Courses</span>
              </div>
              <p className="text-sm text-blue-100">{courses.length} course{courses.length !== 1 ? 's' : ''} • Select to chat</p>
            </div>
            <div className="flex-1 overflow-auto">
              {courses.length === 0 ? (
                <div className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No courses available</p>
                </div>
              ) : (
                courses.map((c) => {
                  const isSelected = String(c.id) === selectedCourseId;
                  const unreadCount = unreadCounts[c.id] || 0;
                  const hasUnread = unreadCount > 0;
                  
                  return (
                    <button
                      key={c.id}
                      onClick={() => { const id = String(c.id); setSelectedCourseId(id); localStorage.setItem(STORAGE_KEY, id); }}
                      className={`w-full text-left px-4 py-4 border-b transition-all duration-200 group relative ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-sm" 
                          : hasUnread
                          ? "bg-blue-50/50 hover:bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
                          isSelected
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md"
                            : hasUnread
                            ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}>
                          <BookOpen className="w-6 h-6" />
                          {hasUnread && !isSelected && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`truncate mb-1 ${
                            hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-800"
                          }`}>{c.title || c.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {hasUnread ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'Click to view chat'}
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-all ${
                          isSelected ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                        }`} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: chat pane */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg flex flex-col h-full overflow-hidden">
            {/* Chat Header */}
            <div className="flex-shrink-0 p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => selectedCourseId && fetchCourseDetails(selectedCourseId)}
                  className="flex items-center gap-3 hover:bg-white/50 rounded-lg p-2 -m-2 transition-colors group"
                  disabled={!selectedCourseId}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      {courses.find((c) => String(c.id) === selectedCourseId)?.title || "Select a course"}
                      {selectedCourseId && (
                        <Info className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {messages.length} messages
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-gradient-to-b from-gray-50 to-white min-h-0" style={{ scrollBehavior: 'smooth' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3 animate-pulse" />
                    <p className="text-gray-500">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No messages yet</p>
                    <p className="text-gray-400 text-sm mt-2">Start a conversation with your students</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => {
                    // Check if this is the educator's own message
                    const isYou = m.isOwnMessage || (m.user?.name || "").toLowerCase() === "you";
                    const messageStatus = m.status || 'sent'; // Default to 'sent' for old messages
                    
                    return (
                      <div key={m.id} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-lg">
                          <div className={`flex items-center gap-2 mb-1 ${isYou ? 'justify-end' : 'justify-start'}`}>
                            {!isYou && (
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <span className="text-xs font-medium text-gray-600">
                              {isYou ? 'You' : (m.user?.name || m.user_public_id)}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              {!isYou && <Clock className="w-3 h-3" />}
                              {new Date(m.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                            isYou 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm' 
                              : 'bg-white border-2 border-gray-100 text-gray-800 rounded-bl-sm'
                          }`}>
                            <div className="flex items-end justify-between gap-3">
                              <p className="text-sm leading-relaxed break-words flex-1">{m.content}</p>
                              {isYou && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <span className="text-xs opacity-80">
                                    {new Date(m.timestamp).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })}
                                  </span>
                                  {messageStatus === 'sending' && (
                                    <Clock className="w-3 h-3 opacity-60" />
                                  )}
                                  {messageStatus === 'sent' && (
                                    <CheckCheck className="w-4 h-4 opacity-80" />
                                  )}
                                  {messageStatus === 'seen' && (
                                    <CheckCheck className="w-4 h-4 text-blue-200" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 p-4 border-t bg-white">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Type your message..."
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={sending || newMessage.trim().length < 2 || !selectedCourseId}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    sending || newMessage.trim().length < 2 || !selectedCourseId
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Modal */}
      {showCourseDetails && courseDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-md transition-all"
              onClick={() => setShowCourseDetails(false)}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl transition-all overflow-hidden">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {courseDetails.title}
                      </h3>
                      <p className="text-sm text-blue-100">Course Details</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCourseDetails(false)}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading students...</p>
                    </div>
                  </div>
                ) : (
                  <>
                {/* Course Description */}
                {courseDetails.description && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-800">Description</h4>
                    </div>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                      {courseDetails.description}
                    </p>
                  </div>
                )}

                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {courseDetails.created_at && (
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-700">Created</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(courseDetails.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">Students</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {courseDetails.enrollments?.length || 0} enrolled
                    </p>
                  </div>
                </div>

                {/* Enrolled Students */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-800">Enrolled Students</h4>
                  </div>
                  
                  {courseDetails.enrollments && courseDetails.enrollments.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {courseDetails.enrollments.map((enrollment, index) => (
                        <div
                          key={enrollment.id || index}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {(enrollment.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">
                              {enrollment.user?.name || 'Unknown Student'}
                            </div>
                            {enrollment.user?.email && (
                              <div className="text-xs text-gray-500">
                                {enrollment.user.email}
                              </div>
                            )}
                          </div>
                          {enrollment.created_at && (
                            <div className="text-xs text-gray-400">
                              Joined {new Date(enrollment.created_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No students enrolled yet</p>
                    </div>
                  )}
                </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowCourseDetails(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


