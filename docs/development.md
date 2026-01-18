# 制作関連メモ

## Three.js をローカル配置する場合

CDNを使わずローカルに配置する場合、以下の3ファイルを配置してください。

- `assets/vendor/three/three.module.min.js`
- `assets/vendor/three/three.core.min.js`
- `assets/vendor/three/OrbitControls.js`
- `assets/vendor/three/STLLoader.js`

`index.html` は importmap を使って `three` を上記パスに解決します。

## pptx2pdf.py の使い方

PowerPoint（.pptx）をPDFに一括変換するスクリプトです。

### 準備（pptx2pdf.py）

- LibreOffice がインストールされていること（`soffice` コマンドが使える状態）

### 実行例（pptx2pdf.py）

```bash
python3 scripts/pptx2pdf.py <フォルダパス>
```

指定したフォルダ内の `.pptx` をすべて `pdf` に変換し、同じフォルダに出力します。

## pdf_firstpage_to_png.py の使い方

PDFの1ページ目を16:9のPNGサムネイルに一括変換します。

### 準備（pdf_firstpage_to_png.py）

- PyMuPDF と Pillow をインストール

```bash
pip install pymupdf pillow
```

### 実行例（pdf_firstpage_to_png.py）

```bash
python3 scripts/pdf_firstpage_to_png.py
```

### 出力先

- `pdf/` 内のPDFを読み込み、`thumbnails/` に `PDF名.png` で保存します
- 例: `pdf/1522003.pdf` → `thumbnails/1522003.png`

### オプション

- `--input-dir` でPDFフォルダを変更
- `--output-dir` で出力先を変更
- `--width` / `--height` で画像サイズを変更

## 重要メモ

- 画像やSTLが未設定でも動作します（プレースホルダー画像を参照）
- Tinkercadは外部リンクのみです
- STLビューアはThree.jsをローカル配置で読み込みます
