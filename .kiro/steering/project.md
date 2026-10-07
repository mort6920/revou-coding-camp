# Life Dashboard — Project Steering

## Project Overview
A To-Do List Life Dashboard built as part of the RevoU Coding Camp.
Displays current time (WIB), a greeting, a focus timer, a to-do list, and quick links.

## Tech Stack
- HTML5 (semantic elements)
- CSS3 (custom properties, CSS Grid, Flexbox)
- Vanilla JavaScript (no frameworks)
- Browser localStorage for all data persistence

## Folder Structure
```
revou-coding-camp/
├── index.html        ← main page
├── css/
│   └── style.css     ← all styles (single file)
├── js/
│   └── app.js        ← all logic (single file)
└── .kiro/
    └── steering/
        └── project.md
```

## Features Implemented
- Real-time clock and date (timezone: Asia/Jakarta / WIB)
- Dynamic greeting (Morning / Afternoon / Evening / Night)
- Focus Timer with Start, Stop, Reset
- To-Do List: Add, Edit, Mark done, Delete — saved to localStorage
- Quick Links: Add, Delete, open in new tab — saved to localStorage

## Challenges Completed (3 of 5)
1. Custom name in greeting → "Capt"
2. Change Pomodoro time → user input (1–60 minutes)
3. Sort tasks → Default, A→Z, Z→A, Done last

## Bonus
- Light / Original / Dark theme toggle — preference saved to localStorage
