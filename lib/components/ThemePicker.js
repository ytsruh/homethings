import React, { useState } from "react";
import Icon from "./Icon";

export default function ThemePicker(props) {
  //const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
  //console.log(darkThemeMq);
  const [theme, setTheme] = useState(props.theme);
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    if (theme === "light") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };
  return (
    <div>
      {theme === "light" ? (
        <div onClick={() => changeTheme("dark")}>
          <Icon icon="BsFillSunFill" color="primary" styles={iconStyles} />
        </div>
      ) : (
        <div onClick={() => changeTheme("light")}>
          <Icon icon="BsFillMoonFill" color="primary" styles={iconStyles} />
        </div>
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
