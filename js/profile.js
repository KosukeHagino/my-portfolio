'use strict';

/**************************************************
   [機能] スキル詳細の動的表示（カテゴリ内タブ切替）
**************************************************/
// 各セクションを取得
const sections = document.querySelectorAll('.js-section');

sections.forEach(section => {
    // セクション内のアイテムだけを取得
    const Items = section.querySelectorAll('.js-process-item');

    Items.forEach(item => {
        item.addEventListener('click', () => {
            // すでにactiveのものをクリックしたときは何もしない
            if (item.classList.contains('active')) return;

            // このセッション内のアイテムだけからactiveを消す
            Items.forEach(el => el.classList.remove('active'));

            // クリックされたアイテムにactiveをつける
            item.classList.add('active');
        });
    });
});
