/**
 * Registers a new user by sending user data to the backend API
 * @param {Object} userData - User registration data containing:
 *   {string} name - User's full name
 *   {string} email - User's email address
 *   {string} password - User's password
 *   {string} phoneNumber - User's 10-digit phone number
 * @returns {Promise<Object>} - Response from the server containing:
 *   {string} message - Success/error message
 *   {Object} [user] - Registered user data (on success)
 *   {string} [error] - Error details (on failure)
 */
export const registerUser = async (userData) => {
    // Make POST request to registration endpoint
    const response = await fetch('http://localhost:8080/user/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Specify JSON content
        },
        body: JSON.stringify(userData), // Convert object to JSON string
    });
    
    // Parse and return JSON response from server
    return await response.json();
};