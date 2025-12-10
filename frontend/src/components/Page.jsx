import React, { useState, useEffect, useRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker-custom.css";
import Kalata from "../assets/images/Kalata.jpg";
import Basket from "../assets/images/Basket.jpg";



const Page = ({ language }) => {
  const [startDate, setStartDate] = useState(new Date(2024, 10)); // November 2024
  const [endDate, setEndDate] = useState(new Date(2025, 10)); // November 2025
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const [dateError, setDateError] = useState("");

  // Format date to display as YYYY/MM
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
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

  return (
    <div className="w-full flex flex-col items-center mt-6 bpg_mrgvlovani_caps">

      {/* Error Modal */}
      {dateError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md mx-4 border border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{language === "GE" ? "შეცდომა" : "Error"}</h3>
            <p className="text-center text-gray-700 mb-6">
              {dateError}
            </p>
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
      <div className="w-full flex flex-col lg:flex-row justify-center gap-8 lg:gap-16 items-start lg:items-start bpg_mrgvlovani_caps px-4" style={{ color: '#333' }}>
        {/* Left Section: Time Period and Results */}
        <div className="flex flex-col">
          {/* --- Title --- */}
          <h2 className="text-center" style={{ fontWeight: 700, fontSize: '16px' }}>
            {language === "GE" ? "დროის პერიოდი:" : "Time Period:"}
          </h2>
          <div className="w-full border-t border-gray-300 mt-2 mb-6"></div>

          {/* Date Inputs */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-10 justify-center">
            {/* Start Date */}
            <div className="flex flex-col">
              <label className="mb-1 text-center">{language === "GE" ? "საწყისი:" : "From:"}</label>

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
              <label className="mb-1 text-center">{language === "GE" ? "საბოლოო:" : "To:"}</label>

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
          <h3 className="text-xl font-bold text-center py-2 mt-[-2rem]">{language === "GE" ? "შედეგი:" : "Result:"}</h3>
          <div className="w-full border-t border-gray-300 mt-2 mb-2"></div>

          {/* --- Results Rows --- */}
          <div className="flex flex-col gap-5 items-start">

            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
              <span className="flex-1">
                {language === "GE"
                  ? `ოფიციალური ინფლაციის მაჩვენებელი ${formatDate(startDate)} -დან ${formatDate(endDate)}`
                  : `Official inflation rate from ${formatDate(startDate)} to ${formatDate(endDate)}`}
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
                  ? `პერსონალური ინფლაციის მაჩვენებელი ${formatDate(startDate)} -დან ${formatDate(endDate)}`
                  : `Personal inflation rate from ${formatDate(startDate)} to ${formatDate(endDate)}`}
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
    </div>
  );
};

export default Page;
