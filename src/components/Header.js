import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      navigate("/");
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">KakaoMap</Link>
      </div>
      <nav>
        <ul>
          <li>
            <Link to="/info">Info</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/management">Management</Link>
              </li>
              <li>
                <Link to="/mypage">MyPage</Link>
              </li>
              <li>
                <a href="/" onClick={handleLogout} className="nav-link">
                  Logout
                </a>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
