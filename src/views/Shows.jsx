import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "../components/Loading";
import PageTitle from "../components/PageTitle";
import image from "../assets/img/showshero1.jpeg";

export default function Shows() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_HOST}/shows`);
        const data = await response.json();
        setShows(data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (error) {
    return <Navigate replace to="/500" />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <PageTitle title="TV Shows" description={desc} image={image} alt="Shows Hero" />
    </div>
  );
}

const desc = "Action, comedy & fantasy TV shows from 24 to Game of Thrones. Sit back & binge.";
