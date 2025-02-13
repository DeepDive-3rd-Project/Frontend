import React, { useState, useEffect } from "react";
import "../styles/AdminManagement.css";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([
    { email: "admin1@example.com", role: "SUPER" },
    { email: "user1@example.com", role: "NORMAL" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    password: "",
    role: "NORMAL",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  if (!currentUser || currentUser.role !== "SUPER") {
    return (
      <div className="no-access">
        <h2>⚠️ 접근 권한이 없습니다.</h2>
      </div>
    );
  }

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password) {
      alert("모든 필드를 입력하세요!");
      return;
    }
    if (admins.find((admin) => admin.email === newAdmin.email)) {
      alert("이미 존재하는 관리자 이메일입니다.");
      return;
    }
    setAdmins([...admins, newAdmin]);
    setNewAdmin({ email: "", password: "", role: "NORMAL" });
  };

  const handleChangeRole = (admin) => {
    setSelectedAdmin(admin);
    setIsEditModalOpen(true);
  };

  const handleSaveRoleChange = () => {
    setAdmins(
      admins.map((admin) =>
        admin.email === selectedAdmin.email ? selectedAdmin : admin
      )
    );
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = (email) => {
    setAdminToDelete(email);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAdmin = () => {
    setAdmins(admins.filter((admin) => admin.email !== adminToDelete));
    setIsDeleteModalOpen(false);
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h2>관리자 관리</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="관리자 이메일 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="add-btn"
          onClick={() => {
            setSelectedAdmin(null);
            setIsEditModalOpen(true);
          }}
        >
          관리자 추가
        </button>
      </div>

      {/* 관리자 목록 */}
      <div className="admin-list">
        <h3>관리자 목록</h3>
        {filteredAdmins.map((admin) => (
          <div key={admin.email} className="admin-item">
            <p>
              {admin.email} (
              {admin.role === "SUPER" ? "최고 관리자" : "일반 관리자"})
            </p>
            <div className="button-group">
              <button
                onClick={() => handleChangeRole(admin)}
                className="change-btn"
              >
                권한 변경
              </button>
              {admin.role !== "SUPER" && (
                <button
                  onClick={() => handleConfirmDelete(admin.email)}
                  className="delete-btn"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 관리자 추가 / 권한 변경 모달 */}
      {isEditModalOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>{selectedAdmin ? "권한 변경" : "관리자 추가"}</h3>
            <form
              onSubmit={selectedAdmin ? handleSaveRoleChange : handleAddAdmin}
            >
              <label>이메일:</label>
              <input
                type="email"
                name="email"
                value={selectedAdmin ? selectedAdmin.email : newAdmin.email}
                onChange={(e) =>
                  selectedAdmin
                    ? setSelectedAdmin({
                        ...selectedAdmin,
                        email: e.target.value,
                      })
                    : setNewAdmin({ ...newAdmin, email: e.target.value })
                }
                disabled={!!selectedAdmin}
                required
              />

              {!selectedAdmin && (
                <>
                  <label>비밀번호:</label>
                  <input
                    type="password"
                    name="password"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                    required
                  />
                </>
              )}

              <label>권한:</label>
              <select
                value={selectedAdmin ? selectedAdmin.role : newAdmin.role}
                onChange={(e) =>
                  selectedAdmin
                    ? setSelectedAdmin({
                        ...selectedAdmin,
                        role: e.target.value,
                      })
                    : setNewAdmin({ ...newAdmin, role: e.target.value })
                }
              >
                <option value="NORMAL">일반 관리자</option>
                <option value="SUPER">최고 관리자</option>
              </select>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  취소
                </button>
                <button type="submit" className="save-btn">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h3>관리자 삭제</h3>
            <p>해당 관리자를 삭제하시겠습니까?</p>
            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                취소
              </button>
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteAdmin}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
