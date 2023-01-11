import fs from 'fs/promises';
import path from 'path';
import { parseMarkdown } from './parser';
import { PatentNode } from './operation';

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
    const tmpl = path.join(__dirname, '../test/template.html');
    const md = await fs.readFile(src, 'utf-8');
    const result = await parseMarkdown(md);
    const html = viewTree(result);
    await saveAsHTML(html, dst, tmpl);
}

function viewTree(tree: PatentNode, depth: number = 0): string {
    if (typeof tree.content === 'string') {
        return `<${tree.type} class="${tree.className}">${tree.content}</${tree.type}>`;
    } else if (Array.isArray(tree.content)) {
        const i = tree.content.map((element: PatentNode) => viewTree(element));
        return `<${tree.type} class="${tree.className}">${i.join("")}</${tree.type}>`;
    } else {
        return "";
    }
}

async function saveAsHTML(content: string, outPath: string, templatePath: string){
    const tmpl = await fs.readFile(templatePath, 'utf-8');
    const html = tmpl.replace("##CONTENT##", content);
    await fs.writeFile(outPath, html, 'utf-8');
}

main()
    .catch(error => console.log(error));

