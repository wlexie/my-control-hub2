import React, { useState } from 'react'; // Import useState
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import NewTemplateFormModal from './NewTemplateFormModal'; // Import the new component

// This is now the INITIAL state, not a constant used for rendering.
const initialTemplateCategories = [
  {
    title: 'Common Issues',
    templates: [
      'Hi! Can you please share your account number?',
      'Please give me a moment while I look into that.'
    ]
  },
   {
  title: 'Closure alert',
  templates: [
    `Oh, before you go… BIG news! 👀
FLASH HOUR is tomorrow — 5–6 PM UK! 💥
For 1 hour only: 1 GBP = 200 bob + zero fees 💷🔥
Be on alert — don’t miss it!🤗`
  ]
},

  

  {
    title: 'Payments',
    templates: [
      'I\'ve escalated this to our finance team.',
      'Refunds are processed within 24-48 hours.'
    ]
  },
  {
    title: 'Compliance Escalation',
    templates: [
      // ... (rest of your initial data is unchanged)
      {
        subtitle: 'ID Request',
        message: `Hi [User Name]🎉, Thank you for choosing to be part of the Tuma Team. Unfortunately, we are having issues verifying your documents. To proceed, please resubmit the following:\n\nA clear and valid UK ID or Passport 🇬🇧🪪\n\nNote: Please ensure the documents are clear, legible, with all corners visible, and submitted through the Tuma App 📲.\n\nIf you need assistance or have any questions, feel free to reach out. 💬\n\nBest regards,\nThe Tuma Team 💥`
      },
      {
        subtitle: 'Expired ID',
        message: `Hi [User Name]🎉, Thank you for choosing to be part of the Tuma Team. Unfortunately, we are having issues verifying your documents as the one you submitted has expired. To proceed, please resubmit the following:\n\nA clear and valid UK ID or Passport 🇬🇧🪪\nOr, an alternative valid document if applicable 📑.\n\nNote: Please ensure the documents are clear, legible, with all corners visible, and submitted through the Tuma App 📲.\n\nIf you need assistance or have any questions, feel free to reach out. 💬\n\nBest regards,\nThe Tuma Team 💥`
      },
      {
        subtitle: 'Account Verified',
        message: `Hi [User Name]🎉, Great news 🎉 Your account has been successfully verified, and you’re officially part of the Tuma Team! 🖤 We’re beyond excited to have you with us and can’t wait for you to explore all the amazing features we offer. 🙌\n\nIf you need anything or have any questions, don’t hesitate to reach out. 💬\n\nWelcome aboard – let’s make this journey unforgettable! 🌟\n\nBest regards,\nThe Tuma Team 💥`
      },
      {
        subtitle: 'Refuse Service',
        message: `Hi [User Name] 👋, Thank you for your time and effort in trying to complete the verification process with us. Unfortunately, we were unable to verify your details, and as a result, we are unable to provide our services at this time. 😔\n\nWe wish you all the best in your future endeavors! 🌟\n\nBest regards,\nThe Tuma Team 💥`
      }
    ]
  }
];

export default function TemplatesModal({ closeModal, onSelectTemplate, userName }) {
  // --- STATE MANAGEMENT ---
  // 1. Manage the template data in state
  const [categories, setCategories] = useState(initialTemplateCategories);
  // 2. Manage the visibility of the new template form modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const handleTemplateClick = (rawTemplateText) => {
    const finalText = rawTemplateText.replace(/\[User Name\]/g, userName || 'there');
    onSelectTemplate(finalText);
  };

  // --- LOGIC TO ADD NEW TEMPLATE ---
  const handleAddTemplate = ({ title, subtitle, message }) => {
    // If a subtitle is provided, the template is an object. Otherwise, it's a simple string.
    const newTemplate = subtitle ? { subtitle, message } : message;

    setCategories(prevCategories => {
      const existingCategoryIndex = prevCategories.findIndex(cat => cat.title.toLowerCase() === title.toLowerCase());

      // Case 1: Category already exists. Add template to it.
      if (existingCategoryIndex > -1) {
        // Create a new array with the updated category
        return prevCategories.map((cat, index) => {
          if (index === existingCategoryIndex) {
            // Return a new category object with the new template added
            return {
              ...cat,
              templates: [...cat.templates, newTemplate]
            };
          }
          return cat;
        });
      } 
      // Case 2: New category. Create it and add it to the list.
      else {
        const newCategory = {
          title: title,
          templates: [newTemplate]
        };
        return [...prevCategories, newCategory];
      }
    });

    // Close the form modal after submission
    setIsNewModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-40 flex justify-end" onClick={closeModal}>
        <div 
          className="w-full max-w-md h-full bg-white shadow-xl flex flex-col p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search template"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* --- MODIFIED BUTTON --- */}
            <button 
              onClick={() => setIsNewModalOpen(true)} // Opens the new form modal
              className="ml-3 px-4 py-2 bg-blue-600 border border-transparent text-white rounded-lg hover:bg-blue-700"
            >
              New +
            </button>
            <button 
              onClick={closeModal}
              className="ml-2 px-2 py-2 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pt-4 space-y-6">
            {/* --- RENDER FROM STATE --- */}
            {categories.map((category) => ( // Use the 'categories' state variable
              <div key={category.title}>
                <h3 className="font-semibold text-gray-800 mb-2">{category.title}</h3>
                <div className="space-y-2">
                  {category.templates.map((template, index) => {
                    if (typeof template === 'string') {
                      return (
                        <div
                          key={index}
                          onClick={() => handleTemplateClick(template)}
                          className="p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-gray-700 text-sm"
                        >
                          {template}
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={index}
                          onClick={() => handleTemplateClick(template.message)}
                          className="p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-gray-700 text-sm font-medium"
                        >
                          {template.subtitle}
                        </div>
                      );
                    }
                  })}
                </div>
                <button className="text-blue-600 text-sm mt-2 hover:underline">
                  Load more
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- RENDER THE NEW MODAL CONDITIONALLY --- */}
      {isNewModalOpen && (
        <NewTemplateFormModal
          onClose={() => setIsNewModalOpen(false)}
          onAdd={handleAddTemplate}
          existingTitles={categories.map(c => c.title)}
        />
      )}
    </>
  );
}

TemplatesModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  onSelectTemplate: PropTypes.func.isRequired,
  userName: PropTypes.string,
};