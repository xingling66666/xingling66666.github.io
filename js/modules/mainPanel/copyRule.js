// modules/mainPanel/copyRule.js

import { showSnackbar } from '../../ui/components/dialog/index.js';
import * as storage from '../../services/storage.js';

/**
 * 显示复制规则编辑弹窗
 */
export function showCopyRuleEditor() {
    const dialog = document.querySelector('.copy-rule-dialog');
    if (!dialog) return;

    const textarea = document.getElementById('ruleTextarea');
    const previewDiv = document.getElementById('rulePreview');
    const cancelBtn = document.getElementById('cancelRuleBtn');
    const saveBtn = document.getElementById('saveRuleBtn');
    const presetLinkOnly = document.getElementById('presetLinkOnly');
    const presetLinkAndMap = document.getElementById('presetLinkAndMap');
    const presetFullInfo = document.getElementById('presetFullInfo');

    if (!textarea || !previewDiv) return;

    // 加载当前保存的规则
    const currentRule = storage.getCopyRule();
    textarea.value = currentRule;

    /**
     * 更新预览区域
     */
    const updatePreview = () => {
        const rule = textarea.value;
        // 模拟数据用于预览
        const mockContext = {
            url: 'https://example.com/share/123456',
            mapName: '王者峡谷',
            gameServer: 'zsf',
            banConfigName: '默认配置',
            banHeroNames: '亚瑟 妲己 鲁班',
            customConfigName: '我的配置'
        };
        const result = applyCopyRule(mockContext, rule);
        previewDiv.innerHTML = result || '(空)';
    };

    // 预设：仅链接
    if (presetLinkOnly) {
        presetLinkOnly.onclick = () => {
            textarea.value = '{url}';
            updatePreview();
        };
    }

    // 预设：链接+地图
    if (presetLinkAndMap) {
        presetLinkAndMap.onclick = () => {
            textarea.value = '{url}\n{map}';
            updatePreview();
        };
    }

    // 预设：完整信息
    if (presetFullInfo) {
        presetFullInfo.onclick = () => {
            textarea.value = '【{server}】{map}\n{url}\n自定义配置：{customConfigName}\n禁用配置：{banConfigName}\n禁用英雄：{banHeroNames}';
            updatePreview();
        };
    }

    // 监听输入实时预览
    textarea.oninput = updatePreview;

    // 取消按钮
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            dialog.open = false;
        };
    }

    // 保存按钮
    if (saveBtn) {
        saveBtn.onclick = () => {
            const newRule = textarea.value.trim();
            if (newRule) {
                storage.setCopyRule(newRule);
                showSnackbar('复制规则已保存');
                dialog.open = false;
            } else {
                showSnackbar('规则不能为空');
            }
        };
    }

    // 初始化预览
    updatePreview();
    dialog.open = true;
}

/**
 * 应用复制规则，将变量替换为实际值
 * @param {Object} context - 上下文数据
 * @param {string} [customRule] - 自定义规则，不传则使用保存的规则
 * @returns {string} 替换后的文本
 */
export function applyCopyRule(context, customRule = null) {
    // 获取规则：优先使用传入的，其次使用保存的，最后使用默认值
    const rule = customRule || storage.getCopyRule() || '{url}';

    // 构建变量映射表
    const variableMap = {
        '{url}': context.url || '',
        '{map}': context.mapName || '',
        '{banConfigName}': context.banConfigName || '',
        '{banHeroNames}': context.banHeroNames || '',
        '{customConfigName}': context.customConfigName || '',
        '{server}': context.gameServer === 'zsf' ? '正式服' : '体验服'
    };

    let result = rule;

    // 替换所有变量
    Object.entries(variableMap).forEach(([key, value]) => {
        // 对 {} 进行转义，使其能作为正则表达式的一部分
        const escapedKey = key.replace(/[{}]/g, '\\$&');
        result = result.replace(new RegExp(escapedKey, 'g'), value);
    });

    return result;
}