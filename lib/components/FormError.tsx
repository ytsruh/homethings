import { Button } from "@/components/ui/button";
import { ResetIcon } from "@radix-ui/react-icons";

type FormErrorProps = {
  reset: (b: boolean) => void;
};

export default function FormError(props: FormErrorProps) {
  return (
    <div className="w-full flex justify-around items-center gap-2">
      <div>
        <h6>An Error Occurred</h6>
        <p>Please try again</p>
      </div>
      <Button onClick={() => props.reset(false)}>
        <ResetIcon className="mr-2 h-4 w-4" /> Reset
      </Button>
    </div>
  );
}
