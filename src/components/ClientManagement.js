import "../styles/ClientManagement.css";
import DummyData from "../data/DummyData";
import React, { useState, useEffect } from "react";
import KakaoMap from "./KakaoMap";

const ClientManagement = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("name");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editedClient, setEditedClient] = useState(null);
  const [clients, setClients] = useState(DummyData);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(!!window.kakao?.maps);

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    region_Address: "",
    road_Address: "",
    lat: null,
    lng: null,
    addressHistory: [],
  });

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      console.log("✅ Kakao 지도 API가 이미 로드됨");
      setIsKakaoLoaded(true);
    }
  }, []);

  const filteredClients = clients.filter((client) =>
    client[searchCategory].toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchAddress = (setClientState) => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const { roadAddress, jibunAddress } = data;

        if (roadAddress || jibunAddress) {
          setClientState((prev) => ({
            ...prev,
            road_Address: roadAddress || prev.road_Address,
            region_Address: jibunAddress || prev.region_Address,
          }));

          fetchCoordinates(roadAddress || jibunAddress, setClientState);
        }
      },
    }).open();
  };

  const fetchCoordinates = (address) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setNewClient((prev) => ({
          ...prev,
          lat: result[0].y,
          lng: result[0].x,
        }));
      }
    });
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (Object.values(newClient).some((field) => field === "")) {
      alert("모든 필드를 입력하세요!");
      return;
    }
    setClients([...clients, { id: clients.length + 1, ...newClient }]);
    setNewClient({
      name: "",
      email: "",
      phone: "",
      gender: "",
      age: "",
      region_Address: "",
      road_Address: "",
      lat: null,
      lng: null,
    });
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (selectedClient) {
      console.log("📌 선택된 고객:", selectedClient);
      console.log("📍 고객 좌표:", selectedClient.lat, selectedClient.lng);
      console.log(
        `📌 lat 타입: ${typeof selectedClient.lat}, lng 타입: ${typeof selectedClient.lng}`
      );

      if (typeof selectedClient.lat !== "number") {
        console.warn("⚠️ lat 또는 lng이 숫자가 아닙니다. 변환 시도...");
        selectedClient.lat = parseFloat(selectedClient.lat);
        selectedClient.lng = parseFloat(selectedClient.lng);
      }
    }
  }, [selectedClient]);

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isModalOpen]);

  const handleCloseModal = (e) => {
    if (
      e.target.classList.contains("modal-overlay") ||
      e.target.classList.contains("close-modal-btn")
    ) {
      setIsAnimating(false);
      setTimeout(() => setIsModalOpen(false), 300);
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
    setEditedClient({ ...selectedClient });
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
    setSelectedClient(editedClient);
    setIsEditModalOpen(false);
  };

  const handleOpenHistoryModal = () => {
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = (e) => {
    if (e.target.classList.contains("history-modal-overlay")) {
      setIsHistoryModalOpen(false);
    }
  };

  return (
    <div className="client-management">
      <h2>고객 관리</h2>
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
                  <strong>성별:</strong> {selectedClient.gender}
                </p>
                <p>
                  <strong>나이:</strong> {selectedClient.age}
                </p>
                <p>
                  <strong>이메일:</strong> {selectedClient.email}
                </p>
                <p>
                  <strong>전화번호:</strong> {selectedClient.phone}
                </p>
                <p>
                  <strong>지번 주소:</strong> {selectedClient.region_Address}
                </p>
                <p>
                  <strong>도로명 주소:</strong> {selectedClient.road_Address}
                </p>
                <button className="edit-btn" onClick={handleOpenEditModal}>
                  고객 정보 수정
                </button>
                <button
                  className="history-btn"
                  onClick={handleOpenHistoryModal}
                >
                  주소 이전 내역
                </button>
              </div>

              {isKakaoLoaded ? (
                <KakaoMap
                  key={`${selectedClient.lat}-${selectedClient.lng}`}
                  lat={selectedClient.lat}
                  lng={selectedClient.lng}
                  width="100%"
                  height="400px"
                />
              ) : (
                <p>📍 지도 API 로딩 중...</p>
              )}
            </div>
          </div>
        </div>
      )}

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
                name="region_Address"
                value={editedClient.region_Address}
                placeholder="지번 주소"
                readOnly
              />

              <label>도로명 주소:</label>
              <input
                type="text"
                name="road_Address"
                value={editedClient.road_Address}
                placeholder="도로명 주소"
                readOnly
              />

              <button
                type="button"
                className="search-address-btn"
                onClick={() => handleSearchAddress(setEditedClient)}
              >
                주소 찾기
              </button>

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

      {isHistoryModalOpen && (
        <div
          className="history-modal-overlay"
          onClick={handleCloseHistoryModal}
        >
          <div className="history-modal">
            <button
              className="close-modal-btn"
              onClick={() => setIsHistoryModalOpen(false)}
            >
              ✖
            </button>
            <h3>주소 이전 내역</h3>
            <ul>
              {selectedClient.addressHistory?.length > 0 ? (
                selectedClient.addressHistory.map((address, index) => (
                  <li key={index}>{address}</li>
                ))
              ) : (
                <p>이전 주소 내역이 없습니다.</p>
              )}
            </ul>
          </div>
        </div>
      )}

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

              <label>성별:</label>
              <select
                name="gender"
                value={newClient.gender}
                onChange={(e) =>
                  setNewClient({ ...newClient, gender: e.target.value })
                }
                className="gender-select"
                required
              >
                <option value="">선택</option>
                <option value="남자">남자</option>
                <option value="여자">여자</option>
              </select>

              <label>나이:</label>
              <input
                type="number"
                name="age"
                value={newClient.age}
                onChange={(e) =>
                  setNewClient({ ...newClient, age: e.target.value })
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

              <label>도로명 주소:</label>
              <input
                type="text"
                name="road_Address"
                value={newClient.road_Address}
                placeholder="도로명 주소"
                readOnly
              />

              <label>지번 주소:</label>
              <input
                type="text"
                name="region_Address"
                value={newClient.region_Address}
                placeholder="지번 주소"
                readOnly
              />

              <button
                type="button"
                className="search-address-btn"
                onClick={handleSearchAddress}
              >
                주소 찾기
              </button>

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
