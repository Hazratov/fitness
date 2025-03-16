import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthCheck } from "../hooks/useAuthCheck";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthCheck();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-admin-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;