import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useJobStore } from '../../store/jobStore';

interface ShipperComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const ShipperCombobox: React.FC<ShipperComboboxProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const { jobs } = useJobStore();
  
  // Get unique shipper names from existing jobs
  const uniqueShippers = Array.from(new Set(jobs.map(job => job.shipper_name)))
    .sort((a, b) => a.localeCompare(b));
  
  // Filter shippers based on input
  const filteredShippers = uniqueShippers.filter(shipper =>
    shipper.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };
  
  const handleSelect = (selectedValue: string) => {
    setInputValue(selectedValue);
    onChange(selectedValue);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <div className="relative w-full">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          placeholder="Enter shipper name..."
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-gray-700"
        >
          <ChevronsUpDown size={16} />
        </button>
      </div>
      
      {isOpen && filteredShippers.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {filteredShippers.map((shipper) => (
              <li
                key={shipper}
                className={`flex items-center px-3 py-2 cursor-pointer hover:bg-blue-50 ${
                  shipper === value ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelect(shipper)}
              >
                <span className="flex-grow">{shipper}</span>
                {shipper === value && (
                  <Check size={16} className="text-blue-600" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ShipperCombobox;