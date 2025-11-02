# Twitter Reply Assistant 🤖 | 推特智能回复助手

<p align="center">
  <a href="#english">English</a> •
  <a href="#中文">中文</a>
</p>

---

## English

### 🎯 Overview

Twitter Reply Assistant is a Chrome extension that uses AI to generate contextual replies for Twitter (X). It supports multiple AI providers (SiliconFlow, DeepSeek, GLM) and offers customizable reply styles. With one click, generate intelligent, context-aware replies that match your desired tone.

### ✨ Features

- 🤖 **AI-Powered Replies** - Generate contextual replies using advanced AI models
- 🎨 **6 Preset Reply Styles** - Professional, Humorous, Concise, Supportive, Critical, Questioning
- 🎭 **Custom Styles** - Create your own reply styles with custom prompts
- 🔌 **Multiple AI Providers** - Support for SiliconFlow, DeepSeek, GLM, and custom API endpoints
- 💨 **One-Click Operation** - Seamlessly integrated into Twitter's interface
- 🌍 **Multi-language Support** - Works with tweets in any language
- 🔒 **Privacy First** - All API keys are stored locally in Chrome

### 📥 Installation

#### Method 1: Install from Source (Recommended)

1. **Download the Extension**

   ```bash
   git clone https://github.com/yourusername/TwitterReplyAssistant.git
   cd TwitterReplyAssistant
   ```

2. **Install Dependencies and Build**

   ```bash
   npm install
   npm run build
   ```

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` folder from the project

#### Method 2: Download Release

1. Go to [Releases](https://github.com/yourusername/TwitterReplyAssistant/releases)
2. Download the latest `twitter-reply-assistant.zip`
3. Extract the ZIP file
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode"
6. Click "Load unpacked" and select the extracted folder

### 🚀 Quick Start

1. **Configure AI Provider**
   - Click the extension icon in Chrome toolbar
   - Select your AI provider (SiliconFlow, DeepSeek, GLM, or Custom)
   - Enter your API key
   - (Optional) Configure the model name

2. **Use on Twitter**
   - Go to Twitter/X
   - Find a tweet you want to reply to
   - Click the reply button to open the reply dialog
   - Click the 🤖 button that appears in the toolbar
   - Select a reply style
   - The AI-generated reply will be automatically filled in

### ⚙️ Configuration

#### Supported AI Providers

| Provider | API Endpoint | Get API Key |
|----------|-------------|-------------|
| SiliconFlow | `https://api.siliconflow.cn/v1/chat/completions` | [Get Key](https://siliconflow.cn) |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | [Get Key](https://platform.deepseek.com) |
| GLM | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | [Get Key](https://open.bigmodel.cn) |
| Custom | Your own OpenAI-compatible endpoint | - |

#### Reply Styles

- 💼 **Professional** - Formal and business-appropriate
- 😄 **Humorous** - Light-hearted and entertaining
- ✨ **Concise** - Brief and to the point
- 👍 **Supportive** - Encouraging and positive
- 🤔 **Critical** - Analytical and thoughtful
- ❓ **Questioning** - Curious and exploratory

### 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/yourusername/TwitterReplyAssistant.git
cd TwitterReplyAssistant

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 📦 Tech Stack

- React 18 + TypeScript
- Vite + CRXJS
- Tailwind CSS
- Chrome Extension Manifest V3

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 中文

### 🎯 概述

Twitter Reply Assistant 是一个 Chrome 扩展程序，使用 AI 为 Twitter (X) 生成智能回复。支持多种 AI 提供商（SiliconFlow、DeepSeek、智谱清言）和自定义回复风格。一键生成符合您期望语气的智能上下文感知回复。

### ✨ 功能特点

- 🤖 **AI 智能回复** - 使用先进的 AI 模型生成上下文相关的回复
- 🎨 **6 种预设风格** - 专业严谨、幽默风趣、简洁明了、友好支持、批判性思考、提问引导
- 🎭 **自定义风格** - 创建您自己的回复风格和提示词
- 🔌 **多种 AI 提供商** - 支持 SiliconFlow、DeepSeek、智谱清言和自定义 API
- 💨 **一键操作** - 无缝集成到 Twitter 界面
- 🌍 **多语言支持** - 支持任何语言的推文
- 🔒 **隐私优先** - 所有 API 密钥都存储在本地 Chrome 中

### 📥 安装方法

#### 方法一：从源代码安装（推荐）

1. **下载扩展程序**

   ```bash
   git clone https://github.com/yourusername/TwitterReplyAssistant.git
   cd TwitterReplyAssistant
   ```

2. **安装依赖并构建**

   ```bash
   npm install
   npm run build
   ```

3. **在 Chrome 中加载**
   - 打开 Chrome，访问 `chrome://extensions/`
   - 在右上角启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `dist` 文件夹

#### 方法二：下载发布版本

1. 前往 [Releases](https://github.com/yourusername/TwitterReplyAssistant/releases) 页面
2. 下载最新的 `twitter-reply-assistant.zip`
3. 解压 ZIP 文件
4. 打开 Chrome，访问 `chrome://extensions/`
5. 启用"开发者模式"
6. 点击"加载已解压的扩展程序"，选择解压后的文件夹

### 🚀 快速开始

1. **配置 AI 提供商**
   - 点击 Chrome 工具栏中的扩展图标
   - 选择您的 AI 提供商（SiliconFlow、DeepSeek、智谱清言或自定义）
   - 输入您的 API 密钥
   - （可选）配置模型名称

2. **在 Twitter 上使用**
   - 访问 Twitter/X
   - 找到您想要回复的推文
   - 点击回复按钮打开回复对话框
   - 点击工具栏中出现的 🤖 按钮
   - 选择一个回复风格
   - AI 生成的回复将自动填入

### ⚙️ 配置说明

#### 支持的 AI 提供商

| 提供商 | API 端点 | 获取 API Key |
|--------|---------|--------------|
| SiliconFlow | `https://api.siliconflow.cn/v1/chat/completions` | [获取密钥](https://siliconflow.cn) |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | [获取密钥](https://platform.deepseek.com) |
| 智谱清言 | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | [获取密钥](https://open.bigmodel.cn) |
| 自定义 | 您自己的 OpenAI 兼容端点 | - |

#### 回复风格

- 💼 **专业严谨** - 正式、商务场合适用
- 😄 **幽默风趣** - 轻松、娱乐性
- ✨ **简洁明了** - 简短、直接
- 👍 **友好支持** - 鼓励、积极
- 🤔 **批判性思考** - 分析、深入
- ❓ **提问引导** - 好奇、探索

### 🛠️ 开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/TwitterReplyAssistant.git
cd TwitterReplyAssistant

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 📦 技术栈

- React 18 + TypeScript
- Vite + CRXJS
- Tailwind CSS
- Chrome Extension Manifest V3

### 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

### 📄 许可证

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

### 🐛 问题反馈

如果您遇到任何问题或有功能建议，请在 [Issues](https://github.com/yourusername/TwitterReplyAssistant/issues) 中提出。

### ⭐ Star History

如果这个项目对您有帮助，请给它一个 ⭐ Star！

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yourusername">Bruce Yang</a>
</p>
