import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export default function NewTemplateFormModal({
  onClose,
  onAdd, // Keep onAdd for potential parent-level state updates or notifications
  selectedTitleId: initialSelectedTitleId,
  selectedTitle: initialSelectedTitle,
  selectedSubtitleId: initialSelectedSubtitleId,
  selectedSubtitle: initialSelectedSubtitle,
}) {
  const [title, setTitle] = useState(initialSelectedTitle || '');
  const [subtitle, setSubtitle] = useState(initialSelectedSubtitle || '');
  const [message, setMessage] = useState('');
  const [isCreatingTitle, setIsCreatingTitle] = useState(false);
  const [titleCreationError, setTitleCreationError] = useState('');
  const [titleCreationSuccess, setTitleCreationSuccess] = useState('');
  const [isCreatingSubtitle, setIsCreatingSubtitle] = useState(false);
  const [subtitleCreationError, setSubtitleCreationError] = useState('');
  const [subtitleCreationSuccess, setSubtitleCreationSuccess] = useState('');

  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');

  const [internalSelectedTitleId, setInternalSelectedTitleId] = useState(initialSelectedTitleId || null);
  const [internalSelectedSubtitleId, setInternalSelectedSubtitleId] = useState(initialSelectedSubtitleId || null);

  const [savingMessage, setSavingMessage] = useState(false); // New state for saving message
  const [saveMessageError, setSaveMessageError] = useState(''); // New state for message save error
  const [saveMessageSuccess, setSaveMessageSuccess] = useState(''); // New state for message save success


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/categories');
        setFetchedCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to load categories. Please try again.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setTitle(initialSelectedTitle || '');
    setSubtitle(initialSelectedSubtitle || '');
    setInternalSelectedTitleId(initialSelectedTitleId || null);
    setInternalSelectedSubtitleId(initialSelectedSubtitleId || null);
    setMessage(''); // Clear message when modal is opened for a new template or existing template for editing
    setSaveMessageError(''); // Clear previous save errors
    setSaveMessageSuccess(''); // Clear previous save successes
  }, [initialSelectedTitle, initialSelectedSubtitle, initialSelectedTitleId, initialSelectedSubtitleId]);

  const existingTitles = fetchedCategories.map((cat) => cat.title);

  const existingSubtitles = internalSelectedTitleId
    ? fetchedCategories
        .find((cat) => cat.id === internalSelectedTitleId)
        ?.subtitles?.map((sub) => sub.text) || []
    : [];

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setTitleCreationError('');
    setTitleCreationSuccess('');
    setSaveMessageError(''); // Clear message save errors on input change
    setSaveMessageSuccess(''); // Clear message save success on input change

    const foundCategory = fetchedCategories.find(
      (cat) => cat.title.toLowerCase() === newTitle.toLowerCase()
    );
    if (foundCategory) {
      setInternalSelectedTitleId(foundCategory.id);
    } else {
      setInternalSelectedTitleId(null);
    }

    setSubtitle('');
    setInternalSelectedSubtitleId(null);
  };

  const handleSubtitleChange = (e) => {
    const newSubtitle = e.target.value;
    setSubtitle(newSubtitle);
    setSubtitleCreationError('');
    setSubtitleCreationSuccess('');
    setSaveMessageError(''); // Clear message save errors on input change
    setSaveMessageSuccess(''); // Clear message save success on input change


    const currentTitleCategory = fetchedCategories.find(
      (cat) => cat.id === internalSelectedTitleId
    );
    const foundSubtitle = currentTitleCategory?.subtitles.find(
      (sub) => sub.text.toLowerCase() === newSubtitle.toLowerCase()
    );
    if (foundSubtitle) {
      setInternalSelectedSubtitleId(foundSubtitle.id);
    } else {
      setInternalSelectedSubtitleId(null);
    }
  };

  const handleCreateNewTitle = async () => {
    if (!title.trim()) {
      setTitleCreationError('Please enter a title before creating a new one.');
      setTitleCreationSuccess('');
      return;
    }

    setIsCreatingTitle(true);
    setTitleCreationError('');
    setTitleCreationSuccess('');
    setSaveMessageError('');
    setSaveMessageSuccess('');

    try {
      const response = await axios.post('http://localhost:8080/api/categories', {
        title: title.trim(),
      });
      console.log('Category created:', response.data);
      setTitleCreationSuccess(`Category "${response.data.title}" created successfully!`);
      setTitle(response.data.title);
      setInternalSelectedTitleId(response.data.id);
      const updatedResponse = await axios.get('http://localhost:8080/api/categories');
      setFetchedCategories(updatedResponse.data);
    } catch (error) {
      console.error('Error creating category:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setTitleCreationError(`Error: ${error.response.data.message}`);
      } else {
        setTitleCreationError('Failed to create category. Please try again.');
      }
    } finally {
      setIsCreatingTitle(false);
    }
  };

  const handleCreateNewSubtitle = async () => {
    if (!internalSelectedTitleId) {
      setSubtitleCreationError('Please select or create a Category Title first.');
      setSubtitleCreationSuccess('');
      return;
    }
    if (!subtitle.trim()) {
      setSubtitleCreationError('Please enter a subtitle before creating a new one.');
      setSubtitleCreationSuccess('');
      return;
    }

    setIsCreatingSubtitle(true);
    setSubtitleCreationError('');
    setSubtitleCreationSuccess('');
    setSaveMessageError('');
    setSaveMessageSuccess('');

    try {
      const response = await axios.post(
        `http://localhost:8080/api/categories/${internalSelectedTitleId}/subtitles`,
        { text: subtitle.trim() }
      );
      console.log('Subtitle created:', response.data);

      setSubtitleCreationSuccess(`Subtitle "${response.data.text}" created successfully!`);
      setSubtitle(response.data.text);
      setInternalSelectedSubtitleId(response.data.id);
      const updatedResponse = await axios.get('http://localhost:8080/api/categories');
      setFetchedCategories(updatedResponse.data);
    } catch (error) {
      console.error('Error creating subtitle:', error.response || error);
      if (error.response?.data?.message) {
        setSubtitleCreationError(`Error: ${error.response.data.message}`);
      } else {
        setSubtitleCreationError('Failed to create subtitle. Please try again.');
      }
    } finally {
      setIsCreatingSubtitle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveMessageError('');
    setSaveMessageSuccess('');

    if (!internalSelectedTitleId) {
      setSaveMessageError('Please select or create a Category Title.');
      return;
    }
    if (!message.trim()) {
      setSaveMessageError('Message content cannot be empty.');
      return;
    }

    setSavingMessage(true);

    try {
      if (internalSelectedSubtitleId) {
        // Option 2: Save message to subtitle
        await axios.post(
          `http://localhost:8080/api/subtitles/${internalSelectedSubtitleId}/message`,
          { content: message.trim() }
        );
        setSaveMessageSuccess('Message successfully saved to subtitle!');
      } else {
        // Option 1: Save message to category (title)
        await axios.post(
          `http://localhost:8080/api/categories/${internalSelectedTitleId}/messages`,
          { content: message.trim() }
        );
        setSaveMessageSuccess('Message successfully saved to category!');
      }

      // Notify parent component of the addition/update
      onAdd({
        titleId: internalSelectedTitleId,
        title: title.trim(),
        subtitleId: internalSelectedSubtitleId,
        subtitle: subtitle.trim(),
        message: message.trim(),
      });
      // Optionally, clear the message input or close the modal after success
      setMessage('');
      // onClose(); // Uncomment if you want the modal to close on successful save
    } catch (error) {
      console.error('Error saving message:', error.response || error);
      if (error.response?.data?.message) {
        setSaveMessageError(`Error saving message: ${error.response.data.message}`);
      } else {
        setSaveMessageError('Failed to save message. Please try again.');
      }
    } finally {
      setSavingMessage(false);
    }
  };

  if (loadingCategories) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 text-center">
          Loading categories...
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 text-center text-red-600">
          {categoriesError}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">Create / Edit Template</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Title
            </label>
            <input
              type="text"
              list="existing-titles"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g., Payments or create a new one"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <datalist id="existing-titles">
              {existingTitles.map((t, index) => (
                <option key={index} value={t} />
              ))}
            </datalist>
            {internalSelectedTitleId && (
              <p className="text-xs text-gray-500 mt-1">ID: {internalSelectedTitleId}</p>
            )}
            <button
              type="button"
              onClick={handleCreateNewTitle}
              className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg"
              disabled={isCreatingTitle}
            >
              {isCreatingTitle ? 'Creating...' : '+ Create New Title'}
            </button>
            {titleCreationError && (
              <p className="text-red-500 text-sm mt-1">{titleCreationError}</p>
            )}
            {titleCreationSuccess && (
              <p className="text-green-600 text-sm mt-1">{titleCreationSuccess}</p>
            )}
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle (Optional)
            </label>
            <input
              type="text"
              list="existing-subtitles"
              value={subtitle}
              onChange={handleSubtitleChange}
              placeholder="e.g., Refund Processed"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="existing-subtitles">
              {existingSubtitles?.map((s, idx) => (
                <option key={idx} value={s} />
              ))}
            </datalist>
            {internalSelectedSubtitleId && (
              <p className="text-xs text-gray-500 mt-1">ID: {internalSelectedSubtitleId}</p>
            )}
            <button
              type="button"
              onClick={handleCreateNewSubtitle}
              className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded-lg"
              disabled={isCreatingSubtitle || !internalSelectedTitleId}
            >
              {isCreatingSubtitle ? 'Creating...' : '+ Create New Subtitle'}
            </button>
            {subtitleCreationError && (
              <p className="text-red-500 text-sm mt-1">{subtitleCreationError}</p>
            )}
            {subtitleCreationSuccess && (
              <p className="text-green-600 text-sm mt-1">{subtitleCreationSuccess}</p>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the template message here. Use [User Name] for placeholders."
              rows="6"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
             {/* Display general save error/success here, as it applies to the message */}
            {saveMessageError && (
              <p className="text-red-500 text-sm mt-1">{saveMessageError}</p>
            )}
            {saveMessageSuccess && (
              <p className="text-green-600 text-sm mt-1">{saveMessageSuccess}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={savingMessage || isCreatingTitle || isCreatingSubtitle} // Disable if saving message or creating title/subtitle
            >
              {savingMessage ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

NewTemplateFormModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  selectedTitleId: PropTypes.number,
  selectedTitle: PropTypes.string,
  selectedSubtitleId: PropTypes.number,
  selectedSubtitle: PropTypes.string,
};