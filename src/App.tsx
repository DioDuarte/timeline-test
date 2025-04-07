import React, { useState } from 'react';
import './App.css';
import Timeline from './components/Timeline/Timeline';
import { timelineItems } from './data/timelineItems';
import { TimelineItem } from './types/types';
import {TimelineProvider} from "./context/TimelineContext";
import {LocalizationProvider, useLocalization} from "./context/LocalizationContext";

function App() {
  const [items, setItems] = useState<TimelineItem[]>(timelineItems);

    const LanguageSwitcher: React.FC = () => {
        const { language, setLanguage } = useLocalization();
        return (
            <>
                <select value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'pt')}>
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                </select>
            </>

        );
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Interactive Timeline</h1>
                <p>Visualize and manage events on a compact timeline</p>
        </header>
        <main className="App-main">
            <LocalizationProvider>
                <TimelineProvider>
                    <LanguageSwitcher/>
                    <Timeline items={items} />
                </TimelineProvider>
            </LocalizationProvider>

        </main>
      </div>
  );
}

export default App;