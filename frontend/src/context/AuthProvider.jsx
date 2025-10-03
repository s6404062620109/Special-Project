import { createContext, useState, useEffect } from "react";
import backend from "../api/backend";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    id: null,
    email: null,
    name: null,
    role: null,
    profile_img: null,
  });

  const fetchUserData = async () => {
    const emailrefStorage = localStorage.getItem("email");

    if (!emailrefStorage) return;

    try {
      const response = await backend.get(`/auth/authorization/${emailrefStorage}`, { withCredentials: true });

      if (response.status === 200) {
        setUserData({
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          surname: response.data.surname,
          role: response.data.role,
          profile_img: response.data.profile_img,
        });
      }
    } catch (error) {
      console.error("Authorization Error:", error);
      if (error.response?.status === 403) {
        localStorage.removeItem("email");
        alert("Session expired. Please log in again.");
        window.location.href = "/";
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
