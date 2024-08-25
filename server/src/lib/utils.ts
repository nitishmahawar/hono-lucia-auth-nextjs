export const getUrl = () => {
  return process.env.NODE_ENV === "production"
    ? process.env.BASE_URL || "http://localhost:5000"
    : "http://localhost:5000";
};
