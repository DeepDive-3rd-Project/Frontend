import React, { useState } from "react";
import "../styles/Management.css";
import ClientManagement from "../components/ClientManagement";
import HeatMap from "../components/HeatMap";
import ClientRetention from "../components/ClientRetention";
import AdminManagement from "../components/AdminManagement";
import KakaoMapSearch from "../components/KakaoMapSearch";

const Management = () => {
  const [selectedMenu, setSelectedMenu] = useState("clients");

  return (
    <div className="management-container">
      <div className="sidebar">
        <h3>관리 메뉴</h3>
        <button
          className={selectedMenu === "clients" ? "active" : ""}
          onClick={() => setSelectedMenu("clients")}
        >
          고객 관리
        </button>
        <button
          className={selectedMenu === "heatmap" ? "active" : ""}
          onClick={() => setSelectedMenu("heatmap")}
        >
          고객 밀집도 분석
        </button>
        <button
          className={selectedMenu === "retention" ? "active" : ""}
          onClick={() => setSelectedMenu("retention")}
        >
          고객 유치 현황
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

      <div className="main-content">
        {selectedMenu === "clients" && <ClientManagement />}
        {selectedMenu === "heatmap" && <HeatMap customers={[]} />}
        {selectedMenu === "retention" && <ClientRetention clients={[]} />}
        {selectedMenu === "admins" && <AdminManagement />}
        {selectedMenu === "search" && <KakaoMapSearch />}
      </div>
    </div>
  );
};

export default Management;
