import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type PageTitleProps = {
  title: string;
  children?: React.ReactNode;
};

const PageTitle = (props: PageTitleProps) => {
  const location = useLocation();

  useEffect(() => {
    document.title = props.title;
  }, [location, props.title]);

  return null;
};

export default PageTitle;
