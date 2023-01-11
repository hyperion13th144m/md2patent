import { Node } from 'ohm-js'

export class PatentNode {
    constructor(
        public type: string,
        public content: string | PatentNode[],
        public className: string = ""
    ) { }
};

export const patentMarkdownOperation = {
    doc: (_: any, description: Node, claims: Node, abstract: Node) =>
        new PatentNode('section', [description.blocks()], "patent-document"),
    description: (descHeader: Node, invention: Node, techField: Node, bgArt: Node, citations: Node) =>
        new PatentNode('section', [
            descHeader.blocks(),
            invention.blocks(),
            techField.blocks(),
            bgArt.blocks(),
            citations.blocks()],
            "description"),
    descHeader: (_1: any, _2: any, _3: any, _4: any, _5: any, _6: any) =>
        new PatentNode("h1", "【書類名】明細書", "document-name"),
    invention: (inventionHeader: any, inventionContent: any, _: any) =>
        new PatentNode("section", [inventionHeader.blocks(), inventionContent.blocks()], "invention-title"),
    inventionHeader: (_0: any, _1: any, _2: any, _3: any, _4: any) =>
        new PatentNode("h2", "【発明の名称】"),
    inventionContent: (blocks: any) =>
        new PatentNode("p", blocks.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p')),
    techField: (techFieldHeader: any, techFieldContent: any, _: any) =>
        new PatentNode("section", [techFieldHeader.blocks(), ...techFieldContent.blocks()], "technical-field"),
    techFieldHeader: (_0: any, _1: any, _2: any, _3: any, _4: any) =>
        new PatentNode("h2", "【技術分野】"),
    techFieldContent: (blocks: any) =>
        blocks.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p'),
    bgArt: (bgArtHeader: Node, bgArtContent: Node) =>
        new PatentNode("section", [
            bgArtHeader.blocks(),
            ...bgArtContent.blocks()],
            "background-art"),
    bgArtHeader: (_0: any, _1: any, _2: any, _3: any, _4: any) =>
        new PatentNode("h2", "【背景技術】"),
    bgArtContent: (block: any) =>
        block.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p'),
    citations: (citationsHeader: any, _0: any, patentCitations: any, _1: any, nonPatentCitations: any) =>
        new PatentNode("section", [citationsHeader.blocks(), patentCitations.blocks(), nonPatentCitations.blocks()], "citations"),
    citationsHeader: (_0: any, _1: any, _2: any, _3: any) =>
        new PatentNode("h2", "【先行技術文献】"),
    patentCitations: (patentCitationsHeader: any, _0: any, patentCitationList: any) =>
        new PatentNode("section", [patentCitationsHeader.blocks(), patentCitationList.blocks()], "patentCitations"),
    patentCitationsHeader: (_1: any, _2: any, _3: any, _4: any) =>
        new PatentNode("h3", "【特許文献】"),
    patentCitationList: (bullet: Node) =>
        new PatentNode("ul", bullet.children.map((c: any) => c.blocks()), "patentCitationList"),
    nonPatentCitations: (nonPatentCitationsHeader: Node, _0: any, nonPatentCitationList: Node) =>
        new PatentNode("section", [nonPatentCitationsHeader.blocks(), nonPatentCitationList.blocks()], "nonPatentCitations"),
    nonPatentCitationsHeader: (_0: any, _1: any, _2: any, _3: any) =>
        new PatentNode("h3", "【非特許文献】"),
    nonPatentCitationList: (bullet: Node) =>
        new PatentNode("ul", bullet.children.map((c: any) => c.blocks()), "nonPatentCitationList"),
    block: (b: any) => b.blocks(),
    para: (p: Node) => new PatentNode('p', p.sourceString.trimEnd()),
    blank: (_0: Node, _1: Node) => new PatentNode('blank', ''),
    endline: (p: Node, _1: Node) => new PatentNode('p', p.sourceString.trimEnd()),
    bullet: (_0: Node, _1: Node, _2: Node) =>
        new PatentNode("li", `${_1.sourceString}${_2.sourceString}`.trimEnd()),
    _iter: (...childrena: any) => childrena.map((c: any) => c.sourceString),
};
