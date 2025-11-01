import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { StorageService, ConfigValidator } from '../services/storage-service';
import { AIService } from '../services/ai-service';
import type { AIConfig, AIProvider } from '../types';
import { PROVIDER_URLS, PROVIDER_NAMES, MODEL_SUGGESTIONS, REPLY_STYLES, ErrorHelper, AppError } from '../types';
import { CustomStyleManager } from '../components/CustomStyleManager';

function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'status' | 'test' | 'customStyles'>('config');
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 配置表单状态
  const [formData, setFormData] = useState<AIConfig>({
    provider: 'siliconflow',
    apiUrl: PROVIDER_URLS.siliconflow,
    apiToken: '',
    model: 'Qwen/Qwen2.5-7B-Instruct',
  });

  const [showToken, setShowToken] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  // 加载配置
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cfg = await StorageService.getAIConfig();

      if (cfg) {
        setConfig(cfg);
        setFormData(cfg);
      } else {
        // 首次使用，切换到配置标签页
        setActiveTab('config');
      }

      const info = await StorageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error: unknown) {
      console.error('加载数据失败:', error);
      // Don't show error in UI for load failures, just log it
    }
  };

  // 处理提供商变化
  const handleProviderChange = (provider: AIProvider) => {
    let newFormData: AIConfig;

    if (provider === 'custom') {
      newFormData = {
        provider,
        apiUrl: '',
        apiToken: formData.apiToken,
        model: formData.model,
      };
    } else {
      newFormData = {
        provider,
        apiUrl: PROVIDER_URLS[provider],
        apiToken: formData.apiToken,
        model: MODEL_SUGGESTIONS[provider][0] || '',
      };
    }

    setFormData(newFormData);
  };

  // 保存配置
  const saveConfig = async () => {
    // 验证配置
    const validation = ConfigValidator.validateConfig(formData);

    if (!validation.valid) {
      setTestResult(`❌ 配置验证失败:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsSaving(true);
    setTestResult('');

    try {
      await StorageService.setAIConfig(formData);
      setConfig(formData);
      await loadData();

      setTestResult('✅ 配置已成功保存！');
      setTimeout(() => {
        setActiveTab('status');
      }, 1000);
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult(`❌ 保存失败:\n\n${formattedError}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 测试 API 连接
  const testAPI = async () => {
    // 验证配置
    const validation = ConfigValidator.validateConfig(formData);

    if (!validation.valid) {
      setTestResult(`❌ 配置验证失败:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsLoading(true);
    setTestResult('测试 API 连接...\n');

    try {
      const result = await AIService.testConfig(formData);

      if (result.success) {
        setTestResult(
          (prev) =>
            prev +
            `✅ API 连接成功！延迟: ${result.latency}ms\n\n` +
            `模型: ${formData.model}\n` +
            `提示: 连接成功，您可以保存配置了`
        );
      } else {
        // Use ErrorHelper to format error message if possible
        const errorMessage = result.error || '未知错误';
        setTestResult((prev) => prev + `❌ 连接失败:\n\n${errorMessage}`);
      }
    } catch (error: unknown) {
      // Use ErrorHelper to format error for better user experience
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult((prev) => prev + `❌ 错误:\n\n${formattedError}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 清除配置
  const clearConfig = async () => {
    if (!confirm('确定要清除配置吗？')) return;

    try {
      await StorageService.clearAIConfig();
      setConfig(null);
      setFormData({
        provider: 'siliconflow',
        apiUrl: PROVIDER_URLS.siliconflow,
        apiToken: '',
        model: 'Qwen/Qwen2.5-7B-Instruct',
      });
      setTestResult('✅ 配置已清除');
      setActiveTab('config');
      await loadData();
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult(`❌ 清除失败:\n\n${formattedError}`);
    }
  };

  // 测试 AI 生成回复
  const testAIGeneration = async () => {
    if (!config) {
      setTestResult('❌ 请先保存 API 配置');
      return;
    }

    setIsLoading(true);
    setTestResult('生成测试回复...\n');

    try {
      const reply = await AIService.generateReply(
        '今天天气真好！☀️',
        'humorous'
      );

      setTestResult(
        (prev) =>
          prev +
          `✅ 回复生成成功！\n\n` +
          `原推文: "今天天气真好！☀️"\n` +
          `风格: 幽默风趣\n` +
          `AI 回复: "${reply}"\n\n` +
          `字符数: ${reply.length}/280`
      );
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult((prev) => prev + `❌ 生成失败:\n\n${formattedError}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[480px] bg-white shadow-lg">
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Twitter Reply Assistant</h1>
            <p className="text-sm text-blue-50 mt-0.5">AI 智能回复助手</p>
          </div>
        </div>
      </div>

      {/* 标签切换 - 现代分段控制器 */}
      <div className="flex gap-1 p-3 bg-gray-50 border-b border-gray-200">
        <button
          className={`flex-1 py-2.5 px-3 font-medium text-sm rounded-lg transition-all ${
            activeTab === 'config'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
          onClick={() => setActiveTab('config')}
        >
          <span className="flex items-center justify-center gap-1.5">
            ⚙️ <span>API 配置</span>
          </span>
        </button>
        <button
          className={`flex-1 py-2.5 px-3 font-medium text-sm rounded-lg transition-all ${
            activeTab === 'status'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
          onClick={() => setActiveTab('status')}
        >
          <span className="flex items-center justify-center gap-1.5">
            📊 <span>状态</span>
          </span>
        </button>
        <button
          className={`flex-1 py-2.5 px-3 font-medium text-sm rounded-lg transition-all ${
            activeTab === 'customStyles'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
          onClick={() => setActiveTab('customStyles')}
        >
          <span className="flex items-center justify-center gap-1.5">
            🎨 <span>自定义</span>
          </span>
        </button>
        <button
          className={`flex-1 py-2.5 px-3 font-medium text-sm rounded-lg transition-all ${
            activeTab === 'test'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
          onClick={() => setActiveTab('test')}
        >
          <span className="flex items-center justify-center gap-1.5">
            🧪 <span>测试</span>
          </span>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-5 max-h-[500px] overflow-y-auto bg-gray-50/50">
        {/* API 配置标签页 */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* 配置状态指示器 */}
            {config ? (
              <div className="modern-card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-semibold text-sm">配置已就绪</p>
                    <p className="text-green-600 text-xs mt-0.5">
                      {PROVIDER_NAMES[config.provider]} · {config.model}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="modern-card bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 p-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-amber-800 font-semibold text-sm">需要配置</p>
                    <p className="text-amber-600 text-xs mt-0.5">
                      请配置 API 以使用智能回复功能
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 提供商选择 */}
            <div className="modern-card p-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                AI 提供商
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['siliconflow', 'deepseek', 'glm', 'custom'] as AIProvider[]).map(
                  (provider) => (
                    <button
                      key={provider}
                      onClick={() => handleProviderChange(provider)}
                      className={`modern-btn p-3 text-sm font-medium transition-all ${
                        formData.provider === provider
                          ? 'border-2 border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                          : 'border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {PROVIDER_NAMES[provider]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* API Token */}
            <div className="modern-card p-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                API Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={formData.apiToken}
                  onChange={(e) =>
                    setFormData({ ...formData, apiToken: e.target.value })
                  }
                  placeholder="sk-xxxx..."
                  className="modern-input w-full px-4 py-2.5 pr-20 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute top-1/2 -translate-y-1/2 right-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 font-medium bg-white rounded shadow-sm"
                >
                  {showToken ? '隐藏' : '显示'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                从 {PROVIDER_NAMES[formData.provider]} 获取您的 API Token
              </p>
            </div>

            {/* 模型名称 */}
            <div className="modern-card p-4">
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                模型名称
              </label>
              <input
                list="model-suggestions"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="输入或选择模型"
                className="modern-input w-full px-4 py-2.5 text-sm"
              />
              <datalist id="model-suggestions">
                {formData.provider !== 'custom' &&
                  MODEL_SUGGESTIONS[formData.provider].map((model) => (
                    <option key={model} value={model} />
                  ))}
              </datalist>
              {formData.provider !== 'custom' && (
                <p className="text-xs text-gray-500 mt-2">
                  建议: {MODEL_SUGGESTIONS[formData.provider].join(', ')}
                </p>
              )}
            </div>

            {/* 自定义 URL（仅自定义提供商） */}
            {formData.provider === 'custom' && (
              <div className="modern-card p-4 animate-fade-in">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  API URL
                </label>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, apiUrl: e.target.value })
                  }
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="modern-input w-full px-4 py-2.5 text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  需要兼容 OpenAI Chat Completions API
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={testAPI}
                disabled={isLoading || isSaving}
                className="modern-btn flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>测试中...</span>
                  </span>
                ) : (
                  '🔌 测试连接'
                )}
              </button>
              <button
                onClick={saveConfig}
                disabled={isLoading || isSaving}
                className="modern-btn flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>保存中...</span>
                  </span>
                ) : (
                  '💾 保存配置'
                )}
              </button>
            </div>

            {config && (
              <button
                onClick={clearConfig}
                className="modern-btn w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium"
              >
                🗑️ 清除配置
              </button>
            )}

            {/* 测试结果 */}
            {testResult && (
              <div className="modern-card p-4 bg-gray-50 animate-fade-in">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 状态标签页 */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {/* 配置状态 */}
            <div className="modern-card p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  width={16}
                  height={16}
                  style={{ minWidth: 16, minHeight: 16 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>当前配置</span>
              </h3>
              {config ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">提供商</span>
                    <span className="font-medium text-gray-900">{PROVIDER_NAMES[config.provider]}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">API URL</span>
                    <span className="font-mono text-xs text-gray-900 truncate max-w-[300px]">
                      {config.apiUrl}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">API Token</span>
                    <span className="font-mono text-xs text-gray-900">
                      {config.apiToken.slice(0, 10)}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">模型</span>
                    <span className="font-medium text-gray-900">{config.model}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">暂无配置</p>
              )}
            </div>

            {/* 存储信息 */}
            <div className="modern-card p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="text-blue-600"
                  width={16}
                  height={16}
                  style={{ minWidth: 16, minHeight: 16 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span>存储使用</span>
              </h3>
              {storageInfo ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">已使用</span>
                    <span className="font-medium text-gray-900">
                      {storageInfo.bytesInUse} 字节
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">配额</span>
                    <span className="font-medium text-gray-900">{storageInfo.quota} 字节</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">使用率</span>
                    <span className="font-medium text-gray-900">
                      {storageInfo.percentUsed}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-blue-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${storageInfo.percentUsed}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">加载中...</p>
              )}
            </div>

            {/* 回复风格列表 */}
            <div className="modern-card p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="text-blue-600"
                  width={16}
                  height={16}
                  style={{ minWidth: 16, minHeight: 16 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>可用回复风格</span>
              </h3>
              <div className="space-y-2">
                {REPLY_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className="flex items-start gap-3 text-sm p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <span className="text-2xl">{style.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{style.name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {style.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 自定义风格标签页 */}
        {activeTab === 'customStyles' && (
          <CustomStyleManager />
        )}

        {/* 测试标签页 */}
        {activeTab === 'test' && (
          <div className="space-y-4">
            <div className="modern-card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-800 font-semibold text-sm">开发测试工具</p>
                  <p className="text-blue-600 text-xs mt-0.5">
                    用于开发调试，正常使用不需要此功能
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={testAIGeneration}
              disabled={isLoading || !config}
              className="modern-btn w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>测试中...</span>
                </span>
              ) : (
                '🤖 测试生成回复'
              )}
            </button>

            {!config && (
              <div className="modern-card bg-amber-50 border-amber-200 p-3">
                <p className="text-xs text-amber-700 flex items-center gap-2">
                  <svg
                    className="text-amber-700"
                    width={16}
                    height={16}
                    style={{ minWidth: 16, minHeight: 16 }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>需要先在"API 配置"中保存配置</span>
                </p>
              </div>
            )}

            {testResult && (
              <div className="modern-card p-4 bg-gray-50 animate-fade-in">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg
                    className="text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    width={16}
                    height={16}
                    style={{ minWidth: 16, minHeight: 16 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>测试结果</span>
                </h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="border-t bg-gradient-to-br from-gray-50 to-gray-100/50 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg
            className="text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            width={16}
            height={16}
            style={{ minWidth: 16, minHeight: 16 }}
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="flex-1">
            {config ? (
              <span className="font-medium">配置已就绪，可以在 Twitter 上使用了</span>
            ) : (
              <span>请先配置 API 以使用智能回复功能</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
