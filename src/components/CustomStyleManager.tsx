/**
 * 自定义风格管理组件
 *
 * 提供自定义回复风格的 CRUD 功能界面
 */

import React, { useState, useEffect } from 'react';
import { StorageService, ConfigValidator } from '../services/storage-service';
import type { CustomReplyStyle } from '../types';
import { MAX_CUSTOM_STYLES, CUSTOM_STYLE_CONSTRAINTS, ErrorHelper } from '../types';

// 常用 emoji 供快速选择
const COMMON_EMOJIS = ['🎨', '✨', '💡', '🚀', '⚡', '🌟', '💎', '🔥', '🎯', '🎪', '🎭', '🎬'];

export function CustomStyleManager() {
  const [styles, setStyles] = useState<CustomReplyStyle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 表单状态
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🎨',
    description: '',
    systemPrompt: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // 加载自定义风格
  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    try {
      const loadedStyles = await StorageService.getCustomStyles();
      setStyles(loadedStyles);
    } catch (error: unknown) {
      const formatted = ErrorHelper.formatForUser(error);
      setMessage({ type: 'error', text: `加载失败：${formatted}` });
    }
  };

  // 打开添加表单
  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      icon: '🎨',
      description: '',
      systemPrompt: '',
    });
    setFormErrors([]);
    setShowForm(true);
  };

  // 打开编辑表单
  const handleEdit = (style: CustomReplyStyle) => {
    setEditingId(style.id);
    setFormData({
      name: style.name,
      icon: style.icon,
      description: style.description,
      systemPrompt: style.systemPrompt,
    });
    setFormErrors([]);
    setShowForm(true);
  };

  // 保存（添加或更新）
  const handleSave = async () => {
    // 验证
    const validation = ConfigValidator.validateCustomStyle(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setFormErrors([]);

    try {
      if (editingId) {
        // 更新
        await StorageService.updateCustomStyle(editingId, formData);
        setMessage({ type: 'success', text: '✅ 风格已更新' });
      } else {
        // 添加
        await StorageService.saveCustomStyle(formData);
        setMessage({ type: 'success', text: '✅ 风格已添加' });
      }

      // 重新加载列表
      await loadStyles();

      // 关闭表单
      setShowForm(false);
      setEditingId(null);

      // 3秒后清除消息
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const formatted = ErrorHelper.formatForUser(error);
      setMessage({ type: 'error', text: formatted });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除"${name}"风格吗？此操作不可撤销。`)) {
      return;
    }

    setIsLoading(true);

    try {
      await StorageService.deleteCustomStyle(id);
      setMessage({ type: 'success', text: '✅ 风格已删除' });

      // 重新加载列表
      await loadStyles();

      // 3秒后清除消息
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const formatted = ErrorHelper.formatForUser(error);
      setMessage({ type: 'error', text: formatted });
    } finally {
      setIsLoading(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormErrors([]);
  };

  return (
    <div className="space-y-4">
      {/* 顶部统计和添加按钮 */}
      <div className="modern-card p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">自定义回复风格</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                已创建 {styles.length}/{MAX_CUSTOM_STYLES} 个风格
              </p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={isLoading || styles.length >= MAX_CUSTOM_STYLES || showForm}
            className="modern-btn min-w-[140px] px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>添加新风格</span>
          </button>
        </div>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`modern-card p-4 animate-fade-in ${
            message.type === 'success'
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {message.type === 'success' ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <pre className={`text-sm whitespace-pre-wrap font-sans flex-1 ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>{message.text}</pre>
          </div>
        </div>
      )}

      {/* 添加/编辑表单 */}
      {showForm && (
        <div className="modern-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              {editingId ? (
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            <h4 className="font-semibold text-gray-800">
              {editingId ? '编辑风格' : '添加新风格'}
            </h4>
          </div>

          <div className="space-y-4">
            {/* 风格名称 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                风格名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：诗意浪漫"
                maxLength={CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH}
                className="modern-input w-full px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-gray-600 mt-1.5">
                {formData.name.length}/{CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH}
              </p>
            </div>

            {/* 图标选择 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                图标 *
              </label>
              <div className="flex gap-2 mb-3">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                      formData.icon === emoji
                        ? 'border-blue-500 bg-blue-50 shadow-sm scale-110'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="或输入自定义 emoji"
                maxLength={CUSTOM_STYLE_CONSTRAINTS.ICON_MAX_LENGTH}
                className="modern-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                描述 *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="例如：适用于文艺、情感类话题"
                maxLength={CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
                className="modern-input w-full px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-gray-600 mt-1.5">
                {formData.description.length}/{CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
              </p>
            </div>

            {/* 系统提示词 */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                系统提示词 *
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="例如：你是一个富有诗意的评论者。请用优美、浪漫的语言回复推文，可以引用诗句或使用比喻..."
                rows={10}
                maxLength={CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH}
                className="modern-input w-full px-4 py-2.5 text-sm resize-none"
              />
              <p className="text-xs text-gray-600 mt-1.5">
                {formData.systemPrompt.length}/{CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH} （至少 {CUSTOM_STYLE_CONSTRAINTS.PROMPT_MIN_LENGTH} 字符）
              </p>
            </div>

            {/* 验证错误 */}
            {formErrors.length > 0 && (
              <div className="modern-card bg-gradient-to-br from-red-50 to-rose-50 border-red-200 p-4 animate-fade-in">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-semibold mb-2">请修正以下错误：</p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="modern-btn flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{editingId ? '保存修改' : '添加风格'}</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="modern-btn flex-1 py-2.5 px-4 bg-gray-500 text-white font-medium disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>取消</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 风格列表 */}
      {styles.length === 0 ? (
        <div className="modern-card p-12 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
          <p className="text-gray-500 font-medium mb-1">暂无自定义风格</p>
          <p className="text-xs text-gray-400">点击上方「添加新风格」按钮创建您的第一个自定义风格</p>
        </div>
      ) : (
        <div className="space-y-3">
          {styles.map((style) => (
            <div
              key={style.id}
              className="modern-card p-5 hover:shadow-lg transition-all animate-fade-in"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* 图标 */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-2xl border border-gray-200">
                    {style.icon}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{style.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{style.description}</p>

                    {/* 系统提示词预览 */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-xs font-semibold text-gray-700">系统提示词</p>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap break-words line-clamp-3">
                        {style.systemPrompt}
                      </p>
                    </div>

                    {/* 时间戳 */}
                    <div className="flex items-center gap-1.5 mt-3">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-gray-400">
                        创建于 {new Date(style.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(style)}
                    disabled={isLoading || showForm}
                    className="modern-btn px-3 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:transform-none flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={() => handleDelete(style.id, style.name)}
                    disabled={isLoading}
                    className="modern-btn px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 disabled:transform-none flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>删除</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 限制提示 */}
      {styles.length >= MAX_CUSTOM_STYLES && (
        <div className="modern-card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 p-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 mb-1">已达到最大数量限制</p>
              <p className="text-xs text-amber-700">
                您已创建 {MAX_CUSTOM_STYLES} 个自定义风格。如需添加新风格，请先删除现有风格。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
