import { useEffect, useState } from "react";

const useFavourite = (data: any) => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const createFavourite = async (input: any) => {
    try {
      fetch("/api/favourite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      setSuccess(true);
    } catch (error) {
      setError(true);
    }
  };

  const deleteFavourite = async (id: any) => {
    try {
      fetch("/api/favourite", {
        method: "PATCH", // Have to use PATCH as DELETE request cannot include a body
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      });
      setSuccess(true);
    } catch (error) {
      setError(true);
    }
  };

  useEffect(() => {
    try {
      // Check if an update should happen
      if (data.update === true) {
        // Check if favouriting or unfavouriting
        if (data.favourite) {
          createFavourite(data.props);
        } else {
          deleteFavourite(data.props.id);
        }
      }
    } catch (error) {
      setError(true);
    }
  }, [data.update]);

  return { success, error };
};

export default useFavourite;
