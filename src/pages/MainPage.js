import React from "react";
import "../styles/MainPage.css";

const MainPage = () => {
  return (
    <div className="main-container">
      <div className="video-container">
        <video autoPlay loop muted>
          <source src="/videos/kakao-promo.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default MainPage;
