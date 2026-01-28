# デジタルファブリケーション成果サイト

学生の制作物をCSVから読み込み、画像・STL・Tinkercadリンクをカード表示する静的サイトです。
次年度仕様では、完成物の展示に加えて、アイデアスケッチや試作段階などの制作プロセスを記録・表示できる拡張フィールドを導入しています。ただし、2025年度分の既存データとの後方互換性を維持し、プロセス項目が未入力の場合でもエラーを出さずに従来どおり表示される設計としています。

URL: https://kwu-cms.github.io/digitai-fabrication-web/

使い方
1. data/works.csv を編集します。
2. 成果物画像は images/final/、制作プロセス画像は images/process/ に配置します。
3. STLファイルは stl/ に配置します。
4. index.html をブラウザで開いて確認します。

## CSVスキーマ

ヘッダーは以下の順で作成してください。

```
COURSE_YEAR,ID,PRESENTATION,TITLE,TAGS,UUID,YEAR,URL,STL_FILENAME,IMAGES_FILENAME,PDF_FILENAME,PROCESS_TEXT,PROCESS_IMAGES_FILENAME,PROCESS_PDF_FILENAME
```

### フィールド定義

| フィールド名 | 説明 | 例 | 必須 |
|------------|------|-----|------|
| `COURSE_YEAR` | 授業年度 | `2025`, `2026` | ✓ |
| `ID` | 管理用ID（重複不可） | `1522050` | ✓ |
| `PRESENTATION` | 発表区分または発表名 | `中間発表`, `最終発表` | ✓ |
| `TITLE` | 作品タイトル | `環境を観察して機能を追加するデザイン` | ✓ |
| `TAGS` | タグ（`\|` 区切り） | `laser\|3dprint\|cnc` | - |
| `UUID` | 一意識別子 | `550e8400-e29b-41d4-a716-446655440000` | ✓ |
| `YEAR` | 制作年 | `2025` | ✓ |
| `URL` | 外部リンク（Tinkercad、設計資料、ポートフォリオ等） | `https://www.tinkercad.com/...` | - |
| `STL_FILENAME` | STLファイルの相対パス | `stl/sample.stl` | - |
| `IMAGES_FILENAME` | 成果物画像の相対パス（複数指定可、`\|` 区切り） | `images/final/img1.jpg\|images/final/img2.jpg` | - |
| `PDF_FILENAME` | 成果物に関するPDF資料の相対パス | `pdf/presentation.pdf` | - |
| `PROCESS_TEXT` | 制作プロセスの説明文（スケッチ段階、試作段階、完成までの変更点など） | `アイデアスケッチから...` | - |
| `PROCESS_IMAGES_FILENAME` | 制作プロセス画像の相対パス（複数指定可、`\|` 区切り） | `images/process/sketch1.jpg\|images/process/proto1.jpg` | - |
| `PROCESS_PDF_FILENAME` | 制作プロセスに関する補足資料PDFの相対パス | `pdf/process_notes.pdf` | - |

後方互換性について
2025年度分のCSVには、PROCESS_TEXT、PROCESS_IMAGES_FILENAME、PROCESS_PDF_FILENAME が空欄でも問題ありません。
フロントエンド側では、これらのフィールドが未定義または空文字の場合、制作プロセス表示用のUIは自動的に非表示となり、従来どおり成果物カードのみが表示されます。
この仕様により、既存データを修正せずに次年度以降の拡張運用が可能です。

データの読み込み元
既定では Google スプレッドシートのCSVを読み込みます。
GitHub Pages 上で data/works.csv を使う場合は、assets/app.js の sheetId を空にしてください。
const sheetId = "";

GitHub Pages 公開
1. GitHubにこのフォルダをリポジトリとしてpush
2. GitHubの Settings → Pages を開く
3. Build and deployment で GitHub Actions または Deploy from a branch を選択
4. ブランチは main、フォルダは / (root) を選択
5. 発行されたURLにアクセス

授業運用メモ
制作物の提出要件として、完成データに加え制作プロセスの記録を含める運用を想定しています。
アイデアスケッチ段階、試作・検証段階、完成・最終調整段階の各フェーズについて、PROCESS_TEXT に意図や設計変更点を記述し、対応する画像やPDFを PROCESS_IMAGES_FILENAME および PROCESS_PDF_FILENAME に指定することで、成果と過程の双方をアーカイブ可能な構成とします。

制作関連メモ
詳細は docs/development.md を参照してください。
