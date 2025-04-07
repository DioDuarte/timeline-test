import React, { useState } from 'react';
import './App.css';
import Timeline from './components/Timeline/Timeline';
import { timelineItems } from './data/timelineItems';
import { TimelineItem } from './types/types';
import {TimelineProvider} from "./context/TimelineContext";
import {LocalizationProvider, useLocalization} from "./context/LocalizationContext";

function App() {
  const [items, setItems] = useState<TimelineItem[]>(timelineItems);



    return (
        <div className="App">
            <header className="App-header">
                <h1>Interactive Timeline</h1>
                <p>Visualize and manage events on a compact timeline</p>
        </header>
        <main className="App-main">
            <LocalizationProvider>
                <TimelineProvider>
                    <Timeline items={items} />
                </TimelineProvider>
            </LocalizationProvider>

        </main>
      </div>
  );
}

export default App;