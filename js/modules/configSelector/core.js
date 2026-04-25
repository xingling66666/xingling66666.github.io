// modules/configSelector/core.js

import { TAB_KEYS, VICTORY_SELECT_ID } from './constants.js';
import { getTabState, getCurrentData, saveCurrentData, switchView } from './state.js';
import { collectConfigFromState, applyConfigToState } from '../../utils/config/collector.js';

// ============ 数据收集 ============

/**
 * 从 UI 收集指定 tab 的数据
 */
export const collectUIData = (panel) => {
    if (!panel) return {};

    const selects = panel.querySelectorAll('.config-container mdui-select');
    const data = {};

    selects.forEach(select => {
        const key = select.dataset.configKey;
        if (!key) return;

        const value = select.value || select.defaultValue;

        if (select.multiple) {
            data[key] = JSON.stringify(value || []);
        } else {
            data[key] = value || String(0);
        }
    });

    return data;
};

/**
 * 获取面板元素
 */
export const getPanelByTabKey = (dialog, tabKey) => {
    return dialog.querySelector(`.config-panel[data-tab-key="${tabKey}"]`);
};

// ============ 数据应用 ============

/**
 * 应用数据到 UI
 */
export const applyDataToUI = (dialog, tabKey, data) => {
    const panel = getPanelByTabKey(dialog, tabKey);
    if (!panel) return;

    panel.querySelectorAll('.config-container mdui-select').forEach(select => {
        const key = select.dataset.configKey;
        if (!key) return;
        const value = data?.[key] ?? select.defaultValue;

        if (select.multiple) {
            try { select.value = JSON.parse(value); }
            catch { select.value = select.defaultValue || []; }
        } else {
            select.value = String(value);
        }
    });
};

/**
 * 加载所有 tab 数据到 UI
 */
export const loadAllDataToUI = (dialog) => {
    TAB_KEYS.forEach(tabKey => {
        const data = getCurrentData(tabKey);
        applyDataToUI(dialog, tabKey, data);
    });
};

// ============ 视图切换 ============

/**
 * 切换到全部模式
 */
export const switchToAll = (dialog, tabKey) => {
    const panel = getPanelByTabKey(dialog, tabKey);
    const currentData = collectUIData(panel);

    saveCurrentData(tabKey, currentData);
    switchView(tabKey, 'all');

    const newData = getCurrentData(tabKey);
    applyDataToUI(dialog, tabKey, newData);
};

/**
 * 切换到队伍模式
 */
export const switchToTeam = (dialog, tabKey, team) => {
    const panel = getPanelByTabKey(dialog, tabKey);
    const currentData = collectUIData(panel);

    saveCurrentData(tabKey, currentData);
    switchView(tabKey, 'team', { team });

    const newData = getCurrentData(tabKey);
    applyDataToUI(dialog, tabKey, newData);
};

/**
 * 切换到选手模式
 */
export const switchToPlayer = (dialog, tabKey, playerNum) => {
    // mdui-select 组件值只能为字符串，请勿输入数字
    if (typeof playerNum === 'number') {
        const errorMessage = '参数 playerNum 必须为字符串，请检测相关代码是否输入正确';
        alert(errorMessage)
        throw new Error(errorMessage);
    }
    const panel = getPanelByTabKey(dialog, tabKey);
    const currentData = collectUIData(panel);

    saveCurrentData(tabKey, currentData);
    switchView(tabKey, 'player', { player: Number(playerNum) });

    const newData = getCurrentData(tabKey);
    applyDataToUI(dialog, tabKey, newData);
};

// ============ DOM 操作 ============

export const collectVictoryFromDOM = () => {
    const victorySelect = document.getElementById(VICTORY_SELECT_ID);
    return victorySelect?.value || victorySelect?.defaultValue;
};

export const applyVictoryToDOM = (value) => {
    const victorySelect = document.getElementById(VICTORY_SELECT_ID);
    if (victorySelect) {
        victorySelect.value = String(value);
    }
};

// ============ 配置收集（结合状态和 DOM） ============

export const collectFullConfig = (tabState) => {
    const victory = collectVictoryFromDOM();
    return collectConfigFromState(tabState, victory);
};

export const applyFullConfig = (config, tabState) => {
    const victory = applyConfigToState(config, tabState);
    applyVictoryToDOM(victory);
};

// ============ 工具函数 ============

export const isJSON = (str) => {
    if (typeof str !== 'string') return false;
    try {
        const obj = JSON.parse(str);
        return typeof obj === 'object' && obj !== null;
    } catch {
        return false;
    }
};

export const generateConfigName = (base = '未命名') => {
    return `${base}${Math.round(Math.random() * 100000000)}`;
};