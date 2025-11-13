// src/lib/cookies.js
import Cookies from "js-cookie";

export const setUserCookie = (user) => {
  Cookies.set("spms_user", JSON.stringify(user), { expires: 1 });
};

export const getUserCookie = () => {
  const data = Cookies.get("spms_user");
  return data ? JSON.parse(data) : null;
};

export const clearUserCookie = () => {
  Cookies.remove("spms_user");
};
