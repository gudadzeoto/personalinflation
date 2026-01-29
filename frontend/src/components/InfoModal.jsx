import React, { useEffect } from "react";

const InfoModal = ({ isOpen, onClose, language }) => {
  const handlePrint = () => {
    // Create a new hidden iframe
    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "0";
    document.body.appendChild(printFrame);

    // Get the content to print
    const contentToPrint = document
      .getElementById("modal-content")
      .cloneNode(true);

    // Remove the buttons from the clone
    const buttons = contentToPrint.querySelectorAll("button, .print\\:hidden");
    buttons.forEach((button) => button.remove());

    // Write the content to the iframe
    const frameDoc = printFrame.contentWindow.document;
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${
            language === "GE"
              ? "პერსონალური ინფლაციის კალკულატორი"
              : "Personal Inflation Calculator"
          }</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            p { margin-bottom: 1em; line-height: 1.5; }
            .font-bold { font-weight: bold; }
            .mt-4 { margin-top: 1.5em; }
            a { color: #2563eb; text-decoration: underline; }
          </style>
        </head>
        <body>
          ${contentToPrint.innerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    // Print and remove the iframe
    printFrame.contentWindow.onafterprint = () => {
      document.body.removeChild(printFrame);
    };

    printFrame.contentWindow.print();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (event.target.classList.contains("modal-backdrop")) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="modal-content">
          <div className="border-b p-4 flex justify-between items-center">
            <h5 className="text-xl font-bold bpg_mrgvlovani_caps">
              {language === "GE"
                ? "როგორ მუშაობს პერსონალური ინფლაციის კალკულატორი"
                : "How does the personal inflation calculator work"}
            </h5>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl print:hidden cursor-pointer font-bpg-nino"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="p-6 bpg_mrgvlovani_caps">
            {language === "GE" ? (
              <>
                <p>
                  პერსონალური ინფლაციის კალკულატორი მომხმარებლის მიერ მითითებული
                  ხარჯების სტრუქტურის გამოყენებით ანგარიშობს პერსონალური
                  ინფლაციის მაჩვენებელს. ამავდროულად, შესაძლებელია მომხმარებლის
                  პერსონალური ხარჯების სტრუქტურის შედარება ქვეყნის საშუალო ზომის
                  შინამეურნეობის ხარჯების სტრუქტურასთან, რაც საფუძვლად უდევს
                  სამომხმარებლო ფასების ინდექსის და შესაბამისად, ინფლაციის
                  ოფიციალური მაჩვენებლის გაანგარიშებას.
                </p>
                <br />
                <p>
                  <span className="font-bold mt-4">შენიშვნა:</span> პერსონალური
                  ინფლაცია არ არის საქსტატის მიერ გაანგარიშებული ოფიციალური
                  ინფლაციის მაჩვენებელი. ის ატარებს ინფორმაციულ ხასიათს და არ
                  უნდა იქნას გამოყენებული თანხების ინდექსაციისთვის.
                </p>
                <p className="font-bold mt-4">შევსების ეტაპები:</p>
                <p className="font-bold mt-4">1. აირჩიეთ დროითი პერიოდი</p>
                <p>
                  აირჩიეთ საწყისი და საბოლოო წელი და თვე, რა პერიოდისთვისაც
                  გსურთ პერსონალური ინფლაციის გაანგარიშება.
                </p>
                <p className="font-bold mt-4">
                  2. შეიყვანეთ თქვენი ხარჯების ოდენობა შესაბამის ველებში
                </p>
                <p>
                  მიუთითეთ თვის ან წლიური საშუალო ხარჯის ოდენობა (ერთერთის
                  ჩაწერის შემდეგ ავტომატურად ანგარიშდება მეორე). ყველა ველის
                  შევსების შემდეგ პროგრამა ანგარიშობს თვის და წლიური ხარჯების
                  მთლიან ოდენობას.
                </p>
                <p className="font-bold mt-4">
                  3. მიღებული შედეგების ინტერპრეტაცია
                </p>
                <p>
                  მითითებული ხარჯების და არჩეული პერიოდის შესაბამისად
                  კალკულატორი ანგარიშობს პერსონალური ინფლაციის მაჩვენებელს,
                  ასევე უთითებს ამავე პერიოდისთვის ინფლაციის ფაქტიურ
                  მაჩვენებელსაც.
                  <p>
                    შედეგების გაანალიზება შესაძლებელია გრაფიკულადაც: პირველი
                    გრაფიკი ასახავს მომხმარებლის ხარჯების პერსონალურ პროცენტულ
                    სტრუქტურას საშუალო სტატისტიკური შინამეურნეობის სტრუქტურასთან
                    შედარებით (COICOP 12 ჯგუფის მიხედვით). მეორე გრაფიკზე
                    წარმოდგენილია პერსონალური და ოფიციალური ინფლაციის
                    მაჩვენებლების შედარება არჩეული დროითი პერიოდისთვის.
                  </p>
                </p>
                <br />
                <p>
                  <span className="font-bold mt-4">შენიშვნა:</span> გრძელვადიანი
                  პერიოდისთვის გამოთვლილი პერსონალური და ოფიციალური ინფლაციის
                  მაჩვენებლები შესაძლოა ერთმანეთს არ დაემთხვეს, სამომხმარებლო
                  კალათის და საქონლისა და მომსახურების წონების რეგულარული
                  განახლების გამო.
                </p>
              </>
            ) : (
              <>
                <p>
                  Personal inflation calculator uses the expenditure pattern,
                  indicated by a person, to calculate a personal inflation rate.
                  It compares the expenditure pattern of a person to the one of
                  an average household, which is used to calculate the Consumer
                  Price Index, therefore the official inflation rate.
                </p>
                <br />
                <p>
                  <span className="font-bold mt-4">Note:</span> Personal
                  inflation rate is not an official inflation rate calculated by
                  Geostat. It is for information purposes only and should not be
                  used for adjustment.
                </p>
                <p className="font-bold mt-4">Filling in steps</p>
                <p className="font-bold mt-4">1. Choose a time period</p>
                <p>
                  Choose the start and end month and year of a period, for which
                  you would like to calculate your personal inflation..
                </p>
                <p className="font-bold mt-4">
                  2. Enter your expenditure pattern in corresponding cells
                </p>
                <p>
                  Indicate your monthly or annual expenditure (after entering
                  one of them, another is calculated automatically). After
                  filling in all relevant cells, a total monthly and annual
                  expenditure will be calculated below.
                </p>
                <p className="font-bold mt-4">3. Interpretation of results</p>
                <p>
                  After entering expenditures and indicating the time period the
                  program automatically calculates a corresponding personal
                  inflation rate, as well as an actual inflation rate for the
                  chosen period.
                </p>
                <p>
                  The results also can be analyzed graphically: the first chart
                  reflects a personal expenditure pattern compared to the
                  pattern of an average household (according to the 12 groups of
                  COICOP). The second chart reflects a comparison of dynamics of
                  personal and actual inflation rates over a chosen time period.
                </p>
                <br />
                <p><span className="font-bold mt-4">Note:</span>
                  Personal and official inflation rate calculated for a
                  long-term period may not match, due to regular updates of the
                  consumer basket and weights of goods and services.
                </p>
              </>
            )}
          </div>
          <div className="border-t p-4 flex justify-end gap-2 print:hidden">
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-bpg-nino cursor-pointer"
              onClick={handlePrint}
            >
              {language === "GE" ? "ბეჭდვა" : "Print"}
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors font-bpg-nino cursor-pointer"
              onClick={onClose}
            >
              {language === "GE" ? "დახურვა" : "Close"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
