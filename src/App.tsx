import React, { useState } from 'react';
import './App.css';
import Timeline from './components/Timeline/Timeline';
import { timelineItems } from './data/timelineItems';
import { TimelineItem } from './types/types';
import {TimelineProvider} from "./context/TimelineContext";

function App() {
  const [items, setItems] = useState<TimelineItem[]>(timelineItems);

  // Handle item updates if needed at App level
  const handleItemUpdate = (updatedItem: TimelineItem) => {
    const newItems = items.map(item =>
        item.id === updatedItem.id ? updatedItem : item
    );
    setItems(newItems);
  };

  return (
      <div className="App">
        <header className="App-header">
          <h1>Interactive Timeline</h1>
          <p>Visualize and manage events on a compact timeline</p>
        </header>
        <main className="App-main">
            <TimelineProvider>
                <Timeline items={items} />
            </TimelineProvider>
        </main>
      </div>
  );
}

export default App;