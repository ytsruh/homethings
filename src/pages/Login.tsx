import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/Auth";
import { Button } from "../components/ui/button";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    signIn("this is a test token");
    navigate("/", { replace: true });
  };

  return (
    <div>
      <h1>Login Page</h1>
      <Button onClick={handleLogin}>Login</Button>
    </div>
  );
}
