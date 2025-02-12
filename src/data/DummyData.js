import { v4 as uuidv4 } from "uuid";

const DummyData = [
  {
    id: uuidv4(),
    name: "강요한",
    email: "yohan.kang@example.com",
    phone: "010-1234-5678",
    gender: "남자",
    age: 30,
    region_Address: "서울특별시 강남구 테헤란로 427",
    road_Address: "서울특별시 강남구 테헤란로 427",
    lat: 37.5035,
    lng: 127.0487,
    region: "서울",
  },
  {
    id: uuidv4(),
    name: "박민준",
    email: "minjun.park@example.com",
    phone: "010-2345-6789",
    gender: "남자",
    age: 28,
    region_Address: "부산광역시 해운대구 해운대해변로 203",
    road_Address: "부산광역시 해운대구 해운대해변로 203",
    lat: 35.1596,
    lng: 129.1603,
    region: "부산",
  },
  {
    id: uuidv4(),
    name: "이지은",
    email: "jieun.lee@example.com",
    phone: "010-3456-7890",
    gender: "여자",
    age: 27,
    region_Address: "대구광역시 중구 동성로2가 88",
    road_Address: "대구광역시 중구 동성로2가 88",
    lat: 35.8679,
    lng: 128.5961,
    region: "대구",
  },
  {
    id: uuidv4(),
    name: "이정훈",
    email: "jeonghoon.lee@example.com",
    phone: "010-4567-8901",
    gender: "남자",
    age: 43,
    region_Address: "인천광역시 연수구 송도동 155",
    road_Address: "인천광역시 연수구 송도동 155",
    lat: 37.3787,
    lng: 126.6468,
    region: "인천",
  },
  {
    id: uuidv4(),
    name: "송준환",
    email: "junhwan.song@example.com",
    phone: "010-5678-9012",
    gender: "남자",
    age: 19,
    region_Address: "광주광역시 서구 치평동 1202",
    road_Address: "광주광역시 서구 치평동 1202",
    lat: 35.1468,
    lng: 126.8431,
    region: "광주",
  },
];

const regions = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const getRandomPhone = () =>
  `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

const getRandomAge = () => Math.floor(Math.random() * 60) + 18;

const getRandomCoords = (region) => {
  const regionCoords = {
    서울: { lat: 37.5665, lng: 126.978 },
    부산: { lat: 35.1796, lng: 129.0756 },
    대구: { lat: 35.8714, lng: 128.6014 },
    인천: { lat: 37.4563, lng: 126.7052 },
    광주: { lat: 35.1595, lng: 126.8526 },
    대전: { lat: 36.3504, lng: 127.3845 },
    울산: { lat: 35.5384, lng: 129.3114 },
    세종: { lat: 36.48, lng: 127.289 },
    경기: { lat: 37.2636, lng: 127.0286 },
    강원: { lat: 37.8854, lng: 127.7298 },
    충북: { lat: 36.6357, lng: 127.4916 },
    충남: { lat: 36.5184, lng: 126.8003 },
    전북: { lat: 35.7175, lng: 127.153 },
    전남: { lat: 34.8194, lng: 126.8931 },
    경북: { lat: 36.576, lng: 128.5056 },
    경남: { lat: 35.237, lng: 128.692 },
    제주: { lat: 33.4996, lng: 126.5312 },
  };

  const offset = 0.1;
  return {
    lat: regionCoords[region].lat + (Math.random() * offset - offset / 2),
    lng: regionCoords[region].lng + (Math.random() * offset - offset / 2),
  };
};

regions.forEach((region) => {
  for (let i = 0; i < 50; i++) {
    const { lat, lng } = getRandomCoords(region);
    DummyData.push({
      id: uuidv4(),
      name: `사용자${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: getRandomPhone(),
      gender: i % 2 === 0 ? "남자" : "여자",
      age: getRandomAge(),
      region_Address: `${region}시 ${Math.floor(Math.random() * 100)}번길`,
      road_Address: `${region}시 ${Math.floor(Math.random() * 1000)}번길`,
      lat,
      lng,
      region,
    });
  }
});

export default DummyData;
