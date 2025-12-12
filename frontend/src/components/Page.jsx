import React, { useState, useEffect, useRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import Kalata from "../assets/images/Kalata.jpg";
import Basket from "../assets/images/Basket.jpg";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Page = ({ language }) => {
  const [startDate, setStartDate] = useState(new Date(2024, 10)); // November 2024
  const [endDate, setEndDate] = useState(new Date(2025, 10)); // November 2025
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const [dateError, setDateError] = useState("");
  const [expandedCategory, setExpandedCategory] = useState(null);

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

  // Function to update total values
  const updateTotal = () => {
    setTimeout(() => {
      const parentMonthly = parseFloat(document.getElementById('parent-monthly')?.value) || 0;
      const parentYearly = parseFloat(document.getElementById('parent-yearly')?.value) || 0;
      const foodMonthly = parseFloat(document.querySelector('.food-monthly')?.value) || 0;
      const foodYearly = parseFloat(document.querySelector('.food-yearly')?.value) || 0;
      const beveragesMonthly = parseFloat(document.querySelector('.beverages-monthly')?.value) || 0;
      const beveragesYearly = parseFloat(document.querySelector('.beverages-yearly')?.value) || 0;

      const totalMonthly = parentMonthly + foodMonthly + beveragesMonthly;
      const totalYearly = parentYearly + foodYearly + beveragesYearly;

      const totalMonthlyInput = document.getElementById('total-monthly');
      const totalYearlyInput = document.getElementById('total-yearly');
      const totalAvgCell = document.getElementById('total-avg');
      const parentAvgCell = document.getElementById('parent-avg');

      if (totalMonthlyInput) totalMonthlyInput.value = totalMonthly.toFixed(2);
      if (totalYearlyInput) totalYearlyInput.value = totalYearly.toFixed(2);

      // Calculate parent average from subcategories
      const foodAvg = 991.00;
      const beveragesAvg = 86.06;
      const parentAvg = foodAvg + beveragesAvg;
      if (parentAvgCell) parentAvgCell.textContent = parentAvg.toFixed(2) + ' ₾';

      // Calculate total average expense
      const totalAvg = parentAvg;
      if (totalAvgCell) totalAvgCell.textContent = totalAvg.toFixed(2) + ' ₾';
    }, 0);
  };

  return (
    <div
      className="bg-white shadow-md bpg_mrgvlovani_caps w-full"
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

      {/* --- Everything in One Row --- */}
      <div
        className="w-full flex flex-col lg:flex-row justify-center gap-8 lg:gap-16 items-start lg:items-start bpg_mrgvlovani_caps px-4"
        style={{ color: "#333" }}
      >
        {/* Left Section: Time Period and Results */}
        <div className="flex flex-col">
          {/* --- Title --- */}
          <h2
            className="text-center"
            style={{ fontWeight: 700, fontSize: "16px", paddingTop: "10px" }}
          >
            {language === "GE" ? "დროის პერიოდი:" : "Time Period:"}
          </h2>
          <div className="w-full border-t border-gray-300 mt-2 mb-6"></div>

          {/* Date Inputs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-10 justify-center">
            {/* Start Date */}
            <div className="flex flex-col">
              <label className="mb-1 text-center">
                {language === "GE" ? "საწყისი:" : "From:"}
              </label>

              <div className="flex border border-gray-400 rounded-lg overflow-hidden w-full sm:w-56 focus-within:border-blue-800 transition-colors">
                <DatePicker
                  ref={startDateRef}
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  className="px-3 py-2 w-full outline-none"
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
              <label className="mb-1 text-center">
                {language === "GE" ? "საბოლოო:" : "To:"}
              </label>

              <div className="flex border border-gray-400 rounded-lg overflow-hidden w-full sm:w-56 focus-within:border-blue-800 transition-colors">
                <DatePicker
                  ref={endDateRef}
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  className="px-3 py-2 w-full outline-none"
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
          <h3 className="text-xl font-bold text-center py-2 mt-[-2rem]">
            {language === "GE" ? "შედეგი:" : "Result:"}
          </h3>
          <div className="w-full border-t border-gray-300 mt-2 mb-2"></div>

          {/* --- Results Rows --- */}
          <div className="flex flex-col gap-5 items-start">
            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
              <span className="flex-1">
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
                value="4.8%"
                readOnly
              />
            </div>

            {/* Row 2 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
              <span className="flex-1 font-bold">
                {language === "GE"
                  ? `პერსონალური ინფლაციის მაჩვენებელი ${formatDate(
                      startDate
                    )} -დან ${formatDate(endDate)}`
                  : `Personal inflation rate from ${formatDate(
                      startDate
                    )} to ${formatDate(endDate)}`}
              </span>

              <input
                className="border border-gray-400 rounded px-3 py-2 w-full sm:w-55 text-right bg-gray-50 focus:border-blue-800 focus:outline-none transition-colors"
                value="0%"
                readOnly
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
            className="w-full sm:w-64 lg:w-52 h-auto border rounded shadow mt-5 lg:mt-5 lg:ml-10 hover:opacity-90 transition-opacity max-w-xs"
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
        <div className="w-full lg:w-2/3 overflow-x-auto">
          <table className="w-full border-collapse text-[10px]">
            <thead className="bg-[#01389c] text-white">
              <tr>
                <th className="border border-gray-300 px-1 py-1 text-left text-[10px] font-bold text-white">
                  {language === "GE" ? "ჯგუფის დასახელება" : "Group"}
                </th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px] font-bold text-white">
                  {language === "GE" ? "ფასების პროცენტული ცვლილება" : "Ch. %"}
                </th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px] font-bold text-white">
                  {language === "GE"
                    ? "შინამეურნეობისსაშუალო ხარჯი თვეში"
                    : "Avg"}
                </th>
                <th className="border border-gray-300 px-1 py-1 text-center text-[10px] font-bold text-white">
                  <div>
                    {language === "GE" ? "პერსონალური ხარჯი (ლარი) " : "Pers."}
                  </div>
                  <div className="flex justify-around mt-0.5 text-[9px] font-normal text-white">
                    <span>{language === "GE" ? "ყოველთვიური" : "Mo"}</span>
                    <span>{language === "GE" ? "ყოველწლიური" : "Yr"}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white text-[10px]">
              {/* Food and Non-Alcoholic Beverages */}
              <tr
                className="hover:bg-gray-50 cursor-pointer bg-white"
                onClick={() => setExpandedCategory(expandedCategory === 'food' ? null : 'food')}
              >
                <td
                  className="border border-gray-300 px-2 py-2"
                  style={{ color: "#333" }}
                >
                  <span className="font-medium flex items-center gap-2">
                    <span className="transform transition-transform" style={{ display: 'inline-block', transform: expandedCategory === 'food' ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      ▶
                    </span>
                    {language === "GE"
                      ? "სურსათი და უალკოჰოლო სასმელები"
                      : "Food and Non-Alcoholic Beverages"}
                  </span>
                </td>
                <td
                  className="border border-gray-300 px-2 py-2 text-right"
                  style={{ color: "#333" }}
                >
                  10.3%
                </td>
                <td
                  className="border border-gray-300 px-2 py-2 text-right"
                  style={{ color: "#333" }}
                  id="parent-avg"
                >
                  1077.07 ₾
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right parent-monthly"
                      style={{ color: "#333" }}
                      onClick={(e) => e.stopPropagation()}
                      id="parent-monthly"
                      onChange={(e) => {
                        const monthly = parseFloat(e.target.value) || 0;
                        const yearlyInput = e.target.nextSibling;
                        if (yearlyInput) yearlyInput.value = (monthly * 12).toFixed(2);
                        updateTotal();
                      }}
                    />
                    <input
                      type="number"
                      min="0"
                      className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right parent-yearly"
                      style={{ color: "#333" }}
                      onClick={(e) => e.stopPropagation()}
                      id="parent-yearly"
                      onChange={(e) => {
                        const yearly = parseFloat(e.target.value) || 0;
                        const monthlyInput = e.target.previousSibling;
                        if (monthlyInput) monthlyInput.value = (yearly / 12).toFixed(2);
                        updateTotal();
                      }}
                    />
                  </div>
                </td>
              </tr>

              {/* Subcategories - Food */}
              {expandedCategory === 'food' && (
                <>
                  <tr className="hover:bg-gray-50 bg-gray-50">
                    <td
                      className="border border-gray-300 px-2 py-2 pl-8"
                      style={{ color: "#333" }}
                    >
                      <span className="text-[9px]">
                        {language === "GE" ? "სურსათი" : "Food"}
                      </span>
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-right"
                      style={{ color: "#333" }}
                    >
                      10.3%
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-right"
                      style={{ color: "#333" }}
                    >
                      991.00 ₾
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right text-[9px] food-monthly"
                          style={{ color: "#333" }}
                          onChange={(e) => {
                            const monthly = parseFloat(e.target.value) || 0;
                            const yearlyInput = e.target.nextSibling;
                            if (yearlyInput) yearlyInput.value = (monthly * 12).toFixed(2);
                            updateTotal();
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right text-[9px] food-yearly"
                          style={{ color: "#333" }}
                          onChange={(e) => {
                            const yearly = parseFloat(e.target.value) || 0;
                            const monthlyInput = e.target.previousSibling;
                            if (monthlyInput) monthlyInput.value = (yearly / 12).toFixed(2);
                            updateTotal();
                          }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50 bg-gray-50">
                    <td
                      className="border border-gray-300 px-2 py-2 pl-8"
                      style={{ color: "#333" }}
                    >
                      <span className="text-[9px]">
                        {language === "GE" ? "უალკოჰოლო სასმელები" : "Non-Alcoholic Beverages"}
                      </span>
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-right"
                      style={{ color: "#333" }}
                    >
                      9.7%
                    </td>
                    <td
                      className="border border-gray-300 px-2 py-2 text-right"
                      style={{ color: "#333" }}
                    >
                      86.06 ₾
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right text-[9px] beverages-monthly"
                          style={{ color: "#333" }}
                          onChange={(e) => {
                            const monthly = parseFloat(e.target.value) || 0;
                            const yearlyInput = e.target.nextSibling;
                            if (yearlyInput) yearlyInput.value = (monthly * 12).toFixed(2);
                            updateTotal();
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right text-[9px] beverages-yearly"
                          style={{ color: "#333" }}
                          onChange={(e) => {
                            const yearly = parseFloat(e.target.value) || 0;
                            const monthlyInput = e.target.previousSibling;
                            if (monthlyInput) monthlyInput.value = (yearly / 12).toFixed(2);
                            updateTotal();
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                </>
              )}
              {/* Total Row */}
              <tr className="bg-[#01389c] text-white font-bold">
                <td className="border border-gray-300 px-2 py-2">
                  {language === "GE" ? "სულ" : "Total"}
                </td>
                <td className="border border-gray-300 px-2 py-2"></td>
                <td className="border border-gray-300 px-2 py-2 text-right" id="total-avg">
                  2154.13 ₾
                </td>
                <td className="border border-gray-300 px-2 py-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="0"
                      readOnly
                      className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right bg-white total-monthly"
                      style={{ color: "#333" }}
                      id="total-monthly"
                    />
                    <input
                      type="text"
                      value="0"
                      readOnly
                      className="border border-gray-400 rounded px-2 py-1 w-1/2 text-right bg-white total-yearly"
                      style={{ color: "#333" }}
                      id="total-yearly"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Side: Charts */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Column Chart */}
          <div className="bg-white border border-gray-300 rounded p-2">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: 'column',
                  height: 320,
                  spacingTop: 10,
                  spacingBottom: 50
                },
                title: {
                  text: language === "GE" ? 'ჯგუფების წილი მთლიან ხარჯებში 2025' : 'Share of Group in Total Expenses 2025',
                  style: {
                    fontSize: '11px',
                    fontFamily: 'bpg_mrgvlovani_caps',
                    fontWeight: 'bold'
                  },
                  margin: 15
                },
                xAxis: {
                  categories: [
                    language === "GE" ? 'სურსათი' : 'Food',
                    language === "GE" ? 'სასმელები' : 'Beverages',
                    language === "GE" ? 'ტანსაცმელი' : 'Clothing',
                    language === "GE" ? 'საცხოვრებელი' : 'Housing',
                    language === "GE" ? 'ავეჯი' : 'Furniture',
                    language === "GE" ? 'ჯანდაცვა' : 'Health',
                    language === "GE" ? 'ტრანსპორტი' : 'Transport',
                    language === "GE" ? 'კავშირგაბმულობა' : 'Communication',
                    language === "GE" ? 'დასვენება' : 'Recreation',
                    language === "GE" ? 'განათლება' : 'Education',
                    language === "GE" ? 'რესტორანი' : 'Restaurant',
                    language === "GE" ? 'სხვა' : 'Other'
                  ],
                  labels: {
                    style: {
                      fontFamily: 'bpg_mrgvlovani_caps',
                      fontSize: '8px'
                    },
                    rotation: -45,
                    align: 'right'
                  }
                },
                yAxis: {
                  title: {
                    text: '%',
                    style: {
                      fontFamily: 'bpg_mrgvlovani_caps',
                      fontSize: '10px'
                    }
                  },
                  labels: {
                    format: '{value}%',
                    style: {
                      fontFamily: 'bpg_mrgvlovani_caps',
                      fontSize: '9px'
                    }
                  }
                },
                legend: {
                  itemStyle: {
                    fontFamily: 'bpg_mrgvlovani_caps',
                    fontSize: '9px'
                  },
                  symbolHeight: 8,
                  symbolWidth: 8,
                  symbolRadius: 2,
                  itemDistance: 30
                },
                plotOptions: {
                  column: {
                    pointPadding: 0.1,
                    borderWidth: 0,
                    groupPadding: 0.15
                  }
                },
                series: [{
                  name: language === "GE" ? 'პერსონალური' : 'Personal',
                  data: [],
                  color: '#01389c',
                  tooltip: {
                    valueSuffix: '%'
                  }
                }, {
                  name: language === "GE" ? 'ოფიციალური' : 'Official',
                  data: [91.70, 8.30, 5.5, 11.8, 4.3, 4.0, 8.9, 3.1, 6.5, 1.8, 9.5, 3.2],
                  color: '#e74c3c',
                  tooltip: {
                    valueSuffix: '%'
                  }
                }],
                credits: {
                  enabled: false
                }
              }}
            />
          </div>

          {/* Line Chart */}
          <div className="bg-white border border-gray-300 rounded p-2">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: 'line',
                  height: 300,
                  spacingTop: 15,
                  spacingBottom: 10
                },
                title: {
                  text: language === "GE" ? 'ინფლაცია წინა წლის<br/>შესაბამის თვესთან შედარებით' : 'Inflation Compared to<br/>Same Month Last Year',
                  style: {
                    fontSize: '11px',
                    fontFamily: 'bpg_mrgvlovani_caps',
                    fontWeight: 'bold'
                  },
                  margin: 20,
                  useHTML: true
                },
                xAxis: {
                  categories: ['2024/01', '2024/06', '2024/11', '2025/05', '2025/11'],
                  labels: {
                    style: {
                      fontFamily: 'bpg_mrgvlovani_caps',
                      fontSize: '10px'
                    }
                  }
                },
                yAxis: {
                  title: {
                    text: '%',
                    style: {
                      fontFamily: 'bpg_mrgvlovani_caps',
                      fontSize: '10px'
                    }
                  },
                  labels: {
                    format: '{value}%',
                    style: {
                      fontFamily: 'bpg_mrgvlovani_caps',
                      fontSize: '9px'
                    }
                  }
                },
                legend: {
                  itemStyle: {
                    fontFamily: 'bpg_mrgvlovani_caps',
                    fontSize: '9px'
                  },
                  symbolHeight: 8,
                  symbolWidth: 8,
                  symbolRadius: 2,
                  itemDistance: 30
                },
                plotOptions: {
                  line: {
                    lineWidth: 2,
                    marker: {
                      radius: 3
                    }
                  }
                },
                series: [{
                  name: language === "GE" ? 'პერსონალური' : 'Personal',
                  data: [3.5, 4.2, 4.8, 5.1, 4.8],
                  color: '#01389c',
                  tooltip: {
                    valueSuffix: '%'
                  }
                }, {
                  name: language === "GE" ? 'ოფიციალური' : 'Official',
                  data: [4.0, 4.5, 5.0, 5.3, 5.0],
                  color: '#e74c3c',
                  tooltip: {
                    valueSuffix: '%'
                  }
                }],
                credits: {
                  enabled: false
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="w-full flex justify-start items-center gap-4 px-4 py-4 mb-4">
        <a
          href="#"
          className="flex items-center gap-2 text-[#01389c] hover:opacity-80 transition"
        >
          <span className="text-2xl">📄</span>
          <span className="text-sm font-medium">PDF</span>
        </a>

        <button className="bg-white border border-[#01389c] text-[#01389c] px-6 py-2 rounded hover:bg-gray-50 transition text-sm font-medium flex items-center gap-2">
          <span className="text-lg">»</span>
          {language === "GE" ? "გასუფთავება" : "Clear"}
        </button>
      </div>
    </div>
  );
};

export default Page;
