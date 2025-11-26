// src/app/components/Card.tsx
import React from 'react';
import { IconType } from 'react-icons'; // Assuming you're using react-icons

interface CardProps {
  icon: IconType; 
  iconBgColor: string; 
  iconColor: string; 
  title: string;
  value: string;
  change: string;
  changeColor: string; 
  dotColor?: string; 
}

const Card: React.FC<CardProps> = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  value,
  change,
  changeColor,
  dotColor,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-full ${iconBgColor}`}>
          <Icon className={`${iconColor} text-xl`} />
        </div>
        {dotColor && <div className={`w-2 h-2 rounded-full ${dotColor}`} />}
      </div>
      <div className="flex-grow">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
      </div>
      <p className={`text-sm mt-4 ${changeColor}`}>
        <span className="font-semibold">{change}</span> from last month
      </p>
    </div>
  );
};

export default Card;