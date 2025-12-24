'use strict';

/**************************************************
ハンバーガーメニュー
**************************************************/

// クラスをトグルするターゲット要素を取得
const menuBtn = document.querySelector('#menu');
const globalNav = document.querySelector('#global_nav');
const mask = document.querySelector('#mask');

// クリックのトリガーとなる全ての要素を取得
const triggers = document.querySelectorAll('#menu, #global_nav_item a, #mask');

// 共通の処理を関数として定義
const toggleMenu = () => {

    // 3つのターゲット要素のクラスを同時にトグル
    menuBtn.classList.toggle('show');
    globalNav.classList.toggle('show');
    mask.classList.toggle('show');  
}

// 全てのトリガー要素をループ処理
triggers.forEach(trigger => {
    trigger.addEventListener('click', toggleMenu)
})
