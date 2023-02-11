import { BsX } from "react-icons/bs";
import PropTypes from "prop-types";

type Props = {
  close: (close: boolean) => void;
  text: string;
};

export default function Alert(props: Props) {
  return (
    <div className="bg-warning text-salt rounded-lg px-5 py-3">
      <div className="flex justify-between">
        <h3 className="text-xl">Oh snap! There's been an error!</h3>
        <div className="cursor-pointer text-xl" onClick={() => props.close(false)}>
          <BsX />
        </div>
      </div>
      <p>{props.text}</p>
    </div>
  );
}

Alert.propTypes = {
  close: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
};
