import React, { useState, useEffect } from "react";
import KakaoMap from "./KakaoMap";
import "../styles/ClientManagement.css";

const ClientManagement = () => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "강요한",
      email: "KYH@example.com",
      phone: "010-1234-5678",
      oldAddress: "서울시 강남구 논현동 45-2",
      newAddress: "서울시 강남구 학동로 120",
    },
    {
      id: 2,
      name: "이지은",
      email: "LJE@example.com",
      phone: "010-8765-4321",
      oldAddress: "부산시 해운대구 좌동 1503",
      newAddress: "부산시 해운대구 해운대로 802",
    },
    {
      id: 3,
      name: "송준환",
      email: "SJH@example.com",
      phone: "010-8765-4321",
      oldAddress: "서울시 마포구 서교동 33-44",
      newAddress: "서울시 마포구 홍익로 25",
    },
    {
      id: 4,
      name: "박민준",
      email: "PMJ@example.com",
      phone: "010-8765-4321",
      oldAddress: "대구시 수성구 범어동 123-5",
      newAddress: "대구시 수성구 동대구로 305",
    },
    {
      id: 5,
      name: "이정훈",
      email: "LJH@example.com",
      phone: "010-8765-4321",
      oldAddress: "인천시 남동구 구월동 1465",
      newAddress: "인천광역시 남동구 예술로 108-1",
    },
    {
      id: 6,
      name: "강요한",
      email: "KYH@example.com",
      phone: "010-1234-5678",
      oldAddress: "서울시 강남구 논현동 45-2",
      newAddress: "서울시 강남구 학동로 120",
    },
    {
      id: 7,
      name: "이지은",
      email: "LJE@example.com",
      phone: "010-8765-4321",
      oldAddress: "부산시 해운대구 좌동 1503",
      newAddress: "부산시 해운대구 해운대로 802",
    },
    {
      id: 8,
      name: "송준환",
      email: "SJH@example.com",
      phone: "010-8765-4321",
      oldAddress: "서울시 마포구 서교동 33-44",
      newAddress: "서울시 마포구 홍익로 25",
    },
    {
      id: 9,
      name: "박민준",
      email: "PMJ@example.com",
      phone: "010-8765-4321",
      oldAddress: "대구시 수성구 범어동 123-5",
      newAddress: "대구시 수성구 동대구로 305",
    },
    {
      id: 10,
      name: "이정훈",
      email: "LJH@example.com",
      phone: "010-8765-4321",
      oldAddress: "인천시 남동구 구월동 1465",
      newAddress: "인천광역시 남동구 예술로 108-1",
    },
  ]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("name");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedClient, setEditedClient] = useState(null);

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    oldAddress: "",
    newAddress: "",
  });

  const filteredClients = clients.filter((client) => {
    return client[searchCategory].includes(searchTerm);
  });

  const handleAddClient = (e) => {
    e.preventDefault();
    if (Object.values(newClient).some((field) => !field.trim())) {
      alert("모든 필드를 입력하세요!");
      return;
    }
    setClients([...clients, { id: clients.length + 1, ...newClient }]);
    setNewClient({
      name: "",
      email: "",
      phone: "",
      oldAddress: "",
      newAddress: "",
    });
    setIsModalOpen(false);
  };

  const loadKakaoMaps = (callback, attempt = 0) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      callback();
    } else if (attempt < 10) {
      setTimeout(() => loadKakaoMaps(callback, attempt + 1), 500);
    } else {
      console.error("🚨 Kakao Maps API 로딩 실패");
    }
  };

  useEffect(() => {
    if (selectedClient) {
      setIsLoading(true);
      loadKakaoMaps(() => {
        setIsLoading(false);
      });
    }
  }, [selectedClient]);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => setIsAnimating(true), 10); // 10ms 후 애니메이션 시작
    } else {
      setIsAnimating(false);
    }
  }, [isModalOpen]);

  const handleCloseModal = (e) => {
    if (
      e.target.classList.contains("modal-overlay") ||
      e.target.classList.contains("close-modal-btn")
    ) {
      setIsAnimating(false); // 애니메이션 종료
      setTimeout(() => setIsModalOpen(false), 300); // 300ms 후 모달 제거
    }
  };

  const handleCloseDetails = (e) => {
    if (
      e.target.classList.contains("details-modal-overlay") ||
      e.target.classList.contains("close-details-btn")
    ) {
      setIsClosing(true);
      setTimeout(() => {
        setSelectedClient(null);
        setIsClosing(false);
      }, 300);
    }
  };

  const handleOpenEditModal = () => {
    setEditedClient({ ...selectedClient }); // 기존 정보 불러오기
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedClient((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = () => {
    setClients((prevClients) =>
      prevClients.map((client) =>
        client.id === editedClient.id ? editedClient : client
      )
    );
    setSelectedClient(editedClient); // 현재 선택된 고객 정보도 업데이트
    setIsEditModalOpen(false); // 수정 모달 닫기
  };

  return (
    <div className="client-management">
      <h2>고객 관리</h2>

      {/* 검색창 추가 */}
      <div className="search-container">
        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        >
          <option value="name">이름</option>
          <option value="newAddress">도로명 주소</option>
          <option value="oldAddress">지번 주소</option>
        </select>
        <input
          type="text"
          placeholder="검색어 입력"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          고객 추가
        </button>
      </div>

      {/* 고객 목록 */}
      <div className="client-container">
        <h3>고객 목록</h3>
        <div className="client-list">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="client-item"
              onClick={() => setSelectedClient(client)}
            >
              {client.name}
            </div>
          ))}
        </div>
      </div>

      {/* 고객 상세 정보 모달  */}
      {selectedClient && (
        <div className="details-modal-overlay" onClick={handleCloseDetails}>
          <div className={`details-modal ${isClosing ? "slide-down" : ""}`}>
            <div className="details-header">
              <h3>고객 상세 정보</h3>
              <button
                className="close-details-btn"
                onClick={handleCloseDetails}
              >
                ✖
              </button>
            </div>
            <div className="details-content">
              <div className="client-info">
                <p>
                  <strong>이름:</strong> {selectedClient.name}
                </p>
                <p>
                  <strong>이메일:</strong> {selectedClient.email}
                </p>
                <p>
                  <strong>전화번호:</strong> {selectedClient.phone}
                </p>
                <p>
                  <strong>지번 주소:</strong> {selectedClient.oldAddress}
                </p>
                <p>
                  <strong>도로명 주소:</strong> {selectedClient.newAddress}
                </p>
                <button className="edit-btn" onClick={handleOpenEditModal}>
                  정보 수정
                </button>
              </div>
              <div className="map-container">
                <KakaoMap address={selectedClient.newAddress} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 고객 정보 수정 모달 */}
      {isEditModalOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3>고객 정보 수정</h3>
            <form>
              <label>이름:</label>
              <input
                type="text"
                name="name"
                value={editedClient.name}
                onChange={handleEditChange}
              />

              <label>이메일:</label>
              <input
                type="email"
                name="email"
                value={editedClient.email}
                onChange={handleEditChange}
              />

              <label>전화번호:</label>
              <input
                type="text"
                name="phone"
                value={editedClient.phone}
                onChange={handleEditChange}
              />

              <label>지번 주소:</label>
              <input
                type="text"
                name="oldAddress"
                value={editedClient.oldAddress}
                onChange={handleEditChange}
              />

              <label>도로명 주소:</label>
              <input
                type="text"
                name="newAddress"
                value={editedClient.newAddress}
                onChange={handleEditChange}
              />

              <div className="modal-buttons">
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSaveEdit}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseEditModal}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 고객 추가 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className={`add-client-modal ${isAnimating ? "show" : ""}`}>
            <div className="modal-header">
              <h3>새 고객 추가</h3>
              <button className="close-modal-btn" onClick={handleCloseModal}>
                ✖
              </button>
            </div>
            <form onSubmit={handleAddClient} className="client-form">
              <label>이름:</label>
              <input
                type="text"
                name="name"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                required
              />
              <label>이메일:</label>
              <input
                type="email"
                name="email"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
                required
              />
              <label>전화번호:</label>
              <input
                type="text"
                name="phone"
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
                required
              />
              <label>지번 주소:</label>
              <input
                type="text"
                name="oldAddress"
                value={newClient.oldAddress}
                onChange={(e) =>
                  setNewClient({ ...newClient, oldAddress: e.target.value })
                }
                required
              />
              <label>도로명 주소:</label>
              <input
                type="text"
                name="newAddress"
                value={newClient.newAddress}
                onChange={(e) =>
                  setNewClient({ ...newClient, newAddress: e.target.value })
                }
                required
              />
              <button type="submit" className="submit-btn">
                추가
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
