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
                onClick: () => {
                    openGameLink(scheme);
                    copyText(content);
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