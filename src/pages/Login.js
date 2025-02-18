import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      console.log("📌 헤더:", [...response.headers.entries()]);
      console.log("📌 상태 코드:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "로그인 실패! 이메일 또는 비밀번호를 확인하세요."
        );
      }

      const data = await response.json();
      console.log("📌 로그인 응답 데이터:", data);

      if (!data.Accesstoken) {
        throw new Error("토큰이 응답에 없습니다.");
      }

      localStorage.setItem("token", data.Accesstoken);
      window.dispatchEvent(new Event("storage"));

      alert("로그인 성공!");
      navigate("/");
    } catch (err) {
      console.error("🚨 로그인 오류:", err);
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-form">
          <h1>사용자 관리 서비스에 오신 것을 환영합니다!</h1>
          <p>쉽고, 빠르게 연결되는 카카오의 다양한 서비스를 경험해보세요.</p>

          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">로그인</button>
          </form>
        </div>

        <div className="login-image">
          <img src="/images/login-background.jpg" alt="로그인 이미지" />
        </div>
      </div>
    </div>
  );
};

export default Login;
