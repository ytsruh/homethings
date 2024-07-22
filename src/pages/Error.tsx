import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "@/components/Auth";
import NotFound from "@/pages/NotFound";

export default function Error() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }

    if (error.status === 401) {
      signOut();
      navigate("/", { replace: false });
      return null;
    }

    if (error.status === 503) {
      return <div>Looks like our API is down</div>;
    }

    if (error.status === 418) {
      return <div>🫖</div>;
    }
  }

  return <div>Something went wrong</div>;
}
