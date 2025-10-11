import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import addTagsToFirestore from './hooks/useTags';

// Call the function to add your tags when the app starts
//addTagsToFirestore();
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);