import React, { useEffect, useRef, useCallback } from "react";

const SoundManager = ({
  soundEnabled,
  language = "GE",
  startYear,
  startMonth,
  endYear,
  endMonth,
  calculatedValue,
  amount,
  monthsWithShi,
  monthsWithTan,
}) => {
  const currentAudioRef = useRef(null);

  const playText = useCallback(
    (text) => {
      if (!soundEnabled || !text) return;
      try {
        const langParam = language === "GE" ? "ka" : "en";
        const url = `http://localhost:5000/api/tts?text=${encodeURIComponent(
          text
        )}&lang=${langParam}`;

        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }

        const audio = new Audio(url);
        currentAudioRef.current = audio;
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {
        console.error("TTS error:", e);
      }
    },
    [soundEnabled, language]
  );

  useEffect(() => {
    window.playText = playText;
    return () => {
      window.playText = null;
    };
  }, [playText]);

  useEffect(() => {
    if (soundEnabled) document.body.classList.add("sound");
    else document.body.classList.remove("sound");
  }, [soundEnabled]);

  useEffect(() => {
    const onFocusIn = (e) => {
      if (!soundEnabled) return;
      let t = e.target;
      if (!t) return;

      // Ensure we have an Element (not a text node)
      if (t.nodeType !== 1 && t.parentElement) t = t.parentElement;

      // Find nearest ancestor element with an id (closest polyfill / fallback)
      const findNearestWithId = (node) => {
        let n = node;
        while (n && n.nodeType === 1) {
          if (n.id) return n;
          n = n.parentElement;
        }
        return null;
      };
      const nearestWithId =
        t.closest && typeof t.closest === "function"
          ? t.closest("[id]")
          : findNearestWithId(t);

      // If focus is on a container, try to find a child with specific ids (e.g., resultText or Note)
      const childResult =
        !nearestWithId && t.querySelector
          ? t.querySelector("#resultText,#resultTexts, #Note")
          : null;

      const targetElem = nearestWithId || childResult || t;
      const id = (targetElem && targetElem.id) || "";

      switch (id) {
        case "titletext":
          playText(
            language === "GE"
              ? "პერსონალური ინფლაციის კალკულატორი"
              : "Consumer Price Index Calculator"
          );
          break;
        default:
          const text = (t.innerText || t.textContent || "")
            .replace(/\s+/g, " ")
            .trim();
          if (text) playText(text);
      }
    };

    const onKeyDown = (e) => {
      if (!soundEnabled) return;
      const t = e.target;
      if (!t) return;
      if (
        t.tagName === "SELECT" &&
        (e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        setTimeout(() => {
          const opt = t.options[t.selectedIndex];
          const text = (opt && opt.text) || "";
          if (text) playText(text);
        }, 50);
      }
    };

    // Handle click events for specific elements
    const onClick = (e) => {
      if (!soundEnabled) return;
      const id = e.target.id;

      switch (id) {
        case "timeperiod":
          playText(
            language === "GE"
              ? "დროის პერიოდი"
              : "From"
          );
          break;
        case "start":
          playText(
            language === "GE"
              ? "საწყისი"
              : "From"
          );
          break;
        case "end":
          playText(
            language === "GE"
              ? "საბოლოო"
              : "To"
          );
          break;
        case "Result":
          playText(
            language === "GE"
              ? "შედეგი"
              : "Result"
          );
          break;
           case "clear":
          playText(
            language === "GE"
              ? "გასუფთავება"
              : "clear"
          );
          break;
        case "Resultone":
          const resultoneText = e.target.innerText || e.target.textContent || "";
          if (resultoneText) playText(resultoneText);
          break;
        case "Resulttwo":
          const resulttwoText = e.target.innerText || e.target.textContent || "";
          if (resulttwoText) playText(resulttwoText);
          break;
        case "groupname":
          const groupnameText = e.target.innerText || e.target.textContent || "";
          if (groupnameText) playText(groupnameText);
          break;
        case "pricechange":
          const pricechangeText = e.target.innerText || e.target.textContent || "";
          if (pricechangeText) playText(pricechangeText);
          break;
        case "avgmonthlyexpenditure":
          const avgmonthlyText = e.target.innerText || e.target.textContent || "";
          if (avgmonthlyText) playText(avgmonthlyText);
          break;
        case "personalexpenditure":
          const personalexpText = e.target.innerText || e.target.textContent || "";
          if (personalexpText) playText(personalexpText);
          break;
        case "month":
          playText(
            language === "GE"
              ? "ყოველთვიური"
              : "Monthly"
          );
          break;
        case "year":
          playText(
            language === "GE"
              ? "ყოველწლიური"
              : "Annual"
          );
          break;
        case "total-monthly":
          const totalMonthlyValue = e.target.value || "0";
          playText(totalMonthlyValue);
          break;
        case "total-yearly":
          const totalYearlyValue = e.target.value || "0";
          playText(totalYearlyValue);
          break;
        default:
          // Handle input field clicks - play descriptive prompt with category name
          if (e.target.tagName === "INPUT") {
            const row = e.target.closest("tr");
            if (row) {
              const firstTd = row.querySelector("td");
              if (firstTd) {
                // Extract category name
                const categoryName = (firstTd.innerText || firstTd.textContent || "")
                  .replace(/▶▶/g, "")
                  .replace(/▶/g, "")
                  .replace(/\s+/g, " ")
                  .trim();

                // Determine if it's monthly or yearly
                const inputClass = e.target.className;
                const isMonthly = inputClass.includes("monthly");

                if (categoryName) {
                  // Create descriptive prompt
                  let prompt = "";
                  if (language === "GE") {
                    prompt = isMonthly
                      ? `მიუთითეთ ${categoryName}ის ყოვეთვიური ხარჯი:`
                      : `მიუთითეთ ${categoryName}ის ყოველწლიური ხარჯი:`;
                  } else {
                    prompt = isMonthly
                      ? `Indicate your monthly ${categoryName} expenses:`
                      : `Indicate your annual ${categoryName} expenses:`;
                  }
                  playText(prompt);
                  return;
                }
              }
            }
          }

          // Handle table cell (td) clicks
          const tableCell = e.target.closest("td");
          if (tableCell) {
            const cellText = (tableCell.innerText || tableCell.textContent || "")
              .replace(/▶▶/g, "")
              .replace(/▶/g, "")
              .replace(/\s+/g, " ")
              .trim();
            if (cellText) {
              playText(cellText);
            }
          }
          break;
      }
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  }, [
    soundEnabled,
    language,
    playText,
    startYear,
    startMonth,
    endYear,
    endMonth,
    calculatedValue,
    monthsWithShi,
    monthsWithTan,
  ]);
  return null;
};

export default SoundManager;
