// src/utils/session.js
export const setSessionId = (id) => {
  sessionStorage.setItem("sessionId", id);
};

export const getSessionId = () => {
  return sessionStorage.getItem("sessionId");
};
