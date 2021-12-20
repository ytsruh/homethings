import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Loading from "../components/Loading";
import PageTitle from "../components/PageTitle";
import image from "../assets/img/movieshero1.jpeg";
import MoviesList from "../components/MoviesList";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_HOST}/movies`, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setMovies(data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    getData();
  }, [user]);

  if (error) {
    return <Navigate replace to="/500" />;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="mb-3">
      <PageTitle title="Movies" description={desc} image={image} alt="Movies Hero" />
      <MoviesList data={movies} />
    </div>
  );
}

const desc = "Find the best & most popular movies now available on Homeflix";
