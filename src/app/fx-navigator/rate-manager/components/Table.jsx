import React, { useState, useEffect } from "react";
import api from "../../../../utils/apiService";

const Table = ({ baseCurrency, targetCurrency }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editableRow, setEditableRow] = useState(null);

  const formatToTwoDecimals = (value) => {
    return parseFloat(value).toFixed(2);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/treasury/temporal-exchange-rates', {
          params: { baseCurrency, targetCurrency }
        });
        
        const apiData = response.data;
        console.log("API Data:", apiData); // Debug log
        
        const transformedData = [
          { 
            paymentRecords: "Paybill", 
            icon: "/fx/svgs/paybill.svg", 
            tumaRate: formatToTwoDecimals(apiData.interBankRate), // Changed from rateAtCost
            weightedAvg: formatToTwoDecimals(apiData.paybillWeightedAvg || 0),
            markup: formatToTwoDecimals(apiData.paybillMarkUp || 0),
            finalRate: formatToTwoDecimals(apiData.paybillRate)
          },
          { 
            paymentRecords: "MPESA", 
            icon: "/fx/svgs/mpesa.svg", 
            tumaRate: formatToTwoDecimals(apiData.interBankRate), // Changed from rateAtCost
            weightedAvg: formatToTwoDecimals(apiData.mpesaWeightedAvg || 0),
            markup: formatToTwoDecimals(apiData.mpesaMarkUp || 0),
            finalRate: formatToTwoDecimals(apiData.mpesaRate)
          },
          { 
            paymentRecords: "Bank", 
            icon: "/fx/svgs/Bank.svg", 
            tumaRate: formatToTwoDecimals(apiData.interBankRate), // Changed from rateAtCost
            weightedAvg: formatToTwoDecimals(apiData.bankWeightedAvg || 0),
            markup: formatToTwoDecimals(apiData.bankMarkUp || 0),
            finalRate: formatToTwoDecimals(apiData.bankRate)
          },
          { 
            paymentRecords: "Card", 
            icon: "/fx/svgs/card.svg", 
            tumaRate: "120.00", 
            weightedAvg: "1.00", 
            markup: "2.00", 
            finalRate: "95.00" 
          }
        ];
        
        setData(transformedData);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseCurrency, targetCurrency]);

  const handleEditClick = (index) => {
    setEditableRow(editableRow === index ? null : index);
  };

  const handleWeightedAvgChange = (index, value) => {
    const newData = [...data];
    newData[index].weightedAvg = formatToTwoDecimals(value);
    calculateFinalRate(newData, index);
    setData(newData);
  }; 

  const handleMarkupChange = (index, value) => {
    const newData = [...data];
    newData[index].markup = formatToTwoDecimals(value);
    calculateFinalRate(newData, index);
    setData(newData);
  };

  const handleFinalRateChange = (index, value) => {
    const newData = [...data];
    newData[index].finalRate = formatToTwoDecimals(value);
    setData(newData);
  };

  const calculateFinalRate = (data, index) => {
    const tumaRate = parseFloat(data[index].tumaRate);
    const weightedAvg = parseFloat(data[index].weightedAvg);
    const markup = parseFloat(data[index].markup);

    if (!isNaN(tumaRate) && !isNaN(weightedAvg) && !isNaN(markup)) {
      const finalRate = tumaRate - (weightedAvg + markup);
      data[index].finalRate = formatToTwoDecimals(finalRate);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-t-xl bg-white mt-7 p-4">
      <table className="w-full text-left text-gray-700">
        <thead>
          <tr className="text-gray-500 font-[300] text-left text-[14px]">
            <th className="p-3">Payment Records</th>
           {/*<th className="p-3">Tuma Rate at Cost</th> */} 
            <th className="p-3">Weighted Average</th> 
            <th className="p-3">Tuma Markup</th>
            <th className="p-3">Final Tuma Rate</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-t text-[17px] border-gray-200">
              <td className="p-3 flex items-center gap-3">
                <span className="p-3 bg-gray-200 my-2 rounded-full">
                  <img src={row.icon} alt={row.paymentRecords} className="w-6 h-6" />
                </span>
                <span className="text-[#101820] font-[600] text-[14px] text-center">
                  {row.paymentRecords}
                </span>
              </td>

             {/** <td className="p-3">
                <span className="block font-[600] bg-[#CD11261A] text-[#CD1126] text-[13px] p-2 pl-2 mr-8 rounded-md">
                  {row.tumaRate}
                </span>
              </td>  */} 
              <td className="p-3">
                {editableRow === index ? (
                  <input
                    type="number"
                    value={row.weightedAvg}
                    onChange={(e) => handleWeightedAvgChange(index, e.target.value)}
                    className="block font-[600] bg-green-100 p-2 pl-2 mr-10 rounded-md w-20"
                    step="0.01"
                  />
                ) : (
                  <span className="block font-[600] bg-green-100 text-[13px] p-2 pl-2 mr-10 rounded-md">
                    {row.weightedAvg}
                  </span>
                )}
              </td> 
              <td className="p-3">
                {editableRow === index ? (
                  <input
                    type="number"
                    value={row.markup}
                    onChange={(e) => handleMarkupChange(index, e.target.value)}
                    className="block font-[600] bg-yellow-100 p-2 pl-2 mr-6 rounded-md w-20"
                    step="0.01"
                  />
                ) : (
                  <span className="block font-[600] bg-yellow-100 text-[13px] p-2 pl-2 mr-6 rounded-md">
                    {row.markup}
                  </span>
                )}
              </td>
              <td className="p-3">
                {editableRow === index ? (
                  <input
                    type="number"
                    value={row.finalRate}
                    onChange={(e) => handleFinalRateChange(index, e.target.value)}
                    className="block font-[600] bg-[#27AE601A] text-[#27AE60] p-2 pl-2 mr-8 rounded-md w-20"
                    step="0.01"
                  />
                ) : (
                  <span className="block font-[600] bg-[#27AE601A] text-[13px] text-[#27AE60] p-2 pl-2 mr-8 rounded-md">
                    {row.finalRate}
                  </span>
                )}
              </td>
              <td className="py-3 pr-4">
                <img
                  src="/fx/svgs/pen.svg"
                  alt="Edit"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => handleEditClick(index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;