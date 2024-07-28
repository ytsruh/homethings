import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/Auth";
import { Button } from "@/components/ui/button";

export function Error() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <ErrorTemplate status={404} />;
    }

    if (error.status === 401) {
      signOut();
      navigate("/", { replace: false });
      return null;
    }

    if (error.status === 503) {
      return <ErrorTemplate status={503} />;
    }

    if (error.status === 418) {
      return <ErrorTemplate status={418} />;
    }
  }

  return <ErrorTemplate status={500} />;
}

export function ErrorTemplate(props: { status: number }) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Button asChild>
        <a href="/">Home</a>
      </Button>
      <img
        src={`https://http.cat/${props.status.toString()}`}
        alt={`${props.status.toString()} cat status`}
      />
    </div>
  );
}
