import { axiosInstance } from "../lib/axios";


/**
 * @param {Object} formData - { fullName, email, password }
 * @returns {Promise<Object>} user data
 */
export const signupApi = async (formData) => {
  try {
    const response = await axiosInstance.post("/auth/signup", formData);
    return response.data;
  } catch (error) {
    // Bubble up the message for the caller to handle
    const message = error?.response?.data?.message || "Signup failed";
    throw new Error(message);
  }
};


export const loginApi = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data; // user data
  } catch (error) {
    const message = error?.response?.data?.message || "Login failed";
    throw new Error(message);
  }
};

export const logoutApi = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    const message = error?.response?.data?.message || "Logout failed";
    throw new Error(message);
  }
};