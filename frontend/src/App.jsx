import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Intro from './pages/Intro';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Results from './pages/Results';

function App() {
  return (
    <>
      {/* Global Background Effects */}
      <div className="bg-gradient-blur"></div>
      <div className="bg-gradient-blur-2"></div>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/intro" element={<Intro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/interview/:id" element={<Interview />} />
          <Route path="/results/:id" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
