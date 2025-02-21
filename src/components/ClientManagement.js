import "../styles/ClientManagement.css";
import React, { useState, useEffect } from "react";
import KakaoMap from "./KakaoMap";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;

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
  const [clients, setClients] = useState([]);
  const [isKakaoLoaded] = useState(!!window.kakao?.maps);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState([]);
  const [pageGroup, setPageGroup] = useState(0);
  const [setAddresses] = useState([]);
  const [addressHistory, setAddressHistory] = useState([]);
  const itemsPerPage = 10;
  const pagesPerGroup = 10;

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    regionAddress: "",
    roadAddress: "",
    addressHistory: [],
  });

  const fetchClients = async () => {
    try {
      let token = localStorage.getItem("token")?.trim();
      if (!token) throw new Error("로그인이 필요합니다.");

      if (!token.startsWith("Bearer ")) {
        token = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/users?page=1&size=${itemsPerPage}`,
        {
          method: "GET",
          headers: { Authorization: token },
        }
      );

      if (!response.ok) throw new Error("데이터 불러오기 실패");

      const data = await response.json();

      console.log("📌 서버 응답 데이터:", data);

      setClients(data.content || data.contents || []);
      setTotalPages(data.totalPages || data.pageable?.totalPages || 1);
      setCurrentPage(1);
    } catch (error) {
      console.error("🚨 고객 데이터 가져오기 오류:", error);
      alert(error.message);
    }
  };

  const searchClients = async () => {
    if (!searchTerm.trim()) {
      fetchClients();
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("로그인이 필요합니다.");

      let endpoint = "";
      let queryParam = "";

      if (searchCategory === "name") {
        endpoint = `/api/users/search/name`;
        queryParam = `name=${searchTerm}`;
      } else if (searchCategory === "newAddress") {
        endpoint = `/api/users/search/road`;
        queryParam = `keyword=${searchTerm}`;
      } else if (searchCategory === "oldAddress") {
        endpoint = `/api/users/search/region`;
        queryParam = `keyword=${searchTerm}`;
      }

      const response = await fetch(
        `${API_BASE_URL}${endpoint}?${queryParam}&page=1&size=${itemsPerPage}`,
        {
          method: "GET",
          headers: { Authorization: token },
        }
      );

      if (!response.ok) throw new Error("검색 실패");

      const data = await response.json();

      console.log("🔍 검색 결과 응답 데이터:", data);

      // ✅ 좌표 변환 추가
      const updatedClients = await Promise.all(
        (data.content || data.contents || []).map(async (client) => {
          let lat = client.y ?? null;
          let lng = client.x ?? null;

          if (!lat || !lng) {
            console.log(`📍 고객(${client.name}) 좌표 변환 시도...`);
            const coords = await fetchCoordinates(
              client.roadAddress || client.regionAddress
            );
            lat = coords.lat;
            lng = coords.lng;
          }

          return {
            ...client,
            regionAddress: client.regionAddress || "주소 없음",
            roadAddress: client.roadAddress || "주소 없음",
            lat,
            lng,
          };
        })
      );

      setClients(updatedClients);
      setTotalPages(data.totalPages || data.pageable?.totalPages || 1);
      setCurrentPage(1);
    } catch (error) {
      console.error("🚨 검색 중 오류 발생:", error);
      alert(error.message);
    }
  };

  const filteredClients = searchTerm.trim() ? clients : clients;

  useEffect(() => {
    console.log("🟢 클라이언트 리스트 업데이트:", clients);
  }, [clients]);

  useEffect(() => {
    console.log("🔍 필터링된 고객 리스트:", filteredClients);
  }, [filteredClients]);

  const handleSearchInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchClients();
    }
  };

  const handleShowAllClients = () => {
    fetchClients();
    setSearchTerm("");
  };

  const handleClientSelect = async (client) => {
    let genderValue = client.gender;
    if (genderValue === "MALE") {
      genderValue = "남자";
    } else if (genderValue === "FEMALE") {
      genderValue = "여자";
    }

    console.log("📌 선택된 고객:", client);

    let updatedClient = {
      id: client.id,
      name: client.name,
      email: client.email,
      phoneNumber: client.phoneNumber || client.phone || "",
      regionAddress:
        client.latestRegionAddress || client.regionAddress || "주소 없음",
      roadAddress:
        client.latestRoadAddress || client.roadAddress || "주소 없음",
      gender: client.gender,
      age: client.age,
      lat: client.y ?? client.lat ?? null, // ✅ y → lat
      lng: client.x ?? client.lng ?? null, // ✅ x → lng
    };

    console.log("📌 [선택된 고객 ID]:", updatedClient.id);

    let addressToSearch =
      updatedClient.roadAddress !== "주소 없음"
        ? updatedClient.roadAddress
        : updatedClient.regionAddress;

    // ✅ 좌표가 없으면 Kakao API를 사용하여 변환
    if (!updatedClient.lat || !updatedClient.lng) {
      console.log("📍 지도 좌표 없음, Kakao API로 변환 시도...");
      try {
        let coords = await fetchCoordinates(addressToSearch);
        console.log("📌 변환된 Kakao 좌표:", coords);

        if (coords.lat && coords.lng) {
          updatedClient.lat = coords.lat;
          updatedClient.lng = coords.lng;
        } else {
          console.warn("⚠️ Kakao API 좌표 변환 실패. 기본값 유지");
        }

        console.log("🟢 최종 업데이트된 좌표:", updatedClient);
      } catch (error) {
        console.error("🚨 Kakao API 좌표 변환 중 오류 발생:", error);
      }
    }

    setSelectedClient(updatedClient);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClientsAndAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const userResponse = await fetch(
        `${API_BASE_URL}/api/users?page=1&size=${itemsPerPage}`,
        {
          method: "GET",
          headers: { Authorization: token },
        }
      );

      if (!userResponse.ok) {
        throw new Error("고객 데이터 불러오기 실패");
      }

      const userData = await userResponse.json();
      setClients(userData.contents || []);

      const newAddress = {
        regionAddress: newClient.regionAddress || "",
        roadAddress: newClient.roadAddress || "",
        x: newClient.lng ? Number(newClient.lng) : null,
        y: newClient.lat ? Number(newClient.lat) : null,
        region: newClient.region || "서울",
      };

      console.log("📌 POST /api/addresses 요청 데이터:", newAddress);

      if (!newAddress.roadAddress || !newAddress.regionAddress) {
        console.warn("⚠️ 주소 정보가 불완전하여 요청을 보내지 않음.");
        return;
      }

      const addressResponse = await fetch(`${API_BASE_URL}/api/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newAddress),
      });

      const responseText = await addressResponse.text();
      console.log("🔴 주소 API 응답:", responseText);

      if (!addressResponse.ok) {
        console.error(`🚨 주소 저장 실패 (HTTP ${addressResponse.status})`);
        throw new Error(responseText);
      }

      const addressData = JSON.parse(responseText);
      setAddresses(addressData.contents || []);

      console.log("📌 가져온 주소 데이터:", addressData.contents);
    } catch (error) {
      console.error("🚨 데이터 가져오는 중 오류 발생:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchClientsAndAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("로그인이 필요합니다.");

      const response = await fetch(
        `${API_BASE_URL}/api/users?page=${pageNumber}&size=${itemsPerPage}`,
        {
          method: "GET",
          headers: { Authorization: token },
        }
      );

      if (!response.ok) throw new Error("데이터 불러오기 실패");

      const data = await response.json();
      setClients(data.contents);
      setTotalPages(data.pageable?.totalPages || 1);
    } catch (error) {
      console.error("🚨 페이지 변경 오류:", error);
    }
  };

  const handlePrevPageGroup = () => {
    if (pageGroup > 0) {
      setPageGroup(pageGroup - 1);
    }
  };

  const handleNextPageGroup = () => {
    if ((pageGroup + 1) * pagesPerGroup < totalPages) {
      setPageGroup(pageGroup + 1);
    }
  };

  const pageNumbers = Array.from(
    { length: pagesPerGroup },
    (_, i) => pageGroup * pagesPerGroup + i + 1
  ).filter((page) => page <= totalPages);

  const handleSearchAddressForNewClient = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const { roadAddress, jibunAddress, autoJibunAddress } = data;
        console.log("📍 [추가] 선택된 주소:", roadAddress, jibunAddress);

        setNewClient((prev) => {
          const updatedClient = {
            ...prev,
            roadAddress: roadAddress || "",
            regionAddress: jibunAddress || autoJibunAddress || "",
          };
          console.log("🟢 [추가] 업데이트된 newClient 상태:", updatedClient);
          return updatedClient;
        });
      },
    }).open();
  };

  const handleSearchAddressForEditClient = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const { roadAddress, jibunAddress, autoJibunAddress } = data;
        console.log("📍 [수정] 선택된 주소:", roadAddress, jibunAddress);

        setEditedClient((prev) => {
          const updatedClient = {
            ...prev,
            roadAddress: roadAddress || "",
            regionAddress: jibunAddress || autoJibunAddress || "",
          };
          console.log("🟢 [수정] 업데이트된 editedClient 상태:", updatedClient);
          return updatedClient;
        });
      },
    }).open();
  };

  const fetchCoordinates = async (address) => {
    if (!REST_API_KEY || !address) return { lat: 37.5665, lng: 126.978 };

    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
          address
        )}`,
        {
          method: "GET",
          headers: { Authorization: `KakaoAK ${REST_API_KEY}` },
        }
      );

      const data = await response.json();
      if (data.documents?.length > 0) {
        return {
          lat: parseFloat(data.documents[0].y),
          lng: parseFloat(data.documents[0].x),
        };
      } else {
        return { lat: 37.5665, lng: 126.978 };
      }
    } catch (error) {
      console.error("🚨 Kakao API 요청 실패", error);
      return { lat: 37.5665, lng: 126.978 };
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();

    if (!newClient.name || !newClient.email || !newClient.phone) {
      alert("이름, 이메일, 전화번호는 필수 입력 항목입니다.");
      return;
    }

    console.log("📌 추가할 고객 정보 (전송 전):", newClient);

    let convertedGender = newClient.gender;
    if (newClient.gender === "MALE") convertedGender = "남자";
    if (newClient.gender === "FEMALE") convertedGender = "여자";

    const userData = {
      name: newClient.name,
      email: newClient.email,
      phoneNumber: newClient.phone.replace(/-/g, ""),
      regionAddress: newClient.regionAddress || null,
      roadAddress: newClient.roadAddress || null,
      gender: convertedGender,
      age: parseInt(newClient.age, 10),
    };

    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) throw new Error("로그인이 필요합니다.");

      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚨 사용자 추가 오류 응답:", errorText);

        if (response.status === 409) {
          alert("❌ 이미 존재하는 이메일입니다.");
        } else {
          alert(`❌ 사용자 추가 실패 (HTTP ${response.status})`);
        }

        throw new Error(`❌ 사용자 추가 실패 (HTTP ${response.status})`);
      }

      console.log("✅ 사용자 추가 성공");
      alert("고객이 성공적으로 추가되었습니다.");
      fetchClients();
    } catch (error) {
      console.error("🚨 사용자 추가 중 오류 발생:", error);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      console.log(
        "📍 고객 좌표 업데이트됨:",
        selectedClient.lat,
        selectedClient.lng
      );
      console.log(selectedClient);
      console.log(
        "📌 주소 정보:",
        selectedClient.roadAddress,
        selectedClient.regionAddress
      );

      if (
        !selectedClient.lat ||
        !selectedClient.lng ||
        isNaN(selectedClient.lat) ||
        isNaN(selectedClient.lng)
      ) {
        console.warn("⚠️ 고객 좌표 없음. 기본값(서울 시청) 적용.");
        setSelectedClient((prev) => ({
          ...prev,
          lat: 37.5665,
          lng: 126.978,
        }));
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

  const handleOpenAddModal = () => {
    setNewClient({
      name: "",
      email: "",
      phone: "",
      gender: "",
      age: "",
      regionAddress: "",
      roadAddress: "",
      addressHistory: [],
    });
    setIsModalOpen(true);
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

  const fetchUpdatedClient = async (clientId) => {
    try {
      let token = localStorage.getItem("token")?.trim();
      if (!token) throw new Error("로그인이 필요합니다.");

      const response = await fetch(`${API_BASE_URL}/api/users/${clientId}`, {
        method: "GET",
        headers: { Authorization: token },
      });

      if (!response.ok) throw new Error("최신 고객 정보를 가져올 수 없습니다.");

      const updatedClient = await response.json();

      // Kakao 좌표 변환 적용
      let coords = { lat: updatedClient.lat, lng: updatedClient.lng };
      if (!updatedClient.lat || !updatedClient.lng) {
        console.log("📍 Kakao API를 사용하여 좌표 변환 시도...");
        coords = await fetchCoordinates(
          updatedClient.roadAddress || updatedClient.regionAddress
        );
      }

      return { ...updatedClient, lat: coords.lat, lng: coords.lng };
    } catch (error) {
      console.error("🚨 고객 정보 업데이트 중 오류 발생:", error);
      return null;
    }
  };

  const sanitizeRequestBody = (requestBody) => {
    return Object.fromEntries(
      Object.entries(requestBody).filter(
        ([_, value]) => value !== null && value !== undefined
      )
    );
  };

  const handleSaveEdit = async () => {
    try {
      let token = localStorage.getItem("token")?.trim();
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }
      if (!token.startsWith("Bearer ")) {
        token = `Bearer ${token}`;
      }

      console.log("📌 수정 요청 사용자 ID:", editedClient?.id);
      if (!editedClient?.id) {
        console.error("🚨 오류: 사용자 ID가 존재하지 않음");
        alert("오류 발생: 사용자 ID가 존재하지 않습니다.");
        return;
      }

      let convertedGender = editedClient.gender;
      if (editedClient.gender === "MALE") convertedGender = "남자";
      if (editedClient.gender === "FEMALE") convertedGender = "여자";

      let requestBody = {
        name: editedClient.name?.trim(),
        email: editedClient.email?.trim(),
        phoneNumber: editedClient.phoneNumber?.replace(/-/g, "").trim(),
        regionAddress: editedClient.regionAddress?.trim() || null,
        roadAddress: editedClient.roadAddress?.trim() || null,
        gender: convertedGender,
        age: Number(editedClient.age),
      };

      // ✅ 불필요한 null/undefined 값 제거
      requestBody = sanitizeRequestBody(requestBody);

      console.log(
        "📤 고객 수정 요청 데이터:",
        JSON.stringify(requestBody, null, 2)
      );

      const response = await fetch(
        `${API_BASE_URL}/api/users/${editedClient.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("🚨 서버 응답 오류:", errorText);

        if (response.status === 404) {
          alert("❌ 해당 사용자는 삭제되었거나 존재하지 않습니다.");
        } else {
          alert(`❌ 서버 응답 오류: ${errorText}`);
        }

        throw new Error(`❌ 고객 정보 수정 실패 (status: ${response.status})`);
      }

      console.log("✅ 고객 정보 수정 성공!");
      alert("고객 정보가 성공적으로 수정되었습니다.");

      setSelectedClient((prevClient) => ({
        ...prevClient,
        ...requestBody,
      }));

      const updatedClient = await fetchUpdatedClient(editedClient.id);

      console.log("📌 서버에서 가져온 최신 고객 데이터:", updatedClient);

      let lat = updatedClient.y ?? updatedClient.lat ?? null;
      let lng = updatedClient.x ?? updatedClient.lng ?? null;

      if (!lat || !lng) {
        console.log("📍 Kakao API를 사용하여 좌표 변환 시도...");
        try {
          const coords = await fetchCoordinates(
            updatedClient.roadAddress || updatedClient.regionAddress
          );
          lat = coords.lat;
          lng = coords.lng;
          console.log(`📌 변환된 Kakao 좌표: lat=${lat}, lng=${lng}`);
        } catch (error) {
          console.error("🚨 Kakao API 좌표 변환 실패:", error);
          lat = 37.5665;
          lng = 126.978;
        }
      }

      console.log(`📍 최종 설정된 좌표: lat=${lat}, lng=${lng}`);

      setSelectedClient((prevClient) => {
        const newClient = {
          ...prevClient,
          ...updatedClient,
          lat,
          lng,
        };
        console.log("🟢 `selectedClient` 업데이트됨:", newClient);
        return newClient;
      });

      fetchClients();

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("🚨 고객 정보 수정 중 오류 발생:", error);
    }
  };

  const handleCloseHistoryModal = (e) => {
    if (e.target.classList.contains("history-modal-overlay")) {
      setIsHistoryModalOpen(false);
    }
  };

  const fetchAddressHistory = async (userId) => {
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) throw new Error("로그인이 필요합니다.");

      const response = await fetch(
        `${API_BASE_URL}/api/users/${userId}/address-histories`,
        {
          method: "GET",
          headers: { Authorization: token },
        }
      );

      if (!response.ok) throw new Error("주소 변경 내역 불러오기 실패");

      const data = await response.json();
      console.log("📌 주소 변경 내역:", data);

      setAddressHistory(data.responses || []);
    } catch (error) {
      console.error("🚨 주소 변경 내역 가져오기 오류:", error);
      setAddressHistory([]);
    }
  };

  const handleOpenHistoryModal = () => {
    if (selectedClient) {
      fetchAddressHistory(selectedClient.id);
      setIsHistoryModalOpen(true);
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
          placeholder="검색어 입력 후 엔터"
          value={searchTerm}
          onChange={handleSearchInputChange}
          onKeyPress={handleSearchKeyPress}
        />
        <button className="reset-btn" onClick={handleShowAllClients}>
          전체 조회
        </button>
        <button className="add-btn" onClick={handleOpenAddModal}>
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
              onClick={() => handleClientSelect(client)}
            >
              {client.name}
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {pageGroup > 0 && <button onClick={handlePrevPageGroup}>◀</button>}

          {pageNumbers.map((page) => (
            <button
              key={page}
              className={currentPage === page ? "active" : ""}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

          {(pageGroup + 1) * pagesPerGroup < totalPages && (
            <button onClick={handleNextPageGroup}>▶</button>
          )}
        </div>
      )}

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
                  <strong>성별:</strong>{" "}
                  {selectedClient.gender === "MALE"
                    ? "남자"
                    : selectedClient.gender === "FEMALE"
                    ? "여자"
                    : selectedClient.gender}
                </p>

                <p>
                  <strong>나이:</strong> {selectedClient.age}
                </p>
                <p>
                  <strong>이메일:</strong> {selectedClient.email}
                </p>
                <p>
                  <strong>전화번호:</strong> {selectedClient.phoneNumber}
                </p>
                <p>
                  <strong>도로명 주소:</strong> {selectedClient.roadAddress}
                </p>
                <p>
                  <strong>지번 주소:</strong> {selectedClient.regionAddress}
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
                name="phoneNumber"
                value={editedClient.phoneNumber}
                onChange={handleEditChange}
              />
              <label>도로명 주소:</label>
              <input
                type="text"
                name="roadAddress"
                value={editedClient.roadAddress}
                readOnly
              />
              <label>지번 주소:</label>
              <input
                type="text"
                name="regionAddress"
                value={editedClient.regionAddress}
                readOnly
              />
              <button
                type="button"
                className="search-address-btn"
                onClick={handleSearchAddressForEditClient}
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
            <div className="history-modal-header">
              <h3>📋 주소 변경 내역</h3>
              <button
                className="close-modal-btn"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                ✖
              </button>
            </div>
            <ul className="history-modal-content">
              {addressHistory.length > 0 ? (
                addressHistory.map((history, index) => (
                  <li key={index}>
                    <p>
                      <strong>도로명 주소:</strong>{" "}
                      {history.roadAddress || "없음"}
                    </p>
                    <p>
                      <strong>지번 주소:</strong>{" "}
                      {history.regionAddress || "없음"}
                    </p>
                    <p>
                      <strong>변경 일자:</strong> {history.createdAt}
                    </p>
                  </li>
                ))
              ) : (
                <p>이전 주소 변경 내역이 없습니다.</p>
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
                value={newClient.roadAddress}
                placeholder="도로명 주소"
                readOnly
              />
              <label>지번 주소:</label>
              <input
                type="text"
                name="region_Address"
                value={newClient.regionAddress}
                placeholder="지번 주소"
                readOnly
              />
              <button
                type="button"
                className="search-address-btn"
                onClick={handleSearchAddressForNewClient}
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
