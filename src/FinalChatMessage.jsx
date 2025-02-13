// src/FinalChatMessage.jsx
import React, { useState, useEffect } from 'react';

function FinalChatMessage({ speed = 50, delay1 = 3000, delay2 = 5000 }) {
  const firstPart = "Hey";
  const secondPart = ", are you still there?";
  const [text, setText] = useState("");

  useEffect(() => {
    let mounted = true;

    // 간단한 sleep 함수
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // 주어진 문자열을 한 글자씩 타이핑하는 함수
    const typeText = async (str) => {
      for (let i = 0; i < str.length; i++) {
        if (!mounted) break;
        // 이전 텍스트에 i번째 문자를 추가
        setText(prev => prev + str.charAt(i));
        await sleep(speed);
      }
    };

    // 전체 순서를 실행하는 async 함수
    const run = async () => {
      await sleep(delay1); // 3초 대기
      if (!mounted) return;
      await typeText(firstPart); // "Hey" 타이핑
      await sleep(delay2); // 5초 대기
      if (!mounted) return;
      await typeText(secondPart); // ", are you still there?" 타이핑
    };

    run();

    return () => { mounted = false; };
  }, [speed, delay1, delay2, firstPart, secondPart]);

  return (
    <div className="chat-bubble right final-chat">
      <div className="chat-header">[민수 - 00:00]</div>
      <div className="chat-body">
        {text}
        <span className="blinking-cursor"></span>
      </div>
    </div>
  );
}

export default FinalChatMessage;
