# AI Chatbot UI

This is a casually built basic chatbot interface built with React, TypeScript, and Vite. This application provides a sleek user experience for interacting with multiple AI language models with support for file uploads, markdown rendering, and advanced animations. It connects to llm router for llm communication and tools.

## Features

- **Multi-LLM Support**: Interact with OpenAI, Anthropic, and Google Gemini models
- **Real-time Chat**: Progressive typing animations with markdown rendering
- **AI Personalities**: Choose from multiple bot personalities with persistent avatars
- **File Upload**: Document attachments with RAG support
- **User Authentication**: Secure login with session management and guest access
- **Auto-logout**: Inactivity-based session timeout
- **Mobile-First Design**: Fully responsive interface
- **Smooth Animations**: GSAP-powered text effects and transitions
- **Custom Components**: Reusable dropdowns and checkboxes with viewport-aware positioning

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: SCSS with CSS modules
- **Animations**: GSAP, CSS transitions
- **HTTP Client**: Axios
- **Markdown**: Marked library
- **Fonts**: Google Fonts (Poppins, Quicksand, Montserrat, Patrick Hand)

## Core Components

### Chat Interface
- Main chat container with message history
- Individual message renderer with markdown support
- Avatar persistence system (messages retain original bot avatar)
- Auto-scroll to new messages
- LLM model attribution per message

### Input System
- Dynamic textarea with auto-resize
- Custom LLM and model selection dropdowns
- File attachment with drag-and-drop
- Progressive typing with markdown rendering

### UI Components
- Loading screen with animated effects
- Navigation bar with personality settings
- Authentication interface with guest access
- Error state display
- Custom dropdown with viewport-aware positioning
- Custom checkbox with exclusive selection
- Settings information panel

## Services

- **Chat Service**: Message submission to AI models with RAG support
- **Authentication**: User login and secure token management
- **File Service**: Multipart file uploads with progress tracking
- **Logout Service**: Secure session termination
- **Health Monitoring**: Server connection status

## Key Features

### Avatar Persistence
- Messages retain their original bot avatar even when personality changes
- New messages use currently selected personality
- Consistent visual conversation timeline

### Guest Access
- Two free prompts without registration
- Prompt count monitoring
- Seamless transition to full authentication

### Multi-LLM Configuration
- OpenAI: GPT-4, GPT-3.5-turbo models
- Anthropic: Claude models
- Google: Gemini models

### Custom Component Architecture
- Reusable, accessible components with TypeScript
- Viewport-aware positioning for dropdowns
- Mobile-first responsive design
- Keyboard navigation support

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/r00kieAd/ai-chatbot-ui.git
cd ai-chatbot-ui/chatbot
npm install
```

### Environment Setup
Create a `.env` file:
```
VITE_API_BASE_URL=your_api_base_url
VITE_SESSION_AUTH_VAR=your_session_variable_name
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

## Attribution

- Icons: Flaticons, FontAwesome, React-bits
- Fonts: Google Fonts
- Libraries: GSAP, Marked, Axios, React, TypeScript, Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Known Issues

- Typing animation may flicker on slow devices
- Large file uploads may timeout
- Guest login may occasionally show undefined username
- Mobile keyboard may affect dropdown positioning
- UI issues in Firefox like navbar and button alignment

## Roadmap

### Completed
- Custom dropdown and checkbox components
- AI personality system with avatar persistence
- Mobile-first responsive design
- Guest access with prompt monitoring
- Multi-LLM support
- Settings information panel

### Upcoming
- Voice message support
- Dark/light theme toggle
- Message search functionality
- Export chat history
- Real-time typing indicators
- Message reactions
- Conversation templates
- Advanced RAG configuration

Built with React, TypeScript, and modern web technologies.