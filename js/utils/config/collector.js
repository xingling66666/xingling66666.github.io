// utils/config/collector.js

import { TAB_KEYS, isDefaultValueByKey, DEFAULT_VICTORY } from './constants.js';

// ============ 从状态收集配置 ============

export function collectConfigFromState(tabState, victoryValue) {
    const config = { victory: victoryValue };

    TAB_KEYS.forEach(tabKey => {
        const state = tabState[tabKey];
        if (state) {
            config[tabKey] = collectConfig(state);
        }
    });

    return config;
}

function collectConfig(state) {
    const mode = state.currentView;
    const config = { mode };

    if (mode === 'all') {
        config.data = filterDefaultValues(state.all);
    } else if (mode === 'team') {
        config.data = {
            blue: filterDefaultValues(state.team.blue),
            red: filterDefaultValues(state.team.red)
        };
    } else if (mode === 'player') {
        config.data = {
            blue: state.player.blue.map(p => filterDefaultValues(p)),
            red: state.player.red.map(p => filterDefaultValues(p))
        };
    }

    return config;
}

/**
 * 过滤掉默认值
 */
function filterDefaultValues(data) {
    if (!data || typeof data !== 'object') return data;

    const filtered = {};
    Object.entries(data).forEach(([attrKey, value]) => {
        if (!isDefaultValueByKey(attrKey, value)) {
            filtered[attrKey] = value;
        }
    });
    return filtered;
}

// ============ 应用配置到状态 ============

export function applyConfigToState(config, tabState) {
    TAB_KEYS.forEach(tabKey => {
        const tabConfig = config[tabKey];
        const state = tabState[tabKey];

        if (tabConfig && state) {
            applyConfig(state, tabConfig);
        }
    });

    return config.victory || DEFAULT_VICTORY;
}

function applyConfig(state, tabConfig) {
    const { mode, data } = tabConfig;
    state.currentView = mode;

    if (mode === 'all') {
        state.all = data || {};
    } else if (mode === 'team') {
        state.team.blue = data.blue || {};
        state.team.red = data.red || {};
    } else if (mode === 'player') {
        state.player.blue = (data.blue || []).map(p => p || {});
        state.player.red = (data.red || []).map(p => p || {});
    }
}