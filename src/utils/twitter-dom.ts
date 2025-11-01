/**
 * Twitter DOM 工具函数
 *
 * 提供与 Twitter DOM 交互的工具方法
 */

import { TWITTER_SELECTORS } from '../types';

/**
 * Twitter DOM 工具类
 */
export class TwitterDOM {
  /**
   * 获取页面上所有的推文元素
   */
  static getAllTweets(): HTMLElement[] {
    return Array.from(document.querySelectorAll(TWITTER_SELECTORS.TWEET));
  }

  /**
   * 从推文元素中提取文本内容
   */
  static getTweetText(tweetElement: HTMLElement): string | null {
    const textElement = tweetElement.querySelector(TWITTER_SELECTORS.TWEET_TEXT);
    if (!textElement) return null;

    return textElement.textContent?.trim() || null;
  }

  /**
   * 获取推文的回复按钮
   */
  static getReplyButton(tweetElement: HTMLElement): HTMLElement | null {
    return tweetElement.querySelector(TWITTER_SELECTORS.REPLY_BUTTON);
  }

  /**
   * 点击推文的回复按钮
   */
  static clickReplyButton(tweetElement: HTMLElement): boolean {
    const replyButton = this.getReplyButton(tweetElement);
    if (!replyButton) return false;

    replyButton.click();
    return true;
  }

  /**
   * 等待回复框出现
   */
  static async waitForReplyBox(timeout = 3000): Promise<HTMLElement | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const replyBox = document.querySelector(TWITTER_SELECTORS.REPLY_TEXTAREA) as HTMLElement;
      if (replyBox) {
        return replyBox;
      }

      // 等待 100ms 再检查
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }

  /**
   * 填充回复文本到输入框
   * Twitter 使用 Draft.js 编辑器（contenteditable div），不是传统的 textarea
   */
  static fillReplyText(element: HTMLElement, text: string): void {
    try {
      console.log('[TwitterDOM] 开始填充文本，元素类型:', element.tagName);
      console.log('[TwitterDOM] contenteditable:', element.getAttribute('contenteditable'));

      // 调试：打印元素上的所有属性键
      const allKeys = Object.keys(element);
      console.log('[TwitterDOM] 元素上的所有键:', allKeys);
      const reactKeys = allKeys.filter(k => k.includes('react') || k.includes('React') || k.includes('fiber'));
      console.log('[TwitterDOM] React 相关的键:', reactKeys);

      // 聚焦元素
      element.focus();
      console.log('[TwitterDOM] 元素已聚焦');

      // 等待焦点生效后再操作
      setTimeout(() => {
        try {
          // 新策略：模拟真实的键盘输入
          // 先清空现有内容（如果有）
          const currentText = element.textContent || '';
          if (currentText.length > 0) {
            // 如果有内容，先全选
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(element);
            selection?.removeAllRanges();
            selection?.addRange(range);
            console.log('[TwitterDOM] 已选中现有内容');
          }

          // 使用 DataTransfer 模拟粘贴操作
          const dataTransfer = new DataTransfer();
          dataTransfer.setData('text/plain', text);

          // 触发 paste 事件
          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dataTransfer
          });

          const handled = element.dispatchEvent(pasteEvent);
          console.log('[TwitterDOM] paste 事件已触发，handled:', handled);

          // 如果 paste 事件没有被处理，使用备用方案
          if (!pasteEvent.defaultPrevented) {
            console.log('[TwitterDOM] paste 事件未被处理，使用直接设置方案');

            // 清空并设置新内容
            element.innerHTML = '';
            const textNode = document.createTextNode(text);
            element.appendChild(textNode);

            // 移动光标到末尾
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(textNode, text.length);
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);

            // 触发 beforeinput 和 input 事件
            element.dispatchEvent(new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              data: text,
              inputType: 'insertText'
            }));

            element.dispatchEvent(new InputEvent('input', {
              bubbles: true,
              cancelable: true,
              data: text,
              inputType: 'insertText'
            }));
          }

          console.log('[TwitterDOM] ✅ 文本填充成功:', text.substring(0, 50) + '...');

        } catch (innerError) {
          console.error('[TwitterDOM] 填充过程出错:', innerError);
          element.textContent = text;
        }
      }, 100);

    } catch (error) {
      console.error('[TwitterDOM] fillReplyText 失败:', error);
      throw error;
    }
  }

  /**
   * 检查推文是否已经注入了 AI 按钮
   */
  static hasAIButton(tweetElement: HTMLElement): boolean {
    return tweetElement.querySelector('.twitter-ai-reply-button') !== null;
  }

  /**
   * 获取推文的唯一标识符
   * 用于防止重复注入
   */
  static getTweetId(tweetElement: HTMLElement): string | null {
    // 尝试从多个属性获取唯一 ID
    const id =
      tweetElement.getAttribute('data-tweet-id') ||
      tweetElement.getAttribute('id') ||
      null;

    return id;
  }

  /**
   * 标记推文已处理
   */
  static markAsProcessed(tweetElement: HTMLElement): void {
    tweetElement.setAttribute('data-ai-reply-processed', 'true');
  }

  /**
   * 检查推文是否已处理
   */
  static isProcessed(tweetElement: HTMLElement): boolean {
    return tweetElement.hasAttribute('data-ai-reply-processed');
  }

  /**
   * 获取回复按钮的容器（用于插入 AI 按钮）
   */
  static getReplyButtonContainer(tweetElement: HTMLElement): HTMLElement | null {
    const replyButton = this.getReplyButton(tweetElement);
    if (!replyButton) return null;

    // Twitter 的回复按钮通常在一个 group 容器中
    // 我们需要找到这个容器的父元素
    let container = replyButton.closest('[role="group"]');

    if (!container) {
      // 如果找不到 role="group"，尝试找父元素
      container = replyButton.parentElement;
    }

    return container as HTMLElement;
  }

  /**
   * 检查当前是否在 Twitter/X.com 上
   */
  static isOnTwitter(): boolean {
    const hostname = window.location.hostname;
    return hostname.includes('twitter.com') || hostname.includes('x.com');
  }

  /**
   * 等待元素出现
   */
  static async waitForElement(
    selector: string,
    timeout = 5000
  ): Promise<HTMLElement | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        return element;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }

  /**
   * 防抖函数
   */
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * 节流函数
   */
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * 查找 Twitter 回复弹窗
   */
  static findReplyDialog(): HTMLElement | null {
    // Twitter 回复弹窗的选择器
    const dialogSelectors = [
      '[role="dialog"]',
      '[data-testid="tweetTextarea_0"]',
    ];

    for (const selector of dialogSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        // 如果是 textarea，返回它的对话框容器
        if (selector === '[data-testid="tweetTextarea_0"]') {
          return element.closest('[role="dialog"]') as HTMLElement;
        }
        // 验证这是回复弹窗（包含 textarea）
        const textarea = element.querySelector('[data-testid="tweetTextarea_0"]');
        if (textarea) {
          return element as HTMLElement;
        }
      }
    }

    return null;
  }

  /**
   * 从回复弹窗中获取原推文文本
   * 策略：
   * 1. 在弹窗中查找引用的推文内容
   * 2. 从 URL 中提取推文 ID，然后在页面中查找对应推文
   */
  static getTweetTextFromReplyDialog(dialog: HTMLElement): string | null {
    // 策略 1: 在弹窗内部查找引用的推文
    const quotedTweet = dialog.querySelector('[data-testid="tweetText"]');
    if (quotedTweet) {
      return quotedTweet.textContent?.trim() || null;
    }

    // 策略 2: 从 URL 获取推文 ID，然后在页面中查找
    const urlMatch = window.location.pathname.match(/\/status\/(\d+)/);
    if (urlMatch) {
      const tweetId = urlMatch[1];
      // 在页面中查找包含此 ID 的推文
      const tweets = this.getAllTweets();
      for (const tweet of tweets) {
        const link = tweet.querySelector(`a[href*="/status/${tweetId}"]`);
        if (link) {
          return this.getTweetText(tweet);
        }
      }
    }

    // 策略 3: 查找弹窗上方最近的推文
    const allTweets = this.getAllTweets();
    if (allTweets.length > 0) {
      // 返回第一条推文（通常是正在回复的推文）
      return this.getTweetText(allTweets[0]);
    }

    return null;
  }

  /**
   * 从回复弹窗中获取工具栏元素
   */
  static getToolbarFromReplyDialog(dialog: HTMLElement): HTMLElement | null {
    // 更新的工具栏选择器策略
    // 1. 先尝试找到回复按钮组
    const replyButtonSelector = '[data-testid="tweetButtonInline"]';
    const replyButton = dialog.querySelector(replyButtonSelector);

    if (replyButton) {
      // 获取回复按钮的父容器，通常这里是操作栏
      const buttonContainer = replyButton.parentElement?.parentElement;
      if (buttonContainer) {
        // 查找包含多个图标按钮的同级容器（工具栏）
        const siblings = Array.from(buttonContainer.parentElement?.children || []);
        for (const sibling of siblings) {
          const iconButtons = sibling.querySelectorAll('[role="button"]');
          if (iconButtons.length >= 2) {
            console.log('[TwitterDOM] 找到工具栏容器（策略1）');
            return sibling as HTMLElement;
          }
        }
      }
    }

    // 2. 使用 data-testid 选择器
    const toolbarSelectors = [
      '[data-testid="toolBar"]',
      '[data-testid="tweetToolbar"]',
      '[data-testid="replyToolbar"]',
    ];

    for (const selector of toolbarSelectors) {
      const toolbar = dialog.querySelector(selector) as HTMLElement;
      if (toolbar) {
        console.log(`[TwitterDOM] 找到工具栏容器（策略2: ${selector}）`);
        return toolbar;
      }
    }

    // 3. 查找包含 emoji 或 gif 按钮的容器
    const emojiButton = dialog.querySelector('[data-testid="emoji"]');
    const gifButton = dialog.querySelector('[data-testid="gif"]');

    if (emojiButton || gifButton) {
      const button = emojiButton || gifButton;
      // 获取按钮的父容器
      let parent = button?.parentElement;
      while (parent && parent !== dialog) {
        const buttons = parent.querySelectorAll('[role="button"], button');
        if (buttons.length >= 2 && buttons.length <= 10) {
          console.log('[TwitterDOM] 找到工具栏容器（策略3: emoji/gif父容器）');
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    // 4. 查找包含文件输入的容器
    const fileInput = dialog.querySelector('[data-testid="fileInput"]');
    if (fileInput) {
      let parent = fileInput.parentElement;
      while (parent && parent !== dialog) {
        const buttons = parent.querySelectorAll('[role="button"], button');
        if (buttons.length >= 2 && buttons.length <= 10) {
          console.log('[TwitterDOM] 找到工具栏容器（策略4: 文件输入父容器）');
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    // 5. 最后的备用策略：查找包含多个小按钮的 div
    const allDivs = dialog.querySelectorAll('div');
    for (const div of allDivs) {
      const buttons = div.querySelectorAll('[role="button"], button');
      const directButtons = Array.from(buttons).filter(btn => btn.parentElement === div);
      // 查找直接子元素中有 3-6 个按钮的容器
      if (directButtons.length >= 3 && directButtons.length <= 6) {
        // 验证这些按钮都比较小（工具栏按钮通常较小）
        const avgWidth = directButtons.reduce((sum, btn) => {
          const rect = (btn as HTMLElement).getBoundingClientRect();
          return sum + rect.width;
        }, 0) / directButtons.length;

        if (avgWidth < 60) { // 工具栏按钮通常宽度小于60px
          console.log('[TwitterDOM] 找到工具栏容器（策略5: 小按钮容器）');
          return div as HTMLElement;
        }
      }
    }

    console.warn('[TwitterDOM] 未能找到工具栏容器');
    return null;
  }

  /**
   * 检查回复框是否已经注入了 AI 按钮
   */
  static hasToolbarAIButton(dialog: HTMLElement): boolean {
    return dialog.querySelector('.twitter-ai-toolbar-container') !== null;
  }
}
