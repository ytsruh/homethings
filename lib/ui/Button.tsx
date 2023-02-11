import PropTypes from "prop-types";

type Props = {
  color: string;
  text: string;
  children: JSX.Element | string;
  onClick?: () => void;
  form?: string;
  disabled?: boolean;
  type?: any;
};

export default function Button(props: Props) {
  return (
    <button onClick={props.onClick} className={`${props.color} ${props.text} px-6 py-3 rounded-md`}>
      {props.children}
    </button>
  );
}

Button.defaultProps = {
  color: "bg-primary",
  text: "text-white",
};

Button.propTypes = {
  color: PropTypes.string,
  text: PropTypes.string,
};
