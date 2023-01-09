import fs from 'fs/promises';
import path from 'path';
import { parseMarkdown } from './ohmjs';

const tagMap = {
    '【書類名】 明細書': '',
    '【発明の名称】': 'invention-title',
    '【技術分野】': 'technical-field',
    '【背景技術】': 'background-art',
    '【先行技術文献】': 'citation-list',
    '【特許文献】': 'patent-literature',
    '【非特許文献】': 'nonpatent-literature',
    '【発明の概要】': 'summary-of-invention',
    '【発明が解決しようとする課題】': 'tech-problem',
    '【課題を解決するための手段】': 'tech-solution',
    '【発明の効果】': 'advantageous-effects',
    '【図面の簡単な説明】': 'description-of-drawings',
    '【発明を実施するための形態】': 'description-of-embodiments',
    '【実施例】': 'embodiments-example',
    '【産業上の利用可能性】': 'industrial-applicability',
    '【符号の説明】': 'reference-signs-list',
    '【受託番号】': 'reference-to-deposited-biological-material',
    '【配列表フリーテキスト】': 'sequence-list-text',
    '【配列表】': 'sequence-list',
};

async function main() {
    const src = path.join(__dirname, '../test/test.md');
    const dst = path.join(__dirname, '../test/test.html');
    const md = await fs.readFile(src, 'utf-8');
    const html = await parseMarkdown(md);
    viewTree(html);
    //await fs.writeFile(dst, html);
}

function viewTree(tree: any, depth: number = 0) {
    if (tree === undefined) return;
    console.log(tree);

    if (Array.isArray(tree.content)) {
        tree.content.forEach((element: any) => {
            viewTree(element, depth + 1);
        });
    } else if (typeof tree.content === 'string') {
        console.log(`_`.repeat(depth * 2) + tree.content);
    } else {
        console.log(tree);
    }
}

main()
    .catch(error => console.log(error));

