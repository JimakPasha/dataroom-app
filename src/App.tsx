import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RoomPage } from './pages/RoomPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DialogProvider } from './contexts/DialogContext';

const App = () => {
  return (
    <BrowserRouter>
      <DialogProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="/about-documentation" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </DialogProvider>
    </BrowserRouter>
  );
};

export default App;

