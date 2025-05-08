



import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/AddJournal.css';

function AddJournal() {
  // Mood tracking state
  const [selectedMoodCategory, setSelectedMoodCategory] = useState(null);
  const [selectedSpecificMood, setSelectedSpecificMood] = useState(null);
  
  // Gratitude items state
  const [gratitudeItems, setGratitudeItems] = useState([]);
  const [newGratitude, setNewGratitude] = useState('');
  
  // Journal form data state
  const [journalData, setJournalData] = useState({
    title: '',
    content: '',
    mood: {},
    grateful: [],
    selfReflection: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Mood categories data
  const moodCategories = [
    { 
      name: "joyful", 
      emoji: "😄", 
      options: [
        { mood: "Ecstatic", emoji: "🤩" },
        { mood: "Elated", emoji: "😁" },
        { mood: "Euphoric", emoji: "😆" },
        { mood: "Overjoyed", emoji: "🥳" },
        { mood: "Radiant", emoji: "🌟" },
        { mood: "Triumphant", emoji: "🏆" },
        { mood: "Exuberant", emoji: "🎉" }
      ] 
    },
    { 
      name: "happy", 
      emoji: "😊", 
      options: [
        { mood: "Content", emoji: "🙂" },
        { mood: "Cheerful", emoji: "😃" },
        { mood: "Pleased", emoji: "☺️" },
        { mood: "Optimistic", emoji: "😌" },
        { mood: "Playful", emoji: "😜" },
        { mood: "Grateful", emoji: "🥰" },
        { mood: "Satisfied", emoji: "😊" }
      ] 
    },
    { 
      name: "calmAndContent", 
      emoji: "😌", 
      options: [
        { mood: "Serene", emoji: "🌊" },
        { mood: "Tranquil", emoji: "🍃" },
        { mood: "Centered", emoji: "🧘" },
        { mood: "Secure", emoji: "🛡️" },
        { mood: "Grounded", emoji: "🌱" },
        { mood: "Composed", emoji: "🎭" },
        { mood: "Reflective", emoji: "🤔" }
      ] 
    },
    { 
      name: "angry", 
      emoji: "😡", 
      options: [
        { mood: "Frustrated", emoji: "😤" },
        { mood: "Annoyed", emoji: "🙄" },
        { mood: "Irritated", emoji: "😒" },
        { mood: "Furious", emoji: "🤬" },
        { mood: "Resentful", emoji: "😾" },
        { mood: "Agitated", emoji: "😖" },
        { mood: "Enraged", emoji: "👿" }
      ] 
    },
    { 
      name: "anxious", 
      emoji: "😟", 
      options: [
        { mood: "Nervous", emoji: "😬" },
        { mood: "Restless", emoji: "😵" },
        { mood: "Apprehensive", emoji: "😨" },
        { mood: "Uneasy", emoji: "😰" },
        { mood: "Fearful", emoji: "😱" },
        { mood: "Jittery", emoji: "🥴" },
        { mood: "Panicky", emoji: "😳" }
      ] 
    },
    { 
      name: "sad", 
      emoji: "😢", 
      options: [
        { mood: "Disappointed", emoji: "😞" },
        { mood: "Melancholic", emoji: "😔" },
        { mood: "Despondent", emoji: "😩" },
        { mood: "Heartbroken", emoji: "💔" },
        { mood: "Lonely", emoji: "🏝️" },
        { mood: "Miserable", emoji: "😫" },
        { mood: "Dismal", emoji: "🌧️" }
      ] 
    },
    { 
      name: "depressed", 
      emoji: "😔", 
      options: [
        { mood: "Hopeless", emoji: "🕳️" },
        { mood: "Despairing", emoji: "😣" },
        { mood: "Dejected", emoji: "😕" },
        { mood: "Disheartened", emoji: "🥀" },
        { mood: "Desolate", emoji: "🏜️" },
        { mood: "Gloomy", emoji: "☁️" },
        { mood: "Sorrowful", emoji: "😿" },
        { mood: "Mourning", emoji: "⚰️" }
      ] 
    }
  ];

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJournalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (e) => {
    setJournalData(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  const handleNotesChange = (e) => {
    setJournalData(prev => ({
      ...prev,
      selfReflection: e.target.value
    }));
  };

  const handleMoodCategorySelect = (category) => {
    setSelectedMoodCategory(category === selectedMoodCategory ? null : category);
    setSelectedSpecificMood(null);
  };

  const handleSpecificMoodSelect = (mood) => {
    setSelectedSpecificMood(mood);
    setJournalData(prev => ({
      ...prev,
      mood: {
        category: selectedMoodCategory,
        specificMood: mood.mood,
        emoji: mood.emoji
      }
    }));
  };

  const handleAddGratitude = () => {
    if (newGratitude.trim() === '') return;
    if (gratitudeItems.length >= 10) return;
    
    const updatedGratitude = [...gratitudeItems, newGratitude];
    setGratitudeItems(updatedGratitude);
    setJournalData(prev => ({
      ...prev,
      grateful: updatedGratitude
    }));
    setNewGratitude('');
  };

  const handleRemoveGratitude = (index) => {
    const updatedItems = [...gratitudeItems];
    updatedItems.splice(index, 1);
    setGratitudeItems(updatedItems);
    setJournalData(prev => ({
      ...prev,
      grateful: updatedItems
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddGratitude();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!journalData.title || !journalData.content || !selectedSpecificMood || gratitudeItems.length < 3) {
      alert('Please fill all required fields (Title, Content, Mood, and at least 3 gratitude items)');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:8080/journal/create', journalData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Journal entry saved:', response.data);
      alert('Journal entry saved successfully!');
      
      // Reset form
      setJournalData({
        title: '',
        content: '',
        mood: {},
        grateful: [],
        selfReflection: '',
        date: new Date().toISOString().split('T')[0]
      });
      setSelectedMoodCategory(null);
      setSelectedSpecificMood(null);
      setGratitudeItems([]);
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert(`Failed to save journal entry: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className='daily-planner'>
      <header className='planner-header'>
        <h1>MY DAILY MOOD JOURNAL</h1>
      </header>
      
      <form onSubmit={handleSubmit}>
        <div className='planner-container'>
          <div className='planner-section'>
            <h2>LET US JOURNAL!</h2>
            <div className='journal-content'>
              <input
                type="text"
                name="title"
                value={journalData.title}
                onChange={handleInputChange}
                placeholder="Title your entry"
                className="journal-title"
                required
              />
              <textarea 
                className='journal-entry' 
                name="content"
                value={journalData.content}
                onChange={handleContentChange}
                placeholder='How are you feeling today? Write your thoughts here...'
                required
              />
            </div>
          </div>

          <div className='planner-section'>
            <h2>SELF REFLECTION</h2>
            <div className='notes'>
              <textarea 
                name="selfReflection"
                value={journalData.selfReflection}
                onChange={handleNotesChange}
                placeholder='Today I learned...'
              />
            </div>
          </div>

          <div className='planner-section mood-section'>
            <h2>HOW ARE YOU FEELING?</h2>
            <div className='mood-categories'>
              {moodCategories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className={`mood-category-btn ${selectedMoodCategory === category.name ? 'active' : ''}`}
                  onClick={() => handleMoodCategorySelect(category.name)}
                  aria-label={category.name}
                >
                  <span className='emoji'>{category.emoji}</span>
                </button>
              ))}
            </div>

            {selectedMoodCategory && (
              <div className='specific-moods-container'>
                <h4>Select specific mood:</h4>
                <div className='specific-moods'>
                  {moodCategories.find(cat => cat.name === selectedMoodCategory).options.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`specific-mood-btn ${selectedSpecificMood?.mood === option.mood ? 'selected' : ''}`}
                      onClick={() => handleSpecificMoodSelect(option)}
                      aria-label={option.mood}
                    >
                      <span className='emoji'>{option.emoji}</span>
                      <span className='tooltip'>{option.mood}</span>
                    </button>
                  ))}
                </div>
                {selectedSpecificMood && (
                  <div className='selected-mood-display font-sansserif'>
                    <span className='emoji'>{selectedSpecificMood.emoji}</span>
                    <span>You selected: <strong>{selectedSpecificMood.mood}</strong></span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='planner-section gratitude-section'>
            <h2>GRATITUDE</h2>
            <div className='gratitude-input-container'>
              <input
                type="text"
                value={newGratitude}
                onChange={(e) => setNewGratitude(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='What are you grateful for today?'
                disabled={gratitudeItems.length >= 10}
              />
              <button
                type="button"
                onClick={handleAddGratitude}
                disabled={gratitudeItems.length >= 10 || newGratitude.trim() === ''}
                className='add-gratitude-btn font-sansserif rounded-full pt-2 pl-2 pr-2'
              >
                Add
              </button>
            </div>
            
            {gratitudeItems.length < 3 && (
              <p className='gratitude-reminder'>Add at least {3 - gratitudeItems.length} more gratitude items</p>
            )}

            <ul className='gratitude-list'>
              {gratitudeItems.map((item, index) => (
                <li key={index} className='gratitude-item'>
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGratitude(index)}
                    className='remove-gratitude-btn'
                    aria-label='Remove gratitude item'
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            
            <div className='gratitude-counter'>
              {gratitudeItems.length}/10 items ({Math.max(0, 3 - gratitudeItems.length)} more required)
            </div>
          </div>

          <div className='quote-section'>
            <h3>Quote of the Day</h3>
            <p className='quote'>"This is an inspirational quote for today."</p>
          </div>

          <div className='form-actions'>
            <button type="submit" className='submit-btn'>
              SAVE ENTRY
            </button>
          </div>
        </div>
      </form>

      <footer className='planner-footer'>
        <p>footer</p>
      </footer>
    </div>
  );
}

export default AddJournal;

