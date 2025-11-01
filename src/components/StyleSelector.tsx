/**
 * 风格选择器组件
 *
 * 显示预设风格和自定义风格的下拉菜单
 */

import React, { useState, useEffect, useRef } from 'react';
import type { ReplyStyle } from '../types';
import { REPLY_STYLES } from '../types';
import { StorageService } from '../services/storage-service';

interface StyleSelectorProps {
  /** 选择风格时的回调 */
  onSelectStyle: (styleId: string) => void;
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 是否正在加载 */
  isLoading?: boolean;
}

export function StyleSelector({
  onSelectStyle,
  isOpen,
  onClose,
  isLoading = false,
}: StyleSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [allStyles, setAllStyles] = useState<ReplyStyle[]>(REPLY_STYLES);

  // 加载所有风格（预设 + 自定义）
  useEffect(() => {
    const loadStyles = async () => {
      try {
        const styles = await StorageService.getAllStyles();
        setAllStyles(styles);
      } catch (error) {
        console.error('Failed to load styles:', error);
        // 如果加载失败，使用默认预设风格
        setAllStyles(REPLY_STYLES);
      }
    };

    loadStyles();
  }, [isOpen]); // 每次打开时重新加载，确保显示最新的自定义风格

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // 延迟添加监听器，避免立即触发
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStyleClick = (styleId: string) => {
    if (isLoading) return;
    onSelectStyle(styleId);
  };

  // 分离预设风格和自定义风格
  const presetStyles = allStyles.filter(s => REPLY_STYLES.some(preset => preset.id === s.id));
  const customStyles = allStyles.filter(s => !REPLY_STYLES.some(preset => preset.id === s.id));

  return (
    <div
      ref={containerRef}
      className="twitter-ai-style-selector"
      style={{
        position: 'absolute',
        top: '0',
        left: '40px', // 按钮宽度 36px + 4px 间距
        zIndex: 999999,
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        padding: '12px',
        minWidth: '320px',
        animation: 'fadeInScale 0.15s ease-out',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '2px solid #f0f4f8',
          marginBottom: '8px',
          background: 'linear-gradient(to bottom, #fafbfc, #ffffff)',
          borderRadius: '8px 8px 0 0',
          marginLeft: '-12px',
          marginRight: '-12px',
          marginTop: '-12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 700,
              color: '#1e293b',
              letterSpacing: '-0.01em',
            }}
          >
            选择回复风格
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isLoading ? (
            <>
              <span style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                border: '2px solid #e2e8f0',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}></span>
              <span>正在生成回复...</span>
            </>
          ) : (
            <>🤖 AI 将以选定风格生成回复</>
          )}
        </p>
      </div>

      {/* 风格列表 */}
      <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '4px' }}>
        {/* 自定义风格 */}
        {customStyles.length > 0 && (
          <>
            <div
              style={{
                padding: '8px 12px 6px',
                marginBottom: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6m-6-6h6m6 0h6" />
                </svg>
                <p
                  style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#8b5cf6',
                    letterSpacing: '-0.01em',
                  }}
                >
                  自定义风格 ({customStyles.length})
                </p>
              </div>
            </div>
            {customStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleClick(style.id)}
                disabled={isLoading}
                className="twitter-ai-style-option"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  width: '100%',
                  padding: '14px',
                  border: '1px solid transparent',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                  opacity: isLoading ? 0.5 : 1,
                  marginBottom: '6px',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#e0e7ff';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* 图标 */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    marginRight: '12px',
                    flexShrink: 0,
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                  }}
                >
                  {style.icon}
                </div>

                {/* 内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: '4px',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {style.name}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      lineHeight: '18px',
                    }}
                  >
                    {style.description}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* 预设风格分隔线（如果有自定义风格） */}
        {customStyles.length > 0 && presetStyles.length > 0 && (
          <div
            style={{
              padding: '12px 0 8px',
              marginTop: '8px',
            }}
          >
            <div style={{
              height: '1px',
              background: 'linear-gradient(to right, transparent, #e2e8f0, transparent)',
            }} />
          </div>
        )}

        {/* 预设风格标题（如果有自定义风格） */}
        {customStyles.length > 0 && presetStyles.length > 0 && (
          <div
            style={{
              padding: '8px 12px 6px',
              marginBottom: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l2 7h7l-5.5 4.5 2 7L12 16l-5.5 4.5 2-7L3 9h7z" />
              </svg>
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#3b82f6',
                  letterSpacing: '-0.01em',
                }}
              >
                预设风格
              </p>
            </div>
          </div>
        )}

        {/* 预设风格 */}
        {presetStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => handleStyleClick(style.id)}
            disabled={isLoading}
            className="twitter-ai-style-option"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              width: '100%',
              padding: '14px',
              border: '1px solid transparent',
              backgroundColor: 'white',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'left',
              opacity: isLoading ? 0.5 : 1,
              marginBottom: '6px',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* 图标 */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginRight: '12px',
                flexShrink: 0,
                border: '1px solid rgba(59, 130, 246, 0.15)',
              }}
            >
              {style.icon}
            </div>

            {/* 内容 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '4px',
                  letterSpacing: '-0.01em',
                }}
              >
                {style.name}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  lineHeight: '18px',
                }}
              >
                {style.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 底部提示 */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '2px solid #f0f4f8',
          marginTop: '8px',
          background: 'linear-gradient(to top, #fafbfc, #ffffff)',
          borderRadius: '0 0 8px 8px',
          marginLeft: '-12px',
          marginRight: '-12px',
          marginBottom: '-12px',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}>
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <p
            style={{
              margin: 0,
              fontSize: '12px',
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            由 AI 驱动 · 最多生成 280 字符
          </p>
        </div>
      </div>
    </div>
  );
}
