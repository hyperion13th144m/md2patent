import ohm, { Node } from 'ohm-js'
import { patentMarkdownGrammar } from './grammar';
import { patentMarkdownOperation } from './operation';
import { promises as fs } from 'fs'

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
        _terminal() {
            return this.sourceString;
        },
        ...patentMarkdownOperation
    });
    const match = parser.grammar.match(str);
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
