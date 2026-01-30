import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const generatePDF = ({
  language,
  startDate,
  endDate,
  officialInflationRate,
  personalInflationRate,
  categories,
  groupData,
  groupPrices,
  totalMonthlySum,
}) => {
  try {
    console.log("PDF generation started...");

    // Helper functions
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}/${month}`;
    };

    const getTodayDate = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Official weights for 2025 (category weights, not inflation rates)
    const officialWeights = [34.5, 6.4, 4.7, 9.8, 5.3, 8.1, 10.9, 3.2, 3.8, 5.4, 3.1, 4.7];

    // Prepare group data
    const groupTableData = categories.map((category, index) => {
      const parentMonthlyInput = document.querySelector(
        `#parent-monthly-${category.code}`,
      );
      const parentMonthlyValue = parseFloat(parentMonthlyInput?.value) || 0;
      const personalWeight =
        totalMonthlySum > 0
          ? ((parentMonthlyValue / totalMonthlySum) * 100).toFixed(1)
          : 0;
      const officialWeight = officialWeights[index] || 0;

      return {
        name: language === "GE" ? category.name_geo : category.name_en,
        official: `${officialWeight}%`,
        personal: `${personalWeight}%`,
      };
    });

    // Prepare expenses data
    const expensesTableData = [];
    categories.forEach((category) => {
      const parentMonthlyInput = document.querySelector(
        `#parent-monthly-${category.code}`,
      );
      const parentYearlyInput = document.querySelector(
        `#parent-yearly-${category.code}`,
      );
      const parentMonthlyValue = parseFloat(parentMonthlyInput?.value) || 0;
      const parentYearlyValue = parseFloat(parentYearlyInput?.value) || 0;

      expensesTableData.push({
        name: language === "GE" ? category.name_geo : category.name_en,
        monthly: parentMonthlyValue.toFixed(2),
        yearly: parentYearlyValue.toFixed(2),
        isParent: true,
      });

      if (category.subcategories) {
        category.subcategories.forEach((sub) => {
          const subMonthlyInput = document.querySelector(
            `.sub-monthly-${sub.code}`,
          );
          const subYearlyInput = document.querySelector(
            `.sub-yearly-${sub.code}`,
          );
          const subMonthlyValue = parseFloat(subMonthlyInput?.value) || 0;
          const subYearlyValue = parseFloat(subYearlyInput?.value) || 0;

          expensesTableData.push({
            name: `  ${language === "GE" ? sub.name_geo : sub.name_en}`,
            monthly: subMonthlyValue.toFixed(2),
            yearly: subYearlyValue.toFixed(2),
            isParent: false,
          });
        });
      }
    });

    // Create HTML content for PDF
    const htmlContent = `
      <div style="font-family: 'Arial', 'Times New Roman', sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="text-align: center; font-size: 19px; margin-bottom: 15px;">
          ${language === "GE" ? "პერსონალური ინფლაციის კალკულატორი" : "Personal Inflation Calculator"}
        </h1>

        <p><strong>${language === "GE" ? "დღევანდელი თარიღი:" : "Today's Date:"}</strong> ${getTodayDate()}</p>

        <p>
          <strong>${language === "GE" ? "ინფლაციის პერიოდი:" : "Inflation Period:"}</strong><br/>
          ${formatDate(startDate)} - ${formatDate(endDate)}
        </p>

        <p>
          <strong>${language === "GE" ? "ოფიციალური ინფლაციის მაჩვენებელი:" : "Official Inflation Rate:"}</strong> ${officialInflationRate}
        </p>

        <p>
          <strong>${language === "GE" ? "პერსონალური ინფლაციის მაჩვენებელი:" : "Personal Inflation Rate:"}</strong> ${personalInflationRate}
        </p>
        <br/>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">
                ${language === "GE" ? "ჯგუფის დასახელება" : "Group Name"}
              </th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">
                ${language === "GE" ? "ოფიციალური წონა" : "Official Weight"}
              </th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">
                ${language === "GE" ? "პერსონალური წონა" : "Personal Weight"}
              </th>
            </tr>
          </thead>
          <tbody>
            ${groupTableData
              .map(
                (row) => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${row.name}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${row.official}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${row.personal}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>


        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">
                ${language === "GE" ? "ჯგუფი / ქვეჯგუფი" : "Group / Subgroup"}
              </th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">
                ${language === "GE" ? "პერსონალური ყოველთვიური ხარჯი (₾)" : "Monthly (₾)"}
              </th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: center;">
                ${language === "GE" ? "პერსონალური ყოველწლიური ხარჯი (₾)" : "Annual (₾)"}
              </th>
            </tr>
          </thead>
          <tbody>
            ${expensesTableData
              .map(
                (row) => `
              <tr>
                <td style="border: 1px solid #ccc; padding: 8px; ${row.isParent ? "font-weight: bold;" : ""}">${row.name}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center; ${row.isParent ? "font-weight: bold;" : ""}">${row.monthly}</td>
                <td style="border: 1px solid #ccc; padding: 8px; text-align: center; ${row.isParent ? "font-weight: bold;" : ""}">${row.yearly}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

      </div>
    `;

    // Create temporary container
    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.width = "800px";
    container.style.backgroundColor = "white";
    document.body.appendChild(container);

    // Convert HTML to canvas
    html2canvas(container, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff",
    })
      .then((canvas) => {
        // Remove temporary container
        document.body.removeChild(container);

        // Create PDF from canvas
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Open PDF in new tab
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        console.log("PDF created successfully, opening in new tab...");
        window.open(pdfUrl, "_blank");
      })
      .catch((error) => {
        console.error("Error rendering PDF:", error);
        alert(`Error rendering PDF: ${error.message}`);
      });
  } catch (error) {
    console.error("Error generating PDF:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    alert(`Error generating PDF: ${error.message}`);
  }
};

export default generatePDF;
