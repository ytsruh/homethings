import { useAuth } from "../components/Auth";
import { Button } from "../components/ui/button";

const Logout = () => {
  const { signOut } = useAuth();

  return (
    <div>
      <h1>Logout Page</h1>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  );
};

export default Logout;
