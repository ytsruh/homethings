import React, { useState, useEffect } from "react";
import Icon from "./Icon";

export default function ThemePicker() {
  const [theme, setTheme] = useState();
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    if (theme === "light") {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  };

  const fetchTheme = () => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      return storedTheme;
    } else {
      console.log("nothing");
      const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      console.log(system);
      return system;
    }
  };

  useEffect(() => {
    const initialTheme = fetchTheme();
    if (initialTheme === "dark") {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

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

const iconStyles = {
  fontSize: "20px",
};
