import os

ROOT = "root"  # 必要に応じて変更

FOLDERS = [
    "2025_EDBXY60I6F_松本_佑美",
    "2025_WHDPOBO8Q1_松本_美音",
    "2025_JRQJMTH0ZX_市川_舞",
    "2025_KTL3JDRXCD_射手矢_里咲",
    "2025_4PTOM079IA_加藤_にこ",
    "2025_XJSQ5QVWG6_駒田_有紀",
    "2025_OEGANR6GO3_白塚_琴弓",
    "2025_4MZKBCGW6B_蓮尾_奏歌",
    "2025_VZW3RUIC38_矢野_初実",
    "2025_ZHRCCWXXOA_盧_秀雅",
    "2025_2RU9PRL8D5_渡部_汐音",
    "2025_S6YH24OIIP_浦上_琴音",
    "2025_PBU2Q44JZD_清重_葵生",
    "2025_H4IKHYANHJ_蓼原_澄香",
    "2025_GK2KABBLRA_西川_侑那",
    "2025_33XMUQCH2A_吉崎_由真",
    "2025_F0G1VABCDU_池田_紘納",
    "2025_0YBQSFGP9E_黒台_紗生",
    "2025_YLO7BW3V1F_後藤_真奈",
    "2025_IVJIV9OH7C_田中_万結",
    "2025_4P6G70TEI0_三井_理々夏",
    "2025_WRDSEGZD12_山本_奈央",
]


def main():
    os.makedirs(ROOT, exist_ok=True)

    for name in FOLDERS:
        path = os.path.join(ROOT, name)
        if not os.path.exists(path):
            os.makedirs(path)
        else:
            print(f"skip: {name}")


if __name__ == "__main__":
    main()
