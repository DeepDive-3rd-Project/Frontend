import React, { useState, useEffect } from "react";
import "../styles/MyPage.css";

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    email: "admin@example.com",
    role: "SUPER", // 또는 "NORMAL"
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUserInfo(storedUser);
    }
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("모든 필드를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("새로운 비밀번호가 일치하지 않습니다.");
      return;
    }

    setTimeout(() => {
      setMessage("비밀번호가 성공적으로 변경되었습니다.");
      setTimeout(handleCloseModal, 1000);
    }, 1000);
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
            <div
              className="modal-overlay"
              onClick={() => setIsModalOpen(false)}
            ></div>
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

                  <label>새로운 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <label>새로운 비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button type="submit">변경하기</button>
                </form>

                {message && <p className="message">{message}</p>}

                <button
                  className="close-modal-btn"
                  onClick={() => setIsModalOpen(false)}
                >
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
