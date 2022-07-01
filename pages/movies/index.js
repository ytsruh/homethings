import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Container, Form } from "react-bootstrap";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/components/PageTitle";
import MoviesList from "@/components/MoviesList";

export default function Movies() {
  const router = useRouter();
  const [movies, setMovies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(`/api/movies`, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setMovies(data);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setError(true);
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (error) {
    router.push("/500");
  }

  if (loading) {
    return <Loading />;
  }

  const filterMovies = (data) => {
    return data.filter((movie) => movie.title.toLowerCase().includes(searchText.toLowerCase()));
  };

  return (
    <Protected>
      <div className="mb-3">
        <PageTitle title="Movies" description={desc} image={"img/movieshero1.jpeg"} alt="Movies Hero" />
        <FilterBar function={setSearchText} />
        <MoviesList data={filterMovies(movies)} />
      </div>
    </Protected>
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
