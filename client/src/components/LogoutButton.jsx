import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login"); // redirect to login after logout
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
