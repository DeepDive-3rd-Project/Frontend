import React, { useState } from "react";
import "../styles/Management.css";
import ClientManagement from "../components/ClientManagement";
import AdminManagement from "../components/AdminManagement";
import KakaoMapSearch from "../components/KakaoMapSearch";

const Management = () => {
  const [selectedMenu, setSelectedMenu] = useState("clients");

  return (
    <div className="management-container">
      {/* 사이드바 */}
      <div className="sidebar">
        <h3>관리 메뉴</h3>
        <button
          className={selectedMenu === "clients" ? "active" : ""}
          onClick={() => setSelectedMenu("clients")}
        >
          고객 관리
        </button>
        <button
          className={selectedMenu === "admins" ? "active" : ""}
          onClick={() => setSelectedMenu("admins")}
        >
          관리자 관리
        </button>
        <button
          className={selectedMenu === "search" ? "active" : ""}
          onClick={() => setSelectedMenu("search")}
        >
          지역 검색
        </button>
      </div>

      {/* 메인 컨텐츠 - 선택된 메뉴에 따라 변경 */}
      <div className="main-content">
        {selectedMenu === "clients" && <ClientManagement />}
        {selectedMenu === "admins" && <AdminManagement />}
        {selectedMenu === "search" && <KakaoMapSearch />}
      </div>
    </div>
  );
};

export default Management;
