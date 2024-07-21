import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/Auth";
import { Button } from "../components/ui/button";

const Logout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>Logout Page</h1>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default Logout;
