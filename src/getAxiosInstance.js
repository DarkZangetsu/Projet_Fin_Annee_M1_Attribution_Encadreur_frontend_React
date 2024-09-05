import axios from "axios";

export const getAxiosInstance = () => {
  const token = localStorage.getItem("authToken");
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};
