import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MainPage from "./pages/MainPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Management from "./pages/Management";
import MyPage from "./pages/MyPage";
import Info from "./pages/Info";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/management" element={<Management />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/info" element={<Info />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
