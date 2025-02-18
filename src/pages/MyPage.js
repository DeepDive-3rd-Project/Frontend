import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../styles/MyPage.css";

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/admin`;

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    email: "",
    role: "",
    id: null,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAdminInfoFromToken();
  }, []);

  const loadAdminInfoFromToken = () => {
    let token = localStorage.getItem("token")?.trim();
    if (!token || !token.startsWith("Bearer ")) {
      alert("로그인이 필요합니다.");
      return;
    }

    token = token.replace("Bearer ", "");

    try {
      const decodedToken = jwtDecode(token);
      console.log("🔑 디코딩된 JWT 정보:", decodedToken);

      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTimestamp) {
        console.error("❌ JWT 토큰 만료됨!");
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      if (!decodedToken.AdminId) {
        console.error("❌ JWT에서 ID가 없음!", decodedToken);
        alert("로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      setUserInfo({
        email: decodedToken.email || "이메일 정보 없음",
        role: decodedToken.role || "권한 정보 없음",
        id: decodedToken.AdminId,
      });
    } catch (error) {
      console.error("❌ 토큰 디코딩 중 오류 발생:", error);
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!userInfo.id) {
      console.error("❌ 관리자 ID가 없음!");
      alert("관리자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    let token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    token = token.replace("Bearer ", "").trim();

    console.log("🔑 현재 토큰:", token);

    try {
      console.log("🔄 비밀번호 변경 요청 중...", userInfo.id);
      await axios.patch(
        `${API_BASE_URL}/${userInfo.id}/password`,
        {
          oldPassword: currentPassword,
          newPassword: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("✅ 비밀번호가 성공적으로 변경되었습니다.");
      setTimeout(handleCloseModal, 1000);
    } catch (error) {
      console.error("❌ 비밀번호 변경 오류:", error);
      setMessage(
        error.response?.data?.message || "비밀번호 변경에 실패했습니다."
      );
    }
  };

  return (
    <>
      <div className="mypage-background"></div>
      <div className="mypage-container">
        <h2>관리자 정보</h2>
        <div className="user-info">
          <p>
            <strong>이메일:</strong> {userInfo.email}
          </p>
          <p>
            <strong>등급:</strong>{" "}
            {userInfo.role === "SUPER" ? "최고 관리자" : "일반 관리자"}
          </p>
        </div>
        <button
          className="change-password-btn"
          onClick={() => setIsModalOpen(true)}
        >
          비밀번호 변경하기
        </button>

        {isModalOpen && (
          <>
            <div className="modal-overlay" onClick={handleCloseModal}></div>
            <div className="modal">
              <div className="modal-content">
                <h3>비밀번호 변경</h3>
                <form onSubmit={handlePasswordChange}>
                  <label>현재 비밀번호</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <label>새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="submit">변경하기</button>
                </form>

                {message && <p className="message">{message}</p>}

                <button className="close-modal-btn" onClick={handleCloseModal}>
                  ✖
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MyPage;
