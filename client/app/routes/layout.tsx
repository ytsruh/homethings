import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-raleway text-white">
      <header className="py-6">
        <div className="container mx-auto flex w-full items-center justify-between px-8 md:px-14 lg:px-24">
          <Link to="/" className="text-lg font-bold">
            ytsruh.com
          </Link>
          <div className="hidden items-center space-x-6 md:flex xl:space-x-12">
            <Link
              to="/"
              className={location.pathname === "/" ? "text-theme" : ""}
            >
              Home
            </Link>
            <Link
              to="/projects"
              className={
                location.pathname.includes("/projects") ? "text-theme" : ""
              }
            >
              Projects
            </Link>
            <Link
              to="/work-history"
              className={
                location.pathname === "/work-history" ? "text-theme" : ""
              }
            >
              Work History
            </Link>
            <Link
              to="/blog"
              className={
                location.pathname.includes("/blog") ? "text-theme" : ""
              }
            >
              Blog
            </Link>
            <Link
              to="/now"
              className={location.pathname === "/now" ? "text-theme" : ""}
            >
              Now
            </Link>
            <Link to="/contact">
              <button className="bg-theme px-6 py-2 font-bold hover:cursor-pointer rounded-xl">
                Contact me
              </button>
            </Link>
          </div>
          <button
            className="md:hidden hover:cursor-pointer"
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <svg
              width="26"
              height="18"
              viewBox="0 0 26 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 17.5H0.25V14.6667H13V17.5ZM25.75 10.4167H0.25V7.58333H25.75V10.4167ZM25.75 3.33333H13V0.5H25.75V3.33333Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
        {menuOpen && (
          <div>
            <ul className="py-3 text-center">
              <li className="my-2 text-lg">
                <Link
                  to="/"
                  className={location.pathname === "/" ? "text-theme" : ""}
                >
                  Home
                </Link>
              </li>
              <li className="my-2 text-lg">
                <Link
                  to="/projects"
                  className={
                    location.pathname.includes("/projects") ? "text-theme" : ""
                  }
                >
                  Projects
                </Link>
              </li>
              <li className="my-2 text-lg">
                <Link
                  to="/work-history"
                  className={
                    location.pathname === "/work-history" ? "text-theme" : ""
                  }
                >
                  Work History
                </Link>
              </li>
              <li className="my-2 text-lg">
                <Link
                  to="/blog"
                  className={
                    location.pathname.includes("/blog") ? "text-theme" : ""
                  }
                >
                  Blog
                </Link>
              </li>
              <li className="my-2 text-lg">
                <Link
                  to="/now"
                  className={location.pathname === "/now" ? "text-theme" : ""}
                >
                  Now
                </Link>
              </li>
              <li className="my-2 text-lg">
                <Link
                  to="/contact"
                  className={
                    location.pathname === "/contact" ? "text-theme" : ""
                  }
                >
                  Contact me
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
      <main className="container mx-auto mt-14 min-h-screen px-8 md:px-14 lg:mt-24 lg:px-24">
        <Outlet />
      </main>
      <footer className="mt-32 flex w-full justify-between bg-theme px-8 md:px-14 lg:px-24">
        <p className="mx-auto py-10 text-white">
          &copy; {new Date().getFullYear()} | Chris Hurst | All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
