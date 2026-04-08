import { createContext, useContext, useMemo, useState } from "react";
import {
  createVisitor,
  getVisitorById,
  updateVisitorExit,
} from "../services/apiService";

const VisitorContext = createContext(null);

export const VisitorProvider = ({ children }) => {
  const [currentVisitor, setCurrentVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setError("");

  const fetchVisitor = async (visitorId) => {
    setLoading(true);
    setError("");

    try {
      const response = await getVisitorById(visitorId.trim());
      if (!response.success) {
        setCurrentVisitor(null);
        return null; // Return null if visitor not found, don't throw
      }
      setCurrentVisitor(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      setCurrentVisitor(null);
      return null; // Return null on error instead of throwing
    } finally {
      setLoading(false);
    }
  };

  const registerVisitor = async (formData) => {
    setLoading(true);
    setError("");

    try {
      const response = await createVisitor(formData);
      setCurrentVisitor(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmExit = async (visitorId, updates) => {
    setLoading(true);
    setError("");

    try {
      const response = await updateVisitorExit(visitorId, updates);
      const mergedVisitor = {
        ...(currentVisitor || {}),
        ...response.data,
      };
      setCurrentVisitor(mergedVisitor);
      return mergedVisitor;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      currentVisitor,
      loading,
      error,
      clearError,
      setCurrentVisitor,
      fetchVisitor,
      registerVisitor,
      confirmExit,
    }),
    [currentVisitor, loading, error],
  );

  return <VisitorContext.Provider value={value}>{children}</VisitorContext.Provider>;
};

export const useVisitor = () => {
  const context = useContext(VisitorContext);

  if (!context) {
    throw new Error("useVisitor must be used within VisitorProvider");
  }

  return context;
};
