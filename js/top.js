'use strict';



/**************************************************
   定数・変数管理
**************************************************/
const TOP_CONFIG = {
    SCROLL_SPEED_RATIO: 2.5,    // マウスホイールの回転を横スクロール量に変換する倍率
    AUTO_SCROLL_DELAY: 3000,    // サイト表示後、自動スクロールが始まるまでの時間
    OFFSET_INDEX: 1             // 画像1枚目(キャッチ)にはテキストがないためのズレ調整
}

let autoScrollTimer;            // 自動スクロールを止めるためのタイマーID保持用



/**************************************************
   初期化処理（ページ読み込み時に一度だけ実行）
**************************************************/
const initTopPage = () => {
    initScrollPosition();       // スクロール位置を左端へリセット
    initWorksScrollObserver();  // スクロール監視とテキスト連動の仕組みを起動
    initIndicator();            // スマホ用ドットインジケーターを作成
    initLoading();              // ローディング演出を開始
};

// 全てのリソースが読み込まれてから初期化を開始
window.addEventListener('load', initTopPage);

// スクロール位置の初期化
const initScrollPosition = () => {
    const scrollList = document.getElementById('js-work-list');
    if (scrollList) scrollList.scrollLeft = 0;
};



/**************************************************
   [機能] 制作物スライドの監視と連動
**************************************************/
const initWorksScrollObserver = () => {
    const scrollList = document.getElementById('js-work-list');
    const textList = document.getElementById('js-work-text-list');
    const workItems = document.querySelectorAll('.work-item');
    const textItems = document.querySelectorAll('.work-text-item');

    if (!scrollList || !textList) return;

    // 中央に来た画像に合わせて、テキストの状態を更新する
    // @param {number} index - 現在中央にある画像の番号(0〜5)
    const updateActiveState = (index) => {
        // 全ての画像から一旦is-activeクラスを削除
        workItems.forEach(item => item.classList.remove('is-active'));
        // 中央に来た画像にだけis-activeを付与（拡大表示などのCSS用）
        if (workItems[index]) workItems[index].classList.add('is-active');

        // 画像とテキストのインデックス調整
        // 画像は [キャッチ, 作品1, 2, 3, 4, Contact] の6枚
        // テキストは [作品1, 2, 3, 4] の4つ。
        // キャッチ(index:0)の時は textIndex が -1 になるように計算
        const textIndex = index - TOP_CONFIG.OFFSET_INDEX;

        textItems.forEach((item, i) => {
            // data-index-diff を常に計算
            // これにより、現在地より「下」にあるか「上」にあるかがCSSに伝わり、
            // スルスルとした上下スライドのアニメーションが維持される
            const diff = i - textIndex;
            item.setAttribute('data-index-diff', diff);
            
            // 現在の作品に該当するテキストにだけis-activeを付与（表示用）
            if (i === textIndex) {
                item.classList.add('is-active');
            } else {
                item.classList.remove('is-active');
            }
        });

        // テキストリストの移動距離計算はCSSに任せる
        // JSは今何番目かの数字を渡す
        textList.style.setProperty('--current-index', textIndex);

        // 下のドット（インジケーター）も更新
        updateIndicator(index);
    };

    // 交差監視（Intersection Observer）
    // 画像が画面の「中央エリア」に入った瞬間を検知する
    const observer = new IntersectionObserver((entries) => {
        // 交差した（中央に入った）要素を特定
        const intersectingEntry = entries.find(entry => entry.isIntersecting);
        if (intersectingEntry) {
            const index = Array.from(workItems).indexOf(intersectingEntry.target);
            if (index !== -1) {
                updateActiveState(index);
            }
        }
    }, { 
        root: scrollList,
        threshold: 0.1,                 // 要素が10%以上エリアに入ったら反応
        rootMargin: "0px -25% 0px -25%" // 画面の中央50%の幅を判定基準にする
    });

    // 全ての画像アイテムを監視対象に登録
    workItems.forEach(item => observer.observe(item));

    // マウスの縦スクロールを横スクロールの動きに変換する
    scrollList.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.deltaY === 0) return;
        e.preventDefault(); // ブラウザ標準の挙動を止めて、自分でスクロールさせる
        scrollList.scrollBy({
            left: e.deltaY * TOP_CONFIG.SCROLL_SPEED_RATIO,
            behavior: 'auto'
        });
    }, { passive: false });
};



/**************************************************
   [機能] ローディング演出
**************************************************/
const initLoading = () => {
    const numEl = document.getElementById('js-loading-num');
    if (!numEl) return;

    // common.js等で管理している「初回訪問フラグ」をチェック
    if (document.documentElement.classList.contains('is-first-visit')) {
        setTimeout(() => {
            const counterContainer = document.getElementById('js-loading-counter');
            if (counterContainer) counterContainer.classList.add('is-active');
            setTimeout(() => updateCount(numEl, 0), 900); // 0.9秒後にカウント開始
        }, 300);
    } else {
        // 2回目以降はローディングを飛ばして即表示
        showContentDirectly();
    }
};

// カウントアップの再帰処理
const updateCount = (el, current) => {
    let nextCount = current + (Math.floor(Math.random() * 3) + 1);
    if (nextCount >= 100) {
        el.textContent = 100;
        setTimeout(endLoading, 1000); // 100%になってから少し余韻を置く
    } else {
        el.textContent = nextCount;
        setTimeout(() => updateCount(el, nextCount), 50); // 0.05秒おきに加算
    }
};

const endLoading = () => {
    sessionStorage.setItem('has-loaded', 'true');
    document.documentElement.classList.remove('is-first-visit');
    setTimeout(showContentDirectly, 1000); 
};

// ローディング終了後、または2回目以降の表示処理
const showContentDirectly = () => {
    // これを付けることでCSSの「.content-ready .copy-jp」等が反応してキャッチが出る
    document.body.classList.add('content-ready');

    const workList = document.getElementById('js-work-list');
    const firstWork = document.getElementById('js-first-work');
    if (!workList || !firstWork) return;

    // キャッチコピーが見える位置（初期位置）へ少し自動スクロールさせる演出
    const offset = firstWork.offsetLeft + (firstWork.clientWidth / 2) - (workList.clientWidth / 2);
    autoScrollTimer = setTimeout(() => {
        workList.scrollTo({ left: offset, behavior: 'smooth' });
    }, TOP_CONFIG.AUTO_SCROLL_DELAY);

    // ユーザーが自分で触ったら自動スクロールをキャンセルする
    const cancelAutoScroll = () => {
        clearTimeout(autoScrollTimer);
        workList.removeEventListener('wheel', cancelAutoScroll);
        workList.removeEventListener('touchstart', cancelAutoScroll);
    };

    workList.addEventListener('wheel', cancelAutoScroll);
    workList.addEventListener('touchstart', cancelAutoScroll);
};



/**************************************************
   [機能] スマホ用インジケーター（ドット）
**************************************************/
const initIndicator = () => {
    const workItems = document.querySelectorAll('.work-item');
    const indicator = document.getElementById('js-indicator');
    if (!indicator || workItems.length === 0) return;

    indicator.innerHTML = ''; // 読み込み直し時の重複防止
    workItems.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('indicator-dot');
        if (index === 0) dot.classList.add('is-active'); // 1個目を光らせる
        indicator.appendChild(dot);
    });
};

const updateIndicator = (index) => {
    const dots = document.querySelectorAll('.indicator-dot');
    // 現在表示中の画像の番号に合わせて光るドットを切り替える
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
};
