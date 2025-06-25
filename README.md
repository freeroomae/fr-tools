# FreeRoom PropScrapeAI

A powerful web scraping tool designed to help landlords import property listings from various platforms into the FreeRoom ecosystem. PropScrapeAI combines advanced web scraping capabilities with AI-powered content enhancement to streamline property listing management.

## 🎯 Project Overview and Goals

PropScrapeAI is a Next.js-based application that enables property managers and landlords to:

- **Extract property data** from multiple real estate platforms automatically
- **Enhance property descriptions** using AI to create more engaging listings
- **Batch process** multiple properties efficiently
- **Export data** in various formats for integration with other systems
- **Manage property listings** through a modern, intuitive interface

The tool serves as a bridge between different property platforms and the FreeRoom ecosystem, reducing manual data entry and improving listing quality through AI-powered enhancements.

## ✨ Features

### Core Scraping Capabilities
- **Individual URL Scraping**: Extract property details from single listing URLs
- **HTML Content Scraping**: Process raw HTML content directly
- **Bulk Processing**: Handle multiple URLs via Excel/CSV file uploads or text input
- **Anti-Bot Evasion**: Advanced techniques including rotating user agents and CAPTCHA handling

### AI-Powered Enhancements
- **Content Enhancement**: Improve property descriptions using OpenAI API
- **Real Estate Copywriting**: Generate engaging content following industry best practices
- **Title Optimization**: Create compelling property titles

### Data Management
- **Property Database**: Local JSON-based storage for scraped properties
- **History Tracking**: Monitor scraping activities and results
- **Export Options**: Download data as Excel, CSV, or JSON
- **Image Management**: Firebase Storage integration for property images

### User Interface
- **Modern Design**: Clean, professional UI using Tailwind CSS
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Real-time Feedback**: Loading states, progress indicators, and notifications
- **Tabbed Interface**: Organized workflow for different scraping methods

## 🌐 Supported Platforms

PropScrapeAI can extract property information from any real estate website that provides structured HTML content. The AI-powered extraction engine is designed to handle various property listing formats and can extract:

- Property details (price, location, bedrooms, bathrooms, area)
- Property features and amenities
- Contact information (agent name, phone, email)
- Regulatory information (RERA numbers, DLD BRN, permits)
- Building and location details
- Images and media content

## 🚀 Installation and Setup

### Prerequisites

- **Node.js** 20.x or later
- **npm** or **yarn** package manager
- **Firebase account** (for image storage)
- **Google AI API key** or **OpenAI API key** (for content enhancement)

### Environment Setup

1. **Clone the repository**:
```bash
git clone https://github.com/freeroomae/fr-tools.git
cd fr-tools
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment configuration**:
Create a `.env.local` file in the root directory:

```env
# Firebase Configuration (for image storage)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# AI Configuration (choose one)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key
# OR
OPENAI_API_KEY=your_openai_api_key
```

4. **TypeScript configuration**:
```bash
npm run typecheck
```

5. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### AI Development Tools

For AI flow development and testing:

```bash
# Start Genkit development server
npm run genkit:dev

# Start with file watching
npm run genkit:watch
```

## 📖 Usage Instructions

### Individual URL Scraping

1. Navigate to the main dashboard
2. Select the "URL" tab
3. Enter a property listing URL
4. Click "Scrape" to extract property information
5. Review and edit results as needed
6. Save to database or export data

**Example**:
```
URL: https://example-real-estate-site.com/property/123
Result: Extracted property with title, price, location, and features
```

### HTML Content Scraping

1. Select the "HTML" tab
2. Paste raw HTML content from a property listing page
3. Click "Scrape HTML" to process the content
4. Review extracted property details

**Use case**: When direct URL access is restricted or you have saved HTML content.

### Bulk Processing

1. Select the "Bulk" tab
2. Choose one of these methods:
   - **File Upload**: Upload Excel/CSV file with URLs
   - **Text Input**: Paste multiple URLs (one per line)
3. Click "Process Bulk" to scrape all URLs
4. Monitor progress and review results

**File format example**:
```csv
URL
https://site1.com/property/1
https://site2.com/property/2
https://site3.com/property/3
```

### AI Content Enhancement

1. After scraping properties, click "Enhance" on any property
2. Review AI-generated improvements to title and description
3. Accept or modify the enhanced content
4. Save changes to the database

### Data Export

From the results table:
- **Excel**: Download as `.xlsx` file
- **CSV**: Download as `.csv` file  
- **JSON**: Download as `.json` file

### Database Management

Access the "Database" page to:
- View all saved properties
- Edit property details
- Delete properties
- Bulk export operations

### History Tracking

Access the "History" page to:
- Review past scraping activities
- See success/failure statistics
- Track processed URLs and results

## 🛠 Development

### Project Structure

```
src/
├── ai/                 # AI flows and configurations
│   ├── flows/         # Property extraction and enhancement
│   └── genkit.ts      # AI framework setup
├── app/               # Next.js app router pages
│   ├── actions.ts     # Server actions
│   ├── database/      # Database management page
│   └── history/       # History tracking page
├── components/        # React components
│   ├── app/          # Application-specific components
│   └── ui/           # Reusable UI components
├── lib/              # Utility functions
│   ├── db.ts         # Database operations
│   ├── types.ts      # TypeScript type definitions
│   └── export.ts     # Data export utilities
└── hooks/            # Custom React hooks
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run genkit:dev       # Start AI development tools
npm run genkit:watch     # Start AI tools with file watching

# Building
npm run build           # Build for production
npm run start          # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run typecheck      # Run TypeScript compiler
```

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Genkit**: AI framework for property extraction and enhancement
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Form management with validation
- **Zod**: Runtime type validation

## 🤝 Contribution Guidelines

We welcome contributions from developers, including AI assistants like GitHub Copilot. Here's how to contribute effectively:

### Getting Started

1. **Fork the repository** and create a feature branch
2. **Set up the development environment** following installation instructions
3. **Review the codebase** to understand existing patterns and conventions
4. **Run tests** to ensure the current codebase is working

### Code Standards

- **TypeScript**: Use strict typing, define interfaces for all data structures
- **Component Structure**: Follow the existing component organization in `src/components/`
- **Server Actions**: Place server-side logic in `src/app/actions.ts`
- **Styling**: Use Tailwind CSS classes, follow existing design patterns
- **AI Flows**: Add new AI capabilities in `src/ai/flows/`

### Making Changes

1. **Small, focused changes**: Make minimal modifications to achieve your goals
2. **Preserve existing functionality**: Don't break working features
3. **Follow existing patterns**: Match the style and structure of existing code
4. **Update types**: Modify `src/lib/types.ts` when adding new data fields
5. **Test thoroughly**: Verify your changes work with different property types

### AI Assistant Guidelines

For GitHub Copilot and other AI assistants:

- **Context awareness**: Study the existing `Property` type definition and extraction schema
- **Pattern matching**: Follow existing component patterns, especially in form handling and data display
- **Error handling**: Implement proper error boundaries and user feedback
- **Type safety**: Ensure all new code is properly typed
- **Performance**: Consider the impact of changes on scraping speed and accuracy

### Pull Request Process

1. **Update documentation** if you're adding new features
2. **Test your changes** with various property listing formats
3. **Include examples** of how your changes improve the tool
4. **Describe the problem** you're solving and your approach

### Areas for Contribution

- **New platform support**: Add scrapers for additional real estate websites
- **Enhanced AI prompts**: Improve property extraction accuracy
- **UI improvements**: Better user experience and accessibility
- **Performance optimization**: Faster scraping and processing
- **Export formats**: Additional data export options
- **Integration features**: APIs for connecting with other tools

## 📄 License and Contact Information

### License

This project is part of the FreeRoom ecosystem. Please refer to the repository license file for terms and conditions.

### Contact

- **Repository**: [freeroomae/fr-tools](https://github.com/freeroomae/fr-tools)
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and community support

### Support

For technical support or questions:

1. Check existing [GitHub Issues](https://github.com/freeroomae/fr-tools/issues)
2. Review the [documentation](https://github.com/freeroomae/fr-tools/tree/main/docs)
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node.js version, OS, etc.)

### Contributing to Documentation

Documentation improvements are always welcome! To update this README or other documentation:

1. Fork the repository
2. Make your changes to the relevant `.md` files
3. Submit a pull request with a clear description of improvements

---

**Built with ❤️ for the FreeRoom community**
