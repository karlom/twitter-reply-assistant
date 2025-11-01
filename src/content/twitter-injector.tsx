/**
 * Twitter 注入器
 *
 * 监听 Twitter 回复弹窗的出现，自动在工具栏中注入 AI 按钮
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReplyToolbarButton } from '../components/ReplyToolbarButton';
import { TwitterDOM } from '../utils/twitter-dom';
import { DOM_DEBOUNCE_DELAY } from '../types';

/**
 * Twitter 注入器类
 */
export class TwitterInjector {
  private observer: MutationObserver | null = null;
  private processedDialogs = new Set<HTMLElement>();
  private debouncedInject: () => void;

  constructor() {
    // 创建防抖的注入函数
    this.debouncedInject = TwitterDOM.debounce(
      () => this.injectToolbarButton(),
      DOM_DEBOUNCE_DELAY
    );
  }

  /**
   * 开始监听和注入
   */
  start(): void {
    console.log('[Twitter Injector] 启动回复框监听器...');

    // 检查是否在 Twitter 上
    if (!TwitterDOM.isOnTwitter()) {
      console.log('[Twitter Injector] 不在 Twitter 页面，停止');
      return;
    }

    // 立即检查当前是否有回复框
    this.injectToolbarButton();

    // 开始监听 DOM 变化
    this.startObserving();

    console.log('[Twitter Injector] 回复框监听器已启动');
  }

  /**
   * 停止监听
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.processedDialogs.clear();

    console.log('[Twitter Injector] 回复框监听器已停止');
  }

  /**
   * 开始监听 DOM 变化
   */
  private startObserving(): void {
    this.observer = new MutationObserver((mutations) => {
      // 检查是否有新的对话框元素
      let hasNewDialog = false;

      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              // 检查是否是回复弹窗或包含回复弹窗
              if (
                element.getAttribute('role') === 'dialog' ||
                element.querySelector('[role="dialog"]') ||
                element.querySelector('[data-testid="tweetTextarea_0"]')
              ) {
                hasNewDialog = true;
                break;
              }
            }
          }
        }
        if (hasNewDialog) break;
      }

      if (hasNewDialog) {
        // 使用防抖避免频繁调用
        this.debouncedInject();
      }
    });

    // 观察整个文档的子树变化
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 在回复框工具栏中注入 AI 按钮
   */
  private injectToolbarButton(): void {
    // 查找回复弹窗
    const dialog = TwitterDOM.findReplyDialog();
    if (!dialog) {
      // console.log('[Twitter Injector] 未找到回复弹窗');
      return;
    }

    // 检查是否已经处理过这个弹窗
    if (this.processedDialogs.has(dialog)) {
      // console.log('[Twitter Injector] 回复弹窗已处理过');
      return;
    }

    // 检查是否已经注入过按钮
    if (TwitterDOM.hasToolbarAIButton(dialog)) {
      this.processedDialogs.add(dialog);
      return;
    }

    console.log('[Twitter Injector] 发现回复弹窗，准备注入 AI 按钮...');

    // 获取回复框
    const replyBox = dialog.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
    if (!replyBox) {
      console.warn('[Twitter Injector] 未找到回复输入框');
      return;
    }

    // 获取推文文本
    const tweetText = TwitterDOM.getTweetTextFromReplyDialog(dialog);
    if (!tweetText) {
      console.warn('[Twitter Injector] 无法提取原推文文本');
      // 即使没有推文文本也继续，允许用户手动输入
    }

    console.log('[Twitter Injector] 原推文文本:', tweetText || '(未找到)');

    // 等待一小段时间让工具栏渲染
    setTimeout(() => {
      this.injectButton(dialog, replyBox, tweetText || '');
    }, 500); // 增加等待时间到 500ms
  }

  /**
   * 执行注入
   */
  private injectButton(
    dialog: HTMLElement,
    replyBox: HTMLElement,
    tweetText: string
  ): void {
    // 获取工具栏
    const toolbar = TwitterDOM.getToolbarFromReplyDialog(dialog);

    // 再次检查是否已经注入过
    if (TwitterDOM.hasToolbarAIButton(dialog)) {
      this.processedDialogs.add(dialog);
      return;
    }

    try {
      // 创建 AI 按钮容器
      const aiButtonContainer = document.createElement('div');
      aiButtonContainer.className = 'twitter-ai-toolbar-container';
      Object.assign(aiButtonContainer.style, {
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: '8px',
      });

      if (toolbar) {
        // 标准注入：插入到工具栏开头
        console.log('[Twitter Injector] 找到工具栏，开始注入 AI 按钮');
        toolbar.insertBefore(aiButtonContainer, toolbar.firstChild);
      } else {
        // 备用方案：在回复框附近注入
        console.warn('[Twitter Injector] 未找到工具栏，尝试备用注入方案');

        // 查找回复框的父容器
        let parent = replyBox.parentElement;
        while (parent && parent !== dialog) {
          // 查找包含回复框的较大容器
          if (parent.offsetHeight > 50 && parent.offsetHeight < 300) {
            // 创建一个浮动容器
            Object.assign(aiButtonContainer.style, {
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              zIndex: '100',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '2px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            });

            // 设置父容器为相对定位
            if (getComputedStyle(parent).position === 'static') {
              parent.style.position = 'relative';
            }

            parent.appendChild(aiButtonContainer);
            console.log('[Twitter Injector] 使用备用方案注入 AI 按钮');
            break;
          }
          parent = parent.parentElement;
        }

        // 如果还是找不到合适的位置，直接插入到对话框底部
        if (!aiButtonContainer.parentElement) {
          Object.assign(aiButtonContainer.style, {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: '10000',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          });
          dialog.appendChild(aiButtonContainer);
          console.log('[Twitter Injector] 使用固定定位注入 AI 按钮');
        }
      }

      // 使用 React 渲染 AI 按钮
      const root = ReactDOM.createRoot(aiButtonContainer);
      root.render(
        <ReplyToolbarButton tweetText={tweetText} replyBox={replyBox} />
      );

      // 标记为已处理
      this.processedDialogs.add(dialog);

      console.log('[Twitter Injector] ✅ AI 按钮已成功注入');
    } catch (error) {
      console.error('[Twitter Injector] 注入失败:', error);
    }
  }

  /**
   * 重新注入所有回复框（用于调试）
   */
  reinjectAll(): void {
    console.log('[Twitter Injector] 重新注入回复框...');
    this.processedDialogs.clear();

    // 移除所有已注入的按钮
    const existingButtons = document.querySelectorAll('.twitter-ai-toolbar-container');
    existingButtons.forEach((button) => button.remove());

    // 重新注入
    this.injectToolbarButton();
  }
}

// 导出单例实例
export const twitterInjector = new TwitterInjector();
