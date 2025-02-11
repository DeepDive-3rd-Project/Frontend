import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Management from "./pages/Management";
import MyPage from "./pages/MyPage";
import Info from "./pages/Info";
import "./App.css";

const KAKAO_API_KEY = process.env.REACT_APP_KAKAO_API_KEY;

const App = () => {
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);

  useEffect(() => {
    const loadKakaoMapScript = () => {
      if (window.kakao && window.kakao.maps) {
        console.log("✅ Kakao 지도 API 이미 로드됨");
        setIsKakaoLoaded(true);
        return;
      }

      console.log("🚀 Kakao 지도 API 로드 시작...");

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false&libraries=services,clusterer,places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("✅ Kakao 지도 API 로드 완료");
        window.kakao.maps.load(() => {
          setIsKakaoLoaded(true);
        });
      };

      script.onerror = () => {
        console.error("❌ Kakao 지도 API 로드 실패");
      };

      document.head.appendChild(script);
    };

    if (!document.querySelector(`script[src*="dapi.kakao.com"]`)) {
      loadKakaoMapScript();
    } else {
      console.log("✅ 기존 Kakao API 스크립트가 감지됨");
      setIsKakaoLoaded(true);
    }
  }, []);

  return (
    <Router>
      <Header />
      {isKakaoLoaded ? (
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/management" element={<Management />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/info" element={<Info />} />
        </Routes>
      ) : (
        <p>🚀 Kakao 지도 API 로드 중...</p>
      )}
      <Footer />
    </Router>
  );
};

export default App;
