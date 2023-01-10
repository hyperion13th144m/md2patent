import ohm, { Node } from 'ohm-js'
import { promises as fs } from 'fs'
import { stringify } from 'querystring';

export class PatentNode {
    constructor(
        public type: string,
        public content: string | PatentNode[],
        public className: string = ""
    ) { }
};

const H1 = (content: any) => ({ type: 'H1', content });
const H2 = (content: any) => ({ type: 'H2', content });
const H3 = (content: any) => ({ type: 'H3', content });
const P = (content: any) => ({ type: 'P', content });
const LI = (content: any) => ({ type: 'LI', content });
const code = (language: any, content: any) => ({ type: 'CODE', language, content });

type MyParser = {
    grammar: any;
    semantics: any;
}

const patentMarkdownGrammar = `
    PatentMarkdown {
        doc = blank* description claims abstract
        description = descHeader invention techField bgArt citations
        claims = blank*
        abstract = blank*

        descHeader = "#" sp* "【書類名】" sp* "明細書" block+

        invention = inventionHeader inventionContent blank*
        inventionHeader = "##" sp* "【発明の名称】" sp* nl
        inventionContent = block+

        techField = techFieldHeader techFieldContent blank*
        techFieldHeader = "##" sp* "【技術分野】" sp* nl
        techFieldContent = block+ 

        bgArt = bgArtHeader bgArtContent
        bgArtHeader = "##" sp* "【背景技術】" sp* nl
        bgArtContent = block+

        citations = citationsHeader blank* patentCitations blank* nonPatentCitations
        citationsHeader = "##" sp* "【先行技術文献】" sp*
        patentCitations =  patentCitationsHeader blank* patentCitationList
        patentCitationsHeader = "###" sp* "【特許文献】" blank*
        patentCitationList = bullet+ 
        nonPatentCitations = nonPatentCitationsHeader blank* nonPatentCitationList
        nonPatentCitationsHeader = "###" sp* "【非特許文献】" sp*
        nonPatentCitationList = bullet* 

        bullet = "* " rest (~"*" ~blank rest)*
        block =  blank | para | endline
        blank = sp* nl  // blank line has only newline
        para = line+ //paragraph is just multiple consecutive lines
        endline = (~nl any)+ end
        line = ~"#" (~nl any)+ nl  // line has at least one letter
        nl = "\\n" | "\\r\\n" | "\\r"
        sp = " "
        rest = (~nl any)* nl  // everything to the end of the line
    }
 `;


const oldGrammar = `
    MarkdownOuter {
    doc = block+
    block =  blank | h3 | h2 | h1 | bullet | code | para | endline
    h3 = "###" rest
    h2 = "##" rest
    h1 = "#" rest  
    para = line+ //paragraph is just multiple consecutive lines
    bullet = "* " rest (~"*" ~blank rest)*
    code = q rest (~q any)* q //anything between the \`\`\` markers
    q = "\`\`\`"   // start and end code blocks
    nl = "\\n"   // new line
    sp = " "
    blank = sp* nl  // blank line has only newline
    endline = (~nl any)+ end
    line = (~nl any)+ nl  // line has at least one letter
    rest = (~nl any)* nl  // everything to the end of the line
    }
`;

/*
const oldActions = {
        _terminal() {
            return this.sourceString;
        },
        doc: (bs: any) => bs.children.map((c: any) => c.blocks()),
        h1: (_: any, b: any) => H1(b.blocks()),
        h2: (_: any, b: any) => H2(b.blocks()),
        h3: (_: any, b: any) => H3(b.blocks()),
        code: (_: any, name: any, cod: any, _2: any) => code(name.blocks(), cod.blocks().join('')),
        para: (a: any) => P(a.sourceString),
        blank: (a: any, b: any) => ({ type: 'BLANK' }),
        bullet: (a: any, b: any, c: any) => LI(b.sourceString + c.sourceString),
        rest: (a: any, _: any) => a.children.map((c: any) => c.blocks()).join('')
    };
*/

function parseMarkdownBlocks(str: string) {
    const parser = {} as MyParser;
    parser.grammar = ohm.grammar(patentMarkdownGrammar);
    parser.semantics = parser.grammar.createSemantics();
    parser.semantics.addOperation('blocks', {
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
        invention: (inventionHeader: any, inventionContent: any, _:any) =>
            new PatentNode("section", [inventionHeader.blocks(), inventionContent.blocks()], "invention-title"),
        inventionHeader: (_0: any, _1: any, _2: any, _3: any, _4: any) =>
            new PatentNode("h2", "【発明の名称】"),
        inventionContent: (blocks: any) =>
            new PatentNode("p", blocks.children.map((c: any) => c.blocks()).filter((c: any) => c.type === 'p')),
        techField: (techFieldHeader: any, techFieldContent: any, _:any) =>
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
        _terminal() {
            return this.sourceString;
        },
    });

    const match = parser.grammar.match(str);
    console.log(match.succeeded());
    if (match.succeeded()) {
        return parser.semantics(match).blocks();
    }
    else {
        return null;
    }
}

function parseMarkdownContent(block: any) {
    const parser = {} as MyParser;
    parser.grammar = ohm.grammar(`
      MarkdownInner {
        block = para*
        para = link | bold | italic | code | plain
        plain = ( ~( "*" | "\`" | "[" | "__") any)+
        bold = "*" (~"*" any)* "*"
        italic = "__" (~"__" any)* "__"
        code = "\`" (~"\`" any)* "\`"
        link = "!"? "[" (~"]" any)* "]" "(" (~")" any)* ")"
      }
    `);
    parser.semantics = parser.grammar.createSemantics();
    parser.semantics.addOperation('content', {
        _terminal() {
            return this.sourceString;
        },
        block: (ps: any) => ps.children.map((c: any) => c.content()),
        plain(a: any) {
            return ['plain', a.children.map((c: any) => c.content()).join('')];
        },
        bold(_1: any, a: any, _2: any) {
            return ['bold', a.children.map((c: any) => c.content()).join('')];
        },
        italic(_1: any, a: any, _2: any) {
            return ['italic', a.children.map((c: any) => c.content()).join('')];
        },
        code: (_1: any, a: any, _2: any) => ['code', a.children.map((c: any) => c.content()).join('')],
        link: (img: any, _1: any, text: any, _2: any, _3: any, url: any, _4: any) => [
            'link',
            text.children.map((c: any) => c.content()).join(''),
            url.children.map((c: any) => c.content()).join(''),
            img.children.map((c: any) => c.content()).join('')
        ]
    });
    const match = parser.grammar.match(block.content);
    if (match.failed()) {
        block.content = [['plain', block.content]];
    } else {
        block.content = parser.semantics(match).content();
    }
    return block;
}

export function parseMarkdown(raw_markdown: string) {
    const blocks = parseMarkdownBlocks(raw_markdown);
    return blocks;
    /*
    return blocks.map((block: any) => {
        if (block.type === 'P') return parseMarkdownContent(block);
        if (block.type === 'LI') return parseMarkdownContent(block);
        return block;
    });
    */
}
