import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import ConnectContext from "../context/Connectcontext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { authdata, authLoading } = useContext(ConnectContext);

  // ── While /me is in-flight, show a full-screen spinner ──────────
  // This prevents a flash-redirect to /login on page refresh
  // while the session is being silently restored.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
          <p className="text-gray-400 text-sm">Restoring session...</p>
        </div>
      </div>
    );
  }

  // ── No valid session after /me resolved → redirect to login ─────
  if (!authdata?.authtoken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;