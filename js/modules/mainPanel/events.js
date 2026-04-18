// modules/mainPanel/events.js

import * as storage from '../../services/storage.js';
import { getState, setLongPressTimer, clearLongPressTimer } from './state.js';
import { BUTTON_ACTIONS } from './actions.js';
import { showCopyRuleEditor } from './copyRule.js';

/**
 * 绑定按钮事件
 */
export function bindButtonEvents() {
    Object.entries(BUTTON_ACTIONS).forEach(([action, handler]) => {
        const selector = `[data-action="${action}"]`;
        const btn = document.querySelector(selector);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    });
}

/**
 * 绑定输入事件
 */
export function bindInputEvents() {
    const mapInput = document.querySelector('.map-input');
    if (mapInput) {
        mapInput.addEventListener('change', (e) => {
            storage.setCurrentMapMode(e.target.value);
        });
    }

    const heroInput = document.querySelector('.hero-ban-input');
    if (heroInput) {
        heroInput.addEventListener('change', (e) => {
            storage.setCurrentBanConfigName(e.target.value);
        });
    }

    const customInput = document.querySelector('.custom-input');
    if (customInput) {
        customInput.addEventListener('change', (e) => {
            storage.setCurrentCustomConfigName(e.target.value);
        });
    }
}

/**
 * 绑定长按事件
 */
export function bindLongPressEvents() {
    const copyBtn = document.querySelector('[data-action="copyLink"]');
    if (!copyBtn) return;

    const startLongPress = () => {
        setLongPressTimer(setTimeout(() => {
            showCopyRuleEditor();
        }, 500));
    };

    const cancelLongPress = () => {
        clearLongPressTimer();
    };

    copyBtn.addEventListener('mousedown', startLongPress);
    copyBtn.addEventListener('mouseup', cancelLongPress);
    copyBtn.addEventListener('mouseleave', cancelLongPress);
    copyBtn.addEventListener('touchstart', startLongPress);
    copyBtn.addEventListener('touchend', cancelLongPress);
    copyBtn.addEventListener('touchcancel', cancelLongPress);
}

/**
 * 绑定切换游戏服务器事件
 */
export function bindGameServerEvents() {
    const serverGroup = document.querySelector('.game-server-group');
    if (!serverGroup) return;

    serverGroup.addEventListener('change', (e) => {
        storage.setCurrentGameServer(e.target.value);
    });
}

/**
 * 从存储加载数据
 */
export function loadDataFromStorage() {
    const savedGameServer = storage.getCurrentGameServer();
    if (savedGameServer) {
        const serverGroup = document.querySelector('.game-server-group');
        if (serverGroup) serverGroup.value = savedGameServer;
    }

    const savedMap = storage.getCurrentMapMode();
    if (savedMap) {
        const mapInput = document.querySelector('.map-input');
        if (mapInput) mapInput.value = savedMap;
    }

    const savedBanConfigName = storage.getCurrentBanConfigName();
    if (savedBanConfigName) {
        const banHeroInput = document.querySelector('.hero-ban-input');
        if (banHeroInput) banHeroInput.value = savedBanConfigName;
    }

    const savedCustomConfigName = storage.getCurrentCustomConfigName();
    if (savedCustomConfigName) {
        const customInput = document.querySelector('.custom-input');
        if (customInput) customInput.value = savedCustomConfigName;
    }
}