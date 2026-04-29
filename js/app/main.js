// app/main.js - 应用主入口

import * as uiManager from '../ui/uiManager.js';
import { initHeroData } from '../data/heroData.js';
import { TIPS } from '../config/constants.js';
import { showDialog, showAlert } from '../ui/components/dialog/index.js';
import * as storage from '../services/storage.js';
import { registerSW, getSWVersion } from '../services/sw-manager.js';

registerSW('./sw.js');

// 应用状态
const appState = {
    initialized: false,
    loading: false
};

/**
 * 应用初始化
 */
async function initApp() {
    if (appState.initialized) {
        console.warn('应用已初始化，跳过重复初始化');
        return;
    }

    if (appState.loading) {
        console.warn('应用正在初始化中...');
        return;
    }

    appState.loading = true;
    console.log('自定义房间应用初始化中...');

    try {
        // 1. 绑定窗口加载事件
        bindWindowEvents();

        // 2. 显示欢迎提示
        showWelcomeTips();

        // 3. 初始化数据
        await initData();

        // 4. 初始化 UI（包含主题加载）
        // 说明：uiManager.init() 会调用 themePicker 模块的 restoreTheme 函数，
        // 该函数负责恢复用户上次选择的主题或应用默认主题，确保主题样式完全加载
        await uiManager.init();

        // 5. 主题和 UI 加载完成后显示 layout
        // 说明：为防止主题切换时的样式闪烁，HTML 中的 mdui-layout 标签预设了内联样式 display: none
        // 此时所有主题样式和 UI 组件均已加载完成，恢复 layout 显示，确保用户看到的是已应用主题的完整界面
        showLayout();

        appState.initialized = true;
        console.log('✓ 应用初始化完成');

    } catch (error) {
        console.error('✗ 应用初始化失败:', error);
        showAlert({
            headline: '初始化失败',
            description: '应用启动失败，请刷新页面重试。\n' + error.message
        });
    } finally {
        appState.loading = false;
    }
}

/**
 * 显示 layout 内容（在主题和 UI 加载完成后调用）
 * 移除内联 display: none 样式，让 layout 按 CSS 样式表定义的规则正常显示
 */
function showLayout() {
    const layout = document.querySelector(".app-layout");
    if (layout) {
        // 清除内联 display: none，让元素按 CSS 规则正常显示
        layout.style.display = '';
        console.log('✓ layout 已显示（主题和 UI 加载完成）');
    }
}

/**
 * 绑定窗口事件
 */
function bindWindowEvents() {
    // 窗口加载完成
    window.addEventListener('load', onWindowLoad);
}

/**
 * 窗口加载完成
 */
async function onWindowLoad() {
    // 设置标题
    const title = document.querySelector('.app-title');
    const version = await getSWVersion();
    if (title) {
        title.textContent = `王者自定义房间 ${version}`;
    }
}

/**
 * 显示欢迎提示
 */
function showWelcomeTips() {
    // 免费提示（仅首次显示）
    if (storage.getFreeTip() !== '0.1') {
        showDialog({
            headline: '提示',
            description: TIPS.FREE_TIP,
            actions: [
                {
                    text: '复制开源链接',
                    onClick: () => {
                        navigator.clipboard?.writeText('https://github.com/huajiqaq/wzzdy');
                        return true;
                    }
                },
                { text: '我知道了' }
            ],
            onClose: () => storage.setFreeTip('0.1')
        });
    }

    // 创建提示（仅首次显示）
    if (storage.getCreateTip() !== '0.1') {
        showAlert({
            headline: '提示',
            description: TIPS.CREATE_TIP,
            confirmText: '我知道了',
            onConfirm: () => storage.setCreateTip('0.1')
        });
    }
}

/**
 * 初始化数据
 */
async function initData() {
    console.log('初始化英雄数据...');

    try {
        await initHeroData();
        console.log('英雄数据加载完成');
    } catch (error) {
        console.error('英雄数据加载失败:', error);
        throw new Error('英雄数据加载失败，请检查网络连接');
    }
}

// ============ 公共 API ============

/**
 * 重新初始化应用
 */
export async function reinitialize() {
    appState.initialized = false;
    appState.loading = false;
    await initApp();
}

/**
 * 获取应用状态
 */
export function getAppState() {
    return { ...appState };
}

/**
 * 检查应用是否已初始化
 */
export function isAppInitialized() {
    return appState.initialized;
}

// ============ 启动应用 ============

// 当 DOM 准备好后启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM 已经加载完成
    initApp();
}

// 导出公共 API
export { initApp };
export default {
    init: initApp,
    reinitialize,
    getAppState,
    isAppInitialized
};
if (window.location.protocol !== "https:" && window.location.hostname !== "127.0.0.1" && window.location.hostname !== "localhost") {
  mdui.alert({
    headline: "提示",
    description: "当前处于非https环境下，sw.js将无法使用，这意味着将无法向用户同步更新"
  })
}
