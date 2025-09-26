import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  selectedCurrency: string;
  onCurrencyChange: (code: string) => void;
}

const CurrencyDropdown = ({ selectedCurrency, onCurrencyChange }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const currencies = [
    {
      code: "GBP",
      name: "Great British Pounds",
      flag: "/backoffice/uk-flag.png",
    },
    {
      code: "KES",
      name: "Kenyan Shillings",
      flag: "/backoffice/kenya-flag.png",
    },
  ];

  const selected =
    currencies.find((c) => c.code === selectedCurrency) || currencies[0];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectCurrency = (currencyCode: string) => {
    onCurrencyChange(currencyCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center bg-white/10 px-3 text-white/70 py-1.5 rounded text-sm space-x-2 hover:bg-white/20 transition-colors"
      >
        <span className="flex items-center space-x-1">
          <img
            src={selected.flag}
            alt={`${selected.code} Flag`}
            className="w-4 h-4 rounded-sm"
          />
          <span>{selected.code}</span>
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 text-black/70 w-full bg-white/90 backdrop-blur-sm rounded-md shadow-lg overflow-hidden">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => selectCurrency(currency.code)}
              className={`flex items-center w-full px-3 py-2 text-sm space-x-2 hover:bg-white/20 ${
                selectedCurrency === currency.code
                  ? "bg-white/30 text-black/70"
                  : ""
              }`}
            >
              <img
                src={currency.flag}
                alt={`${currency.code} Flag`}
                className="w-4 h-4 rounded-sm"
              />
              <span>{currency.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
