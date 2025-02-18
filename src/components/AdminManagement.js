import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../styles/AdminManagement.css";

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/admin`;

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
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
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      const decodedToken = jwtDecode(token.replace("Bearer ", "").trim());
      console.log("🔑 현재 로그인한 관리자 정보:", decodedToken);

      if (decodedToken.role !== "SUPER") {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error("❌ 토큰 디코딩 실패:", error);
      localStorage.removeItem("token");
      setIsAuthorized(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;
    fetchAdmins(currentPage);
  }, [isAuthorized, currentPage]);

  const fetchAdmins = async (page) => {
    try {
      const token = localStorage.getItem("token").replace("Bearer ", "").trim();
      const response = await axios.get(
        `${API_BASE_URL}/list?page=${page - 1}&size=${itemsPerPage}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAdmins(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("❌ 관리자 목록 불러오기 실패:", error);
    }
  };

  const fetchAdminByEmail = async (email) => {
    try {
      const token = localStorage.getItem("token").replace("Bearer ", "").trim();
      const response = await axios.get(
        `${API_BASE_URL}/search?email=${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setAdmins([response.data]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("❌ 관리자 검색 실패:", error);
      alert("해당 이메일의 관리자를 찾을 수 없습니다.");
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      fetchAdminByEmail(searchTerm.trim());
    } else {
      fetchAdmins(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAdmin(null);
    setAdminToDelete(null);
  };

  if (!isAuthorized) {
    return (
      <div className="no-access">
        <h2>⚠️ 접근 권한이 없습니다.</h2>
        <p>일반 관리자는 이 페이지에 접근할 수 있는 권한이 없습니다.</p>
      </div>
    );
  }

  const handleDeleteAdmin = async () => {
    try {
      const token = localStorage.getItem("token").replace("Bearer ", "").trim();
      await axios.delete(`${API_BASE_URL}/${adminToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ 관리자 삭제 완료!");
      closeModal();

      const response = await axios.get(`${API_BASE_URL}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data);
    } catch (error) {
      console.error("❌ 관리자 삭제 실패:", error);
      alert("관리자 삭제에 실패했습니다.");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.password) {
      alert("모든 필드를 입력하세요!");
      return;
    }

    try {
      const token = localStorage.getItem("token").replace("Bearer ", "").trim();
      await axios.post(`${API_BASE_URL}/register`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ 관리자 추가 완료!");
      setNewAdmin({ email: "", password: "", role: "NORMAL" });

      const response = await axios.get(`${API_BASE_URL}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data);
      closeModal();
    } catch (error) {
      console.error("❌ 관리자 추가 실패:", error);
      alert(error.response?.data?.message || "관리자 추가에 실패했습니다.");
    }
  };

  const handleSaveRoleChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token").replace("Bearer ", "").trim();
      await axios.patch(
        `${API_BASE_URL}/${selectedAdmin.id}/role`,
        { role: selectedAdmin.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("관리자 권한 변경 성공!");
      closeModal();

      const response = await axios.get(`${API_BASE_URL}/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data);
    } catch (error) {
      console.error("❌ 관리자 권한 변경 실패:", error);
      alert("권한 변경에 실패했습니다.");
    }
  };

  return (
    <div className="admin-container">
      <h2>관리자 관리</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="관리자 이메일 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button className="search-btn" onClick={handleSearch}>
          검색
        </button>
        <button className="add-btn" onClick={() => setIsEditModalOpen(true)}>
          관리자 추가
        </button>
      </div>

      <div className="admin-list">
        <h3>관리자 목록</h3>
        {admins.map((admin) => (
          <div key={admin.id} className="admin-item">
            <p>
              {admin.email} (
              {admin.role === "SUPER" ? "최고 관리자" : "일반 관리자"})
            </p>
            <div className="button-group">
              <button
                onClick={() => {
                  setSelectedAdmin(admin);
                  setIsEditModalOpen(true);
                }}
                className="change-btn"
              >
                권한 변경
              </button>
              {admin.role !== "SUPER" && (
                <button
                  onClick={() => {
                    setAdminToDelete(admin.id);
                    setIsDeleteModalOpen(true);
                  }}
                  className="delete-btn"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {isEditModalOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <button className="close-modal-btn" onClick={closeModal}>
              ✖
            </button>

            <h3>{selectedAdmin ? "권한 변경" : "관리자 추가"}</h3>
            <form
              onSubmit={selectedAdmin ? handleSaveRoleChange : handleAddAdmin}
            >
              <label>이메일:</label>
              <input
                type="email"
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

              <button className="add-admin-save-btn" type="submit">
                저장
              </button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>정말 삭제하시겠습니까?</h3>
            <div className="modal-buttons">
              <button
                className="delete-confirm-btn"
                onClick={handleDeleteAdmin}
              >
                삭제
              </button>
              <button className="cancel-btn" onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
