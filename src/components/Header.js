import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Header.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

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

  const handleLogout = async () => {
    const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
    if (!confirmLogout) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("토큰이 없습니다.");

      await axios.post(
        `${API_BASE_URL}/api/admin/logout`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      localStorage.removeItem("token");
      setIsAuthenticated(false);
      navigate("/");
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
      alert("로그아웃에 실패했습니다.");
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
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  className="nav-link"
                >
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
