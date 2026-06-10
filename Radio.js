<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>野良生放送ラジオ（試作版）</title>
    <style>
        body {
            background-color: #222;
            color: #fff;
            font-family: sans-serif;
            text-align: center;
            padding-top: 50px;
        }
        .radio-box {
            border: 4px solid #555;
            border-radius: 10px;
            padding: 30px;
            display: inline-block;
            background-color: #333;
        }
        button {
            padding: 10px 20px;
            font-size: 18px;
            background-color: #ffb703;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        button:hover { background-color: #fb8500; }
        #player-container { margin-top: 20px; }
        #info { margin-top: 15px; font-size: 14px; color: #ccc; }
    </style>
</head>
<body>

<div class="radio-box">
    <h2>📻 ニコ生・野良ザッピングラジオ</h2>
    <p>ページを開く、またはボタンを押すと「今やってる放送」に繋がります</p>
    <button id="next-btn">次の番組（チューニング）</button>
    
    <div id="info">番組を検索中...</div>
    <div id="player-container"></div>
</div>

<script>
// ニコニコ生放送の「公式検索API」を使って、今ライブ中の番組をひっぱる関数
async function tuneInRadio() {
    const infoDiv = document.getElementById('info');
    const container = document.getElementById('player-container');
    infoDiv.innerText = "今やってる放送を電波探索中...";
    container.innerHTML = ""; // プレイヤーを一旦消去

    // ニコ生の『雑談』タグがついている、現在放送中の番組を最大100件取得するAPI URL
    // （CORS回避のため、公開プロキシを経由させています）
    const q = encodeURIComponent("雑談");
    const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://snapshot.search.nicovideo.jp/api/v2/live/contents/search?q=${q}&targets=tags&fields=contentId,title&filters[liveStatus][0]=onair&_sort=-startTime&_limit=30`
    )}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const result = JSON.parse(data.contents);

        if (result.data && result.data.length > 0) {
            // ヒットした「今放送中の番組リスト」から、ランダムで1つ選ぶ（ガチャ要素）
            const randomIndex = Math.floor(Math.random() * result.data.length);
            const program = result.data[randomIndex];
            
            infoDiv.innerHTML = `<strong>現在再生中:</strong> ${program.title}`;
            
            // ニコ生公式の埋め込みプレイヤー（iframe）を生成して音を鳴らす
            // ※ブラウザの仕様上、最初は消音(muted)で始まることがあるため、画面が出たら音量を上げてください
            container.innerHTML = `
                <iframe src="https://live.nicovideo.jp/embed/${program.contentId}?autoplay=1&mute=0" 
                        width="400" 
                        height="250" 
                        style="border:none;" 
                        allow="autoplay">
                </iframe>`;
        } else {
            infoDiv.innerText = "今放送中の番組が見つかりませんでした。時間をおいて試してください。";
        }
    } catch (error) {
        console.error(error);
        infoDiv.innerText = "通信エラーが発生しました。もう一度ボタンを押してください。";
    }
}

// ページが読み込まれたら自動で再生を試みる（電源ONの再現）
// ※ブラウザのセキュリティ制限により、ユーザーが画面を1回クリックするまで自動再生がブロックされる場合があります
window.addEventListener('load', () => {
    setTimeout(tuneInRadio, 1000);
});

// ボタンを押したら次の番組へ
document.getElementById('next-btn').addEventListener('click', tuneInRadio);
</script>

</body>
</html>
