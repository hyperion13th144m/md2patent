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
    description: (descHeader: Node, invention: Node, techField: Node, bgArt: Node,
        citations: Node, summaryOfInvention: Node, summaryOfDrawings: Node,
        descriptionOfEmbodiments: Node, industrialApplicability: Node, refSigns: Node) => {
        const contents = [
            descHeader.blocks(),
            invention.blocks(),
            techField.blocks(),
            bgArt.blocks(),
            citations.blocks(),
            summaryOfInvention.blocks()
        ];
        const summaryOfDrawingsBlock = summaryOfDrawings.children.map((c: any) => c.blocks()).shift();
        if (summaryOfDrawingsBlock != undefined) {
            contents.push(summaryOfDrawingsBlock);
        }
        contents.push(descriptionOfEmbodiments.blocks())
        const industrialApplicabilityBlock = industrialApplicability.children.map((c: any) => c.blocks()).shift();
        if (industrialApplicabilityBlock != undefined) {
            contents.push(industrialApplicabilityBlock);
        }
        const refSignsBlock = refSigns.children.map((c: any) => c.blocks()).shift();
        if (refSignsBlock != undefined) {
            contents.push(refSignsBlock);
        }
        return new PatentNode('section', contents, "description");
    },
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
    citations: (citationsHeader: any, _0: any, patentCitations: any, _1: any, nonPatentCitations: any, _2: any) =>
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

    summaryOfInvention: (summaryOfInventionHeader: Node, _0: any, techProblem: Node, _1: any, techSolution: Node, _2: any, advantageousEffect: Node) => {
        const contents = [
            summaryOfInventionHeader.blocks(),
            techProblem.blocks(),
            techSolution.blocks()
        ];
        const advantageousEffectContent = advantageousEffect.children.map((c: any) => c.blocks()).shift();
        if (advantageousEffectContent != undefined) {
            contents.push(advantageousEffectContent);
        }
        return new PatentNode("section", contents, "summary-of-invention");
    },
    summaryOfInventionHeader: (_0: any, _1: any, _2: any, _3: any) =>
        new PatentNode("h2", "【発明の概要】"),
    techProblem: (techProblemHeader: Node, _0: any, techProblemContent: Node) =>
        new PatentNode("section", [techProblemHeader.blocks(), ...techProblemContent.blocks()], "tech-problem"),
    techProblemHeader: (_0: any, _1: any, _2: any, _3: any) =>
        new PatentNode("h3", "【発明が解決しようとする課題】"),
    techProblemContent: (block: any) =>
        block.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p'),
    techSolution: (techSolutionHeader: Node, _0: any, techSolutionContent: Node) =>
        new PatentNode("section", [techSolutionHeader.blocks(), ...techSolutionContent.blocks()], "tech-solution"),
    techSolutionHeader: (_0: any, _1: any, _2: any, _3: any) =>
        new PatentNode("h3", "【課題を解決するための手段】"),
    techSolutionContent: (block: any) =>
        block.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p'),
    advantageousEffect: (advantageousEffectHeader: Node, _0: any, advantageousEffectContent: Node) => {
        return new PatentNode("section", [advantageousEffectHeader.blocks(), ...advantageousEffectContent.blocks()], "advantageous-effect");//,
    },
    advantageousEffectHeader: (_0: any, _1: any, _2: any, _3: any) =>
        new PatentNode("h3", "【発明の効果】"),
    advantageousEffectContent: (block: any) =>
        block.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p'),

    summaryOfDrawings: (summaryOfDrawingsHeader: any, _0: any, summaryOfDrawingsList: any, _1: any) =>
        new PatentNode("section", [summaryOfDrawingsHeader.blocks(), summaryOfDrawingsList.blocks()], "summary-of-drawings"),
    summaryOfDrawingsHeader: (_1: any, _2: any, _3: any, _4: any) =>
        new PatentNode("h3", "【図面の簡単な説明】"),
    summaryOfDrawingsList: (bullet: Node) =>
        new PatentNode("ul", bullet.children.map((c: any) => c.blocks()), "summary-of-drawings-list"),

    descriptionOfEmbodiments: (descriptionOfEmbodimentsHeader: Node, descriptionOfEmbodimentsContent: Node, _1: any) => {
        return new PatentNode("section", [
            descriptionOfEmbodimentsHeader.blocks(),
            ...descriptionOfEmbodimentsContent.blocks()
        ], "description-of-embodiments");
    },
    descriptionOfEmbodimentsHeader: (_0: any, _1: any, _2: any, _3: any) => {
        return new PatentNode("h3", "【発明を実施するための形態】");
    },
    descriptionOfEmbodimentsContent: (block: any) => {
        return block.children.map((c: any) => c.blocks()).filter((c: any) => (c.type === 'p' || c.type === 'h3'));
    },
    embodimentsExample: (_0: any, _1: any, _2: any, _3: any) => {
        return new PatentNode("h3", "【実施例】");
    },

    industrialApplicability: (industrialApplicabilityHeader: any, _0: any, industrialApplicabilityContent: any, _1: any) =>
        new PatentNode("section", [industrialApplicabilityHeader.blocks(), ...industrialApplicabilityContent.blocks()], "industrial-applicability"),
    industrialApplicabilityHeader: (_1: any, _2: any, _3: any, _4: any) =>
        new PatentNode("h3", "【産業上の利用可能性】"),
    industrialApplicabilityContent: (block: Node) =>
        block.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p'),

    refSigns: (refSignsHeader: any, _0: any, refSignsContent: any, _1: any) =>
        new PatentNode("section", [refSignsHeader.blocks(), ...refSignsContent.blocks()], "reference-signs-list"),
    refSignsHeader: (_1: any, _2: any, _3: any, _4: any) =>
        new PatentNode("h3", "【符号の説明】"),
    refSignsContent: (block: Node) =>
        block.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p'),

    block: (b: any) => b.blocks(),
    para: (p: Node) => new PatentNode('p', p.sourceString.trimEnd()),
    blank: (_0: Node, _1: Node) => new PatentNode('blank', ''),
    endline: (p: Node, _1: Node) => new PatentNode('p', p.sourceString.trimEnd()),
    bullet: (_0: Node, _1: Node, _2: Node) =>
        new PatentNode("li", `${_1.sourceString}${_2.sourceString}`.trimEnd()),
    _iter: (...children: any) => { console.log(children); return children.map((c: any) => c.sourceString) },
};
