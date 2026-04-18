// mapModeChecker.js - 游戏模式检查

import { MAP_TIPS, GAME_SERVERS } from '../config/constants.js';

/**
 * 模式规则配置
 */
const MODE_RULES = [
    {
        keyword: "觉醒",
        isOpen: () => false,
        tip: MAP_TIPS.NOT_OPEN
    },
    {
        keyword: "克隆",
        isOpen: () => [5, 6, 0].includes(new Date().getDay()),
        tip: MAP_TIPS.WEEKEND_ONLY
    },
    {
        keyword: "契约",
        isOpen: () => [5, 6, 0].includes(new Date().getDay()),
        tip: MAP_TIPS.WEEKEND_ONLY
    },
    {
        keyword: "变身",
        isOpen: (serverType) => serverType === GAME_SERVERS.ZSF,
        tip: MAP_TIPS.ZSF_ONLY
    },
    {
        keyword: "随机征召",
        isOpen: (serverType) => serverType === GAME_SERVERS.ZSF,
        tip: MAP_TIPS.ZSF_ONLY
    },
    {
        keyword: "小峡谷",
        isOpen: (serverType) => serverType === GAME_SERVERS.TYF,
        tip: MAP_TIPS.TYF_ONLY
    }
];

/**
 * 检查游戏模式是否可用
 */
export function checkModeAvailability(modeName, serverType) {
    const matchedMode = MODE_RULES.find(rule => modeName.includes(rule.keyword));

    if (!matchedMode) {
        return { available: true };
    }

    const isOpen = matchedMode.isOpen(serverType);

    if (!isOpen) {
        showModeAlert(matchedMode.tip);
        return { available: false, tip: matchedMode.tip };
    }

    return { available: true };
}

/**
 * 显示模式不可用提示
 */
function showModeAlert(tip) {
    mdui.alert({
        headline: "提示",
        description: tip,
        confirmText: "我知道了",
        onConfirm: () => console.log("confirmed")
    });
}

/**
 * 检查征召模式
 */
export { isZhengzhaoMode } from '../data/mapData.js';