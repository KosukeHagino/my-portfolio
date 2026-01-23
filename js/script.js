'use strict';

/**************************************************
   変数・定数エリア
**************************************************/

/* タイマーを管理する変数 */
let autoScrollTimer; // 自動スライドの予約を覚えておくための変数



/**************************************************
   実行エリア（目次）
**************************************************/
// サイト全体の初期化と演出の開始をまとめる
const initSite = () => {

    // 1. 各パーツの準備（表示前に必要な設定）
    initScrollPosition();       // [トップページ]スクロール位置のリセット
    initCustomCursor();         // [共通]追尾カーソル
    initHamburgerMenu();        // [共通]ハンバーガーメニュー
    initWorksScrollObserver();  // [トップページ]制作物スライドの監視

    // 2. 演出の開始（初回/2回目の判定を行い、画面を表示させる）
    initLoading();              // [ローディング]初回判定と開始
};

// 全てのリソース（画像など）が読み込まれたら実行
window.addEventListener('load', initSite);



/**************************************************
   関数定義エリア
**************************************************/
/*** [トップページ] ページ読み込み時にスクロール位置をリセット（左端に戻す） ***/
const initScrollPosition = () => {
    const scrollList = document.querySelector('.works-list');
    if (scrollList) {

        // スクロールバーの位置を0（左端）にする
        scrollList.scrollLeft = 0;
    }
};



/*** [共通] 追尾カーソルの制御 ***/
const initCustomCursor = () => {
    const cursor = document.querySelector('#cursor');
    if (!cursor) return;

    // マウスの現在地をCSS変数(--x, --y)に送り込み、位置を更新する
    document.addEventListener('mousemove', (e) => {
        cursor.style.setProperty('--x', `${e.clientX}px`);
        cursor.style.setProperty('--y', `${e.clientY}px`);
    });

    // 特定の要素に乗った時、専用のクラス(.cursor-large)を付けて見た目を変える
    const hoverElements = document.querySelectorAll('a, #menu, .work-item');
    hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-large'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-large'));
    });
};



/*** [共通] ハンバーガーメニューの開閉制御 ***/
const initHamburgerMenu = () => {
    const menuBtn = document.querySelector('#menu');
    const globalNav = document.querySelector('#global-nav');
    const mask = document.querySelector('#mask');

    // 必要な要素が揃っていない場合はエラー防止のため中断
    if (!menuBtn || !globalNav || !mask) return;

    // クリックに反応させるトリガー要素をまとめる（ボタン本体、メニュー内のリンク、背景マスク）
    const triggers = document.querySelectorAll('#menu, .global-nav-item a, #mask');
    
    // クラスを付け替える（表示されていれば隠し、隠れていれば表示する）
    const toggleMenu = () => {
        menuBtn.classList.toggle('show');
        globalNav.classList.toggle('show');
        mask.classList.toggle('show');
    };

    // 全てのトリガー要素に対して、クリックされたらtoggleMenuを実行するように命令
    triggers.forEach(trigger => trigger.addEventListener('click', toggleMenu));
};



/*** [トップページ] 制作物スライドの監視と連動 ***/
/*** 1. 画面中央に来た作品を検知してアクティブ化する ***/
/*** 2. 画像の動きに合わせて、作品タイトル（テキスト）を自動でスライドさせる ***/
/*** 3. マウスホイールの縦回転を横スクロールに変換する ***/
const initWorksScrollObserver = () => {

    // 必要な要素をすべて取得
    const scrollList = document.querySelector('.works-list');
    const textList = document.querySelector('.work-text-list');
    const workItems = document.querySelectorAll('.work-item');
    const textItems = document.querySelectorAll('.work-text-item');

    if (!scrollList || !textList) return;

    // --- 1. 中央検知の設定 ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {

                // 中央に入った要素の番号（インデックス）を調べる
                const index = Array.from(workItems).indexOf(entry.target);
                
                if (index !== -1) {

                    // 全体のクラスをリセットし、今中央にあるものだけに「is-active」をつける
                    workItems.forEach(item => item.classList.remove('is-active'));
                    textItems.forEach(item => item.classList.remove('is-active'));
                    entry.target.classList.add('is-active');

                    // 対応するタイトルテキストを縦にスライド移動させる
                    if (textItems[index]) {
                        const itemHeight = 40; // 1行の高さ
                        textList.style.transform = `translateY(-${index * itemHeight}px)`;
                        textItems[index].classList.add('is-active');
                    }
                }
            }
        });
    }, { 
        root: scrollList,
        threshold: 0.1, // 少しでもエリアに入ったら反応
        rootMargin: "0px -45% 0px -45%" // 左右45%を削り、中央の「10%の隙間」を判定基準にする
    });

    // 全ての作品画像を監視対象に登録
    workItems.forEach(item => observer.observe(item));

    // --- 2. 操作の変換 ---
    // マウスの「縦スクロール」を「横スクロール」の動きに変換して操作しやすくする
    scrollList.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return;
        if (e.deltaY !== 0) {
            e.preventDefault();
            scrollList.scrollBy({ left: e.deltaY * 2.5, behavior: 'auto' });
        }
    }, { passive: false });
};



/*** [ローディング] ローディング画面の判定と実行 ***/
const initLoading = () => {

    // --- 演出のタイミング設定 ---
    const BLANK_TIME = 300;      // ページを開いてから黒い画面で待つ時間：0.3秒
    const START_DELAY = 1500;    // カウンター出現開始から数字が動き始めるまでの時間：1.5秒＝2のCSSアニメ1.2秒＋3の待機0.3秒
    // --------------------------

    const numEl = document.getElementById('loading-num');
    
    // ページにローディング要素がない場合は何もしない
    if (!numEl) return;

    if (document.documentElement.classList.contains('is-first-visit')) {
           
        /* A. 初回訪問時（ローディング演出あり） */
        // 1. ページを開いてから黒い画面で0.3秒待つ
        setTimeout(() => {

            // 2. カウンター出現（CSSで1.2秒かけて表示される）
            const counterContainer = numEl.closest('.loading-counter');
            if (counterContainer) {
                counterContainer.classList.add('is-active');
            }

            // 3. カウンター出現してから0.3秒待ってカウントアップ開始
            setTimeout(() => {
                updateCount(numEl, 0); // カウントアップは0から開始
            }, START_DELAY);

        }, BLANK_TIME);

    } else {

        /* B. 2回目以降の処理（ローディング演出をなくして即座にトップページを表示） */
        // ローディングを飛ばして中身を表示する関数
        showContentDirectly();
    }
};



/*** [ローディング] ローディング画面の数字を0から100までカウントアップする ***/
/*** el - 数字を書き換える対象の要素 ***/
/*** current - 現在の数値 ***/
const updateCount = (el, current) => {

    // 1〜5のランダムな数値を加算して「読み込み感」を演出
    let nextCount = current + (Math.floor(Math.random() * 5) + 1);

    // 100%を超えたときは100%にする
    if (nextCount >= 100) {
        nextCount = 100;
        el.textContent = nextCount;

        // 100%に達してから1秒の「余韻」を置いて終了処理へ
        setTimeout(endLoading, 1000);

    } else {
        el.textContent = nextCount;

        // 50ミリ秒ごとに再帰的に呼び出して滑らかに動かす
        setTimeout(() => updateCount(el, nextCount), 50);
    }
};



/*** [ローディング] ローディング画面をフェードアウトさせて終了する ***/
const endLoading = () => {

    // 1. 次回訪問時にスキップするためのフラグを保存
    sessionStorage.setItem('has-loaded', 'true');
    
    // 2. CSSのフェードアウトを開始（クラスを外す）
    document.documentElement.classList.remove('is-first-visit');

    // 3. 画面が完全に消えるタイミングで「表示処理（ゴール）」を呼び出す
    setTimeout(() => {
        showContentDirectly(); // ← 重複を削って、共通関数を呼ぶ！
    }, 2100); 
};



/*** [トップページ] コンテンツを表示して初期演出を実行する（共通のゴール） ***/
const showContentDirectly = () => {

    // サイトの中身をふわっと出す
    document.body.classList.add('content-ready');
    
    // 最初の作品へスクロールさせる
    scrollToFirstWork();
};



/*** [トップページ] 最初の作品へ自動スクロールする ***/
const scrollToFirstWork = () => {
    const worksList = document.querySelector('.works-list');
    const firstWork = document.querySelector('.first-work');

    if (worksList && firstWork) {

        // works-listの左端からみた「最初の作品」の距離を取得
        const elementLeft = firstWork.offsetLeft;

        // 最初の作品自体の幅の半分
        const elementHalfWidth = firstWork.clientWidth / 2;

        // 表示領域（画面）の幅の半分
        const containerHalfWidth = worksList.clientWidth / 2;

        // 【中央に持ってくるための計算】
        // 作品の左端の位置に、作品の幅の半分を足して「作品の中心」を出し、
        // そこから画面の幅の半分を引くことで、画面の中央に作品の中心が重なる
        const offset = elementLeft + elementHalfWidth - containerHalfWidth;
        
        // タイマーを変数に格納し、手動操作を監視する ---
        autoScrollTimer = setTimeout(() => {
            worksList.scrollTo({
                left: offset,
                behavior: 'smooth'
            });
        }, 3000);       // 3秒後に実行

        // ユーザーが自らホイール操作をした瞬間、自動スライドを中止する
        const cancelAutoScroll = () => {
            clearTimeout(autoScrollTimer);

            // 一度キャンセルしたら監視も不要なので削除
            worksList.removeEventListener('wheel', cancelAutoScroll);
            worksList.removeEventListener('touchstart', cancelAutoScroll);
        };

        worksList.addEventListener('wheel', cancelAutoScroll);
        worksList.addEventListener('touchstart', cancelAutoScroll); // スマホ用
    }
};
