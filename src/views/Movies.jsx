import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import Loading from "../components/Loading";
import PageTitle from "../components/PageTitle";
import image from "../assets/img/movieshero1.jpeg";
import MoviesList from "../components/MoviesList";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [searchText, setSearchText] = useState("");
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
  }, [user.token]);

  if (error) {
    return <Navigate replace to="/500" />;
  }

  if (loading) {
    return <Loading />;
  }

  const filterMovies = (data) => {
    return data.filter((movie) => movie.title.toLowerCase().includes(searchText.toLowerCase()));
  };

  return (
    <div className="mb-3">
      <PageTitle title="Movies" description={desc} image={image} alt="Movies Hero" />
      <FilterBar function={setSearchText} />
      <MoviesList data={filterMovies(movies.data)} />
    </div>
  );
}

const desc = "Find the best & most popular movies now available on Homeflix";

const FilterBar = (props) => {
  return (
    <Container className="bg-dark text-white my-5 px-5 py-3 rounded">
      <Form.Group>
        <Form.Control
          type="search"
          name="filter"
          className="bg-dark border border-primary text-white"
          placeholder="Search or filter movies"
          onChange={(e) => props.function(e.target.value)}
        />
      </Form.Group>
    </Container>
  );
};