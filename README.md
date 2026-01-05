┌───────────────────────────────────────────────┐
│ 1. CREATE VITE + REACT PROJECT                 │
└───────────────────────────────────────────────┘
npm create vite@latest my-react-app

Framework → React
Variant   → JavaScript

cd my-react-app
npm install
npm run dev


┌───────────────────────────────────────────────┐
│ 2. INSTALL TAILWIND CSS v4 + VITE PLUGIN       │
└───────────────────────────────────────────────┘
npm install tailwindcss @tailwindcss/vite


┌───────────────────────────────────────────────┐
│ 3. CONFIGURE VITE                             │
└───────────────────────────────────────────────┘
vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});


┌───────────────────────────────────────────────┐
│ 4. IMPORT TAILWIND CSS                        │
└───────────────────────────────────────────────┘
src/index.css

@import "tailwindcss";


┌───────────────────────────────────────────────┐
│ 5. USE TAILWIND IN REACT                      │
└───────────────────────────────────────────────┘
src/App.jsx

const App = () => {
  return (
    <div className="flex items-center justify-center h-screen text-5xl text-blue-400 font-bold underline">
      App
    </div>
  );
};

export default App;


┌───────────────────────────────────────────────┐
│ 6. START DEV SERVER                           │
└───────────────────────────────────────────────┘
npm run dev
