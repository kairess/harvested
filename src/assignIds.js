// src/assignIds.js

/**
 * 각 스크린과 메시지에 고유 id를 자동으로 부여합니다.
 * 만약 이미 id가 있다면 그대로 사용하고, 없으면 배열의 인덱스를 기반으로 id를 생성합니다.
 */
export function assignIdsToScreens(screens) {
    return screens.map((screen, screenIndex) => {
      // 스크린 id 생성 (기존 id가 없으면 "screen-0", "screen-1", ...)
      const screenId = screen.id || `screen-${screenIndex}`;

      // 스크린에 messages가 있으면 각 메시지에 대해 id 생성
      const messages = screen.messages
        ? screen.messages.map((msg, msgIndex) => ({
            ...msg,
            id: msg.id || `${screenId}-msg-${msgIndex}`,
          }))
        : undefined;

      return { ...screen, id: screenId, messages };
    });
  }
