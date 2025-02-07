import React from "react";
import "../styles/Info.css";

const Info = () => {
  return (
    <div className="info-container">
      <h1>🗺️ 여기 맞지?</h1>
      <section className="info-intro">
        <h2>서비스 소개</h2>
        <p>
          <strong>"여기 맞지?"</strong>는 사용자가 입력한 주소 및 연락처를 보다
          정확하고 최신 정보로 변환해주는 서비스입니다.
        </p>
        <p>
          카카오 지도 API를 활용하여 주소를 변환하고, 유효하지 않은 연락처를
          자동으로 검증하여 정확한 고객 정보를 제공합니다.
        </p>
      </section>

      <hr className="divider" />

      <section className="info-features">
        <h2>🚀 주요 기능</h2>
        <ul>
          <li>📍 오래된 주소 → 최신 주소 변환</li>
          <li>📌 주소 검색 및 위치 확인 (카카오 지도 연동)</li>
          <li>📞 연락처 유효성 검사 및 오류 수정</li>
          <li>📜 변경 이력 저장 및 알림 제공</li>
        </ul>
      </section>

      <hr className="divider" />

      <section className="info-team">
        <h2>👨‍💻 우리 팀 소개</h2>
        <p>
          <strong>팀명:</strong> 여기 맞지?
          <br />
          <br />
          <strong>팀원:</strong>
        </p>
        <ul>
          <li>🔹 강요한(팀장) - 관리자 관련 기능 개발</li>
          <li>🔹 박민준 - 멀티 모듈 설계, 성능 최적화</li>
          <li>🔹 이지은 - 배포 및 CI/CD 구축</li>
          <li>🔹 송준환 - 카카오 지도 API 활용 데이터 추출 기능 개발</li>
          <li>🔹 이정훈 - 서비스 이용 프로토 타입 개발, 코드 리펙토링</li>
        </ul>
      </section>

      <hr className="divider" />

      <section className="info-contact">
        <h2>💾 작업물</h2>
        <p>더 궁금한 점이 있다면 깃허브에 방문해주세요!</p>
        <ul>
          <li>
            🔗 GitHub:{" "}
            <a
              href="https://github.com/DeepDive-3rd-Project"
              target="_blank"
              rel="noopener noreferrer"
            >
              여기 맞지? GitHub
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
};

export default Info;
