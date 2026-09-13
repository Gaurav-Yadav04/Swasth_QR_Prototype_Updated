
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import profilePhoto from "../assets/profile.webp";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    window.dispatchEvent(new Event("swasth-auth-updated"));

    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <img src={logo} alt="Swasth QR" />
        <span>Swasth QR</span>
      </Link>

      <nav className="navlinks">
        <Link className="navlink" to="/">
          Home
        </Link>

        <Link className="navlink" to="/patient">
          My Queue
        </Link>

        <Link className="navlink" to="/kiosk">
          Hospital Kiosk
        </Link>

        
        {!isLoggedIn ? (
          <Link className="navlink" to="/register">
            Login / Register
          </Link>
        ) : (
          <>
            <Link
              to="/profile"
              title="My Profile"
              className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 transition hover:border-blue-500 hover:shadow-md"
            >
              <img
                src={profilePhoto}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="navlink border-0 bg-transparent cursor-pointer"
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

