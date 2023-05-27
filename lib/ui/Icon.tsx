// @ts-nocheck
import * as Icons from "react-icons/bs";
import PropTypes from "prop-types";

type Props = {
  icon: string;
  color: string;
  styles: {
    fontSize: string;
  };
};

export default function Icon(props: Props) {
  const icon = Icons[props.icon]();
  const color = props.color || "text-white";
  return (
    <div style={props.styles} className={color}>
      {icon}
    </div>
  );
}

Icon.propTypes = {
  icon: PropTypes.any,
  color: PropTypes.string,
  styles: PropTypes.object,
};
