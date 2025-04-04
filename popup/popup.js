// 精准截图弹出窗口脚本
import { getCurrentLanguage, getText, getRatioGroupLabel, getRatioOptionText } from '../utils/i18n.js';

document.addEventListener('DOMContentLoaded', function() {
  // 更新所有带有data-i18n属性的元素的文本
  function updateI18nTexts() {
    // 更新普通文本
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      element.textContent = getText(key);
    });

    // 更新比例选择器的组标签和选项
    const ratioSelect = document.getElementById('ratio-select');
    if (ratioSelect) {
      ratioSelect.querySelectorAll('optgroup').forEach(group => {
        const groupKey = group.getAttribute('data-group');
        group.label = getRatioGroupLabel(groupKey);
        
        group.querySelectorAll('option').forEach(option => {
          const optionKey = option.getAttribute('data-option');
          option.textContent = getRatioOptionText(groupKey, optionKey);
        });
      });
    }
  }

  // 获取DOM元素
  const startScreenshotBtn = document.getElementById('start-screenshot');
  const ratioSelect = document.getElementById('ratio-select');
  const saveFormatSelect = document.getElementById('save-format');
  const titleLink = document.getElementById('title-link');
  const normalModeBtn = document.getElementById('normal-mode');
  const inspectModeBtn = document.getElementById('inspect-mode');
  const shortcutKey = document.querySelector('[data-command="screenshot_start"]');
  
  // 获取截图参数
  let selectedRatio = ratioSelect.value;
  let isInspectMode = false;
  
  // 监听模式切换
  normalModeBtn.addEventListener('click', function() {
    isInspectMode = false;
    normalModeBtn.classList.add('active');
    inspectModeBtn.classList.remove('active');
    ratioSelect.disabled = false;
    
    // 保存模式设置，以便快捷键可以使用正确的模式
    chrome.storage.sync.set({ isInspectMode: false });
  });
  
  inspectModeBtn.addEventListener('click', function() {
    isInspectMode = true;
    inspectModeBtn.classList.add('active');
    normalModeBtn.classList.remove('active');
    ratioSelect.value = 'free';
    ratioSelect.disabled = true;
    
    // 保存模式设置，以便快捷键可以使用正确的模式
    chrome.storage.sync.set({ isInspectMode: true });
  });
  
  // 监听比例选择改变
  if (ratioSelect) {
    ratioSelect.addEventListener('change', function() {
      selectedRatio = this.value;
    });
  }
  
  // 添加标题链接点击事件
  if (titleLink) {
    titleLink.addEventListener('click', function(e) {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://puzzledu.com/' });
    });
  }
  
  // 加载上次使用的设置
  loadSettings();
  
  // 开始截图按钮点击事件
  startScreenshotBtn.addEventListener('click', function() {
    // 禁用按钮防止重复点击
    startScreenshotBtn.disabled = true;
    startScreenshotBtn.textContent = getText('capturing');
    
    // 准备截图选项
    const screenshotOptions = {
      ratio: selectedRatio,
      saveFormat: saveFormatSelect.value,
      imageQuality: 1.0,
      isInspectMode: isInspectMode
    };
    
    // 保存当前设置
    saveSettings(screenshotOptions);
    
    // 发送消息到background启动截图流程
    chrome.runtime.sendMessage({
      action: 'startScreenshot',
      options: screenshotOptions
    });
    
    // 自动关闭弹窗
    setTimeout(() => {
      window.close();
    }, 500);
  });
  
  // 加载设置
  function loadSettings() {
    chrome.storage.sync.get(['lastUsedRatio', 'saveFormat', 'imageQuality', 'isInspectMode'], function(data) {
      // 设置模式
      if (data.isInspectMode) {
        inspectModeBtn.click();
      }
      
      // 设置比例
      if (data.lastUsedRatio && ratioSelect && !data.isInspectMode) {
        ratioSelect.value = data.lastUsedRatio;
        selectedRatio = data.lastUsedRatio;
      }
      
      // 设置保存格式
      if (data.saveFormat && saveFormatSelect) {
        saveFormatSelect.value = data.saveFormat;
      }
      
      // 设置图片质量
      if (data.imageQuality) {
        // 这里不需要设置 imageQuality，因为我们在截图选项中直接使用固定值
      }
    });
  }
  
  // 保存设置
  function saveSettings(options) {
    chrome.storage.sync.set({
      lastUsedRatio: options.ratio,
      saveFormat: options.saveFormat,
      imageQuality: options.imageQuality,
      isInspectMode: options.isInspectMode
    });
  }

  // 初始化时更新所有文本
  updateI18nTexts();
}); 