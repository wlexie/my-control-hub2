import React, { useState } from "react";

const Table1 = () => {
  // Static data with weightedAvg and markup set to 0
  const [data] = useState([
    { 
      paymentRecords: "Paybill", 
      icon: "/svgs/paybill.svg",
      weightedAvg: "0.00",
      markup: "0.00"
    },
    { 
      paymentRecords: "MPESA", 
      icon: "/svgs/mpesa.svg",
      weightedAvg: "0.00",
      markup: "0.00"
    },
    { 
      paymentRecords: "Bank", 
      icon: "/svgs/bank.svg",
      weightedAvg: "0.00",
      markup: "0.00"
    },
    { 
      paymentRecords: "Card", 
      icon: "/svgs/card.svg",
      weightedAvg: "0.00",
      markup: "0.00"
    }
  ]);

  return (
    <div className="overflow-x-auto rounded-t-xl bg-white mt-7 p-4">
      <table className="w-full text-left text-gray-700">
        <thead>
          <tr className="text-gray-500 font-[300] text-left text-[16px]">
            <th className="p-3">Payment Records</th>
            <th className="p-3">Weighted Average</th> 
            <th className="p-3">Tuma Markup</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-t text-[17px] border-gray-200">
              <td className="p-3 flex items-center gap-3">
                <span className="p-3 bg-gray-200 my-2 rounded-full">
                  <img src={row.icon} alt={row.paymentRecords} className="w-6 h-6" />
                </span>
                <span className="text-[#101820] font-[600] text-center">
                  {row.paymentRecords}
                </span>
              </td>

              <td className="p-3">
                <span className="block font-[600] bg-green-100 p-2 pl-2 mr-10 rounded-md">
                  {row.weightedAvg}
                </span>
              </td> 
              
              <td className="p-3">
                <span className="block font-[600] bg-yellow-100 p-2 pl-2 mr-6 rounded-md">
                  {row.markup}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table1;