import React, { useState, useEffect, useRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import Kalata from "../assets/images/Kalata.jpg";
import Basket from "../assets/images/Basket.jpg";
import PdfIcon from "../assets/images/pdf.png";
import InfoModal from "./InfoModal";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const InfoTooltip = ({ text, align = "center" }) => {
  const alignClass =
    align === "left"
      ? "left-0"
      : align === "right"
      ? "right-0"
      : "left-1/2 -translate-x-1/2";

  return (
    <span className="relative inline-flex group" tabIndex={0} aria-label={text}>
      <span className="text-xs cursor-help leading-none select-none">ℹ️</span>
      <span
        className={`invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 transition-opacity duration-150 absolute ${alignClass} top-5 max-w-[260px] md:max-w-[320px] bg-white text-[#01389c] border border-[#01389c] text-[9px] px-2 py-1 rounded shadow-md z-50 text-left whitespace-normal break-words`}
        role="tooltip"
      >
        {text}
      </span>
    </span>
  );
};

const Page = ({ language }) => {
  const [startDate, setStartDate] = useState(new Date(2024, 11)); // დეკემბერი 2024
  const [endDate, setEndDate] = useState(new Date(2025, 11)); // დეკემბერი 2025
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const [dateError, setDateError] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMonthlySum, setTotalMonthlySum] = useState(0);
  const [totalYearlySum, setTotalYearlySum] = useState(0);
  const [officialInflationRate, setOfficialInflationRate] = useState("0.0%");
  const [groupData, setGroupData] = useState({});
  const [subGroupData, setSubGroupData] = useState({});
  const [groupPrices, setGroupPrices] = useState({});
  const [subGroupWeights, setSubGroupWeights] = useState({});
  const [subCategoryPrices, setSubCategoryPrices] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personalInflationRate, setPersonalInflationRate] = useState("0%");

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/personaltitle");
        const data = await response.json();

        // Group categories by level
        const level1 = data.filter((item) => item.level === 1);
        const level2 = data.filter((item) => item.level === 2);

        // Create hierarchical structure - only direct children
        const categoriesWithSub = level1.map((parent) => {
          const parentCodeStr = String(parent.code);
          const parentCodeLength = parentCodeStr.length;

          return {
            ...parent,
            subcategories: level2.filter((sub) => {
              const subCodeStr = String(sub.code);
              // Only match direct children (code starts with parent code and is exactly one level deeper)
              return (
                subCodeStr.startsWith(parentCodeStr) &&
                subCodeStr.length === parentCodeLength + 1
              );
            }),
          };
        });

        setCategories(categoriesWithSub);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch info groups on page load with default dates
  useEffect(() => {
    fetchInfoGroups(startDate, endDate);
    fetchSubGroupIndex(startDate, endDate);
    fetchGroupPrices(endDate.getFullYear());
    fetchSubGroupWeights(endDate.getFullYear());
  }, []);

  // Recalculate subcategory prices whenever groupPrices or subGroupWeights change
  useEffect(() => {
    if (Object.keys(groupPrices).length > 0 && Object.keys(subGroupWeights).length > 0) {
      calculateSubCategoryPrices(groupPrices, subGroupWeights);
    }
  }, [groupPrices, subGroupWeights]);

  // Recalculate personal inflation rate dynamically whenever totals or group data change
  useEffect(() => {
    setPersonalInflationRate(calculatePersonalInflationRate());
  }, [totalMonthlySum, groupData, categories]);

  // Format date to display as YYYY/MM
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}/${month}`;
  };

  // Validate dates whenever they change
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setDateError(
        language === "GE"
          ? "საბოლოო პერიოდი უნდა აღემატებოდეს საწყის პერიოდს."
          : "The end period must exceed the start period."
      );
    } else {
      setDateError("");
    }
  }, [startDate, endDate, language]);

  // Function to update total values - only parent categories
  const updateTotal = () => {
    const numberInputs = document.querySelectorAll('input[type="number"]');

    let monthly = 0;
    let yearly = 0;

    numberInputs.forEach((input) => {
      const val = parseFloat(input.value) || 0;
      const key = (input.id || input.className || "").toLowerCase();

      // Only include parent category inputs, exclude subcategories
      if (key.includes("parent-monthly")) monthly += val;
      if (key.includes("parent-yearly")) yearly += val;
    });

    setTotalMonthlySum(monthly);
    setTotalYearlySum(yearly);
  };

  // Calculate total of all group prices
  const getTotalGroupPrices = () => {
    return Object.values(groupPrices).reduce((sum, price) => {
      return sum + (parseFloat(price) || 0);
    }, 0);
  };

  // Function to clear all input fields in the table
  const handleClear = () => {
    // Clear all parent and sub category inputs dynamically
    const allInputs = document.querySelectorAll('input[type="number"]');
    allInputs.forEach((input) => (input.value = ""));

    // Update totals to zero
    updateTotal();
  };

  // Fetch info groups from API
  const fetchInfoGroups = async (fromDate, toDate) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/infogroups?from=${formatDate(fromDate)}&to=${formatDate(toDate)}`
      );
      const data = await response.json();

      // Calculate official inflation rate using formula: (enddate / startdate) * 100 - 100
      if (data && data.length > 0) {
        const startValue = data[0].GroupTotal; // Value at start date
        const endValue = data[data.length - 1].GroupTotal; // Value at end date

        if (startValue && endValue) {
          const inflationRate = (endValue / startValue) * 100 - 100;
          const roundedRate = inflationRate.toFixed(1);
          setOfficialInflationRate(`${roundedRate}%`);
        }

        // Calculate inflation rates for each group (Group1, Group2, Group3, etc.)
        const groupCalculations = {};
        const groupKeys = Object.keys(data[0]).filter((key) =>
          key.match(/^Group\d+$/)
        );

        groupKeys.forEach((groupKey) => {
          const startGroupValue = data[0][groupKey];
          const endGroupValue = data[data.length - 1][groupKey];

          if (startGroupValue && endGroupValue) {
            const groupInflationRate =
              (endGroupValue / startGroupValue) * 100 - 100;
            groupCalculations[groupKey] = groupInflationRate.toFixed(1);
          }
        });

        setGroupData(groupCalculations);
      }

    } catch (error) {
      console.error("Error fetching info groups:", error);
    }
  };

  // Fetch subgroup index from API
  const fetchSubGroupIndex = async (fromDate, toDate) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/subgroupindex?from=${formatDate(fromDate)}&to=${formatDate(toDate)}`
      );
      const data = await response.json();

      // Calculate inflation rates for each subgroup dynamically
      if (data && data.length > 0) {
        const subGroupCalculations = {};
        const subGroupKeys = Object.keys(data[0]).filter((key) =>
          key.match(/^grp\d+sub\d+$/i)
        );

        subGroupKeys.forEach((subGroupKey) => {
          const startSubGroupValue = data[0][subGroupKey];
          const endSubGroupValue = data[data.length - 1][subGroupKey];

          if (startSubGroupValue && endSubGroupValue) {
            const subGroupInflationRate =
              (endSubGroupValue / startSubGroupValue) * 100 - 100;
            subGroupCalculations[subGroupKey] = subGroupInflationRate.toFixed(2);
          }
        });

        setSubGroupData(subGroupCalculations);
      }

    } catch (error) {
      console.error("Error fetching subgroup index:", error);
    }
  };

  // Fetch group prices from API
  const fetchGroupPrices = async (year) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/groupprices?year=${year}`
      );
      const data = await response.json();

      // Create a map of group prices dynamically
      if (data && data.length > 0) {
        const groupPricesMap = {};
        const groupPriceKeys = Object.keys(data[0]).filter((key) =>
          key.match(/^Group\d+$/)
        );

        groupPriceKeys.forEach((groupKey) => {
          groupPricesMap[groupKey] = parseFloat(data[0][groupKey]);
        });

        setGroupPrices(groupPricesMap);
      }

    } catch (error) {
      console.error("Error fetching group prices:", error);
    }
  };

  // Fetch subgroup weights from API
  const fetchSubGroupWeights = async (year) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/subgroupweights?year=${year}`
      );
      const data = await response.json();

      // Create a map of subgroup weights dynamically
      if (data && data.length > 0) {
        const subGroupWeightsMap = {};
        const subGroupWeightKeys = Object.keys(data[0]).filter((key) =>
          key.match(/^grp\d+sub\d+$/i)
        );

        subGroupWeightKeys.forEach((weightKey) => {
          subGroupWeightsMap[weightKey] = parseFloat(data[0][weightKey]);
        });

        setSubGroupWeights(subGroupWeightsMap);
      }
    } catch (error) {
      console.error("Error fetching subgroup weights:", error);
    }
  };

  // Calculate subcategory prices based on group prices and subgroup weights
  const calculateSubCategoryPrices = (groupPricesMap, weightsMap) => {
    const prices = {};

    Object.keys(weightsMap).forEach((weightKey) => {
      // Extract group number from weight key (e.g., "grp1sub1" -> "1")
      const match = weightKey.match(/grp(\d+)sub/i);
      if (match) {
        const groupNum = match[1];
        const groupKey = `Group${groupNum}`;
        const groupPrice = groupPricesMap[groupKey];
        const weight = weightsMap[weightKey];

        if (groupPrice !== undefined) {
          prices[weightKey] = groupPrice * weight;
        }
      }
    });

    setSubCategoryPrices(prices);
  };

  // Calculate personal inflation rate
  const calculatePersonalInflationRate = () => {
    const totalMonthlyInput = document.querySelector('#total-monthly');
    const totalMonthly = parseFloat(totalMonthlyInput?.value) || 0;

    if (totalMonthly === 0) {
      return "0%";
    }

    let weightedInflationSum = 0;

    categories.forEach((category) => {
      const parentMonthlyInput = document.querySelector(`#parent-monthly-${category.code}`);
      const parentMonthlyValue = parseFloat(parentMonthlyInput?.value) || 0;
      const inflationRate = parseFloat(groupData[`Group${category.code}`]) || 0;

      // Weight = (parent monthly value / total monthly) * inflation rate
      if (totalMonthly > 0) {
        const weight = (parentMonthlyValue / totalMonthly) * inflationRate;
        weightedInflationSum += weight;
      }
    });

    return `${weightedInflationSum.toFixed(1)}%`;
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle all categories expanded/collapsed
  const toggleAllCategories = () => {
    if (expandedCategory === "all") {
      setExpandedCategory(null);
    } else {
      setExpandedCategory("all");
    }
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    setStartDate(date);
    fetchInfoGroups(date, endDate);
    fetchSubGroupIndex(date, endDate);
  };

  // Handle end date change
  const handleEndDateChange = (date) => {
    setEndDate(date);
    fetchInfoGroups(startDate, date);
    fetchSubGroupIndex(startDate, date);
    fetchGroupPrices(date.getFullYear());
    fetchSubGroupWeights(date.getFullYear());
  };

  return (
    <div
      className={`shadow-md bpg_mrgvlovani_caps w-full ${darkMode ? 'bg-gray-900' : 'bg-white'}`}
      style={{ border: "1px solid #01389c" }}
    >
      {/* Error Modal */}
      {dateError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md mx-4 border border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
              {language === "GE" ? "შეცდომა" : "Error"}
            </h3>
            <p className="text-center text-gray-700 mb-6">{dateError}</p>
            <button
              onClick={() => setDateError("")}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {language === "GE" ? "დახურვა" : "Close"}
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <InfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          language={language}
        />
      )}

      {/* --- Everything in One Row --- */}
      <div
        className="w-full flex flex-col lg:flex-row justify-center gap-8 lg:gap-16 items-start lg:items-start bpg_mrgvlovani_caps px-4"
        style={{ color: darkMode ? "#fff" : "#333" }}
      >
        {/* Left Section: Time Period and Results */}
        <div className="flex flex-col">
          {/* --- Title --- */}
          <h2
            className="text-center"
            style={{ fontWeight: 700, fontSize: "16px", paddingTop: "10px", color: darkMode ? "#fff !important" : "#333" }}
          >
            {language === "GE" ? "დროის პერიოდი:" : "Time Period:"}
          </h2>
          <div className="w-full border-t border-gray-300 mt-2 mb-6"></div>

          {/* Date Inputs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-10 justify-center">
            {/* Start Date */}
            <div className="flex flex-col">
              <label className="mb-1 text-center" style={{ color: darkMode ? "#fff !important" : "#333" }}>
                {language === "GE" ? "საწყისი:" : "From:"}
              </label>

              <div className="flex border border-gray-400 rounded-lg overflow-hidden w-full sm:w-56 focus-within:border-blue-800 transition-colors"
                style={{ backgroundColor: darkMode ? "#374151" : "#fff" }}>
                <DatePicker
                  ref={startDateRef}
                  selected={startDate}
                  onChange={handleStartDateChange}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  className="px-3 py-2 w-full outline-none"
                  style={{ backgroundColor: darkMode ? "#374151" : "#fff", color: darkMode ? "#fff" : "#333" }}
                />

                <button
                  onClick={() => startDateRef.current?.setFocus()}
                  className="bg-blue-800 text-white px-4 flex items-center justify-center cursor-pointer hover:bg-blue-900 transition"
                >
                  <span className="text-xl">▦</span>
                </button>
              </div>
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="mb-1 text-center" style={{ color: darkMode ? "#fff !important" : "#333" }}>
                {language === "GE" ? "საბოლოო:" : "To:"}
              </label>

              <div className="flex border border-gray-400 rounded-lg overflow-hidden w-full sm:w-56 focus-within:border-blue-800 transition-colors"
                style={{ backgroundColor: darkMode ? "#374151" : "#fff" }}>
                <DatePicker
                  ref={endDateRef}
                  selected={endDate}
                  onChange={handleEndDateChange}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  className="px-3 py-2 w-full outline-none"
                  style={{ backgroundColor: darkMode ? "#374151" : "#fff", color: darkMode ? "#fff" : "#333" }}
                />

                <button
                  onClick={() => endDateRef.current?.setFocus()}
                  className="bg-blue-800 text-white px-4 flex items-center justify-center cursor-pointer hover:bg-blue-900 transition"
                >
                  <span className="text-xl">▦</span>
                </button>
              </div>
            </div>
          </div>

          {/* --- Results Title --- */}
          <h3 className="text-xl font-bold text-center py-2 mt-[-2rem]" style={{ color: darkMode ? "#fff !important" : "#333" }}>
            {language === "GE" ? "შედეგი:" : "Result:"}
          </h3>
          <div className="w-full border-t border-gray-300 mt-2 mb-2"></div>

          {/* --- Results Rows --- */}
          <div className="flex flex-col gap-5 items-start">
            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
              <span className="flex-1" style={{ color: darkMode ? "#fff !important" : "#333" }}>
                {language === "GE"
                  ? `ოფიციალური ინფლაციის მაჩვენებელი ${formatDate(
                      startDate
                    )} -დან ${formatDate(endDate)}`
                  : `Official inflation rate from ${formatDate(
                      startDate
                    )} to ${formatDate(endDate)}`}
              </span>

              <input
                className="border border-gray-400 rounded px-3 py-2 w-full sm:w-55 text-right bg-gray-50 focus:border-blue-800 focus:outline-none transition-colors"
                value={officialInflationRate}
                readOnly
                style={{ backgroundColor: darkMode ? "#374151" : "#f3f4f6", color: darkMode ? "#fff" : "#333" }}
              />
            </div>

            {/* Row 2 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
              <span className="flex-1 font-bold" style={{ color: darkMode ? "#fff !important" : "#333" }}>
                {language === "GE"
                  ? `პერსონალური ინფლაციის მაჩვენებელი ${formatDate(
                      startDate
                    )} -დან ${formatDate(endDate)}`
                  : `Personal inflation rate from ${formatDate(
                      startDate
                    )} to ${formatDate(endDate)}`}
              </span>

              <input
                className="border border-gray-400 rounded px-3 py-2 w-full sm:w-55 text-right focus:border-blue-800 focus:outline-none transition-colors"
                value={personalInflationRate}
                readOnly
                style={{ backgroundColor: darkMode ? "#374151" : "#f3f4f6", color: darkMode ? "#fff" : "#333" }}
              />
            </div>
          </div>
        </div>

        {/* Right Section: Image */}
        <a
          href="https://www.geostat.ge/personalinflation/pdf/samomkhmareblo%20kalatis%20metodologiis%20shesakheb%202024.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer flex justify-center lg:justify-start w-full lg:w-auto"
        >
          <img
            src={language === "GE" ? Kalata : Basket}
            className="w-full sm:w-64 lg:w-52 h-auto border rounded shadow mt-10 lg:mt-10 lg:ml-10 hover:opacity-90 transition-opacity max-w-xs"
            alt="cover"
          />
        </a>
      </div>

      <div className="mt-6 bg-[#01389c] text-white text-right px-4 py-4 text-sm font-medium flex items-center justify-end gap-1 w-full mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-white cursor-pointer text-sm font-medium"
          aria-label="Information"
        >
          <span>
            {language === "GE"
              ? "გაანგარიშების ინსტრუქცია"
              : "Calculation instruction"}
          </span>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
        </button>
      </div>

      {/* Table and Chart Section */}
      <div className="w-full flex flex-col lg:flex-row gap-6 mt-6 px-4">
        {/* Left Side: Expense Categories Table */}
        <div className="w-full lg:w-2/3 overflow-x-auto overflow-y-visible">
          <table className="w-full border-collapse text-[10px]">
            <thead className={`${darkMode ? 'bg-gray-800' : 'bg-[#01389c]'} text-white`}>
              <tr>
                <th className="px-1 py-1 text-left text-[10px] font-bold text-white">
                  <div className="flex items-center gap-1">
                    <span>
                      {language === "GE" ? "ჯგუფის დასახელება" : "Group Name"}
                    </span>
                    <InfoTooltip
                      align="left"
                      text={
                        language === "GE"
                          ? "დანიშნულების მიხედვით ინდივიდუალური მოხმარების კლასიფიკატორის (COICOP) ჯგუფის დასახელება"
                          : "Group name according to the Classification of Individual Consumption According to Purpose"
                      }
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllCategories();
                    }}
                    className="mt-1 w-full px-2 py-1 text-white rounded text-[9px] font-medium flex items-center justify-start"
                  >
                    <span
                      style={{
                        display: "inline-block",
                        transform: expandedCategory === "all" ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        fontSize: "14px",
                      }}
                    >
                      ▶▶
                    </span>
                    <InfoTooltip
                      text={
                        language === "GE"
                          ? "ყველას ჩაშლა / ყველას დახურვა"
                          : "Collapse all/Hide all"
                      }
                    />
                  </button>
                </th>
                <th className="px-1 py-1 text-center text-[10px] font-bold text-white">
                  <div className="flex items-center gap-1 justify-center">
                    <span>
                      {language === "GE"
                        ? "ფასების პროცენტული ცვლილება"
                        : "Percentage Change of Prices"}
                    </span>
                    <InfoTooltip
                      text={
                        language === "GE"
                          ? "ფასების პროცენტული ცვლილება არჩეულ პერიოდებს შორის"
                          : "Percentage change of the index"
                      }
                    />
                  </div>
                </th>
                <th className="px-1 py-1 text-center text-[10px] font-bold text-white">
                  <div className="flex items-center gap-1 justify-center">
                    <span>
                      {language === "GE"
                        ? "შინამეურნეობის საშუალო ხარჯი თვეში"
                        : "Average Monthly Expenditure of Household"}
                    </span>
                    <InfoTooltip
                      text={
                        language === "GE"
                          ? "საშუალო სიდიდის შინამეურნეობის (3,3 კაცი) ხარჯი თვეში"
                          : "Monthly expenditure of an average household (3.3 persons)"
                      }
                    />
                  </div>
                </th>
                <th className="px-1 py-1 text-center text-[10px] font-bold text-white">
                  <div className="flex items-center gap-1 justify-center">
                    <span>
                      {language === "GE"
                        ? "პერსონალური ხარჯი (ლარი) "
                        : "Personal Expenditure (GEL)"}
                    </span>
                    <InfoTooltip
                      align="right"
                      text={
                        language === "GE"
                          ? "მომხმარებლის მიერ თვეში ან წელიწადში გაწეული ხარჯი"
                          : "Annual or monthly expenditure amount"
                      }
                    />
                  </div>
                  <div className="flex justify-around mt-0.5 text-[9px] font-normal text-white">
                    <span>{language === "GE" ? "ყოველთვიური" : "Monthly"}</span>
                    <span>{language === "GE" ? "ყოველწლიური" : "Annual"}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} text-[10px]`}>
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-2 py-4 text-center"
                  >
                    {language === "GE" ? "იტვირთება..." : "Loading..."}
                  </td>
                </tr>
              ) : (
                <>
                  {categories.map((category) => (
                    <React.Fragment key={category.code}>
                      {/* Parent Category Row */}
                      <tr
                        className={`${darkMode ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-gray-50 bg-white'} cursor-pointer`}
                        onClick={() => {
                          setExpandedCategory(
                            expandedCategory === category.code
                              ? null
                              : category.code
                          );
                        }}
                      >
                        <td
                          className="px-2 py-2"
                          style={{ color: darkMode ? "#fff" : "#333" }}
                        >
                          <span className="font-medium flex items-center gap-2">
                            <span
                              className="transform transition-transform"
                              style={{
                                display: "inline-block",
                                transform:
                                  expandedCategory === category.code
                                    ? "rotate(90deg)"
                                    : "rotate(0deg)",
                                color: "#01389c",
                              }}
                            >
                              ▶▶
                            </span>
                            {language === "GE"
                              ? category.name_geo
                              : category.name_en}
                          </span>
                        </td>
                        <td
                          className="px-2 py-2 text-right"
                          style={{ color: darkMode ? "#fff" : "#333" }}
                        >
                          {groupData[`Group${category.code}`] !== undefined
                            ? `${groupData[`Group${category.code}`]}%`
                            : "0%"}
                        </td>
                        <td
                          className="px-2 py-2 text-right"
                          style={{ color: darkMode ? "#fff" : "#333" }}
                          id={`parent-avg-${category.code}`}
                        >
                          {groupPrices[`Group${category.code}`] !== undefined
                            ? `${parseFloat(groupPrices[`Group${category.code}`]).toFixed(2)} ₾`
                            : "0 ₾"}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="0"
                              className={`border border-gray-400 rounded px-2 py-1 w-1/2 text-right parent-monthly-${category.code}`}
                              style={{ color: darkMode ? "#fff" : "#333", backgroundColor: darkMode ? "#514137" : "#fff" }}
                              onClick={(e) => e.stopPropagation()}
                              id={`parent-monthly-${category.code}`}
                              onChange={(e) => {
                                const monthly = parseFloat(e.target.value) || 0;
                                const yearlyInput = e.target.nextSibling;
                                if (yearlyInput)
                                  yearlyInput.value = (monthly * 12).toFixed(2);

                                // Update subcategory values based on weights
                                if (category.subcategories) {
                                  category.subcategories.forEach((sub) => {
                                    const weightKey = `grp${category.code}sub${sub.code % 10}`;
                                    const weight = subGroupWeights[weightKey] || 1;
                                    const subMonthlyValue = monthly * weight;
                                    const subYearlyValue = subMonthlyValue * 12;

                                    // Update subcategory monthly input
                                    const subMonthlyInput = document.querySelector(`.sub-monthly-${sub.code}`);
                                    if (subMonthlyInput) {
                                      subMonthlyInput.value = subMonthlyValue.toFixed(2);
                                    }

                                    // Update subcategory yearly input
                                    const subYearlyInput = document.querySelector(`.sub-yearly-${sub.code}`);
                                    if (subYearlyInput) {
                                      subYearlyInput.value = subYearlyValue.toFixed(2);
                                    }
                                  });
                                }

                                updateTotal();
                                setPersonalInflationRate(calculatePersonalInflationRate());
                              }}
                            />
                            <input
                              type="number"
                              min="0"
                              className={`border border-gray-400 rounded px-2 py-1 w-1/2 text-right parent-yearly-${category.code}`}
                              style={{ color: darkMode ? "#fff" : "#333", backgroundColor: darkMode ? "#374151" : "#fff" }}
                              onClick={(e) => e.stopPropagation()}
                              id={`parent-yearly-${category.code}`}
                              onChange={(e) => {
                                const yearly = parseFloat(e.target.value) || 0;
                                const monthlyInput = e.target.previousSibling;
                                if (monthlyInput)
                                  monthlyInput.value = (yearly / 12).toFixed();

                                // Update subcategory values based on weights
                                if (category.subcategories) {
                                  category.subcategories.forEach((sub) => {
                                    const weightKey = `grp${category.code}sub${sub.code % 10}`;
                                    const weight = subGroupWeights[weightKey] || 1;
                                    const subYearlyValue = yearly * weight;
                                    const subMonthlyValue = subYearlyValue / 12;

                                    // Update subcategory monthly input
                                    const subMonthlyInput = document.querySelector(`.sub-monthly-${sub.code}`);
                                    if (subMonthlyInput) {
                                      subMonthlyInput.value = subMonthlyValue.toFixed(2);
                                    }

                                    // Update subcategory yearly input
                                    const subYearlyInput = document.querySelector(`.sub-yearly-${sub.code}`);
                                    if (subYearlyInput) {
                                      subYearlyInput.value = subYearlyValue.toFixed(2);
                                    }
                                  });
                                }

                                updateTotal();
                                setPersonalInflationRate(calculatePersonalInflationRate());
                              }}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Subcategories (kept in DOM, hidden when collapsed) */}
                      {category.subcategories &&
                        category.subcategories.map((sub) => (
                          <tr
                            key={sub.code}
                            className="hover:bg-gray-50 bg-gray-50"
                            style={{
                              display:
                                expandedCategory === category.code || expandedCategory === "all"
                                  ? ""
                                  : "none",
                            }}
                          >
                            <td
                              className="px-2 py-2 pl-8"
                              style={{ color: darkMode ? "#fff" : "#333" }}
                            >
                              <span className="text-[9px]">
                                {language === "GE" ? sub.name_geo : sub.name_en}
                              </span>
                            </td>
                            <td
                              className="px-2 py-2 text-right"
                              style={{ color: darkMode ? "#fff" : "#333" }}
                            >
                              {subGroupData[`grp${category.code}sub${sub.code % 10}`] !== undefined
                                ? `${subGroupData[`grp${category.code}sub${sub.code % 10}`]}%`
                                : "0%"}
                            </td>
                            <td
                              className="px-2 py-2 text-right"
                              style={{ color: darkMode ? "#fff" : "#333" }}
                            >
                              {subCategoryPrices[`grp${category.code}sub${sub.code % 10}`] !== undefined
                                ? `${subCategoryPrices[`grp${category.code}sub${sub.code % 10}`].toFixed(2)} ₾`
                                : "0 ₾"}
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  className={`border border-gray-400 rounded px-2 py-1 w-1/2 text-right text-[9px] sub-monthly-${sub.code}`}
                                  style={{ color: darkMode ? "#fff" : "#333", backgroundColor: darkMode ? "#374151" : "#fff" }}
                                  onChange={(e) => {
                                    const monthly = parseFloat(e.target.value) || 0;
                                    const yearlyInput = e.target.nextSibling;
                                    if (yearlyInput)
                                      yearlyInput.value = (monthly * 12).toFixed(2);

                                    // Update parent monthly value to sum of all subcategory monthly values
                                    const parentMonthlyInput = document.querySelector(`#parent-monthly-${category.code}`);
                                    if (parentMonthlyInput && category.subcategories) {
                                      let totalMonthly = 0;
                                      category.subcategories.forEach((sub) => {
                                        const subMonthlyInput = document.querySelector(`.sub-monthly-${sub.code}`);
                                        if (subMonthlyInput) {
                                          totalMonthly += parseFloat(subMonthlyInput.value) || 0;
                                        }
                                      });
                                      parentMonthlyInput.value = totalMonthly.toFixed(2);

                                      // Also update parent yearly
                                      const parentYearlyInput = document.querySelector(`#parent-yearly-${category.code}`);
                                      if (parentYearlyInput) {
                                        parentYearlyInput.value = (totalMonthly * 12).toFixed(2);
                                      }
                                    }
                                    updateTotal();
                                    setPersonalInflationRate(calculatePersonalInflationRate());
                                  }}
                                />
                                <input
                                  type="number"
                                  min="0"
                                  className={`border border-gray-400 rounded px-2 py-1 w-1/2 text-right text-[9px] sub-yearly-${sub.code}`}
                                  style={{ color: darkMode ? "#fff" : "#333", backgroundColor: darkMode ? "#374151" : "#fff" }}
                                  onChange={(e) => {
                                    const yearly = parseFloat(e.target.value) || 0;
                                    const monthlyInput = e.target.previousSibling;
                                    if (monthlyInput)
                                      monthlyInput.value = (yearly / 12).toFixed(2);

                                    // Update parent yearly value to sum of all subcategory yearly values
                                    const parentYearlyInput = document.querySelector(`#parent-yearly-${category.code}`);
                                    if (parentYearlyInput && category.subcategories) {
                                      let totalYearly = 0;
                                      category.subcategories.forEach((sub) => {
                                        const subYearlyInput = document.querySelector(`.sub-yearly-${sub.code}`);
                                        if (subYearlyInput) {
                                          totalYearly += parseFloat(subYearlyInput.value) || 0;
                                        }
                                      });
                                      parentYearlyInput.value = totalYearly.toFixed(2);

                                      // Also update parent monthly
                                      const parentMonthlyInput = document.querySelector(`#parent-monthly-${category.code}`);
                                      if (parentMonthlyInput) {
                                        parentMonthlyInput.value = (totalYearly / 12).toFixed(2);
                                      }
                                    }
                                    updateTotal();
                                    setPersonalInflationRate(calculatePersonalInflationRate());
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}

                  {/* Total Row */}
                  <tr className={`${darkMode ? 'bg-gray-700' : 'bg-[#01389c]'} text-white font-bold`}>
                    <td className="px-2 py-2" style={{ color: "white" }}>
                      {language === "GE" ? "სულ" : "Total"}
                    </td>
                    <td className="px-2 py-2"></td>
                    <td
                      className="px-2 py-2 text-right"
                      id="total-avg"
                      style={{ color: "white" }}
                    >
                      {getTotalGroupPrices().toFixed(1)} ₾
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={totalMonthlySum.toFixed(1)}
                          readOnly
                          className="border border-gray-400 rounded px-2 py-1 w-27 text-right total-monthly"
                          style={{ color: darkMode ? "#fff" : "#333", backgroundColor: darkMode ? "#374151" : "#fff" }}
                          id="total-monthly"
                        />
                        <input
                          type="text"
                          value={totalYearlySum.toFixed(1)}
                          readOnly
                          className="border border-gray-400 rounded px-2 py-1 w-27 text-right total-yearly"
                          style={{ color: darkMode ? "#fff" : "#333", backgroundColor: darkMode ? "#374151" : "#fff" }}
                          id="total-yearly"
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
          <div className="w-full flex items-center justify-between px-1 py-1 mt-1 mb-1">
            <a
              href="#"
              className="flex items-center gap-2 text-[#01389c] hover:opacity-80 transition"
            >
              <img src={PdfIcon} alt="PDF" className="w-8 h-8" />
            </a>
            <button
              onClick={handleClear}
              className="bg-white border border-[#01389c] text-[#01389c] px-6 py-2 rounded hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <span className="text-lg">»</span>
              {language === "GE" ? "გასუფთავება" : "Clear"}
            </button>
          </div>
        </div>

        {/* Right Side: Charts */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Column Chart */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded p-2`}>
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: "column",
                  height: 320,
                  spacingTop: 10,
                  spacingBottom: 50,
                },
                title: {
                  text:
                    language === "GE"
                      ? "ჯგუფების წილი მთლიან ხარჯებში 2025"
                      : "Share of Group in Total Expenses 2025",
                  style: {
                    fontSize: "11px",
                    fontFamily: "bpg_mrgvlovani_caps",
                    fontWeight: "bold",
                  },
                  margin: 15,
                },
                xAxis: {
                  categories: categories.map((cat) =>
                    language === "GE" ? cat.name_geo : cat.name_en
                  ),
                  labels: {
                    style: {
                      fontFamily: "bpg_mrgvlovani_caps",
                      fontSize: "8px",
                    },
                    rotation: -45,
                    align: "right",
                  },
                },
                yAxis: {
                  title: {
                    text: "წონა",
                    style: {
                      fontFamily: "bpg_mrgvlovani_caps",
                      fontSize: "10px",
                    },
                  },
                  labels: {
                    format: "{value}%",
                    style: {
                      fontFamily: "bpg_mrgvlovani_caps",
                      fontSize: "9px",
                    },
                  },
                },
                legend: {
                  itemStyle: {
                    fontFamily: "bpg_mrgvlovani_caps",
                    fontSize: "9px",
                  },
                  symbolHeight: 8,
                  symbolWidth: 8,
                  symbolRadius: 2,
                  itemDistance: 30,
                },
                plotOptions: {
                  column: {
                    pointPadding: 0.1,
                    borderWidth: 0,
                    groupPadding: 0.15,
                  },
                },
                series: [
                  {
                    name: language === "GE" ? "პერსონალური" : "Personal",
                    data: [],
                    color: "#a6d5ff",
                    tooltip: {
                      valueSuffix: "%",
                    },
                  },
                  {
                    name: language === "GE" ? "ოფიციალური" : "Official",
                    data: [
                      34.5, 6.4, 4.7, 9.8, 4.3, 4.0, 8.9, 3.1, 6.5, 1.8, 9.5,
                      3.2,
                    ],
                    color: "#eb695c",
                    tooltip: {
                      valueSuffix: "%",
                    },
                  },
                ],
                credits: {
                  enabled: false,
                },
              }}
            />
          </div>

          {/* Line Chart */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} border rounded p-2`}>
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: "line",
                  height: 300,
                  spacingTop: 15,
                  spacingBottom: 10,
                },
                title: {
                  text:
                    language === "GE"
                      ? "ინფლაცია წინა წლის<br/>შესაბამის თვესთან შედარებით"
                      : "Inflation Compared to<br/>Same Month Last Year",
                  style: {
                    fontSize: "11px",
                    fontFamily: "bpg_mrgvlovani_caps",
                    fontWeight: "bold",
                  },
                  margin: 20,
                  useHTML: true,
                },
                xAxis: {
                  categories: [
                    "2024/01",
                    "2024/06",
                    "2024/11",
                    "2025/05",
                    "2025/11",
                  ],
                  labels: {
                    style: {
                      fontFamily: "bpg_mrgvlovani_caps",
                      fontSize: "10px",
                    },
                  },
                },
                yAxis: {
                  title: {
                    text: "",
                    style: {
                      fontFamily: "bpg_mrgvlovani_caps",
                      fontSize: "10px",
                    },
                  },
                  labels: {
                    format: "{value}%",
                    style: {
                      fontFamily: "bpg_mrgvlovani_caps",
                      fontSize: "9px",
                    },
                  },
                },
                legend: {
                  itemStyle: {
                    fontFamily: "bpg_mrgvlovani_caps",
                    fontSize: "9px",
                  },
                  symbolHeight: 8,
                  symbolWidth: 8,
                  symbolRadius: 2,
                  itemDistance: 30,
                },
                plotOptions: {
                  line: {
                    lineWidth: 2,
                    marker: {
                      radius: 3,
                    },
                  },
                },
                series: [
                  {
                    name: language === "GE" ? "პერსონალური" : "Personal",
                    data: [3.5, 4.2, 4.8, 5.1, 4.8],
                    color: "#a6d5ff",
                    tooltip: {
                      valueSuffix: "%",
                    },
                  },
                  {
                    name: language === "GE" ? "ოფიციალური" : "Official",
                    data: [4.0, 4.5, 5.0, 5.3, 5.0],
                    color: "#eb695c",
                    tooltip: {
                      valueSuffix: "%",
                    },
                  },
                ],
                credits: {
                  enabled: false,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>

  );
};

export default Page;
