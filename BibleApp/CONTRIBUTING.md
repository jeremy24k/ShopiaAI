# 🤝 Contributing to ShopiaAI Bible App

Thank you for your interest in contributing to ShopiaAI Bible App! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or pnpm
- Git
- Supabase account
- DeepSeek API key (for AI features)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR_USERNAME/shopiaai-bible-app.git
cd shopiaai-bible-app
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/shopiaai-bible-app.git
```

### Setup Development Environment

Follow the instructions in [README.md](README.md) to set up your development environment.

---

## 🔄 Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow the code style guidelines
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Frontend
cd BibleApp/Frontend
npm run dev

# Backend
cd BibleApp/Backend
npm run dev
```

Test thoroughly:
- Manual testing in browser
- Check console for errors
- Test on different screen sizes
- Verify all features work as expected

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

See [Commit Message Guidelines](#commit-message-guidelines) for details.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template
5. Submit the PR

---

## 💅 Code Style Guidelines

### JavaScript/React

#### General Rules

- Use **ES6+ syntax**
- Use **functional components** with hooks
- Use **arrow functions** for callbacks
- Use **const** by default, **let** only when necessary
- Never use **var**

#### Naming Conventions

```javascript
// Components: PascalCase
function UserProfile() {}

// Functions and variables: camelCase
const getUserData = () => {}
const userName = "John"

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com"

// Private functions: prefix with underscore
const _helperFunction = () => {}
```

#### Component Structure

```javascript
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Component.module.css';

function Component({ prop1, prop2 }) {
  // 1. Hooks
  const [state, setState] = useState(null);
  
  // 2. Effects
  useEffect(() => {
    // effect logic
  }, []);
  
  // 3. Event handlers
  const handleClick = () => {
    // handler logic
  };
  
  // 4. Render helpers
  const renderContent = () => {
    // render logic
  };
  
  // 5. Return JSX
  return (
    <div className={styles.container}>
      {renderContent()}
    </div>
  );
}

Component.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number
};

export default Component;
```

#### Hooks Rules

- Only call hooks at the top level
- Only call hooks from React functions
- Use custom hooks for reusable logic
- Name custom hooks with `use` prefix

```javascript
// Good
function useUserData(userId) {
  const [data, setData] = useState(null);
  // hook logic
  return data;
}

// Bad
function getUserData(userId) {
  const [data, setData] = useState(null); // ❌ Not a hook name
  return data;
}
```

#### State Management (Zustand)

```javascript
import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // State
  count: 0,
  user: null,
  
  // Actions
  increment: () => set((state) => ({ count: state.count + 1 })),
  setUser: (user) => set({ user }),
  
  // Computed values
  getDoubleCount: () => get().count * 2
}));
```

### CSS

#### Use CSS Modules

```javascript
import styles from './Component.module.css';

function Component() {
  return <div className={styles.container} />;
}
```

#### Naming Convention

- Use **kebab-case** for class names
- Use **BEM-like** structure when needed

```css
/* Good */
.user-profile {}
.user-profile__header {}
.user-profile__header--active {}

/* Bad */
.UserProfile {}
.user_profile {}
```

#### Organization

```css
/* 1. Layout */
.container {
  display: flex;
  flex-direction: column;
}

/* 2. Positioning */
.element {
  position: relative;
  top: 0;
  left: 0;
}

/* 3. Box model */
.box {
  width: 100%;
  padding: 1rem;
  margin: 0 auto;
}

/* 4. Typography */
.text {
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

/* 5. Visual */
.visual {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 6. Misc */
.misc {
  cursor: pointer;
  transition: all 0.3s ease;
}
```

### Backend (Node.js/Express)

#### File Structure

```javascript
// 1. Imports
import express from 'express';
import Logger from '../utils/logger.js';

// 2. Constants
const router = express.Router();
const logger = Logger.create('RouteName');

// 3. Route handlers
router.get('/endpoint', async (req, res) => {
  try {
    // logic
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: 'Error message' });
  }
});

// 4. Export
export default router;
```

#### Error Handling

```javascript
// Always use try-catch for async operations
router.post('/endpoint', async (req, res) => {
  try {
    const result = await someAsyncOperation();
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Operation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'User-friendly error message' 
    });
  }
});
```

#### Logging

```javascript
import Logger from '../utils/logger.js';

const logger = Logger.create('ServiceName');

// Use appropriate log levels
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred:', error);
```

---

## 📝 Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Simple commit
git commit -m "feat: add user profile page"

# With scope
git commit -m "fix(auth): resolve login redirect issue"

# With body
git commit -m "feat: add dark mode support

- Add theme toggle component
- Implement dark mode styles
- Save preference to localStorage"

# Breaking change
git commit -m "feat!: update API response format

BREAKING CHANGE: API now returns data in { success, data } format"
```

### Rules

- Use present tense ("add" not "added")
- Use imperative mood ("move" not "moves")
- First line max 72 characters
- Reference issues: "fixes #123" or "closes #456"

---

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.logs or debugging code
- [ ] Tests pass (if applicable)
- [ ] No merge conflicts

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Maintainer reviews your PR
2. Address any requested changes
3. Once approved, PR will be merged
4. Your contribution will be credited

---

## 🧪 Testing Guidelines

### Manual Testing

Always test:
- Happy path (expected behavior)
- Edge cases (empty states, max values, etc.)
- Error scenarios (network errors, invalid input)
- Different browsers (Chrome, Firefox, Safari)
- Different screen sizes (mobile, tablet, desktop)

### Writing Tests (Future)

```javascript
// Example test structure
describe('Component', () => {
  it('should render correctly', () => {
    // test logic
  });
  
  it('should handle user interaction', () => {
    // test logic
  });
});
```

---

## 📚 Documentation

### Code Comments

```javascript
// Good: Explain WHY, not WHAT
// Debounce to avoid excessive API calls
const debouncedSearch = debounce(search, 300);

// Bad: Obvious comment
// Set count to 0
const count = 0;
```

### JSDoc (for complex functions)

```javascript
/**
 * Fetches user data from the API
 * @param {string} userId - The user's unique identifier
 * @param {Object} options - Optional configuration
 * @param {boolean} options.includeProfile - Include profile data
 * @returns {Promise<Object>} User data object
 * @throws {Error} If user not found
 */
async function fetchUserData(userId, options = {}) {
  // implementation
}
```

### README Updates

When adding new features, update:
- Features list
- Installation instructions (if needed)
- Usage examples
- Environment variables (if added)

---

## ❓ Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions
- Join our community chat (if available)

---

## 🎉 Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Appreciated by the community!

Thank you for contributing to ShopiaAI Bible App! 🙏
