import { AxiosError } from "axios";
import axios from "../axios";
import { Session, User } from "@/types/auth";

const login = async (body: { email: string; password: string }) => {
  try {
    const { data } = await axios.post("/api/auth/login", body);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.error || "Something went wrong!");
    }
  }
};

const register = async (body: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const { data } = await axios.post("/api/auth/register", body);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.error || "Something went wrong!");
    }
    throw new Error("Something went wrong!");
  }
};

const google = async () => {
  try {
    const { data } = await axios.get("/api/auth/google");
    return data as { url: string };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.error || "Something went wrong!");
    }

    throw new Error("Something went wrong!");
  }
};

const logout = async () => {
  try {
    const { data } = await axios.post("/api/auth/logout");
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "An error occurred during logout"
      );
    }
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred");
  }
};

const profile = async () => {
  try {
    const { data } = await axios.get("/api/auth/profile");
    return data as { user: User; session: Session };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        error.response?.data?.error || error.message || "Something went wrong!"
      );
    }
    throw error instanceof Error
      ? error
      : new Error("An unexpected error occurred");
  }
};

const authApi = { login, register, logout, google, profile };

export default authApi;
