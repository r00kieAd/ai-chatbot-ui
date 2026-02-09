# AI Chatbot UI

A modern, feature-rich chatbot interface built with React, TypeScript, and Vite. This application provides a sleek user experience for interacting with multiple AI language models with support for file uploads, markdown rendering, and advanced animations.

## 🚀 Features

- **Multi-LLM Support**: Interact with multiple AI language models
- **Real-time Chat**: Progressive typing animations with markdown rendering
- **File Upload**: Support for document attachments
- **User Authentication**: Secure login with session management
- **Auto-logout**: Inactivity-based session timeout (60s)
- **Responsive Design**: Mobile-friendly interface
- **Smooth Animations**: GSAP-powered text effects and transitions
- **Auto-scroll**: Smart scrolling to new messages
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
│   │   ├── chat_message_component.tsx # Individual message display
│   │   ├── click_spark.tsx           # Click animation effect
│   │   ├── display_error.tsx         # Error state component
│   │   ├── input_component.tsx       # Message input with controls
│   │   ├── loading_screen.tsx        # Loading state with animations
│   │   ├── login_components.tsx      # Authentication forms
│   │   ├── navbar.tsx                # Navigation bar
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
│   │   ├── available_llm_models.json # LLM provider configuration
│   │   └── endpoints.json            # API endpoint definitions
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

#### `input_component.tsx`
Message input interface featuring:
- Dynamic textarea with auto-resize
- LLM model selection dropdown
- File attachment support
- Send button with click effects

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
Navigation bar with user info and logout functionality.

#### `login_components.tsx`
Authentication interface with form validation and guest access.

#### `display_error.tsx`
Error state display for connection issues and API errors.

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
Seamless switching between different AI models with provider-specific configurations.

### File Attachments
Drag-and-drop file support with:
- Upload progress tracking
- File type validation
- Attachment count display

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
    {"name": "Anthropic", "id": "2"}
  ],
  "M1": {
    "MODELS": [
      {"model": "gpt-4"},
      {"model": "gpt-3.5-turbo"}
    ]
  }
}
```

## 🎨 Attribution

### Assets & Icons
- **Icons**: [Flaticons](https://www.flaticon.com/) - Various UI icons
- **Components**: [React-bits](https://react-bits.dev/) - Component patterns and utilities  
- **Icons**: [FontAwesome](https://fontawesome.com/) - Additional iconography

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

## 🔮 Roadmap

- [ ] Voice message support
- [ ] Dark/light theme toggle  
- [ ] Message search functionality
- [ ] Export chat history
- [ ] Multi-file upload support
- [ ] Drag and drop file interface
- [ ] Real-time typing indicators
- [ ] Message reactions

---

Built with :keyboard: using React, TypeScript, and modern web technologies.