# Graduation Credit Verification System (畢業學分檢核系統)

本專案是一個整合「學分分析、通識必修比對、排課模擬、走動預警」之新世代學位檢核系統。

本專案使用以下技術棧：
- **前端**：React + Vite + TypeScript (埠口: 3000)
- **後端**：Python FastAPI (埠口: 8000)
- **資料庫**：MySQL (埠口: 3306)
- **容器化技術**：Docker & Docker Compose 一鍵啟動

---

## 快速啟動 (Docker 一鍵部署)

本專案已完全容器化。只需在一台安裝了 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 的電腦上執行以下步驟即可一鍵啟動整個系統。

### 1. 啟動所有容器
請在專案根目錄（包含 `docker-compose.yml` 的目錄）開啟終端機，執行：
```bash
docker compose up --build
```
此指令會自動：
- 啟動 MySQL 資料庫，並在背景運行。
- 編譯並啟動 Python FastAPI 後端伺服器 (映射至主機 `8000` 埠口)。
- 編譯並啟動 React 前端 Web 伺服器 (映射至主機 `3000` 埠口)。

### 2. 初始化資料庫與匯入種子資料 (Seeding)
在容器成功啟動後，請另外開啟一個終端機視窗，進入後端目錄 `dbms_final_backend` 並執行種子腳本：
```bash
cd dbms_final_backend
python seed.py
```
*這會自動初始化所有資料表，並為測試帳號寫入政大資科系必修、一般通識規則，以及學生「聖結石」的歷年修課數據。*

### 3. 開始使用
打開瀏覽器，訪問：
👉 **http://localhost:3000**

- **測試學號**：`110306078`
- **預設密碼**：`password123`

---

## 本地開發手動啟動模式 (不使用 Docker)

如果您想在本地進行開發除錯，也可以分別啟動前後端：

### 後端啟動
1. 進入 `dbms_final_backend` 目錄。
2. 安裝套件：`pip3 install -r requirements.txt` (注意：為解決 passlib 相容問題，建議使用 `pip3 install bcrypt==4.3.0`)。
3. 初始化資料庫：`python3 seed.py` (預設為 MySQL，若要改用 SQLite，請修改 `.env` 中的 `DATABASE_URL=sqlite:///./sql_app.db`)。
4. 啟動伺服器：`python3 -m uvicorn app.main:app --reload --port 8000`。

### 前端啟動
1. 進入 `graduation-credit-verification-system` 目錄。
2. 安裝依賴：`npm install`。
3. 啟動網頁：`npm run dev`。
4. 訪問 `http://localhost:3000`。
