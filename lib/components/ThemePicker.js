import React, { useState } from "react";
import Icon from "./Icon";

export default function ThemePicker(props) {
  const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
  console.log(darkThemeMq);
  const [theme, setTheme] = useState(props.theme);
  return (
    <div>
      {theme === "light" ? (
        <Icon icon="BsFillSunFill" color="primary" styles={iconStyles} />
      ) : (
        <Icon icon="BsFillMoonFill" color="primary" styles={iconStyles} />
      )}
    </div>
  );
}

ThemePicker.defaultProps = {
  theme: "dark",
};

const iconStyles = {
  fontSize: "20px",
};
