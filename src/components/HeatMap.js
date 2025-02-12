import React, { useEffect, useState, useCallback } from "react";
import "../styles/HeatMap.css";
import DummyData from "../data/DummyData";

const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;

const HeatMap = () => {
  const [map, setMap] = useState(null);
  const [customers] = useState(DummyData || []);
  const [filteredCustomers, setFilteredCustomers] = useState(DummyData || []);
  const [selectedAges, setSelectedAges] = useState([]);
  const [customMinAge, setCustomMinAge] = useState("");
  const [customMaxAge, setCustomMaxAge] = useState("");
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clusterer, setClusterer] = useState(null);

  const initializeMap = useCallback(() => {
    if (!window.kakao || !window.kakao.maps || map) return;

    const container = document.getElementById("heatmap");
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(36.5, 127.5),
      level: 10,
    };

    const mapInstance = new window.kakao.maps.Map(container, options);
    setMap(mapInstance);

    const newClusterer = new window.kakao.maps.MarkerClusterer({
      map: mapInstance,
      averageCenter: true,
      minLevel: 5,
    });
    setClusterer(newClusterer);
  }, [map]);

  useEffect(() => {
    const scriptSrc = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer,places`;
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => initializeMap());
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [initializeMap]);

  const applyClusterer = useCallback(() => {
    if (!map || !clusterer) return;

    clusterer.clear();

    const bounds = new window.kakao.maps.LatLngBounds();
    const markers = filteredCustomers
      .map((customer) => {
        if (!customer.lat || !customer.lng) return null;
        const position = new window.kakao.maps.LatLng(
          customer.lat,
          customer.lng
        );
        bounds.extend(position);
        return new window.kakao.maps.Marker({ position });
      })
      .filter(Boolean);

    clusterer.addMarkers(markers);
    map.setBounds(bounds);
  }, [map, clusterer, filteredCustomers]);

  useEffect(() => {
    if (map && clusterer) {
      applyClusterer();
    }
  }, [map, clusterer, filteredCustomers, applyClusterer]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }

    const places = new window.kakao.maps.services.Places();
    places.keywordSearch(searchTerm, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const bounds = new window.kakao.maps.LatLngBounds();
        data.forEach((place) =>
          bounds.extend(new window.kakao.maps.LatLng(place.y, place.x))
        );
        map.setBounds(bounds);
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddRegion = () => {
    if (!searchTerm.trim()) {
      alert("추가할 지역을 검색하세요.");
      return;
    }

    setSelectedRegions((prev) => [...prev, searchTerm]);
    setSearchTerm("");
  };

  const handleResetFilters = () => {
    setSelectedAges([]);
    setCustomMinAge("");
    setCustomMaxAge("");
    setSelectedRegions([]);

    if (clusterer) clusterer.clear();
    setFilteredCustomers([...DummyData]);
  };

  const handleFilter = () => {
    let filtered = [...customers];

    if (selectedAges.length > 0) {
      filtered = filtered.filter((customer) =>
        selectedAges.some(
          (age) =>
            customer.age >= age && customer.age < (age === 60 ? 150 : age + 10)
        )
      );
    }

    if (customMinAge && customMaxAge) {
      filtered = filtered.filter(
        (customer) =>
          customer.age >= Number(customMinAge) &&
          customer.age <= Number(customMaxAge)
      );
    }

    if (selectedRegions.length > 0) {
      filtered = filtered.filter((customer) =>
        selectedRegions.some((region) => customer.region.includes(region))
      );
    }

    if (clusterer) clusterer.clear();
    setFilteredCustomers(filtered);
  };

  return (
    <div className="heatmap-page">
      <div className="heatmap-container">
        <div className="filter-section">
          <h2 className="title">고객 밀집도 필터</h2>
          <div className="filter-row">
            <div className="filter-column">
              <h3>👤 연령대 선택</h3>
              <div className="filter-container vertical">
                {[10, 20, 30, 40, 50, 60].map((age) => (
                  <button
                    key={age}
                    className={selectedAges.includes(age) ? "active" : ""}
                    onClick={() =>
                      setSelectedAges((prev) =>
                        prev.includes(age)
                          ? prev.filter((a) => a !== age)
                          : [...prev, age]
                      )
                    }
                  >
                    {age} ~ {age === 60 ? "" : age + 9}
                  </button>
                ))}
              </div>

              <h3>범위 입력</h3>
              <div className="filter-container vertical">
                <input
                  type="number"
                  placeholder="최소"
                  value={customMinAge}
                  onChange={(e) => setCustomMinAge(e.target.value)}
                />
                <span> ~ </span>
                <input
                  type="number"
                  placeholder="최대"
                  value={customMaxAge}
                  onChange={(e) => setCustomMaxAge(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-column">
              <h3>📍 지역 검색</h3>
              <div className="filter-container vertical">
                <input
                  type="text"
                  placeholder="지역 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button onClick={handleSearch}>검색</button>
                <button onClick={handleAddRegion}>지역 추가</button>
              </div>

              <div className="selected-regions">
                {selectedRegions.map((region, index) => (
                  <span key={index} className="region-tag">
                    {region}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={handleFilter}>필터 적용</button>
            <button onClick={handleResetFilters} className="reset-btn">
              초기화
            </button>
          </div>
        </div>

        <div className="map-section">
          <div id="heatmap" className="heatmap-map"></div>
        </div>
      </div>
    </div>
  );
};

export default HeatMap;
