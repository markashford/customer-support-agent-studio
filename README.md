# Customer Support Agent Studio

A production-ready AI customer support system built with Next.js, leveraging Claude AI for intelligent responses and Amazon Bedrock for knowledge base retrieval. This project demonstrates enterprise-grade patterns for building scalable, observable, and maintainable AI applications.

![preview](tutorial/preview.png)

## 🎯 Key Features

- **AI-Powered Support** - Claude 3.5 Sonnet and Haiku models for intelligent, contextual responses
- **Retrieval-Augmented Generation (RAG)** - Amazon Bedrock Knowledge Base integration for accurate, sourced answers
- **Real-Time Observability** - Sidebar panels showing AI thinking process, mood detection, and source citations
- **Multi-Model Support** - Seamlessly switch between Claude models (Haiku, Sonnet) for cost/performance optimization
- **Responsive Design** - Modern UI with Tailwind CSS, shadcn/ui components, and dark mode support
- **Production Ready** - Docker containerization, GitHub Actions CI/CD, comprehensive error handling
- **Flexible Layouts** - Configure UI components via environment variables for different deployment scenarios

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key ([get one free](https://console.anthropic.com))
- AWS credentials with Bedrock access (optional, for knowledge base features)

### Installation

```bash
# Clone repository
git clone https://github.com/markashford91/customer-support-agent-studio.git
cd customer-support-agent-studio

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys
```

### Development

```bash
# Start dev server with all components
npm run dev

# Or with specific configurations
npm run dev:left    # Left sidebar only
npm run dev:right   # Right sidebar only
npm run dev:chat    # Chat-only mode
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Production Build

```bash
npm run build
npm start
```

## 📋 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Anthropic API
ANTHROPIC_API_KEY=your_api_key_here

# AWS Bedrock (for knowledge base features)
BAWS_ACCESS_KEY_ID=your_access_key
BAWS_SECRET_ACCESS_KEY=your_secret_key

# UI Configuration
NEXT_PUBLIC_INCLUDE_LEFT_SIDEBAR=true
NEXT_PUBLIC_INCLUDE_RIGHT_SIDEBAR=true
```

**Note:** AWS keys use a "B" prefix (`BAWS_*`) to comply with AWS Amplify deployment constraints.

### UI Layout Options

Configure which panels appear via environment variables:

| Flag | Description |
|------|-------------|
| `NEXT_PUBLIC_INCLUDE_LEFT_SIDEBAR` | Shows AI thinking process & category insights |
| `NEXT_PUBLIC_INCLUDE_RIGHT_SIDEBAR` | Shows RAG source citations & history |

## 🏗️ Architecture

### Component Structure

```
├── app/
│   ├── api/chat/route.ts         # Claude API integration
│   ├── layout.tsx                # Root layout with theme
│   ├── page.tsx                  # Main page shell
│   └── globals.css               # Global styles & animations
├── components/
│   ├── ChatArea.tsx              # Main chat interface
│   ├── LeftSidebar.tsx           # AI thinking display
│   ├── RightSidebar.tsx          # RAG sources display
│   ├── TopNavBar.tsx             # Navigation & theme controls
│   └── ui/                       # shadcn/ui components
└── lib/
    ├── utils.ts                  # RAG retrieval logic
    └── customer_support_categories.json
```

### Data Flow

```
User Input
    ↓
ChatArea.tsx (validation, formatting)
    ↓
/api/chat (request validation, RAG retrieval, Claude call)
    ↓
Bedrock Knowledge Base (context retrieval)
    ↓
Claude AI (response generation, JSON formatting)
    ↓
Response (thinking, mood, citations, categories)
    ↓
UI (message display, source visualization, sidebar updates)
```


## 🤖 AI Configuration

### Model Selection

Models are configured in `ChatArea.tsx`:

```typescript
const models: Model[] = [
  { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
  { id: "claude-haiku-4-5-20251001", name: "Claude 4.5 Haiku" },
  { id: "claude-3-5-sonnet-20240620", name: "Claude 3.5 Sonnet" },
];
```

### Knowledge Base Setup

1. Create a knowledge base in AWS Bedrock Console
2. Upload documents to configure RAG
3. Update knowledge base IDs in `ChatArea.tsx`:

```typescript
const knowledgeBases: KnowledgeBase[] = [
  { id: "your-kb-id", name: "Product Docs" },
];
```

## 🐳 Docker Deployment

### Build & Run

```bash
# Build image
docker build -t customer-support-agent .

# Run container
docker run -p 3000:3000 \
  -e ANTHROPIC_API_KEY=your_key \
  -e BAWS_ACCESS_KEY_ID=your_key \
  -e BAWS_SECRET_ACCESS_KEY=your_secret \
  customer-support-agent
```

### Docker Compose

```bash
# Set environment variables
export ANTHROPIC_API_KEY=your_key
export BAWS_ACCESS_KEY_ID=your_key
export BAWS_SECRET_ACCESS_KEY=your_secret

# Start services
docker-compose up
```

The Dockerfile uses multi-stage builds for optimal image size (~400MB) and includes health checks.

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
- ✅ Runs linter on commits
- ✅ Builds Next.js production bundle
- ✅ Tests multiple Node versions (18.x, 20.x)
- 🐳 Builds Docker image on main branch push

View workflow in `.github/workflows/ci.yml`.

## Tests

```bash
npm test
```

Request validation for `/api/chat` lives in `lib/chat-schema.ts` and is covered by Vitest.

## 🎨 Customization

### Themes

Themes are defined in `styles/themes.js`. Available themes:
- Neutral (default)
- Red, Violet, Blue, Tangerine, Emerald, Amber

Users can toggle via the TopNavBar theme selector.

### Styling

- **Framework**: Tailwind CSS with CSS variables
- **Components**: shadcn/ui with custom extensions
- **Fonts**: Manrope (body) + Space Grotesk (display)
- **Animations**: Fade-in, bounce effects with Tailwind animate

## 📊 Observability

### What Gets Logged

The API logs:
- Request validation results
- RAG retrieval success/failure
- Claude API latency
- Response generation performance
- Error stack traces with context

Example console output:
```
📝 Latest Query: "How do I reset my password?"
🔍 RAG Retrieved: YES
✅ Response generated in 1.23s
```

### Client-Side Metrics

ChatArea.tsx tracks:
- Time to first thinking state
- Network round-trip duration
- JSON parse time
- Total client operation time

## 🔐 Security & Best Practices

- **Input Validation**: Zod schema validation on all API requests
- **Timeout Handling**: RAG queries have 5-second timeout to prevent hanging
- **Error Recovery**: Graceful fallbacks if RAG unavailable
- **Environment Secrets**: API keys stored in `.env.local` (not in version control)
- **CORS Headers**: Configured for safe cross-origin requests
- **Rate Limiting**: Can be added via middleware (not included in base)

## 📈 Performance

### Optimizations Implemented

- **Code Splitting**: Dynamic imports for sidebars (not loaded if disabled)
- **Multi-Stage Docker**: Reduces image size from 900MB → 400MB
- **CSS Variables**: Efficient theme switching without re-renders
- **Markdown Rendering**: Server-safe with rehype plugins
- **Streaming Responses**: Prepared for future real-time features

### Benchmarks

- Initial page load: ~300ms (cached)
- API response: 1-2 seconds (depends on Claude latency)
- RAG retrieval: 0.5-2 seconds
- Docker container startup: ~3 seconds

## 🛠️ Development Guide

### Adding a New Feature

1. Create feature branch: `git checkout -b feat/my-feature`
2. Make changes and test locally: `npm run dev`
3. Verify lint: `npm run lint`
4. Build check: `npm run build`
5. Commit: `git commit -m "feat: add my feature"`
6. Push and create PR

### Project Structure Philosophy

- **Separation of Concerns**: UI (components) separate from logic (lib, api)
- **Type Safety**: Full TypeScript coverage with strict mode enabled
- **Error Boundaries**: Try-catch blocks at API and component levels
- **Composability**: Small, reusable UI components (MessageContent, SuggestedQuestions)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Claude API Guide](https://docs.anthropic.com)
- [Bedrock Knowledge Bases](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

## ⚠️ Important Notes

- This project is production-ready but configured for educational use
- Bedrock Knowledge Base features require AWS setup and may incur costs
- Claude API calls consume credits per token used
- Environment variables are required for all AI features

## 📄 License

This project is provided as-is under the MIT License. See LICENSE for details.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit changes with descriptive messages
4. Submit a pull request

## ✨ Showcase Ready

This codebase demonstrates:
- ✅ Full-stack TypeScript application
- ✅ Professional API design with validation
- ✅ Modern React patterns (hooks, dynamic imports)
- ✅ Enterprise deployment (Docker, CI/CD)
- ✅ Accessible UI with ARIA labels
- ✅ Real-time state management
- ✅ Error handling and recovery
- ✅ Performance monitoring and logging

**Perfect for**: Portfolio projects, production deployments, and AI application reference implementations.
