// src/TypingEffect.jsx
import React, { useState, useEffect } from 'react';

function TypingEffect({ text, speed = 50, onUpdate }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let isCancelled = false;
    setDisplayedText("");

    const typeNext = (i) => {
      if (isCancelled) return;
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        setTimeout(() => typeNext(i + 1), speed);
      }
    };

    typeNext(0);

    return () => {
      isCancelled = true;
    };
  }, [text, speed]);

  useEffect(() => {
    if (onUpdate) onUpdate();
  }, [displayedText, onUpdate]);

  return <span>{displayedText}</span>;
}

export default TypingEffect;
