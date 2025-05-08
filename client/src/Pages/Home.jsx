import React from 'react';

function Home() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-[url('./assets/beige-green-abstract-botanical-patterned-background-vector_53876-173863.avif')] bg-cover bg-no-repeat bg-center px-4 text-center">
      <h1 className="text-4xl font-bold text-[#42bfdd] mb-4">Welcome to MoodJournal</h1>

     
        <p className="text-xl italic text-[#ef99c4] max-w-2xl">
          “Keeping a journal of what’s going on in your life is a good way to help you distill what’s important and what’s not.” – <span className="not-italic font-medium">Martina Navratilova</span>
        </p>
      
        <p className="text-xs text-gray-600 max-w-lg">
          Your journey matters. Head over to the dashboard to track your mood and thoughts!
        </p>
     
    </div>
  );
}

export default Home;
