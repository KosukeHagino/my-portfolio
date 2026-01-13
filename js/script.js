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
トップページ：初回訪問時のみローディング画面（カウントアップ）
**************************************************/

// DOM要素を取得し、変数に代入
const loadingEl = document.getElementById('loading');
const counterEl = document.getElementById('loading-counter');

// 要素が存在する場合のみ実行
if (loadingEl && counterEl) {

    // 【判定】htmlタグに「is-first-visit」クラスがついているか確認
    // （head内のスクリプトによって、初回訪問時のみ付与されている）
    if (document.documentElement.classList.contains('is-first-visit')) {
        
        let count = 0; // カウントアップ用の変数

        // --- 数字を更新する関数 ---
        const updateCount = () => {
            
            // 1〜5のランダムな数値を加算して「読み込み感」を出す
            count += Math.floor(Math.random() * 5) + 1; 

            if (count >= 100) {
                count = 100;
                counterEl.textContent = count + "%";
                
                // 100%に達してから「1秒」待って終了（完了を見せるためのタメ）
                setTimeout(endLoading, 1000);
            } else {
                counterEl.textContent = count + "%";
                // 40ミリ秒ごとに自分を呼び出してカウントアップを継続
                setTimeout(updateCount, 40); 
            }
        };

        // --- ローディング画面を消す関数 ---
        const endLoading = () => {
            // 2回目以降の訪問ではスキップするためにフラグを保存
            sessionStorage.setItem('has-loaded', 'true');
            
            /* 重要：htmlタグからクラスを削除。
               CSS側で「html:not(.is-first-visit)」に対して transition が設定されているため、
               この一行を実行した瞬間に、0.8秒かけたフェードアウトが始まる。
            */
            document.documentElement.classList.remove('is-first-visit');

            // 画面が完全に消えるのを待ってからメインの演出を開始
            setTimeout(() => {
                // コンテンツ表示準備完了の印（カーソル表示など）
                document.body.classList.add('content-ready');
                // 最初の作品へ自動スクロール
                scrollToFirstWork();
            }, 900); // CSSのtransition(0.8s)より少し長く設定
        };

        // ページが表示されてから「1秒」待ってカウントアップ開始（開始前のタメ）
        setTimeout(updateCount, 1000);

    } else {
        // --- 2回目以降の訪問（即座にメイン表示） ---
        document.body.classList.add('content-ready');
        window.addEventListener('load', scrollToFirstWork);
    }
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
