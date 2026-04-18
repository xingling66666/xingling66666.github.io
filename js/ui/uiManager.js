// ui/uiManager.js

import { initHeroSelector } from '../modules/heroSelector/index.js';
import { initConfigSelector } from '../modules/configSelector/index.js';
import { initThemePicker } from '../modules/themePicker/index.js';
import { initMapSelector } from '../modules/mapSelector/index.js';
import { initMainPanel } from '../modules/mainPanel/index.js';
import { showSnackbar } from './components/dialog/index.js';
import * as storage from '../services/storage.js';

/**
 * 初始化所有 UI 组件
 */
export async function init() {
    console.log('初始化 UI 组件...');

    try {
        // 1. 初始化主题选择器
        await initThemePicker();
        console.log('  ✓ 主题选择器');

        // 2. 初始化地图选择器
        initMapSelector();
        console.log('  ✓ 地图选择器');

        // 3. 初始化主面板
        initMainPanel();
        console.log('  ✓ 主面板');

        // 4. 初始化英雄选择器
        await initHeroSelector();
        console.log('  ✓ 英雄选择器');

        // 5. 初始化配置选择器
        await initConfigSelector();
        console.log('  ✓ 配置选择器');

        // 6. 恢复用户偏好
        restorePreferences();

        console.log('✓ UI 组件初始化完成');

    } catch (error) {
        console.error('✗ UI 初始化失败:', error);
        showSnackbar('界面初始化失败，请刷新页面重试');
        throw error;
    }
}

/**
 * 恢复用户偏好设置
 */
function restorePreferences() {
    const themeColor = storage.getThemeColor();
    if (themeColor && typeof mdui !== 'undefined') {
        mdui.setColorScheme(themeColor);
    }
}

export default { init };