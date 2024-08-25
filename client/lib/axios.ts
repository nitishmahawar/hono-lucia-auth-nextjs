import AXIOS from "axios";
// import { getCurrentUser } from "./get-current-user";

export const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

// Create a new Axios instance with default configuration
const axios = AXIOS.create({
  baseURL: API_URL, // Replace with your API base URL
  withCredentials: true,
  // timeout: 10000, // Adjust timeout as needed
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptors for handling headers, authentication, etc.
axios.interceptors.request.use(
  async (config) => {
    // You can modify headers, set authentication tokens, etc. before sending the request
    // For example, adding an authorization token:
    // const user = await getCurrentUser();
    // if (user?.accessToken) {
    //   config.headers.Authorization = user.accessToken;
    // }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Add response interceptors for handling responses or errors
axios.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // Handle different HTTP status codes here (e.g., 401 for unauthorized)
      console.error(
        "Response error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Request error:", error.request);
    } else {
      // Something happened in setting up the request that triggered an error
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Export the configured Axios instance
export default axios;
