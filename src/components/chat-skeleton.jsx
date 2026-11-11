'use client';

import { useEffect, useState } from 'react';

export default function ChatSkeleton() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide skeleton after a short delay to simulate loading
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="chat-skeleton">
      <div className="chat-bubble">
        <div className="chat-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H6L10 22L14 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        .chat-skeleton {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          animation: pulse 2s infinite;
        }

        .chat-bubble {
          width: 60px;
          height: 60px;
          background: #e74c3c;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        .chat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .chat-skeleton {
            bottom: 15px;
            right: 15px;
          }

          .chat-bubble {
            width: 50px;
            height: 50px;
          }

          .chat-icon svg {
            width: 20px;
            height: 20px;
          }
        }
      `}</style>
    </div>
  );
}
