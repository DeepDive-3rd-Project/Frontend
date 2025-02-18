import React, { useState, useEffect } from "react";
import "../styles/MapFilterControls.css";

const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_JS_KE;

const MapFilterControls = ({ customers, setFilteredCustomers }) => {
  const [map, setMap] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      const container = document.getElementById("map-filter");
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 5,
      };
      const mapInstance = new window.kakao.maps.Map(container, options);
      setMap(mapInstance);
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSearch = () => {
    if (!map || !searchTerm.trim()) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchTerm, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const bounds = new window.kakao.maps.LatLngBounds();

        data.forEach((place) => {
          bounds.extend(new window.kakao.maps.LatLng(place.y, place.x));
        });

        map.setBounds(bounds);
        setBounds(bounds);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  const handleFilter = () => {
    if (!bounds) {
      alert("먼저 지역을 검색하세요.");
      return;
    }

    const filtered = customers.filter((customer) =>
      bounds.contains(new window.kakao.maps.LatLng(customer.lat, customer.lng))
    );

    setFilteredCustomers(filtered);
  };

  return (
    <div className="filter-container">
      <input
        type="text"
        placeholder="지역 검색"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>검색</button>
      <button onClick={handleFilter}>이 지역 내 고객 보기</button>
      <div id="map-filter" className="map-filter-container"></div>
    </div>
  );
};

export default MapFilterControls;
