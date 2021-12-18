import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Protected from "./views/Protected";
import NotFound from "./views/404";
import Error from "./views/500";
import Login from "./views/Login";
import Logout from "./views/Logout";
import Movies from "./views/Movies";
import Shows from "./views/Shows";
import Player from "./views/Player";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/500" element={<Error />} />
        <Route path="/" element={<Protected />}>
          <Route path="/" element={<Navigate replace to="/movies" />} />
          <Route path="movies" element={<Movies />} />
          <Route path="/movies/:id" element={<Player />} />
          <Route path="shows" element={<Shows />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
