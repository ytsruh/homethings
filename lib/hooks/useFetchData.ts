import { useEffect, useState } from "react";

const useFetchData = (url: URL) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const user = await JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(url, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setServerError(true);
        }
        const data = await response.json();
        setApiData(data);
        setIsLoading(false);
      } catch (error) {
        setServerError(error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { isLoading, apiData, serverError };
};

export default useFetchData;
