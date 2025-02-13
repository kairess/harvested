import React, { useState, useRef, useEffect } from 'react';
import { rawScreens } from './screens';
import { assignIdsToScreens } from './assignIds';
import TypingEffect from './TypingEffect';
import FinalChatMessage from './FinalChatMessage';
import './App.css';

const TRANSITION_DURATION = 500; // 스크린 전환 애니메이션 시간 (ms)
const LONG_FADE_DURATION = 10000; // 대화창 페이드아웃 시간 (10초)
const screens = assignIdsToScreens(rawScreens);

// URL 쿼리 파라미터로 특정 스크린/메시지에서 시작 (예: ?screen=2&message=1)
const urlParams = new URLSearchParams(window.location.search);
const initialScreenIndex = parseInt(urlParams.get("screen") || "0", 10);
const initialMessageIndex = parseInt(urlParams.get("message") || "0", 10);

function App() {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(initialScreenIndex);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(initialMessageIndex);
  const [transitionClass, setTransitionClass] = useState('');
  const [showCredits, setShowCredits] = useState(false);
  const [fadeOutCredits, setFadeOutCredits] = useState(false);
  const [showFinalChat, setShowFinalChat] = useState(false);

  const contentRef = useRef(null);
  const currentScreen = screens[currentScreenIndex];
  const totalMessages =
    currentScreen.type === 'narration'
      ? 1
      : currentScreen.messages.length + (currentScreen.endMessage ? 1 : 0);

  const scrollToBottom = () => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessageIndex, currentScreenIndex, transitionClass]);

  const handleClick = () => {
    if (showCredits || showFinalChat) return;
    if (currentMessageIndex < totalMessages - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1);
    } else {
      if (currentScreenIndex < screens.length - 1) {
        setTransitionClass('wipe-out');
        setTimeout(() => {
          setCurrentScreenIndex(currentScreenIndex + 1);
          setCurrentMessageIndex(0);
          setTransitionClass('wipe-in');
          setTimeout(() => {
            setTransitionClass('');
          }, TRANSITION_DURATION);
        }, TRANSITION_DURATION);
      }
    }
  };

  const handleBack = (e) => {
    e.stopPropagation();
    if (showCredits || showFinalChat) return;
    if (currentScreenIndex === 0 && currentMessageIndex === 0) return;
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1);
    } else {
      const prevScreenIndex = currentScreenIndex - 1;
      const prevScreen = screens[prevScreenIndex];
      const prevTotalMessages =
        prevScreen.type === 'narration'
          ? 1
          : prevScreen.messages.length + (prevScreen.endMessage ? 1 : 0);
      setTransitionClass('wipe-out-back');
      setTimeout(() => {
        setCurrentScreenIndex(prevScreenIndex);
        setCurrentMessageIndex(prevTotalMessages - 1);
        setTransitionClass('wipe-in-back');
        setTimeout(() => {
          setTransitionClass('');
        }, TRANSITION_DURATION);
      }, TRANSITION_DURATION);
    }
  };

  // 마지막 스크린의 마지막 메시지 도달 후 1초 대기 → 대화창 페이드아웃 10초 적용 → 엔딩 크레딧 표시
  useEffect(() => {
    if (
      !showCredits &&
      currentScreenIndex === screens.length - 1 &&
      currentMessageIndex === totalMessages - 1
    ) {
      const timer = setTimeout(() => {
        setTransitionClass('long-fade-out'); // 10초 페이드아웃
        setTimeout(() => {
          setShowCredits(true);
        }, LONG_FADE_DURATION);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentScreenIndex, currentMessageIndex, showCredits, totalMessages]);

  // 엔딩 크레딧 표시 후 23초 (20초 스크롤 + 3초 대기) 후 5초 페이드아웃, then 최종 채팅 메시지
  useEffect(() => {
    if (showCredits && !fadeOutCredits) {
      const timer = setTimeout(() => {
        setFadeOutCredits(true);
        setTimeout(() => {
          setShowCredits(false);
          setFadeOutCredits(false);
          setShowFinalChat(true);
        }, 5000); // 5초 페이드아웃
      }, 23000);
      return () => clearTimeout(timer);
    }
  }, [showCredits, fadeOutCredits]);

  if (showFinalChat) {
    return (
      <div className="terminal" onClick={handleClick}>
        <FinalChatMessage />
      </div>
    );
  }

  if (showCredits) {
    return (
      <div className="terminal credits-terminal">
        <div className={`credits-content ${fadeOutCredits ? 'credits-fade-out' : ''}`}>
          <p>Written and played by Taehee Lee</p>
          <p>Developed by ChatGPT o3-mini-high</p>
          <p>Inspired by Tech Dregs's video [It's time to move to Linux]</p>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal" onClick={handleClick}>
      <button className="back-button" onClick={handleBack}>
        뒤로가기
      </button>
      <div ref={contentRef} className={`terminal-content ${transitionClass}`}>
        {currentScreen.type === 'narration' ? (
          <div className="narration">
            <pre>{currentScreen.text}</pre>
          </div>
        ) : (
          <>
            {currentScreen.messages
              .slice(0, currentMessageIndex + 1)
              .map((msg) => {
                if (msg.type === 'news') {
                  return (
                    <div key={msg.id} className="news-message">
                      <pre>{msg.text}</pre>
                    </div>
                  );
                } else if (msg.type === 'chat') {
                  const alignment = msg.sender === '민수' ? 'right' : 'left';
                  return (
                    <div key={msg.id} className={`chat-bubble ${alignment}`}>
                      <div className="chat-header">
                        [{msg.sender} - {msg.time}]
                      </div>
                      <div className="chat-body">
                        <TypingEffect text={msg.text} speed={50} onUpdate={scrollToBottom} />
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            {currentScreen.endMessage &&
              currentMessageIndex >= currentScreen.messages.length && (
                <div className="system-message">
                  <pre>{currentScreen.endMessage}</pre>
                </div>
              )}
          </>
        )}
      </div>
      <div className="click-hint">
        마우스를 클릭하면{" "}
        {currentMessageIndex < totalMessages - 1 ? "다음 메시지로" : "다음 화면으로"} 넘어갑니다.
      </div>
    </div>
  );
}

export default App;
