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
// ローディング画面がないページ（＝トップページ以外）なら、すぐに表示フラグを立てる
if (!document.querySelector('#loading')) {
    document.body.classList.add('content-ready');
}


// 初期化処理
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
        ...document.querySelectorAll('.global-nav-item a')
    ];
    
    // クラスの付け替え処理
    // CSS側で.showクラスに対して表示スタイルを定義
    const toggleMenu = () => {
        [menuBtn, globalNav, mask].forEach(el => el.classList.toggle('show'));
    };

    // メニューボタン、ナビ内のリンクにクリックイベントを登録
    triggers.forEach(trigger => trigger.addEventListener('click', toggleMenu));

    // マウス専用のクリック処理
    mask.addEventListener('click', () => {
        // モーダル表示中の場合：モーダルを閉じる（モーダル側の処理と競合させないため）
        if (mask.classList.contains('is-modal')) {
            // ここでは何もせずモーダル制御のセクションに任せる
            return;
        }

        // メニュー表示中の場合：メニューを閉じる
        if (mask.classList.contains('show')) {
            toggleMenu();
        }
    });
};



/**************************************************
   [機能] モーダル表示制御（バナー拡大など）
**************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const mask = document.getElementById('mask');
    const modalClose = document.querySelector('.modal-close');
    // 全ページ共通で使えるよう、ボタンのクラス名で取得
    const modalTriggers = document.querySelectorAll('.modal-trigger-button');

    // モーダルを開く処理
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            // 1. クリックされたボタン内から画像情報を取得
            const img = trigger.querySelector('img');
            if (img) {
                modalImg.src = img.src;
                modalImg.alt = img.alt;
            }

            // 2. モーダルとマスクを表示（z-indexはCSSのis-modalで制御）
            mask.classList.add('is-modal');
            modal.classList.add('show');

            // 3. 背景スクロールを禁止（モーダル背後で動かないようにする）
            document.body.style.overflow = 'hidden';
        });
    });

    // モーダルを閉じる共通処理
    const closeModal = () => {
        if (modal) modal.classList.remove('show');
        if (mask) mask.classList.remove('is-modal');
        
        // 背景スクロールを再開
        document.body.style.overflow = '';
    };

    // 閉じるイベント：×ボタンクリック
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // 閉じるイベント：背景マスククリック
    if (mask) {
        mask.addEventListener('click', () => {
            // モーダル表示中（is-modalが付いている時）だけ閉じる処理を実行
            if (mask.classList.contains('is-modal')) {
                closeModal();
            }
        });
    }
});
