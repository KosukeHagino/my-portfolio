'use strict';



/**************************************************
関数定義
**************************************************/

/*** トップページのロード時に2枚目（最初の作品）へ自動スクロール ***/
/*** 左側にキャッチコピー、中央に作品を配置するためにス位置を調整 ***/
function scrollToFirstWork() {

    // DOM要素を取得し、変数に代入
    const worksList = document.querySelector('.works-list');
    const firstWork = document.querySelector('.first-work');

    // 両方の要素が画面に存在する場合のみ実行（エラー防止）
    if (worksList && firstWork) {

        // 作品が画面の真ん中に来るための計算式：
        // (作品の左端の距離) - (画面幅の半分) + (作品自体の幅の半分)
        const offset = firstWork.offsetLeft - (worksList.clientWidth / 2) + (firstWork.clientWidth / 2);

        // 計算した位置へ2秒後にスライド
        setTimeout(() => {
            worksList.scrollLeft = offset;
        }, 2000);
    }
}



/**************************************************
トップページ：初回訪問時のみローディング画面（タイプライター風）
**************************************************/

// DOM要素の取得
const loadingEl = document.getElementById('loading');
const loadingTextEl = document.getElementById('loading-text');

// ローディング画面の制御
if (loadingEl && loadingTextEl) {
    // A: 初回訪問（sessionStorageにデータがない）場合
    if (sessionStorage.getItem('has-loaded') !== 'true') {
        
        // CSSの表示フラグ（クラス）を即座に付与
        document.body.classList.add('is-first-visit');

        // テキストを1文字ずつ<span>に分割する処理
        const textToAnimate = loadingTextEl.textContent.trim();
        loadingTextEl.textContent = '';
        let spansHtml = '';
        for (let char of textToAnimate) {
            spansHtml += `<span>${char === ' ' ? '&nbsp;' : char}</span>`;
        }
        loadingTextEl.innerHTML = spansHtml;
        const spanEls = loadingTextEl.querySelectorAll('span');

        // タイプライターアニメーションの実行
        loadingTextEl.classList.add('show-text');
        spanEls.forEach((span, i) => {
            setTimeout(() => {
                span.classList.add('animate-text');
            }, 100 * i);
        });

        // 終了処理の予約
        const totalDuration = textToAnimate.length * 100 + 1000;
        setTimeout(() => {
            sessionStorage.setItem('has-loaded', 'true');
            loadingEl.classList.add('loading-hidden'); // フェードアウト開始
            
            setTimeout(() => {
                sessionStorage.setItem('has-loaded', 'true');
                
                // フェードアウト開始
                loadingEl.classList.add('loading-hidden'); 
                
                // CSSの transition (0.5s) が終わった後に完全に消す
                setTimeout(() => {
                    loadingEl.classList.add('loading-complete'); 
                    document.body.classList.add('content-ready');
                    scrollToFirstWork(); 
                }, 550); // CSSの0.5秒より少しだけ長く設定
            }, 510);
        }, totalDuration);

    } else {
        // B: 2回目以降（すでにロード済み）の場合
        // 準備完了クラスをつけ、ローディング画面を表示させない
        document.body.classList.add('content-ready');
        
        // 画像などの読み込み完了後にスクロール位置だけ調整
        window.addEventListener('load', scrollToFirstWork);
    }
} else {
    // ローディング要素がないページ（Profileなど）
    document.body.classList.add('content-ready');
}



/**************************************************
共通　追尾カーソル
**************************************************/

/*** マウスの動きに合わせて動く丸いカーソルの制御 ***/
// DOM要素を取得し、変数に代入
const cursor = document.querySelector('#cursor');

// ページにカーソル要素がある場合のみ実行
if (cursor) {

    // マウスが動くたびに実行
    document.addEventListener('mousemove', (e) => {

        // CSS変数 (--x, --y) にマウスの座標を渡す
        // これによりCSS側で translate: var(--x) var(--y) が動く
        cursor.style.setProperty('--x', `${e.clientX}px`);
        cursor.style.setProperty('--y', `${e.clientY}px`);
    });

    // リンクやボタンに乗った時にカーソルを大きくする設定
    const hoverElements = document.querySelectorAll('a, #menu, .work-item');
    hoverElements.forEach((el) => {

        // 乗ったとき
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-large'));

        // 離れたとき
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-large'));
    });
}



/**************************************************
共通　ハンバーガーメニュー
**************************************************/

/*** メニューボタン、ナビ、背景マスクの3つを同時に切り替え ***/
// DOM要素を取得し、変数に代入
const menuBtn = document.querySelector('#menu');
const globalNav = document.querySelector('#global-nav');
const mask = document.querySelector('#mask');

// メニュー関連の要素がすべて揃っている場合のみ実行
if (menuBtn && globalNav && mask) {

    // クリックに反応させる要素をまとめて取得
    const triggers = document.querySelectorAll('#menu, .global-nav-item a, #mask');

    // クラスを付け外しする共通の命令
    const toggleMenu = () => {
        menuBtn.classList.toggle('show');
        globalNav.classList.toggle('show');
        mask.classList.toggle('show');
    };

    // すべてのトリガーに「クリックしたらtoggleMenuを実行」と教える
    triggers.forEach(trigger => {
        trigger.addEventListener('click', toggleMenu);
    });
}



/**************************************************
トップページ　制作物の横スクロール・制作物のテキスト情報の切り替え
**************************************************/

// DOM要素を取得し、変数に代入
const scrollList = document.querySelector('.works-list');
const workTitleArea = document.querySelector('.work-title-area');

if (scrollList && workTitleArea) {
    // 【ホイール変換】マウスの縦回転を横スクロールに変える
    scrollList.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;      // 拡大操作中は邪魔しない
        if (e.deltaY !== 0) {
            e.preventDefault();     // 画面全体のスクロールを止める
            scrollList.scrollBy({
                left: e.deltaY * 2.5,   // 2.5倍の速さで横に移動
                behavior: 'auto'        // スナップ機能と相性が良い'auto'を選択
            });
        }
    }, { passive: false });         // preventDefaultを使うために必要

    // 【監視】どの作品が中央にあるかチェックする
    // DOM要素を取得し、変数に代入
    const typeLabel = document.querySelector('.work-type-label');
    const workTitle = document.querySelector('.work-title');
    const workDesc = document.querySelector('.work-description');

    const observerOptions = {
        root: scrollList,
        threshold: 0.6          // 60%以上見えたら「中央に来た」とみなす
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                // 中央に来た要素にクラスを付けて大きくする
                entry.target.classList.add('is-active');

                // 要素内のリンクからデータ（タイトルなど）を取得
                const link = entry.target.querySelector('a');

                if (link) {
                    workTitleArea.style.opacity = "1";      // 文字エリアを表示

                    // アニメーションを一度リセットして再実行
                    workTitleArea.classList.remove('is-change');
                    void workTitleArea.offsetWidth;         // 再描画を強制
                    workTitleArea.classList.add('is-change');

                    // アニメーションの途中で文字を書き換える
                    setTimeout(() => {
                        typeLabel.textContent = link.getAttribute('data-type');
                        workTitle.textContent = link.getAttribute('data-title');
                        workDesc.textContent = link.getAttribute('data-desc');
                    }, 300);

                } else {

                    // リンクがない（キャッチコピーの）時は文字エリアを消す
                    workTitleArea.style.opacity = "0";
                }
            } else {

                // 中央から外れたらクラスを取る
                entry.target.classList.remove('is-active');
            }
        });
    }, observerOptions);

    // すべての作品アイテムの監視を開始
    const workItems = document.querySelectorAll('.work-item');
    workItems.forEach(item => observer.observe(item));
}
