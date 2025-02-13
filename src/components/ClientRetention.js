import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DummyData from "../data/DummyData";
import "../styles/ClientRetention.css";

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
  "#C0392B",
  "#1ABC9C",
  "#F1C40F",
  "#27AE60",
  "#2C3E50",
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

const ageGroups = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];
const genders = ["남자", "여자"];

const ClientRetention = () => {
  const [filterGender, setFilterGender] = useState(["전체"]);
  const [filterRegion, setFilterRegion] = useState(["전체"]);
  const [filterAgeGroup, setFilterAgeGroup] = useState(["전체"]);
  const [dropdownOpen, setDropdownOpen] = useState({
    gender: false,
    region: false,
    age: false,
  });

  const filteredClients = DummyData.filter((client) => {
    const matchGender =
      filterGender.includes("전체") || filterGender.includes(client.gender);
    const matchRegion =
      filterRegion.includes("전체") || filterRegion.includes(client.region);
    const matchAge =
      filterAgeGroup.includes("전체") ||
      filterAgeGroup.some((ageLabel) => {
        const index = ageGroups.indexOf(ageLabel);
        if (index === -1) return false;
        const minAge = index * 10 + 10;
        const maxAge = index === 5 ? 100 : minAge + 9;
        return client.age >= minAge && client.age <= maxAge;
      });

    return matchGender && matchRegion && matchAge;
  });

  const totalClients = filteredClients.length;

  const transformData = (labels, key) =>
    labels
      .map((label) => ({
        name: label,
        value: filteredClients.filter((c) => c[key] === label).length,
      }))
      .filter((d) => d.value > 0);

  const genderData = transformData(genders, "gender");
  const regionData = transformData(regions, "region");

  const ageData = ageGroups
    .map((group, index) => {
      const minAge = index * 10 + 10;
      const maxAge = index === 5 ? 100 : minAge + 9;
      return {
        name: group,
        value: filteredClients.filter(
          (client) => client.age >= minAge && client.age <= maxAge
        ).length,
      };
    })
    .filter((d) => d.value > 0);

  const handleFilterChange = (setFilter, value) => {
    setFilter((prev) => {
      if (value === "전체") return ["전체"];
      if (prev.includes("전체")) return [value];
      return prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value];
    });
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
            {["전체", ...options].map((option) => (
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
            <strong>{name}</strong>
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
          ageGroups,
          "age"
        )}
        <button
          className="reset-btn"
          onClick={() => {
            setFilterGender(["전체"]);
            setFilterRegion(["전체"]);
            setFilterAgeGroup(["전체"]);
          }}
        >
          초기화
        </button>
      </div>

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
                  label={({ name, value }) => `${name}: ${value}명`}
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
                  label={({ name, value }) => `${name}: ${value}명`}
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
                  label={({ name, value }) => `${name}: ${value}명`}
                >
                  {ageData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientRetention;
