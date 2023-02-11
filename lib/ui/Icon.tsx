// @ts-nocheck
import * as Icons from "react-icons/bs";

type Props = {
  icon: any;
  color: string;
  styles: any;
};

export default function Profile(props: Props) {
  const icon = Icons[props.icon]();
  const color = props.color || "text-white";
  return (
    <div style={props.styles} className={color}>
      {icon}
    </div>
  );
}
