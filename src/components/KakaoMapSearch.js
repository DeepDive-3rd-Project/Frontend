import React, { useEffect, useState } from "react";
import "../styles/KakaoMapSearch.css";

const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;

const KakaoMapSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [map, setMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [infowindow, setInfowindow] = useState(null);

  useEffect(() => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        console.log("✅ 카카오 API 로드 완료");
        initMap();
      } else {
        console.warn(
          "⏳ 카카오 API가 아직 완전히 로드되지 않았습니다. 500ms 후 재시도..."
        );
        setTimeout(loadKakaoMap, 500);
      }
    };

    if (document.querySelector(`script[src*="dapi.kakao.com"]`)) {
      console.log("✅ 기존 카카오 API 스크립트가 감지됨");
      loadKakaoMap();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false&libraries=services`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      console.log("✅ 카카오 API 스크립트 로드 완료");
      window.kakao.maps.load(() => {
        console.log("✅ 카카오 API가 완전히 로드되었습니다.");
        initMap();
      });
    };

    script.onerror = () => {
      console.error("❌ 카카오 API 스크립트 로드 실패");
    };
  }, []);

  const initMap = () => {
    console.log("🚀 지도 초기화 시작");

    if (!window.kakao || !window.kakao.maps) {
      console.error("❌ 카카오 API가 아직 준비되지 않았습니다.");
      return;
    }

    setTimeout(() => {
      if (!window.kakao.maps.LatLng) {
        console.error(
          "❌ window.kakao.maps.LatLng가 아직 정의되지 않았습니다. 500ms 후 다시 시도"
        );
        return;
      }

      console.log("✅ 카카오 API 로드 확인:", window.kakao.maps);

      const mapContainer = document.getElementById("map");
      if (!mapContainer) {
        console.error("❌ `#map` 요소가 존재하지 않습니다.");
        return;
      }

      try {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        const mapInstance = new window.kakao.maps.Map(mapContainer, options);
        console.log("✅ 지도 객체 생성 완료:", mapInstance);

        setMap(mapInstance);
        setInfowindow(new window.kakao.maps.InfoWindow({ zIndex: 1 }));
      } catch (error) {
        console.error("❌ 지도 생성 중 오류 발생:", error);
      }
    }, 500);
  };

  const handleSearch = () => {
    if (!map) {
      console.warn(
        "⏳ 지도 객체가 아직 로드되지 않았습니다. 잠시 후 다시 시도하세요."
      );
      alert("지도가 아직 로드되지 않았습니다. 잠시 후 다시 시도하세요.");
      return;
    }

    if (!searchTerm.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }

    console.log("🔎 검색 실행:", searchTerm);

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchTerm, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        removeMarkers();
        setPlaces(data);

        const bounds = new window.kakao.maps.LatLngBounds();
        const newMarkers = [];

        data.forEach((place, index) => {
          const coords = new window.kakao.maps.LatLng(place.y, place.x);
          bounds.extend(coords);

          const newMarker = addMarker(coords, index, place.place_name);
          newMarkers.push(newMarker);
        });

        setMarkers(newMarkers);
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

  const addMarker = (position, index, title) => {
    const marker = new window.kakao.maps.Marker({
      position,
      map,
    });

    window.kakao.maps.event.addListener(marker, "mouseover", () => {
      infowindow.setContent(`<div style="padding:5px;">${title}</div>`);
      infowindow.open(map, marker);
    });

    window.kakao.maps.event.addListener(marker, "mouseout", () => {
      infowindow.close();
    });

    return marker;
  };

  const removeMarkers = () => {
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
  };

  return (
    <>
      <div className="map-search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="지역 검색어 입력"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSearch}>검색</button>
        </div>
        <div id="map" className="map-container"></div>
        <div className="menu-wrap">
          <ul className="places-list">
            {places.map((place, index) => (
              <li key={index} className="place-item">
                <span className={`markerbg marker_${index + 1}`}></span>
                <div className="info">
                  <h5>{place.place_name}</h5>
                  <span>{place.road_address_name || place.address_name}</span>
                  {place.phone && <span className="tel">{place.phone}</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="speech-bubble">
        <h1>카카오 지도를 이용해보세요!</h1>
      </div>
      <img src="/images/choon_sik.png" alt="춘식이" className="choon-sik-img" />
    </>
  );
};

export default KakaoMapSearch;
