import React from 'react';
import { GameScene } from './components/3d/GameScene';
import { HUD } from './components/UI/HUD';
import { ClosetModal } from './components/UI/ClosetModal';
import { WelcomeModal } from './components/UI/WelcomeModal';

export const App: React.FC = () => {
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-sky-200 select-none">
      {/* 3D Game Canvas */}
      <GameScene />

      {/* 2D User Interface Layers */}
      <HUD />
      <ClosetModal />
      <WelcomeModal />
    </div>
  );
};

export default App;
