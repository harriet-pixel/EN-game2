# 奇幻像素美術測試版

獨立網址：`/EN-game2/fantasy-test/`。正式版 `/EN-game2/` 的畫面與資料不變。

背景、石階、角色是分開產生的 PNG 素材，保留獨立圖層；介面使用深色金框與紫色調。美術預覽每屏顯示八塊較大的石階，沿用持續前進、鏡頭平移與魔法陣轉場邏輯。人物目前使用單張細緻站姿素材搭配移動動畫。

測試版使用 `mosslight-fantasy-preview` IndexedDB，正式版使用 `mosslight`，題庫與進度互不覆寫。

執行 `npm run build` 同時輸出正式版與 `dist/fantasy-test/`。預覽使用共享玩法產生的獨立版本程式，加上 `theme.css`，不會變更正式版的程式或樣式檔內容。發布同一份 GitHub Pages 產物即可存取兩個網址。

`assets/forest.png`、`assets/stone.png`、`assets/hero.png` 為此測試版生成的美術素材。
