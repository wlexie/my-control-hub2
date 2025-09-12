import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import NewTemplateFormModal from './NewTemplateFormModal';
import ConfirmationModal from './ConfirmationModal'; // Import the new ConfirmationModal

export default function TemplatesModal({ closeModal, onSelectTemplate, userName }) {
  const [categories, setCategories] = useState([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);

  // New state for selected title/subtitle for editing
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);

  // State for Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // Stores { categoryId, templateId, type, isCategory }

  // New state for success message
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/categories');
      const apiCategories = response.data;

      const transformedCategories = apiCategories.map((category) => {
        const templatesFromSubtitles = category.subtitles
          ? category.subtitles.map((subtitle) => ({
              id: `subtitle-${subtitle.id}`, // prefix ensures unique key
              subtitle: subtitle.text,
              message: subtitle.message
                ? subtitle.message.content || 'No content provided'
                : 'No content provided',
              type: 'subtitle',
              categoryId: category.id,
              categoryTitle: category.title,
            }))
          : [];

        const templatesFromMessages = category.messages
          ? category.messages.map((msg) => ({
              id: `message-${msg.id}`, // prefix ensures unique key
              subtitle: null,
              message: msg.content,
              type: 'message',
              categoryId: category.id,
              categoryTitle: category.title,
            }))
          : [];

        return {
          id: category.id,
          title: category.title,
          templates: [...templatesFromSubtitles, ...templatesFromMessages],
        };
      });

      setCategories(transformedCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to clear success message after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000); // Message disappears after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleTemplateClick = (rawTemplateText) => {
    const finalText = rawTemplateText.replace(/\[User Name\]/g, userName || 'there');
    onSelectTemplate(finalText);
    closeModal();
  };

  const handleAddTemplate = ({ titleId, title, subtitleId, subtitle, message }) => {
    // Clear any existing success messages when a new action starts
    setSuccessMessage(null);

    const newId = `new-${Date.now()}`;
    const newTemplate = {
      id: subtitle ? `subtitle-${newId}` : `message-${newId}`,
      subtitle: subtitle || null,
      message: message,
      type: subtitle ? 'subtitle' : 'message',
    };

    setCategories((prevCategories) => {
      const existingCategoryIndex = prevCategories.findIndex(
        (cat) => cat.title.toLowerCase() === title.toLowerCase()
      );

      if (existingCategoryIndex > -1) {
        return prevCategories.map((cat, index) => {
          if (index === existingCategoryIndex) {
            return {
              ...cat,
              templates: [...cat.templates, newTemplate],
            };
          }
          return cat;
        });
      } else {
        const newCategory = {
          id: titleId || Date.now(),
          title: title,
          templates: [newTemplate],
        };
        return [...prevCategories, newCategory];
      }
    });

    setIsNewModalOpen(false);
    setSelectedCategory(null);
    setSelectedSubtitle(null);
    fetchCategories(); // Re-fetch to get actual IDs from backend
  };

  const handleEditTemplate = (category, template) => {
    // Clear any existing success messages when a new action starts
    setSuccessMessage(null);

    setSelectedCategory({ id: category.id, title: category.title });
    setSelectedSubtitle(
      template.subtitle ? { id: template.id, subtitle: template.subtitle } : null
    );
    setIsNewModalOpen(true);
  };

  // Modified handleDeleteTemplate to open confirmation modal
  const handleDeleteTemplate = (categoryId, templateId, type) => {
    // Clear any existing success messages when a new action starts
    setSuccessMessage(null);
    setItemToDelete({ categoryId, templateId, type, isCategory: false });
    setShowConfirmModal(true);
  };

  // Modified handleDeleteCategory to open confirmation modal
  const handleDeleteCategory = (categoryId) => {
    // Clear any existing success messages when a new action starts
    setSuccessMessage(null);
    setItemToDelete({ categoryId, isCategory: true });
    setShowConfirmModal(true);
  };

  // New function to handle the actual deletion after confirmation
  const confirmDeletion = async () => {
    if (!itemToDelete) return;

    const { categoryId, templateId, type, isCategory } = itemToDelete;

    try {
      if (isCategory) {
        await axios.delete(`http://localhost:8080/api/categories/${categoryId}`);
        setSuccessMessage('Category deleted successfully!'); // Set success message
      } else {
        let endpoint = '';
        let actualId = templateId.split('-')[1]; // Extract the numerical ID

        if (type === 'subtitle') {
          endpoint = `http://localhost:8080/api/subtitles/${actualId}`;
        } else if (type === 'message') {
          endpoint = `http://localhost:8080/api/messages/${actualId}`;
        } else {
          console.error('Unknown template type:', type);
          return;
        }

        await axios.delete(endpoint);
        setSuccessMessage('Template deleted successfully!'); // Set success message
      }
      fetchCategories(); // Re-fetch categories to update the UI
    } catch (err) {
      console.error('Error deleting item:', err);
      // alert('Failed to delete item.'); // Keep alert for error, or replace with error message state
    } finally {
      setShowConfirmModal(false);
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center">
        <p className="text-white">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-40 flex justify-center items-center">
        <p className="text-white">{error}</p>
        <button
          onClick={closeModal}
          className="ml-4 px-3 py-1 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 flex justify-end"
        onClick={closeModal}
      >
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
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedSubtitle(null);
                setIsNewModalOpen(true);
                setSuccessMessage(null); // Clear message when opening new template modal
              }}
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

          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
              {successMessage}
            </div>
          )}

          <div className="flex-1 overflow-y-auto pt-4 space-y-6">
            {categories.map((category) => (
              <div key={category.id}>
                <div className="flex items-center mr-3 justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{category.title}</h3>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                    title="Delete Category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {category.templates.map((template) => (
                    <div
                      key={template.id}
                      className="p-3 bg-gray-100 rounded-lg text-gray-700 text-sm font-medium flex-col items-start"
                      onMouseEnter={() =>
                        template.type === 'subtitle' && setHoveredMessage(template.id)
                      }
                      onMouseLeave={() => setHoveredMessage(null)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className="flex-1 cursor-pointer hover:underline"
                          onClick={() => handleTemplateClick(template.message)}
                        >
                          {template.subtitle || template.message}
                        </span>
                        <div className="flex space-x-2 ml-4">
                          {/* Removed Edit button as per original code comment */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(category.id, template.id, template.type);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                            title="Delete Template"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {template.type === 'subtitle' && hoveredMessage === template.id && (
                        <p className="mt-2 text-xs text-gray-500 italic px-2 py-1 bg-gray-50 rounded">
                          {template.message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isNewModalOpen && (
        <NewTemplateFormModal
          onClose={() => setIsNewModalOpen(false)}
          onAdd={handleAddTemplate}
          existingTitles={categories.map((c) => c.title)}
          existingSubtitles={
            selectedCategory
              ? categories
                  .find((c) => c.id === selectedCategory.id)
                  ?.templates.filter((t) => t.subtitle)
                  .map((t) => t.subtitle)
              : []
          }
          selectedTitleId={selectedCategory?.id || null}
          selectedTitle={selectedCategory?.title || ''}
          selectedSubtitleId={selectedSubtitle?.id || null}
          selectedSubtitle={selectedSubtitle?.subtitle || ''}
        />
      )}

      {/* Render the ConfirmationModal here */}
      {showConfirmModal && itemToDelete && (
        <ConfirmationModal
          message={
            itemToDelete.isCategory
              ? 'Are you sure you want to delete this category and all its associated templates?'
              : 'Are you sure you want to delete this template?'
          }
          onConfirm={confirmDeletion}
          onCancel={() => {
            setShowConfirmModal(false);
            setItemToDelete(null);
          }}
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