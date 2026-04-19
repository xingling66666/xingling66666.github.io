// modules/mainPanel/qrcode.js

import { showDialog } from '../../ui/components/dialog/index.js';
import { openGameLink } from '../../core/linkBuilder.js';
import { createElement } from '../../utils/dom.js';
import { copyText } from '../../services/clipboard.js';

/**
 * 显示二维码对话框
 */
export function showQRCodeDialog(scheme, url, content) {
    const qrContainer = createElement('div', {
        id: 'qrcode-container',
        style: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            minHeight: '200px'
        }
    });

    showDialog({
        headline: '扫描二维码',
        description: '使用手机扫描二维码即可进入房间',
        body: qrContainer,
        actions: [
            {
                text: '打开游戏并复制',
                onClick: async () => {
                    // 关键：必须先完成复制，再执行跳转
                    // 因为 openGameLink 会导致页面失焦或跳转，打断 Clipboard API 所需的用户交互上下文
                    // 若顺序颠倒，复制操作会因丢失焦点而触发权限验证
                    // - 未授权时：抛出 NotAllowedError
                    // - 已授权时：可以正常复制
                    // 为避免不确定性，始终先复制再跳转
                    await copyText(content);
                    openGameLink(scheme);
                }
            },
            { text: '关闭' }
        ],
        onOpen: () => {
            const size = Math.min(qrContainer.clientWidth, 250) || 200;

            if (typeof QRCode !== 'undefined') {
                new QRCode(qrContainer, {
                    text: url,
                    width: size,
                    height: size,
                    correctLevel: QRCode.CorrectLevel.H
                });
            } else {
                qrContainer.textContent = '二维码库未加载';
            }
        }
    });
}