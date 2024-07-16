import { useNavigate } from "react-router-dom";
import { useAuth } from "@components/Auth";
import { Button } from "@ui/button";

export default function Login() {
  const { updateToken } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    updateToken("this is a test token");
    navigate("/", { replace: true });
  };

  return (
    <div>
      <h1>Login Page</h1>
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
}
