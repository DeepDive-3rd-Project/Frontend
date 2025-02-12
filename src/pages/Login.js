import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    localStorage.setItem("token", "dummy_token"); // 더미 로그인 처리
    window.dispatchEvent(new Event("storage")); // 상태 변경 알림
    alert("Access Granted");
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* 로그인 폼 */}
        <div className="login-form">
          <h1>사용자 관리 서비스에 오신 것을 환영합니다!</h1>
          <p>쉽고, 빠르게 연결되는 카카오의 다양한 서비스를 경험해보세요.</p>
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

        {/* 로그인 이미지 */}
        <div className="login-image">
          <img src="/images/login-background.jpg" alt="로그인 이미지" />
        </div>
      </div>
    </div>
  );
};

export default Login;
