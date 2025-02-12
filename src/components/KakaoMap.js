import React, { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import "../styles/KakaoMap.css";

const KakaoMap = ({ lat, lng, width = "100%", height = "400px" }) => {
  const [position, setPosition] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    console.log(`📌 KakaoMap 컴포넌트 - lat: ${lat}, lng: ${lng}`);

    if (!lat || !lng) {
      console.warn("⚠️ 지도에 표시할 위치 정보가 없습니다.");
      setPosition(null);
      return;
    }

    const newPosition = { lat: parseFloat(lat), lng: parseFloat(lng) };
    console.log(`✅ 위치 값 설정:`, newPosition);
    setPosition(newPosition);
  }, [lat, lng]);

  useEffect(() => {
    if (mapInstance && position) {
      console.log("🔄 지도 재배치 (relayout) 실행됨!");

      setTimeout(() => {
        try {
          if (mapInstance && typeof mapInstance.relayout === "function") {
            mapInstance.relayout();
            mapInstance.setCenter(position);
          } else {
            console.warn("⚠️ mapInstance가 아직 생성되지 않음.");
          }
        } catch (error) {
          console.error("🚨 Kakao 지도 관련 오류 발생:", error);
        }
      }, 500);
    }
  }, [mapInstance, position]);

  useEffect(() => {
    console.log("📍 KakaoMap useEffect 실행됨");
    console.log(`📌 현재 position 상태:`, position);
  }, [position]);

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
            onCreate={(map) => {
              console.log("🗺️ Kakao Map 객체 생성됨:", map);
              setMapInstance(map);
            }}
          >
            <MapMarker position={position} />
          </Map>
        </>
      )}
    </div>
  );
};

export default KakaoMap;
