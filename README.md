# Shinko 🧠📅

**Shinko** is a modern productivity calendar that combines week-view scheduling with an intelligent task board, built for focus and speed. Designed to mirror the look and feel of Google Calendar, Shinko helps you visually plan your day and automatically syncs with Google Calendar. It's perfect for task-first users who still rely on their calendar to stay organized.

---

## 🔗 Project Links

- **Live App**: [https://shinko.vercel.app](https://shinko.vercel.app)
- **GitHub**: [https://github.com/bendstaples7/shinko](https://github.com/bendstaples7/shinko)
- **Lovable Dashboard**: [https://lovable.dev/projects/53fc8d92-f90d-497e-8f6b-7ed094fd0d72](https://lovable.dev/projects/53fc8d92-f90d-497e-8f6b-7ed094fd0d72)

---

## 🧠 Key Features

- 🧭 **Google Calendar Sync** – OAuth integration using `@react-oauth/google`, supports fetching events from Google Calendar and displaying them in the calendar view.
- 🗂️ **Stacked Task Board** – Priority-based vertical layout (Critical, High, Medium, Low) to help users visually manage their to-dos.
- 📆 **Week View Calendar** – 7-column grid layout, styled like Google Calendar, showing 24-hour vertical time slots. Scroll support is enabled with default scroll to 6AM.
- ⌛ **All-Day Events** – Google Calendar all-day events are automatically pinned to the top of each day in the calendar.
- 🔄 **Real-Time Event Filtering** – Only events from the current week (Sunday to Saturday) are shown in the calendar.
- 📦 **Drag-and-Drop Tasks** – Rearranging tasks is supported through a drag-and-drop UI.
- 🧱 **Animated Panels** – Toggle between calendar and task board with collapsible side-by-side panels.
- ⚠️ **Toast Alerts** – Built-in toast system for success, error, and informative messages.
- 💅 **Modern Aesthetic** – Powered by `shadcn/ui`, `Tailwind CSS`, and custom component layout.

---

## ⚙️ Tech Stack

- [Vite](https://vitejs.dev/) – Lightning-fast bundler and dev server  
- [React](https://reactjs.org/) – UI framework  
- [TypeScript](https://www.typescriptlang.org/) – Strongly typed JS  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS  
- [shadcn/ui](https://ui.shadcn.com/) – Modern component library  
- [React Query](https://tanstack.com/query/latest) – For remote state/data fetching  
- [Lucide Icons](https://lucide.dev/) – Clean iconography  
- [date-fns](https://date-fns.org/) – Date and time utilities  
- [Google Calendar API](https://developers.google.com/calendar) – Calendar integration  
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) – For OAuth authentication

---

## 🚀 Getting Started

### Prerequisites

- Node.js + npm (use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to install)

### Local Development

```bash
# Clone the repository
git clone https://github.com/bendstaples7/shinko.git
cd shinko

# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
http://localhost:8080

---

## PowerShell Compatibility

When using PowerShell, use semicolons (`;`) or newlines to separate commands instead of `&&`. For example:

```powershell
git pull origin main ; git checkout -b Task-Maximize-Blowup
```

or

```powershell
git pull origin main
git checkout -b Task-Maximize-Blowup
```
