// src/hooks/useNotifications.js
import { useEffect, useRef } from 'react';
import { API_URL as BASE_URL } from '../config';

const API_URL = `${BASE_URL}/api`;

/**
 * Global notification hook that polls for new messages
 * Works across all pages to trigger notifications
 */
export function useNotifications() {
  const lastCheckRef = useRef({});
  const isPollingRef = useRef(false);

  useEffect(() => {
    // Temporarily disabled to prevent CORS errors
    return () => {};
    
    /* eslint-disable no-unreachable */
    const pollForNewMessages = async () => {
      if (isPollingRef.current) return; // Prevent concurrent polls
      isPollingRef.current = true;

      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Get user's courses
        const coursesRes = await fetch(`${API_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!coursesRes.ok) return;
        
        const coursesData = await coursesRes.json();
        const courses = coursesData?.data?.courses || coursesData?.data?.items || [];
        
        // Check each course for new messages
        for (const course of courses) {
          try {
            const messagesRes = await fetch(`${API_URL}/courses/${course.id}/messages`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!messagesRes.ok) continue;
            
            const messagesData = await messagesRes.json();
            const messages = messagesData?.data?.messages || messagesData?.messages || [];
            
            if (messages.length === 0) continue;
            
            // Get the last message
            const latestMessage = messages[messages.length - 1];
            const lastChecked = lastCheckRef.current[course.id];
            
            // If this is a new message since last check
            if (!lastChecked || new Date(latestMessage.timestamp) > new Date(lastChecked)) {
              // Get current user to check if it's their own message
              const userStr = localStorage.getItem('user');
              const currentUser = userStr ? JSON.parse(userStr) : null;
              const isOwnMessage = currentUser && latestMessage.user_public_id === currentUser.public_id;
              
              // Only notify if it's not the user's own message
              if (!isOwnMessage) {
                console.log('🔔 New message detected:', course.title, latestMessage.content);
                
                // Dispatch notification event
                window.dispatchEvent(
                  new CustomEvent('edu:new-message', {
                    detail: {
                      courseId: course.id,
                      courseTitle: course.title || course.name,
                      message: latestMessage
                    }
                  })
                );
              }
              
              // Update last checked time
              lastCheckRef.current[course.id] = latestMessage.timestamp;
            }
          } catch (err) {
            console.error(`Failed to check messages for course ${course.id}:`, err);
          }
        }
      } catch (err) {
        console.error('Failed to poll for notifications:', err);
      } finally {
        isPollingRef.current = false;
      }
    };

    // Initial check after 2 seconds
    const initialTimeout = setTimeout(pollForNewMessages, 2000);
    
    // Poll every 10 seconds
    const interval = setInterval(pollForNewMessages, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);
}
