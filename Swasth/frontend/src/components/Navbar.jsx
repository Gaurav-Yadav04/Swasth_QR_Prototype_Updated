import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import logo from "../assets/logo.png";
import profilePhoto from "../assets/profile.webp";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* =====================================================
     CHECK LOGIN
  ===================================================== */

  useEffect(() => {
    const checkLogin = () => {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("swasth_patient_token");

      setIsLoggedIn(!!token);
    };

    checkLogin();

    window.addEventListener("storage", checkLogin);
    window.addEventListener(
      "swasth-auth-updated",
      checkLogin
    );

    return () => {
      window.removeEventListener("storage", checkLogin);
      window.removeEventListener(
        "swasth-auth-updated",
        checkLogin
      );
    };
  }, []);

  /* =====================================================
     CLOSE MOBILE MENU WHEN ROUTE CHANGES
  ===================================================== */

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("swasth_patient_token");
    localStorage.removeItem("swasth_patient_id");
    localStorage.removeItem("swasth_patient_profile");

    setIsLoggedIn(false);
    setMenuOpen(false);

    window.dispatchEvent(
      new Event("swasth-auth-updated")
    );

    navigate("/");
  };

  /* =====================================================
     NAVIGATION LINKS
  ===================================================== */

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: "⌂",
      
    },
    {
      name: "My Queue",
      path: "/patient",
      icon: "▣",
    },
    {
      name: "Abmulance",
      path:  "/ambulance",
      icon: "*",
    },
    
  ];

  /* =====================================================
     ACTIVE LINK STYLE
  ===================================================== */

  const desktopNavClass = ({ isActive }) =>
    `relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-[#0757c9]"
        : "text-slate-600 hover:bg-slate-50 hover:text-[#0757c9]"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-[#0757c9]"
        : "text-slate-700 hover:bg-slate-50 hover:text-[#0757c9]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">

      {/* =================================================
          MAIN NAVBAR
      ================================================= */}

      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 transition duration-200 group-hover:bg-blue-100">
            <img
              src={logo}
              alt="Swasth QR"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div className="leading-none">
            <p className="text-[15px] font-black tracking-tight text-slate-900 sm:text-base">
              Swasth <span className="text-[#0757c9]">QR</span>
            </p>

            <p className="mt-1 hidden text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">
              Smart OPD
            </p>
          </div>
        </Link>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav className="hidden items-center gap-1 md:flex">

          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={desktopNavClass}
            >
              <span className="text-base leading-none opacity-80">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}

        </nav>

        {/* =================================================
            DESKTOP RIGHT SIDE
        ================================================= */}

        <div className="hidden items-center gap-2 md:flex">

          {!isLoggedIn ? (
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#0757c9] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#064aa9] hover:shadow-md"
            >
              <span>Login</span>

              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ) : (
            <>
              {/* PROFILE */}

              <Link
                to="/profile"
                title="My Profile"
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>

                <span className="text-sm font-semibold text-slate-700 group-hover:text-[#0757c9]">
                  Profile
                </span>
              </Link>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* =================================================
            MOBILE MENU BUTTON
        ================================================= */}

        <button
          type="button"
          aria-label={
            menuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 md:hidden ${
            menuOpen
              ? "border-blue-200 bg-blue-50 text-[#0757c9]"
              : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-[#0757c9]"
          }`}
        >
          <div className="flex w-5 flex-col gap-[5px]">

            <span
              className={`block h-[2px] w-5 origin-center rounded-full bg-current transition-all duration-200 ${
                menuOpen
                  ? "translate-y-[7px] rotate-45"
                  : ""
              }`}
            />

            <span
              className={`block h-[2px] w-5 rounded-full bg-current transition-all duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`block h-[2px] w-5 origin-center rounded-full bg-current transition-all duration-200 ${
                menuOpen
                  ? "-translate-y-[7px] -rotate-45"
                  : ""
              }`}
            />

          </div>
        </button>
      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white md:hidden">

          <div className="mx-auto max-w-7xl px-4 pb-4 pt-3 sm:px-6">

            {/* NAV LINKS */}

            <nav className="space-y-1">

              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={mobileNavClass}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base text-slate-500">
                    {item.icon}
                  </span>

                  <span>{item.name}</span>

                  <span className="ml-auto text-slate-300">
                    →
                  </span>
                </NavLink>
              ))}

            </nav>

            {/* DIVIDER */}

            <div className="my-3 border-t border-slate-100" />

            {/* LOGIN / PROFILE */}

            {!isLoggedIn ? (
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0757c9] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#064aa9]"
              >
                <span>Login / Register</span>
                <span>→</span>
              </Link>
            ) : (
              <div className="space-y-2">

                {/* PROFILE */}

                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-slate-200 bg-white">
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      My Profile
                    </p>

                    <p className="text-xs text-slate-400">
                      View your profile
                    </p>
                  </div>

                  <span className="ml-auto text-slate-400">
                    →
                  </span>
                </Link>

                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500">
                    ↪
                  </span>

                  <span>Logout</span>
                </button>

              </div>
            )}

            {/* MOBILE FOOTER TEXT */}

            <div className="mt-4 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-300">
                Swasth QR • Smart OPD Management
              </p>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}