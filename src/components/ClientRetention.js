import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/ClientRetention.css";

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/users/stats`;

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#FFBB28",
  "#FF8042",
  "#00C49F",
  "#0088FE",
  "#D72638",
  "#3A015C",
  "#FF5700",
  "#8E44AD",
  "#16A085",
  "#D35400",
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

const ageGroups = {
  TEENS: "10대",
  TWENTIES: "20대",
  THIRTIES: "30대",
  FORTIES: "40대",
  FIFTIES: "50대",
  SIXTIES_AND_ABOVE: "60대 이상",
};

const genders = ["남자", "여자"];

const genderMapping = {
  남자: ["MALE", "남자"],
  여자: ["FEMALE", "여자"],
};

const ClientRetention = () => {
  const [filterGender, setFilterGender] = useState(["전체"]);
  const [filterRegion, setFilterRegion] = useState(["전체"]);
  const [filterAgeGroup, setFilterAgeGroup] = useState(["전체"]);
  const [genderData, setGenderData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState({
    gender: false,
    region: false,
    age: false,
  });

  const fetchUserStats = useCallback(async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem("token")?.trim();
      const token = rawToken?.startsWith("Bearer ")
        ? rawToken
        : `Bearer ${rawToken}`;

      const headers = {
        Authorization: token,
        "Content-Type": "application/json",
      };

      const params = new URLSearchParams();

      if (!filterGender.includes("전체")) {
        filterGender.forEach((g) => {
          genderMapping[g].forEach((mappedValue) => {
            params.append("gender", mappedValue);
          });
        });
      }

      if (!filterRegion.includes("전체")) {
        filterRegion.forEach((r) => params.append("region", r));
      }

      if (!filterAgeGroup.includes("전체")) {
        filterAgeGroup.forEach((a) =>
          params.append(
            "ageGroups",
            Object.keys(ageGroups).find((key) => ageGroups[key] === a)
          )
        );
      }

      const response = await axios.get(`${API_BASE_URL}?${params.toString()}`, {
        withCredentials: true,
        headers,
      });

      const { total, genderStats, regionStats, ageStats } = response.data;
      setTotalClients(total);

      const combinedGenderData = {};
      Object.entries(genderStats).forEach(([key, value]) => {
        if (genderMapping["남자"].includes(key)) {
          combinedGenderData["남자"] =
            (combinedGenderData["남자"] || 0) + value;
        } else if (genderMapping["여자"].includes(key)) {
          combinedGenderData["여자"] =
            (combinedGenderData["여자"] || 0) + value;
        }
      });

      setGenderData(
        Object.entries(combinedGenderData)
          .filter(([_, value]) => value > 0)
          .map(([key, value]) => ({ name: key, value }))
      );

      setRegionData(
        Object.entries(regionStats).map(([key, value]) => ({
          name: key,
          value,
        }))
      );

      const convertAgeKeyToKorean = (key) => {
        if (key.includes("10.0-20.0")) return "10대";
        if (key.includes("20.0-30.0")) return "20대";
        if (key.includes("30.0-40.0")) return "30대";
        if (key.includes("40.0-50.0")) return "40대";
        if (key.includes("50.0-60.0")) return "50대";
        if (key.includes("60.0-*")) return "60대 이상";
        return key;
      };
      const ageOrder = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];

      const formattedAgeData = Object.entries(ageStats)
        .map(([key, value]) => ({
          name: convertAgeKeyToKorean(key),
          value,
        }))
        .filter(({ value }) => value > 0)
        .sort((a, b) => ageOrder.indexOf(a.name) - ageOrder.indexOf(b.name));

      setAgeData(formattedAgeData);
    } catch (error) {
      console.error("❌ [ERROR] 데이터 불러오기 실패:", error);
    }
    setLoading(false);
  }, [filterGender, filterRegion, filterAgeGroup]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const handleFilterChange = (setFilter, value) => {
    setFilter((prev) => {
      if (value === "전체") return ["전체"];
      if (prev.includes("전체")) return [value];
      return prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];
    });
  };

  const resetFilters = () => {
    setFilterGender(["전체"]);
    setFilterRegion(["전체"]);
    setFilterAgeGroup(["전체"]);
  };

  const toggleDropdown = (type) => {
    setDropdownOpen((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const renderDropdown = (title, filter, setFilter, options, type) => (
    <div className="filter-group">
      <button className="dropdown-btn" onClick={() => toggleDropdown(type)}>
        {title}:{" "}
        {filter.includes("전체") ? "전체" : `${filter.length}개 선택됨`}
      </button>
      {dropdownOpen[type] && (
        <div className="dropdown-menu">
          <div className="dropdown-scroll">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.includes("전체")}
                onChange={() => setFilter(["전체"])}
              />
              전체
            </label>
            {options.map((option) => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filter.includes(option)}
                  onChange={() => handleFilterChange(setFilter, option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = ((value / totalClients) * 100).toFixed(1);
      return (
        <div className="tooltip-box">
          <p>
            <strong>{ageGroups[name] || name}</strong>
          </p>
          <p>인원: {value}명</p>
          <p>비율: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="client-retention">
      <h2>고객 유치 현황</h2>
      <div className="filter-container">
        {renderDropdown(
          "성별",
          filterGender,
          setFilterGender,
          genders,
          "gender"
        )}
        {renderDropdown(
          "지역",
          filterRegion,
          setFilterRegion,
          regions,
          "region"
        )}
        {renderDropdown(
          "연령대",
          filterAgeGroup,
          setFilterAgeGroup,
          Object.values(ageGroups),
          "age"
        )}
        <button className="reset-btn" onClick={resetFilters}>
          초기화
        </button>
      </div>

      {loading ? (
        <p>📊 데이터를 불러오는 중...</p>
      ) : (
        <div className="chart-container">
          {genderData.length > 0 && (
            <div className="chart-box">
              <h3>성별 비율</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name} (${value}명)`}
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {regionData.length > 0 && (
            <div className="chart-box">
              <h3>지역별 비율</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={regionData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name} (${value}명)`}
                  >
                    {regionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {ageData.length > 0 && (
            <div className="chart-box">
              <h3>연령별 비율</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={ageData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name} (${value}명)`}
                  >
                    {ageData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => value} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientRetention;
