'use strict';

/**************************************************
   グローバル変数
**************************************************/
// マウスの現在座標を保持
// 描画ループ（requestAnimationFrame）とイベントを切り分けることでパフォーマンスを最適化
window.mouseX = 0;
window.mouseY = 0;



/**************************************************
   初期化処理
**************************************************/
const initCommon = () => {
    initCustomCursor();     // 追尾カーソルの開始
    initHamburgerMenu();    // メニュー開閉機能の有効化
};

// ページ読み込み完了時に実行
window.addEventListener('load', initCommon);



/**************************************************
   [機能] 追尾カーソルの制御
**************************************************/
// マウスの動きに滑らかに追従するカスタムカーソルの実装
const initCustomCursor = () => {
    const cursor = document.querySelector('#cursor');
    if (!cursor) return;

    let cursorX = 0;    // カーソルの現在のX座標
    let cursorY = 0;    // カーソルの現在のY座標

    // マウスが動くたびに座標を更新
    document.addEventListener('mousemove', (e) => {
        window.mouseX = e.clientX;
        window.mouseY = e.clientY;
    });

    // アニメーションループ
    // 毎フレーム実行され、カーソルをマウス位置へ滑らかに移動させる
    const animateCursor = () => {
        // 現在地から目標地点までの距離の15%ずつ移動させることでヌルヌル動かす
        cursorX += (window.mouseX - cursorX) * 0.15;
        cursorY += (window.mouseY - cursorY) * 0.15;

        // CSS変数を通じて位置を反映
        cursor.style.setProperty('--x', `${cursorX}px`);
        cursor.style.setProperty('--y', `${cursorY}px`);

        // 次の描画フレームでも呼び出す
        requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // ホバーイベントの設定
    // 特定の要素に乗ったときにカーソルの見た目を変える
    const updateHoverEvents = () => {
        const hoverElements = document.querySelectorAll('a, #menu, .work-item, button');
        hoverElements.forEach((el) => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cursor-large'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-large'));
        });
    };
    updateHoverEvents();
};



/**************************************************
   [機能] ハンバーガーメニューの開閉制御
**************************************************/
// メニューボタン、背景マスク、ナビ内のリンクをクリックした際の挙動を管理
const initHamburgerMenu = () => {
    const menuBtn = document.querySelector('#menu');
    const globalNav = document.querySelector('#global-nav');
    const mask = document.querySelector('#mask');

    // 必要な要素が揃っていない場合は処理を中断（エラー防止）
    if (!menuBtn || !globalNav || !mask) return;

    // 複数の要素（NodeList）を一つの配列に展開してまとめる
    const triggers = [
        menuBtn,
        mask,
        ...document.querySelectorAll('.global-nav-item a')
    ];
    
    // クラスの付け替え処理
    // CSS側で.showクラスに対して表示スタイルを定義
    const toggleMenu = () => {
        [menuBtn, globalNav, mask].forEach(el => el.classList.toggle('show'));
    };

    // すべてのトリガー要素にクリックイベントを一括登録
    triggers.forEach(trigger => trigger.addEventListener('click', toggleMenu));
};
