import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import NewTemplateFormModal from './NewTemplateFormModal';

export default function TemplatesModal({ closeModal, onSelectTemplate, userName }) {
  // --- REDUX STATE ---
  const { accessToken } = useSelector((state) => state.auth);

  // --- LOCAL STATE ---
  const [categories, setCategories] = useState([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:8080/api/whatsapp/templates';

  // --- FETCH DATA ---
  const fetchTemplates = async () => {
    try {
      if (categories.length === 0) setIsLoading(true);
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchTemplates();
    }
  }, [accessToken]);

  // --- DELETE HANDLERS ---
  const handleDeleteTemplate = async (id, e) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCategories(prev => prev.map(cat => ({
        ...cat,
        templates: cat.templates.filter(t => t.id !== id)
      })));
    } catch (err) {
      console.error("Error deleting template", err);
      alert("Failed to delete template");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("WARNING: This will delete the Category and ALL templates inside it. Continue?")) return;

    try {
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error("Error deleting category", err);
      alert("Failed to delete category");
    }
  };

  // --- CLICK HANDLER ---
  const handleTemplateClick = (rawTemplateText) => {
    const finalText = rawTemplateText.replace(/\[User Name\]/g, userName || 'there');
    onSelectTemplate(finalText);
  };

  // --- ADD NEW TEMPLATE (FIXED) ---
  // The Modal now handles the API call. This function just updates the UI.
  const handleModalSuccess = (updatedCategory) => {
    setCategories(prevCategories => {
      // Check if this category already existed
      const index = prevCategories.findIndex(c => c.id === updatedCategory.id);
      
      if (index !== -1) {
        // Update existing category
        const newCats = [...prevCategories];
        newCats[index] = updatedCategory;
        return newCats;
      } else {
        // Add new category to the end
        return [...prevCategories, updatedCategory];
      }
    });
    
    setIsNewModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-40 flex justify-end" onClick={closeModal}>
        <div 
          className="w-full max-w-md h-full bg-white shadow-xl flex flex-col p-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search template"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="ml-3 px-4 py-2 bg-blue-600 border border-transparent text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
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

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto pt-4 space-y-6">
            
            {isLoading && (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {!isLoading && error && (
              <div className="text-center text-red-500 p-4">{error}</div>
            )}

            {!isLoading && !error && categories.map((category) => (
              <div key={category.id || category.title} className="group/category">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{category.title}</h3>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover/category:opacity-100 transition-opacity"
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {category.templates.map((template) => {
                    const isSimpleTemplate = !template.subtitle;
                    const displayText = isSimpleTemplate ? template.message : template.subtitle;

                    return (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateClick(template.message)}
                        className={`group relative p-3 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-gray-700 text-sm flex items-center justify-between ${
                          !isSimpleTemplate ? 'font-medium' : ''
                        }`}
                      >
                        <span className="flex-1 mr-2">{displayText}</span>
                        <button
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                          className="p-1.5 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete Template"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isNewModalOpen && (
        <NewTemplateFormModal
          onClose={() => setIsNewModalOpen(false)}
          onAdd={handleModalSuccess} // Pass the new handler
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