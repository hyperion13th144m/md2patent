"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const marked_1 = require("marked");
class MyRenderer extends marked_1.Renderer {
    paragraph(text) {
        console.log('hogehoge');
        return 'hoge';
    }
    heading(text, level, raw, slugger) {
        const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
        console.log('called');
        return `
            <h${level}>
              <a name="${escapedText}" class="anchor" href="#${escapedText}">
                <span class="header-link"></span>
              </a>
              ${text}
            </h${level}>`;
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const renderer = new MyRenderer();
        const src = path_1.default.join(__dirname, '../test/test.md');
        const dst = path_1.default.join(__dirname, '../test/test.html');
        const md = yield promises_1.default.readFile(src, 'utf-8');
        marked_1.marked.use({ renderer });
        const html = marked_1.marked.parse(md);
        yield promises_1.default.writeFile(dst, html);
    });
}
main()
    .catch(error => console.log(error));
//const html = marked.parse()
