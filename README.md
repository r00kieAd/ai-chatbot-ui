# AI Chatbot UI

This is a basic, chatbot interface built with React, TypeScript, and Vite. This application provides a sleek user experience for interacting with multiple AI language models with support for file uploads, markdown rendering, and advanced animations.

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

## Components

### Core Components

#### `chat_component.tsx`
Main chat interface that renders message history and manages chat state.

#### `chat_message_component.tsx`
Individual message renderer with:
- Auto-scroll to new messages
- LLM model attribution per message

### Input System
- Dynamic textarea with auto-resize
- Custom LLM and model selection dropdowns
- File attachment with drag-and-drop
- Progressive typing with markdown rendering

### UI Components

#### `loading_screen.tsx`
Elegant loading state with animated text shuffle effects.

#### `navbar.tsx`
Navigation bar featuring:
- User info and secure logout functionality
- Personality settings panel with exclusive selection
- Mobile burger menu for compact screens
- Custom checkbox components for personality selection
- Settings information panel with LLM configuration details

#### `login_components.tsx`
Authentication interface featuring:
- Secure user login with form validation
- Guest access with prompt count monitoring (2 prompts limit)
- Mobile-responsive design
- Error handling and user feedback

#### `display_error.tsx`
Error state display for connection issues and API errors.

### Custom UI Components

#### `dropdown.tsx`
Reusable dropdown component with:
- Viewport-aware positioning (opens up/down based on available space)
- Auto-selection logic when options change
- Keyboard navigation support (Enter, Escape, Arrow keys)
- Click-outside-to-close functionality
- Customizable styling and disabled states
- TypeScript interfaces for type safety

#### `custom_checkbox.tsx`
Reusable checkbox component featuring:
- Skewed styling design
- Controlled component pattern
- Customizable labels (ON/OFF text)
- Disabled state support
- Integration with SCSS styling system
- Event handling for state changes

#### `settings_info_card.tsx`
Information panel component displaying:
- LLM configuration details
- Model availability and parameters
- Interactive grid layout
- Mobile-responsive design
- Scrollable content area

## 🔧 Services

### API Services

#### `ask_service.tsx`
Handles chat message submission to AI models with support for:
- Multiple LLM providers
- RAG (Retrieval-Augmented Generation)
- Configurable parameters (top_k, model selection)

#### `authorization_service.tsx`
User authentication service with secure token management.

#### `file_service.tsx`
File upload service supporting:
- Multipart form data uploads
- Authentication headers
- Error handling and progress tracking

#### `logout_service.tsx`
Secure logout with server-side session termination.

#### `ping_server.tsx`
Server health monitoring for connection status.

### Utility Services

#### `clear_attachments.tsx`
File management utilities for cleaning up uploaded attachments.

## Key Features

### Smart Auto-scroll
Automatically scrolls to new bot messages while preserving user scroll position.

### Inactivity Logout
Automatic logout after 60 seconds of inactivity with:
- Mouse movement detection
- Keyboard input monitoring
- Tab visibility handling
- Graceful session cleanup

### Progressive Markdown Rendering
Real-time markdown processing during typing animation with:
- Code syntax highlighting
- Table support
- List rendering
- Link handling

### Multi-LLM Support
Seamless switching between different AI models with provider-specific configurations:
- **OpenAI**: GPT-4, GPT-3.5-turbo models
- **Anthropic**: Claude models
- **Google**: Gemini models with latest configurations

### AI Personalities
Choose from multiple bot personalities that affect conversation style:
- **Owl**: Wise and analytical responses
- **Ghost**: Mysterious and creative interactions  
- **Megatron**: Powerful and direct communication
- **Doraemon**: Friendly and helpful assistance

### Avatar Persistence System
Smart avatar management ensures:
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

## Attribution

## Attribution

- Icons: Flaticons, FontAwesome, React-bits
- Fonts: Google Fonts
- Libraries: GSAP, Marked, Axios, React, TypeScript, Vite

## Contributing

## Security Features

## License

## Performance Optimizations

## Known Issues

## Browser Support

## Roadmap

## Contributing

### In Development
- Voice message support
- Dark/light theme toggle
- Message search functionality
- Export chat history
- Real-time typing indicators
- Message reactions
- Conversation templates
- Advanced RAG configuration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Known Issues

- Typing animation may occasionally flicker on very slow devices
- File uploads > 10MB may timeout (configurable)
- Safari may have minor CSS animation differences
- Guest login may occasionally show undefined username (being addressed)
- Mobile keyboard may affect dropdown positioning on some devices
---

## Recent Updates (September 2025)

### Version 2.1.0 - Enhanced UI & Component Architecture
- **Custom Component System**: Added reusable `Dropdown` and `CustomCheckbox` components
- **Avatar Persistence**: Implemented smart avatar system preventing retroactive changes
- **Mobile-First Design**: Comprehensive mobile responsiveness with burger menu navigation
- **AI Personality System**: Multiple bot personalities with persistent avatar selection
- **Google Gemini Integration**: Added support for Google's latest AI models
- **Guest Access**: Limited free access for unauthenticated users (2 prompts)
- **CSS Architecture**: Reorganized styling system for better maintainability
- **Settings Panel**: Interactive information card with LLM configuration details
- **Viewport-Aware Dropdowns**: Smart positioning based on screen real estate
- **Enhanced Error Handling**: Improved user feedback and error state management

### Component Architecture Improvements
- **TypeScript Integration**: Full type safety across all custom components
- **Accessibility Features**: ARIA labels, keyboard navigation, screen reader support
- **Performance Optimizations**: Efficient re-renders and component lifecycle management
- **Responsive Design Patterns**: Mobile-first approach with breakpoint-based styling

---

Built with :keyboard: using React, TypeScript, and modern web technologies.
