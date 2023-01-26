import { useEffect, useState } from "react";

const useFetchData = (url: URL) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [serverError, setServerError]: any = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(url);
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
