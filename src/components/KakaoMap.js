import React, { useState, useEffect } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";

const KakaoMap = ({ address, width = "100%", height = "300px" }) => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=e952b2c5640cdd93c581a0c212caca9e&libraries=services,clusterer`;
      script.async = true;
      script.onload = () => loadMap();
      document.head.appendChild(script);
    } else {
      loadMap();
    }
  }, [address]);

  const loadMap = () => {
    setLoading(true);
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPosition({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        console.error("주소 변환 실패:", address);
      }
      setLoading(false);
    });
  };

  return (
    <div style={{ width, height, borderRadius: "8px", overflow: "hidden" }}>
      {loading || !position ? (
        <p style={{ textAlign: "center", padding: "20px" }}>
          📍 지도 로딩 중...
        </p>
      ) : (
        <Map
          center={position}
          style={{ width: "100%", height: "100%" }}
          level={3}
        >
          <MapMarker position={position} />
        </Map>
      )}
    </div>
  );
};

export default KakaoMap;
