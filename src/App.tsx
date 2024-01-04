import { useEffect } from 'react';
import './App.css';

import { runGameApp } from './pixiMain';

function App() {
  useEffect(() => {
    runGameApp();
  }, []);

  return <div></div>;
}

export default App;
