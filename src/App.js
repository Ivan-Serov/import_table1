import React, { useState } from 'react';
import './App.css';
import DropzoneComponent from './DropzoneComponent/DropzoneComponent';

const App = () => {
  const [uploadedData, setUploadedData] = useState([]);
  return (
    <div className='App'>
      <h1>Upload Table App</h1>
      <DropzoneComponent setUploadedData={setUploadedData}/>
    </div>
  );
};

export default App;
