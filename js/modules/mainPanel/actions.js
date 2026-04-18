// modules/mainPanel/actions.js

import { showSnackbar, showConfirm, showAlert, showDialog } from '../../ui/components/dialog/index.js';
import { copyText } from '../../services/clipboard.js';
import { openGameLink, buildRoomOnlyLink, generateGameLink, generateShareLink } from '../../core/linkBuilder.js';
import { checkModeAvailability } from '../../core/mapModeChecker.js';
import { getShortLink } from '../../services/api.js';
import { refreshHeroData } from '../../data/heroData.js';
import { getMapInfo, isRoomOnlyMode as checkRoomOnly, getMapTip } from '../../data/mapData.js';
import { checkHasCustomConfig } from '../../utils/config/index.js';
import { createElement } from '../../utils/dom.js';
import { checkSWUpdate, skipWaiting, getSWVersion } from '../../services/sw-manager.js';

import { getState, setWorkMessage, getLinkAction } from './state.js';
import { getGameServer, getMapName, getCurrentConfig, getBanData } from './panel.js';
import { applyCopyRule } from './copyRule.js';
import { showQRCodeDialog } from './qrcode.js';

const { LAUNCH, COPY } = getLinkAction();

/**
 * 统一的链接处理
 */
/**
 * 统一的链接处理
 */
export async function handleLinkAction(action) {
    const state = getState();

    if (state.workMessage) {
        showSnackbar(state.workMessage);
        return;
    }

    const gameServer = getGameServer();
    const config = getCurrentConfig();
    const banHeroData = getBanData();

    if (!gameServer) {
        showSnackbar('请先选择游戏服务器');
        return;
    }

    const mapName = getMapName();
    if (!mapName) {
        showSnackbar('请先选择地图模式');
        return;
    }

    // 地图可用性检查
    if (!checkModeAvailability(mapName, gameServer).available) return;

    // 获取地图信息
    const mapInfo = getMapInfo(mapName);
    if (!mapInfo) {
        showSnackbar('地图信息不存在');
        return;
    }

    const isRoomOnly = checkRoomOnly(mapName);

    // 统一的确认检查
    const tipText = isRoomOnly
        ? '此地图仅提供开房间，不可无CD哦，确认继续？'
        : (checkHasCustomConfig(config) ? '确认继续？' : '检测到自定义配置为空，是否继续？');

    const confirmed = await showConfirm({
        headline: '提示',
        description: tipText,
        confirmText: '继续',
        cancelText: '取消'
    });

    if (!confirmed) return;

    if (action === COPY) {
        setWorkMessage('正在生成链接...');
    }

    try {
        const banHeroNames = banHeroData?.banHeroNames || '';

        const scheme = isRoomOnly
            ? buildRoomOnlyLink(gameServer, mapInfo)
            : generateGameLink(config, gameServer, mapInfo, banHeroNames).url;

        if (action === LAUNCH) {
            openGameLink(scheme);
        } else {
            await handleCopyAction(scheme, config, gameServer, mapName, banHeroData);
        }
    } catch (error) {
        console.error('操作失败:', error);
        const errorMsg = action === LAUNCH ? '生成失败' : '生成链接失败';
        showAlert({ headline: errorMsg, description: error.message });
    } finally {
        if (action === COPY) {
            setWorkMessage(null);
        }
    }
}

/**
 * 处理复制动作
 */
const MAX_URL_LENGTH = 2048;
const MAX_QR_LENGTH = 2000;

async function handleCopyAction(scheme, config, gameServer, mapName, banHeroData) {
    let url = generateShareLink(scheme);
    const data = {
        url,
        gameServer,
        mapName,
        customConfigName: config?.name || '',
        banConfigName: banHeroData?.banConfigName || '',
        banHeroNames: banHeroData?.banHeroNames || ''
    };

    // 链接超长处理
    if (url.length > MAX_URL_LENGTH) {
        const useShort = await showConfirm({
            headline: '链接过长',
            description: `当前链接长度 ${url.length}，超过 ${MAX_URL_LENGTH} 限制。\n生成短链接可能无法进房，是否尝试？`,
            confirmText: '生成短链接',
            cancelText: '复制原始链接'
        });

        if (!useShort) {
            handleCopyResult(data, url);
            return;
        }
    }

    // 尝试生成短链接
    try {
        data.url = await getShortLink(url) || url;
    } catch {
        // 短链接失败，继续使用原链接
    }

    handleCopyResult(data, url);
}

function handleCopyResult(data, originalUrl) {
    const copyResult = applyCopyRule(data);
    copyText(copyResult);
    
    if (originalUrl.length >= MAX_QR_LENGTH) {
        showDialog({
            headline: '提示',
            description: '配置文本过长，无法生成二维码，请手动分享配置',
            body: null,
            actions: [{ text: '知道了' }]
        });
    } else {
        showQRCodeDialog(data.url, originalUrl, copyResult);
    }
}

// ============ 独立动作 ============

export const handleLaunch = () => handleLinkAction(LAUNCH);
export const handleCopyLink = () => handleLinkAction(COPY);

/**
 * 使用教程
 */
export function handleTutorial() {
    showAlert({
        headline: '使用教程',
        description: '1. 打开游戏训练营\n2. 选择英雄后进入加载页\n3. 点击「启动」即可解除限制\n4. 可通过「复制链接」分享给他人进入房间\n\n💡 提示：长按「复制链接」按钮可设置复制规则'
    });
}

/**
 * 更多链接
 */
export function handleMoreLinks() {
    const links = [
        { name: '小王自定义', url: 'https://xl.xlskw.cn/' },
        { name: '小王开局助手v1.0', url: 'https://wz.yzre.cn/' }
    ];

    const body = createElement('div');

    links.forEach(link => {
        const a = createElement('a', {
            textContent: link.name,
            attributes: { href: link.url, target: '_blank' },
            style: {
                display: 'block',
                margin: '8px 0',
                color: 'rgb(var(--mdui-color-primary))'
            }
        });
        body.appendChild(a);
    });

    showDialog({
        headline: '更多链接',
        description: '本网页已停止维护，以下是可能维护的网页',
        body,
        actions: [{ text: '我知道了' }]
    });
}

/**
 * QQ群
 */
export function handleQQGroup() {
    copyText('746855036');
}

/**
 * 更新配置
 */
export async function handleUpdateConfig() {
    const confirmed = await showConfirm({
        headline: '提示',
        description: '是否更新英雄列表？成功后会自动刷新网页。'
    });

    if (!confirmed) return;

    showSnackbar('正在更新配置...');

    try {
        await refreshHeroData();
        showSnackbar('更新成功，即将刷新页面');
        setTimeout(() => location.reload(), 1500);
    } catch (error) {
        console.error('更新失败:', error);
        showSnackbar('更新失败，请重试');
    }
}

/**
 * 检测 SW 更新
 */
export async function handleCheckUpdate() {
    try {
        // 获取当前版本
        const currentVersion = await getSWVersion();
        console.log('当前版本:', currentVersion);

        // 检查是否有更新
        const hasUpdate = await checkSWUpdate();

        if (hasUpdate) {
            const confirmed = await showConfirm({
                headline: '发现新版本',
                description: `当前版本: ${currentVersion || '未知'}\n发现新版本，是否立即更新？`,
                confirmText: '立即更新',
                cancelText: '稍后'
            });

            if (confirmed) {
                showSnackbar('正在更新...');
                await skipWaiting();
            }
        } else {
            showAlert({
                headline: '检查更新',
                description: `当前已是最新版本\n版本号: ${currentVersion || '未知'}`
            });
        }
    } catch (error) {
        console.error('检查更新失败:', error);
        showSnackbar('检查更新失败，请稍后重试');
    }
}

// 动作映射表
export const BUTTON_ACTIONS = {
    launch: handleLaunch,
    copyLink: handleCopyLink,
    tutorial: handleTutorial,
    moreLinks: handleMoreLinks,
    qqGroup: handleQQGroup,
    updateConfig: handleUpdateConfig,
    checkUpdate: handleCheckUpdate
};