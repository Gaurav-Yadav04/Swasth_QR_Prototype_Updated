
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import profilePhoto from "../assets/profile.webp";

export default function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("swasth_patient_token");

      setIsLoggedIn(!!token);
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);
    window.addEventListener("swasth-auth-updated", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener("swasth-auth-updated", checkLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("swasth_patient_token");
    localStorage.removeItem("swasth_patient_id");
    localStorage.removeItem("swasth_patient_profile");

    setIsLoggedIn(false);
    setMenuOpen(false);

    window.dispatchEvent(new Event("swasth-auth-updated"));

    navigate("/");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar relative z-50 flex items-center justify-between px-3 py-2 sm:px-5">
      {/* ================= LOGO ================= */}
      <Link
        to="/"
        onClick={closeMenu}
        className="brand flex shrink-0 items-center gap-1.5 sm:gap-2"
      >
        <img
          src={logo}
          alt="Swasth QR"
          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
        />

        <span className="text-sm font-semibold sm:text-base">
          Swasth QR
        </span>
      </Link>

      {/* ================= DESKTOP NAVBAR ================= */}
      <nav className="hidden items-center gap-1 sm:flex sm:gap-2">
        <Link
          className="navlink whitespace-nowrap px-2 py-1 text-sm"
          to="/"
        >
          Home
        </Link>

        <Link
          className="navlink whitespace-nowrap px-2 py-1 text-sm"
          to="/patient"
        >
          My Queue
        </Link>

        <Link
          className="navlink whitespace-nowrap px-2 py-1 text-sm"
          to="/kiosk"
        >
          Hospital Kiosk
        </Link>

        {!isLoggedIn ? (
          <Link
            className="navlink whitespace-nowrap px-2 py-1 text-sm"
            to="/register"
          >
            Login / Register
          </Link>
        ) : (
          <>
            {/* Profile */}
            <Link
              to="/profile"
              title="My Profile"
              className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 transition hover:border-blue-500 hover:shadow-md"
            >
              <img
                src={profilePhoto}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="navlink cursor-pointer whitespace-nowrap border-0 bg-transparent px-2 py-1 text-sm"
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {/* ================= MOBILE HAMBURGER ================= */}
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-blue-500 hover:text-blue-600 sm:hidden"
      >
        <div className="flex w-5 flex-col gap-1">
          <span
            className={`block h-0.5 w-5 bg-current transition ${
              menuOpen ? "translate-y-1.5 rotate-45" : ""
            }`}
          />

          <span
            className={`block h-0.5 w-5 bg-current transition ${
              menuOpen ? "opacity-0" : ""
            }`}
          />

          <span
            className={`block h-0.5 w-5 bg-current transition ${
              menuOpen ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </div>
      </button>

      {/* ================= MOBILE MENU ================= */}
      {menuOpen && (
        <div className="absolute left-3 right-3 top-full mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:hidden">
          <nav className="flex flex-col p-2">
            <Link
              to="/"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              to="/patient"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
            >
              My Queue
            </Link>

            <Link
              to="/kiosk"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
            >
              Hospital Kiosk
            </Link>

            {!isLoggedIn ? (
              <Link
                to="/register"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
              >
                Login / Register
              </Link>
            ) : (
              <>
                {/* Profile */}
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-blue-600"
                >
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="h-8 w-8 rounded-full border border-gray-200 object-cover"
                  />

                  <span>My Profile</span>
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

