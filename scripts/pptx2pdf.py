import os
import subprocess
import sys

def pptx_to_pdf(folder_path):
    if not os.path.isdir(folder_path):
        raise ValueError("指定されたパスはフォルダではありません")

    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pptx"):
            pptx_path = os.path.join(folder_path, filename)

            cmd = [
                "soffice",
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                folder_path,
                pptx_path
            ]

            subprocess.run(cmd, check=True)
            print(f"変換完了: {filename}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("使い方: python pptx_to_pdf.py <フォルダパス>")
        sys.exit(1)

    target_folder = sys.argv[1]
    pptx_to_pdf(target_folder)
