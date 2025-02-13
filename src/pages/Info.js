import React from "react";
import "../styles/Info.css";

const Info = () => {
  return (
    <div className="info-page">
      <div className="info-container">
        <h1>고객 관리 서비스</h1>
        <section className="info-intro">
          <h2>🌐 서비스 소개</h2>
          <p>
            <strong>"여기 맞지?"</strong>는 사용자가 입력한 주소 및 연락처를
            보다 정확하고 최신 정보로 변환해주는 서비스입니다.
          </p>
          <p>
            카카오 지도 API를 활용하여 주소를 변환하고, 유효하지 않은 연락처를
            자동으로 검증하여 정확한 고객 정보를 제공합니다.
          </p>
          <p>
            해당 서비스는 기업이나 단체의 입장에서 클라이언트를 관리함에 있어
            편리성을 제공함과 동시에 카카오 지도 API의 기능들을 활용하여
            서비스의 집중 자원 투자 및 운영 방향에 도움을 주는 것에 목적이
            있습니다.
          </p>
        </section>

        <hr className="divider" />

        <section className="info-features">
          <h2>🚀 주요 기능</h2>
          <ul>
            <li>📍 오래된 주소 → 최신 주소 변환</li>
            <li>📌 주소 검색 및 위치 확인 (카카오 지도 연동)</li>
            <li>📞 연락처 유효성 검사 및 오류 수정</li>
            <li>🗓️ 변경 이력 저장 및 알림 제공</li>
          </ul>
        </section>

        <hr className="divider" />

        <section class-Name="info-scensrio">
          <h2>👤 사용자 시나리오</h2>
          <ul>
            <li>
              ✅ 사용자는 최고 관리자로, 팀원에게 관리 서비스를 이용할 수 있는
              계정을 만들어 제공할 수 있다.
            </li>
            <li>✅ 사용자는 관리자의 권한을 수정할 수 있다. </li>
            <li>
              ✅ 사용자는 관리자를 삭제할 수 있다.(일반 관리자만 삭제 가능)
            </li>
            <li>✅ 사용자는 관리자 목록을 출력할 수 있다. </li>
            <li>✅ 사용자는 클라이언트의 상세정보를 볼 수 있다.</li>
            <li>✅ 사용자는 클라이언트의 정보를 수정할 수 있다.</li>
            <li>✅ 사용자는 클라이언트를 추가할 수 있다. </li>
            <li>✅ 사용자는 클라이언트를 삭제할 수 있다.</li>
            <li>✅ 사용자는 지도 기능을 이용할 수 있다.</li>
            <li>✅ 사용자는 지역별 클라이언트의 밀집도를 확인할 수 있다.</li>
            <li>✅ 사용자는 지역별 클라이언트의 정보를 볼 수 있다.</li>
          </ul>
        </section>

        <hr className="divider" />

        <section class-Name="info-effect">
          <h2>👍 서비스 이용 효과</h2>
          <ul>
            <li>
              1️⃣ 서비스를 제공하는 기업이나 단체에서 고객의 위치, 연락처를
              포함한 정보를 편리하게 관리할 수 있다.
            </li>
            <li>
              2️⃣ 서비스를 이용하는 고객의 성별, 나이, 지역별 분포도를 분석하여
              마케팅 전략 수립에 활용한다.
            </li>
            <li>
              3️⃣ 고객의 정보가 변동되거나 불확실할 경우 정확한 정보를 수집 및
              수정하여 고객과 서비스 배포자 간 마찰을 줄여 서비스 만족도를
              상승시킨다.
            </li>
          </ul>
        </section>

        <hr className="divider" />

        <section className="info-team">
          <h2>👨‍💻 우리 팀 소개</h2>
          <p>
            <strong>팀명:</strong> 여기 맞지?
            <br />
            <br />
            <strong>팀원 및 역할</strong>
          </p>
          <ul>
            <li>🔹 강요한(팀장) - 관리자 관련 기능 개발, 프로젝트 총괄</li>
            <li>🔹 박민준 - 멀티 모듈 설계, 성능 최적화</li>
            <li>🔹 이지은 - 배포 및 CI/CD 구축, 부가 기능 구현</li>
            <li>
              🔹 송준환 - 카카오 지도 API 활용 데이터 추출 기능 개발 및 연동
            </li>
            <li>
              🔹 이정훈 - 서비스 프로토 타입 개발, 카카오 지도 API 활용 기능
              개발
            </li>
          </ul>
        </section>

        <hr className="divider" />

        <section className="info-contact">
          <h2>🛜 접근</h2>
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
      <div className="info-background"></div>
    </div>
  );
};

export default Info;
