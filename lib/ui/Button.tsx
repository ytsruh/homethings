type Props = {
  color: string;
  text: string;
  children: JSX.Element | string;
  onClick?: () => void;
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
  text: "text-salt",
};
