import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import ConnectContext from "../context/Connectcontext";

const ProtectedRoute = ({ children }) => {
  const { authdata } = useContext(ConnectContext);

  // Check token existence
  if (!authdata?.authtoken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
