import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function AdminSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/admin/login", { replace: true });
  }, [navigate]);

  return null;
}
