import React, { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import "../styles/KakaoMap.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;
const JS_KEY = process.env.REACT_APP_KAKAO_JS_KEY;

const KakaoMap = ({ lat, lng, width = "100%", height = "400px" }) => {
  const [position, setPosition] = useState({ lat: 37.5665, lng: 126.978 }); // 기본 좌표 설정

  useEffect(() => {
    console.log("📌 KakaoMap 위치 업데이트 - lat:", lat, "lng:", lng);
    if (lat && lng) {
      setPosition({ lat, lng });
    }
  }, [lat, lng]);

  useEffect(() => {
    console.log("📍 KakaoMap useEffect 실행됨 - position 변경 감지");
    console.log(`📌 현재 position 상태:`, position);
  }, [position]);

  useEffect(() => {
    console.log("📡 백엔드에서 위치 정보 가져오는 중...");
    const fetchClientLocation = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/location`);
        if (!response.ok) throw new Error("위치 정보를 불러오지 못했습니다.");

        const locationData = await response.json();
        console.log("📌 가져온 위치 데이터:", locationData);

        setPosition({
          lat: locationData.x || 37.5665,
          lng: locationData.y || 126.978,
        });
      } catch (error) {
        console.error("🚨 위치 정보 가져오기 오류:", error);
      }
    };

    if (!lat || !lng) {
      fetchClientLocation();
    }
  }, [lat, lng]);

  useEffect(() => {
    if (!JS_KEY) {
      console.error("🚨 Kakao JavaScript API 키가 설정되지 않았습니다!");
      return;
    }

    if (document.getElementById("kakao-map-script")) return;

    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${JS_KEY}&libraries=services`;
    script.async = true;
    script.onload = () => {
      console.log("✅ Kakao 지도 API 로드 완료!");
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div
      className="kakao-map-container"
      style={{ width, height, minHeight: "400px", backgroundColor: "white" }}
    >
      {!position ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#333" }}>
          📍 지도 로딩 중...
        </p>
      ) : (
        <>
          {console.log("🗺️ Kakao Map 렌더링 시작!", position)}
          <Map
            center={position}
            level={2}
            style={{ width: "70%", height: "100%", minHeight: "400px" }}
          >
            <MapMarker position={position} />
          </Map>
        </>
      )}
    </div>
  );
};

export default KakaoMap;
