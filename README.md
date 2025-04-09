# Shinko 🧠📅

**Shinko** is a modern productivity calendar that combines week-view scheduling with an intelligent task board, built for focus and speed. Designed to mirror the look and feel of Google Calendar, Shinko helps you visually plan your day and automatically syncs with Google Calendar. It's perfect for task-first users who still rely on their calendar to stay organized.

---

## 🔗 Project Links

- **Live App**: [https://shinko.vercel.app](https://shinko.vercel.app)
- **GitHub**: [https://github.com/bendstaples7/shinko](https://github.com/bendstaples7/shinko)
- **Lovable Project Dashboard**: [https://lovable.dev/projects/53fc8d92-f90d-497e-8f6b-7ed094fd0d72](https://lovable.dev/projects/53fc8d92-f90d-497e-8f6b-7ed094fd0d72)

---

## 🧠 Key Features

- 🧭 **Google Calendar Sync** – Bi-directional integration with Google Calendar via OAuth.
- 🗂️ **Stacked Task Board** – Priority-based vertical layout: Critical, High, Medium, Low.
- 🧱 **Week View Calendar** – Custom-built 7-column layout styled like Google Calendar, with hour-by-hour scroll support (24h layout, default scroll to 6am).
- 🎯 **Drag & Drop Tasks** – Rearrange and re-prioritize tasks easily.
- ⏱️ **Live Timers** – Track time with visual indicators and timer states.
- 📁 **Animated Panels** – Toggle between calendar and task board view with collapsible panes.
- 🔔 **Toast Feedback** – Built-in toast messages for user feedback.
- 🎨 **Modern UI** – Built using `shadcn/ui` and `Tailwind CSS`.

---

## ⚙️ Tech Stack

- [Vite](https://vitejs.dev/) – Fast dev server & bundler  
- [React](https://reactjs.org/) – Frontend UI  
- [TypeScript](https://www.typescriptlang.org/) – Typed JavaScript  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework  
- [shadcn/ui](https://ui.shadcn.com/) – Component system built on Radix UI  
- [React Query](https://tanstack.com/query/latest) – Data fetching and caching  
- [Lucide Icons](https://lucide.dev/) – Icon set  
- [date-fns](https://date-fns.org/) – Date manipulation  
- [Google Calendar API](https://developers.google.com/calendar) – Calendar sync  

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm – [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

```bash
# Clone the repo
git clone https://github.com/bendstaples7/shinko.git
cd shinko

# Install dependencies
npm install

# Start local server
npm run dev

# App will be available at http://localhost:8080
