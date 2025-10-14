# AI Chatbot UI

A modern, feature-rich chatbot interface built with React, TypeScript, and Vite. This application provides a sleek user experience for interacting with multiple AI language models with support for file uploads, markdown rendering, and advanced animations.

## 🚀 Features

- **Multi-LLM Support**: Interact with multiple AI language models (OpenAI, Anthropic, Google Gemini)
- **Real-time Chat**: Progressive typing animations with markdown rendering
- **AI Personalities**: Choose from multiple bot personalities (Owl, Ghost, Megatron, Doraemon) with avatar persistence
- **Custom UI Components**: Reusable dropdown and checkbox components with modern styling
- **File Upload**: Support for document attachments with RAG (Retrieval-Augmented Generation)
- **User Authentication**: Secure login with session management and guest access
- **Auto-logout**: Inactivity-based session timeout (60s)
- **Mobile-First Design**: Fully responsive interface with mobile-optimized components
- **Smooth Animations**: GSAP-powered text effects and transitions
- **Auto-scroll**: Smart scrolling to new messages
- **Avatar Persistence**: Chat messages maintain their original bot avatars even when personality settings change
- **Viewport-Aware Dropdowns**: Custom dropdowns that automatically adjust positioning
- **Error Handling**: Comprehensive error states and user feedback

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: SCSS with CSS modules
- **Animations**: GSAP, CSS transitions
- **HTTP Client**: Axios
- **Markdown**: Marked library
- **Icons**: Flaticons, FontAwesome, React-bits
- **Fonts**: Google Fonts (Poppins, Quicksand, Montserrat, Patrick Hand)

## 📁 Project Structure

```
chatbot/
├── src/
│   ├── components/          # React components
│   │   ├── attach_component.tsx      # File attachment handler
│   │   ├── chat_component.tsx        # Main chat container
│   │   ├── chat_message_component.tsx # Individual message display with avatar persistence
│   │   ├── click_spark.tsx           # Click animation effect
│   │   ├── custom_checkbox.tsx       # Reusable checkbox component with skewed styling
│   │   ├── display_error.tsx         # Error state component
│   │   ├── dropdown.tsx              # Custom dropdown with viewport-aware positioning
│   │   ├── input_component.tsx       # Message input with custom dropdown controls
│   │   ├── loading_screen.tsx        # Loading state with animations
│   │   ├── login_components.tsx      # Authentication forms with guest access
│   │   ├── navbar.tsx                # Navigation bar with personality settings
│   │   ├── settings_info_card.tsx    # Settings information panel
│   │   ├── shiny_text.tsx           # Animated text effect
│   │   ├── shuffle_text.tsx         # GSAP text shuffle animation
│   │   ├── silk_bg.tsx              # Animated background
│   │   ├── split_text.tsx           # Character-by-character text animation
│   │   └── typing_effect_component.tsx # Progressive typing with markdown
│   ├── services/            # API service layer
│   │   ├── ask_service.tsx           # Chat message API
│   │   ├── authorization_service.tsx # User authentication
│   │   ├── clear_attachments.tsx     # File cleanup utilities
│   │   ├── file_service.tsx          # File upload handler
│   │   ├── logout_service.tsx        # User logout
│   │   └── ping_server.tsx           # Server health check
│   ├── utils/               # Utility functions
│   │   ├── global_context.tsx        # Global state management
│   │   └── textarea_css_data.tsx     # Dynamic textarea styling
│   ├── configs/             # Configuration files
│   │   ├── available_llm_models.json # LLM provider configuration (OpenAI, Anthropic, Gemini)
│   │   ├── bot_prompts.json          # AI personality configurations
│   │   ├── endpoints.json            # API endpoint definitions
│   │   └── lllm_config_info.json     # LLM configuration metadata
│   ├── assets/              # Static assets
│   └── types/               # TypeScript type definitions
├── public/                  # Public assets
└── package.json            # Dependencies and scripts
```

## 🎨 Components

### Core Components

#### `chat_component.tsx`
Main chat interface that renders message history and manages chat state.

#### `chat_message_component.tsx`
Individual message renderer with:
- Auto-scroll to new messages
- LLM model attribution per message
- Markdown support for rich text
- Progressive typing animation
- Avatar persistence (messages retain original bot avatar even when personality changes)
- Personality-based avatar selection (Owl, Ghost, Megatron, Doraemon)

#### `input_component.tsx`
Message input interface featuring:
- Dynamic textarea with auto-resize
- Custom LLM and model selection dropdowns
- File attachment support with drag-and-drop
- Send button with click effects
- Personality integration for message creation
- Mobile-responsive design

#### `typing_effect_component.tsx`
Progressive character-by-character typing with:
- Live markdown rendering
- Stable partial content display
- Code fence handling
- Configurable typing speed (100 WPM default)

### Animation Components

#### `shuffle_text.tsx`
GSAP-powered text shuffle animation with:
- Character scrambling effects
- Customizable animation modes
- Scroll trigger support
- Hover interactions

#### `split_text.tsx`
Character-by-character text reveals with:
- Staggered animations
- Configurable easing
- Threshold-based triggers

#### `shiny_text.tsx`
Gradient text animation effect with:
- Customizable colors and duration
- Enable/disable states
- Smooth transitions

#### `click_spark.tsx`
Click interaction enhancement with:
- Particle burst effects
- Configurable spark properties
- Wrappable around any element

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

## 🌟 Key Features

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
- Existing messages retain their original bot avatar
- No retroactive changes to conversation history
- Consistent visual conversation timeline

### File Attachments
Comprehensive file handling with:
- Drag-and-drop file support
- Upload progress tracking with bouncing animations
- File type validation and error handling
- Attachment count display with clear functionality
- RAG (Retrieval-Augmented Generation) integration
- Secure file cleanup services

### Guest Access System
Limited access for unauthenticated users:
- 2 free prompts without registration
- Prompt count monitoring and display
- Session management for guest users
- Seamless transition to full authentication

### Custom Component Architecture
Reusable, accessible components:
- **Custom Dropdowns**: Viewport-aware positioning, keyboard navigation
- **Custom Checkboxes**: Exclusive selection patterns, skewed styling
- **Mobile-First Design**: Responsive components for all screen sizes
- **TypeScript Integration**: Full type safety and developer experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/r00kieAd/ai-chatbot-ui.git
   cd ai-chatbot-ui/chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the chatbot directory:
   ```env
   VITE_API_BASE_URL=your_api_base_url
   VITE_SESSION_AUTH_VAR=your_session_variable_name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Preview production build**
   ```bash
   npm run preview
   ```

### Configuration

#### API Endpoints
Update `src/configs/endpoints.json` with your API endpoints:
```json
{
  "LOGIN": "/auth/login",
  "LOGOUT": "/auth/logout", 
  "ASK": "/chat/ask",
  "UPLOAD": "/files/upload",
  "PING": "/health"
}
```

#### LLM Models
Configure available models in `src/configs/available_llm_models.json`:
```json
{
  "ALL": [
    {"name": "OpenAI", "id": "1"},
    {"name": "Anthropic", "id": "2"},
    {"name": "Google", "id": "3"}
  ],
  "M1": {
    "MODELS": [
      {"model": "gpt-4o"},
      {"model": "gpt-4o-mini"},
      {"model": "gpt-3.5-turbo"}
    ]
  },
  "M2": {
    "MODELS": [
      {"model": "claude-3-sonnet"},
      {"model": "claude-3-haiku"}
    ]
  },
  "M3": {
    "MODELS": [
      {"model": "gemini-pro"},
      {"model": "gemini-pro-vision"}
    ]
  }
}
```

#### Bot Personalities
Configure AI personalities in `src/configs/bot_prompts.json`:
```json
{
  "PERSONALITY": [
    {"NAME": "Owl", "VALUE": "You are a wise and analytical assistant."},
    {"NAME": "Ghost", "VALUE": "You are a mysterious and creative guide."},
    {"NAME": "Megatron", "VALUE": "You are a powerful and direct advisor."},
    {"NAME": "Doraemon", "VALUE": "You are a friendly and helpful companion."}
  ]
}
```

## 🎨 Attribution

### Assets & Icons
- **Icons**: [Flaticons](https://www.flaticon.com/) - Various UI icons and bot avatars
- **Components**: [React-bits](https://react-bits.dev/) - Component patterns and utilities  
- **Icons**: [FontAwesome](https://fontawesome.com/) - Dropdown arrows and navigation icons
- **Bot Avatars**: Custom personality-based avatar system (Owl, Ghost, Megatron, Doraemon)

### Fonts
- **Poppins**: Google Fonts - Primary UI font
- **Quicksand**: Google Fonts - Secondary text
- **Montserrat**: Google Fonts - Message timestamps
- **Patrick Hand**: Google Fonts - User message styling
- **Press Start 2P**: Google Fonts - Loading screen

### Dependencies
- **GSAP**: Animation library for text effects
- **Marked**: Markdown parsing and rendering
- **Axios**: HTTP client for API requests
- **React**: UI framework
- **TypeScript**: Type safety and development experience
- **Vite**: Build tool and development server

## 🔒 Security Features

- Secure session management with auto-logout
- Token-based authentication
- XSS protection through proper sanitization
- CSRF protection through token validation

## 🚀 Performance Optimizations

- Code splitting with React.lazy
- Optimized re-renders with React.memo
- Efficient scroll handling
- Lazy loading of heavy components
- Optimized bundle size with Vite

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Typing animation may occasionally flicker on very slow devices
- File uploads > 10MB may timeout (configurable)
- Safari may have minor CSS animation differences
- Guest login may occasionally show undefined username (being addressed)
- Mobile keyboard may affect dropdown positioning on some devices

## 🔮 Roadmap

### Completed ✅
- [x] Custom dropdown components with viewport awareness
- [x] Custom checkbox components with exclusive selection  
- [x] AI personality system with avatar persistence
- [x] Mobile-first responsive design
- [x] Guest access with prompt monitoring
- [x] Multi-LLM support (OpenAI, Anthropic, Google Gemini)
- [x] Settings information panel
- [x] CSS architecture reorganization

### Upcoming Features
- [ ] Conversational AI
- [ ] Voice message support
- [ ] Dark/light theme toggle  
- [ ] Message search functionality
- [ ] Export chat history
- [ ] Real-time typing indicators
- [ ] Message reactions
- [ ] Conversation templates
- [ ] Advanced RAG configuration
- [ ] API rate limiting display

---

## 📝 Recent Updates (September 2025)

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