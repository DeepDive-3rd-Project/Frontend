import React, { useEffect, useState, useCallback } from "react";
import "../styles/HeatMap.css";

const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;
const API_BASE_URL = process.env.REACT_APP_API_URL;

const HeatMap = () => {
  const [map, setMap] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedAges, setSelectedAges] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clusterer, setClusterer] = useState(null);
  const [tempSelectedAges, setTempSelectedAges] = useState([]);
  const [tempSelectedRegions, setTempSelectedRegions] = useState([]);

  const ageGroups = {
    TEENS: "10대",
    TWENTIES: "20대",
    THIRTIES: "30대",
    FORTIES: "40대",
    FIFTIES: "50대",
    SIXTIES: "60대 이상",
  };

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

  const fetchHeatMapData = useCallback(async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token || token.trim() === "") {
        throw new Error("로그인이 필요합니다.");
      }

      token = token.trim();
      let formattedToken = token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;
      console.log("📌 JWT 토큰 확인:", formattedToken);

      let queryParams = new URLSearchParams();

      if (selectedRegions.length > 0) {
        selectedRegions.forEach((region) =>
          queryParams.append("region", region)
        );
      }

      if (selectedAges.length > 0) {
        selectedAges.forEach((age) => {
          const formattedAge = age === "SIXTIES" ? "SIXTIES_AND_ABOVE" : age;
          queryParams.append("ageGroups", formattedAge);
        });
      }

      const url = queryParams.toString()
        ? `${API_BASE_URL}/api/users/heatmap?${queryParams.toString()}`
        : `${API_BASE_URL}/api/users/heatmap`;

      console.log("📌 API 요청 URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: formattedToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("히트맵 데이터 불러오기 실패");

      const data = await response.json();
      console.log("📌 히트맵 데이터:", data);

      setCustomers(data.response || []);
      setFilteredCustomers(data.response || []);
    } catch (error) {
      console.error("🚨 히트맵 데이터 가져오기 오류:", error);
    }
  }, [selectedRegions, selectedAges]);

  useEffect(() => {
    fetchHeatMapData();
  }, [fetchHeatMapData]);

  useEffect(() => {
    if (selectedRegions.length > 0 || selectedAges.length > 0) {
      fetchHeatMapData();
    }
  }, [selectedRegions, selectedAges, fetchHeatMapData]);

  const applyClusterer = useCallback(() => {
    if (!map || !clusterer) return;

    clusterer.clear();
    const bounds = new window.kakao.maps.LatLngBounds();
    const markers = filteredCustomers
      .map((customer) => {
        if (!customer.x || !customer.y) return null;
        const position = new window.kakao.maps.LatLng(customer.y, customer.x);
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

  const handleApplyFilter = () => {
    console.log("📌 필터 적용 - 선택된 연령대:", tempSelectedAges);
    console.log("📌 필터 적용 - 선택된 지역:", tempSelectedRegions);

    setSelectedAges(tempSelectedAges);
    setSelectedRegions(tempSelectedRegions);
  };

  useEffect(() => {
    fetchHeatMapData();
  }, [fetchHeatMapData]);

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
      alert("추가할 지역을 입력하세요.");
      return;
    }

    const places = new window.kakao.maps.services.Places();
    const geocoder = new window.kakao.maps.services.Geocoder();

    places.keywordSearch(searchTerm, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const firstResult = data[0];
        console.log("📌 검색된 주소 데이터:", firstResult);

        const { x, y } = firstResult;

        geocoder.coord2RegionCode(x, y, (result, status) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            result.length > 0
          ) {
            console.log("📌 좌표 기반 행정구역 데이터:", result);

            let selectedRegion = null;

            for (let region of result) {
              if (region.region_type === "H") continue;

              if (region.region_1depth_name.includes(searchTerm)) {
                selectedRegion = region.region_1depth_name;
              } else if (region.region_2depth_name.includes(searchTerm)) {
                selectedRegion = region.region_2depth_name;
              } else if (region.region_3depth_name.includes(searchTerm)) {
                selectedRegion = region.region_3depth_name;
              }
            }

            if (!selectedRegion) {
              alert("올바른 지역을 찾을 수 없습니다.");
              return;
            }

            console.log("📌 추가할 지역:", selectedRegion);

            setTempSelectedRegions((prev) => {
              if (prev.includes(selectedRegion)) {
                alert("이미 추가된 지역입니다.");
                return prev;
              }
              return [...prev, selectedRegion];
            });

            setSearchTerm("");
          } else {
            alert("검색 결과를 찾을 수 없습니다.");
          }
        });
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  useEffect(() => {
    console.log("현재 선택된 지역:", selectedRegions);
  }, [selectedRegions]);

  const convertCoordinatesToRegion = useCallback((customers) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    return Promise.all(
      customers.map((customer) => {
        return new Promise((resolve) => {
          if (!customer.x || !customer.y) {
            resolve(null);
            return;
          }

          geocoder.coord2Address(customer.x, customer.y, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const address = result[0].address;
              const region = address.region_1depth_name;
              const subRegion = address.region_2depth_name;
              resolve({ ...customer, region, subRegion });
            } else {
              resolve(null);
            }
          });
        });
      })
    );
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")?.trim();
      if (!token) throw new Error("로그인이 필요합니다.");

      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("데이터 불러오기 실패");

      const data = await response.json();
      console.log("📌 원본 고객 데이터:", data);

      const customersWithRegion = await convertCoordinatesToRegion(data);

      const sanitizedCustomers = customersWithRegion.map((customer) => ({
        ...customer,
        region: customer.region || "Unknown",
        subRegion: customer.subRegion || "Unknown",
      }));

      setCustomers(sanitizedCustomers);
      setFilteredCustomers(sanitizedCustomers);
    } catch (error) {
      console.error("🚨 고객 데이터 가져오기 오류:", error);
    }
  }, [convertCoordinatesToRegion]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleResetFilters = () => {
    console.log("📌 필터 초기화 실행");

    setTempSelectedAges([]);
    setTempSelectedRegions([]);
    setSelectedAges([]);
    setSelectedRegions([]);
  };

  useEffect(() => {
    if (selectedAges.length === 0 && selectedRegions.length === 0) {
      fetchHeatMapData();
    }
  }, [selectedAges, selectedRegions, fetchHeatMapData]);

  const handleFilter = useCallback(() => {
    let filtered = [...customers];

    if (selectedRegions.length > 0) {
      filtered = filtered.filter((customer) => {
        const region = customer.region || "";
        const subRegion = customer.subRegion || "";
        return selectedRegions.some(
          (regionFilter) =>
            region.includes(regionFilter) || subRegion.includes(regionFilter)
        );
      });
    }

    setFilteredCustomers(filtered);
  }, [customers, selectedRegions]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  return (
    <div className="heatmap-page">
      <div className="heatmap-container">
        <div className="filter-section">
          <h2 className="title">고객 밀집도 필터</h2>
          <div className="filter-row">
            <div className="filter-column">
              <h3>👤 연령대 선택</h3>
              <div className="filter-container vertical">
                {Object.keys(ageGroups).map((key) => (
                  <button
                    key={key}
                    className={tempSelectedAges.includes(key) ? "active" : ""}
                    onClick={() =>
                      setTempSelectedAges((prev) =>
                        prev.includes(key)
                          ? prev.filter((a) => a !== key)
                          : [...prev, key]
                      )
                    }
                  >
                    {ageGroups[key]}
                  </button>
                ))}
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

                <div className="selected-regions">
                  {tempSelectedRegions.map((region, index) => (
                    <span key={index} className="region-tag">
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="filter-actions">
              <button onClick={handleApplyFilter}>필터 적용</button>
              <button onClick={handleResetFilters} className="reset-btn">
                초기화
              </button>
            </div>
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
